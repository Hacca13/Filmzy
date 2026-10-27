import {
  MODEL_GROUPS,
  modelGroupForKind,
  type ConnectionsOverview,
  type GroupState,
  type ModelEntry,
  type ModelGroup,
  type ProviderState,
  type ServiceState,
  type UnusableReason,
  type UserSettings,
} from '@filmzy/contracts';
import {
  adapterCanTest,
  parseSecretRef,
  testConnection,
  type ConfigSource,
  type SecretSources,
  type TroupeConfig,
} from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { SecretsService } from '../secrets/secrets.service.js';
import { SECRET_SOURCES } from '../secrets/tokens.js';
import { CONFIG_SOURCE } from '../troupe/tokens.js';
import { UserSettingsService } from '../troupe/user-settings.service.js';

type Connection = TroupeConfig['connections'][string];

/**
 * Fornitori, servizi e chiavi per le impostazioni (T2.7, architettura §4.3, §5.6, D36). Dice cosa è
 * collegato e cosa si può usare, e cambia le scelte dell'utente — che valgono subito, senza
 * pubblicare. Ogni cambiamento controlla quello che chiede: non si attiva un servizio ritirato,
 * senza chiave o di un fornitore spento, e un predefinito è sempre un servizio attivato.
 *
 * Non si toglie mai niente in silenzio: se una chiave sparisce, i servizi restano scelti e la
 * pagina li segna come «non utilizzabili»; il lavoro che li chiedesse si ferma con un messaggio
 * chiaro (D36, regola 6), invece di passare da solo a un altro servizio.
 */
@Injectable()
export class ConnectionsService {
  constructor(
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    @Inject(SECRET_SOURCES) private readonly secretSources: SecretSources,
    private readonly secrets: SecretsService,
    private readonly userSettings: UserSettingsService,
  ) {}

  async overview(): Promise<ConnectionsOverview> {
    const { config, settings } = await this.effective();
    const { settings: current, explicit } = this.userSettings.read(config);

    return {
      groups: MODEL_GROUPS.map((group) => this.groupState(group, config, current)),
      hasChoices: explicit && settings !== undefined,
      limits: {
        ...(current.spendCaps.filmBudgetUsd === undefined
          ? {}
          : { filmBudgetUsd: current.spendCaps.filmBudgetUsd }),
      },
    };
  }

  async setServices(
    connectionId: string,
    modelIds: readonly string[],
  ): Promise<ConnectionsOverview> {
    const { config } = await this.effective();
    const own = this.modelsOf(config, connectionId);

    const unknown = modelIds.find((id) => !own.has(id));
    if (unknown !== undefined) {
      throw domainError(400, 'invalid_request', {
        details: { field: 'modelIds', modelId: unknown },
      });
    }

    this.userSettings.update(config, (settings) => {
      const wasEnabled = new Set(settings.enabledModelIds);
      for (const id of modelIds.filter((candidate) => !wasEnabled.has(candidate))) {
        this.assertCanEnable(config, connectionId, id, own.get(id));
      }

      const wanted = new Set(modelIds);
      const turnedOff = [...own.keys()].filter((id) => wasEnabled.has(id) && !wanted.has(id));
      return withoutServices(
        {
          ...settings,
          enabledModelIds: [...settings.enabledModelIds.filter((id) => !own.has(id)), ...wanted],
        },
        turnedOff,
      );
    });
    return this.overview();
  }

  async setProviderDefault(connectionId: string, modelId: string): Promise<ConnectionsOverview> {
    const { config } = await this.effective();
    if (!this.modelsOf(config, connectionId).has(modelId)) {
      throw domainError(400, 'invalid_request', { details: { field: 'modelId', connectionId } });
    }

    this.userSettings.update(config, (settings) => {
      if (!settings.enabledModelIds.includes(modelId)) {
        throw domainError(409, 'no_eligible_model', { details: { modelId, connectionId } });
      }
      return {
        ...settings,
        defaultModelByConnection: { ...settings.defaultModelByConnection, [connectionId]: modelId },
      };
    });
    return this.overview();
  }

  /** Il fornitore predefinito del gruppo: si parte dal suo servizio predefinito, o dal primo attivato. */
  async setGroupDefault(group: ModelGroup, connectionId: string): Promise<ConnectionsOverview> {
    const { config } = await this.effective();
    const own = this.modelsOf(config, connectionId);

    this.userSettings.update(config, (settings) => {
      const inGroup = [...own.entries()].filter(
        ([id, model]) => groupsOf(model).includes(group) && settings.enabledModelIds.includes(id),
      );
      const preferred = settings.defaultModelByConnection[connectionId];
      const chosen = inGroup.find(([id]) => id === preferred) ?? inGroup[0];
      if (chosen === undefined) {
        throw domainError(409, 'no_eligible_model', { details: { connectionId } });
      }
      return { ...settings, defaultModels: { ...settings.defaultModels, [group]: chosen[0] } };
    });
    return this.overview();
  }

  async setMonthlyCap(connectionId: string, usd: number | null): Promise<ConnectionsOverview> {
    const { config } = await this.effective();
    this.connectionOf(config, connectionId);

    this.userSettings.update(config, (settings) => {
      const others = Object.entries(settings.spendCaps.monthlyByConnection ?? {}).filter(
        ([id]) => id !== connectionId,
      );
      const monthlyByConnection = Object.fromEntries(
        usd === null ? others : [...others, [connectionId, usd]],
      );
      const rest = Object.fromEntries(
        Object.entries(settings.spendCaps).filter(([name]) => name !== 'monthlyByConnection'),
      );
      return {
        ...settings,
        spendCaps:
          Object.keys(monthlyByConnection).length === 0 ? rest : { ...rest, monthlyByConnection },
      };
    });
    return this.overview();
  }

  /** Il limite di spesa per film (D30): facoltativo, `null` lo toglie. Si scrive, ma non si applica ancora (T3.1). */
  async setFilmBudget(usd: number | null): Promise<ConnectionsOverview> {
    const { config } = await this.effective();

    this.userSettings.update(config, (settings) => {
      const rest = Object.fromEntries(
        Object.entries(settings.spendCaps).filter(([name]) => name !== 'filmBudgetUsd'),
      );
      return { ...settings, spendCaps: usd === null ? rest : { ...rest, filmBudgetUsd: usd } };
    });
    return this.overview();
  }

  /** La prova che non costa. Se qualcosa non va, lancia un `ProviderError` che il filtro traduce. */
  async test(connectionId: string): Promise<void> {
    const { config } = await this.effective();
    const connection = this.connectionOf(config, connectionId);
    const sample = [...this.modelsOf(config, connectionId).values()][0];

    await testConnection({
      connectionId,
      connection,
      secrets: this.secretSources,
      ...(sample === undefined ? {} : { sampleProviderModel: sample.provider_model }),
    });
  }

  private async effective() {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(404, 'not_found');
    return { config: loaded.config, settings: loaded.settings };
  }

  private connectionOf(config: TroupeConfig, connectionId: string): Connection {
    const connection = config.connections[connectionId];
    if (connection === undefined)
      throw domainError(404, 'not_found', { details: { connectionId } });
    return connection;
  }

  private modelsOf(config: TroupeConfig, connectionId: string): Map<string, ModelEntry> {
    this.connectionOf(config, connectionId);
    return new Map(
      Object.entries(config.models).filter(([, model]) => model.connection === connectionId),
    );
  }

  private assertCanEnable(
    config: TroupeConfig,
    connectionId: string,
    modelId: string,
    model: ModelEntry | undefined,
  ): void {
    const connection = this.connectionOf(config, connectionId);
    const reason = model === undefined ? undefined : this.unusableReason(connection, model);
    if (reason === 'key_missing') {
      throw domainError(409, 'secret_missing', { details: { connectionId, modelId } });
    }
    if (reason !== undefined) {
      throw domainError(400, 'invalid_request', { details: { field: 'modelIds', modelId } });
    }
  }

  /** Il servizio si può usare adesso: non ritirato, di un fornitore acceso e con la chiave (§4.3). */
  isUsable(config: TroupeConfig, modelId: string): boolean {
    const model = config.models[modelId];
    const connection = model === undefined ? undefined : config.connections[model.connection];
    return (
      model !== undefined &&
      connection !== undefined &&
      this.unusableReason(connection, model) === undefined
    );
  }

  /** Perché un servizio non si può usare adesso (§4.3): ritirato, fornitore spento, chiave mancante. */
  private unusableReason(connection: Connection, model: ModelEntry): UnusableReason | undefined {
    if (model.status === 'retired') return 'retired';
    if (!connection.enabled) return 'connection_disabled';
    if (this.keyRequired(connection) && !this.keyPresent(connection)) return 'key_missing';
    return undefined;
  }

  /** Il fornitore finto e quelli dichiarati senza chiave (`none`) non ne vogliono. */
  private keyRequired(connection: Connection): boolean {
    return connection.adapter !== 'fake' && parseSecretRef(connection.api_key)?.kind !== 'none';
  }

  private keyPresent(connection: Connection): boolean {
    const parsed = parseSecretRef(connection.api_key);
    if (parsed === undefined || parsed.kind === 'none') return true;
    // Una chiave facoltativa (`env:NOME?`) assente non ferma niente: lo dice il seme.
    return this.secrets.presence(connection.api_key) !== undefined || parsed.optional;
  }

  private groupState(group: ModelGroup, config: TroupeConfig, settings: UserSettings): GroupState {
    const providers = Object.entries(config.connections).flatMap(([connectionId, connection]) => {
      const services = Object.entries(config.models)
        .filter(([, model]) => model.connection === connectionId && groupsOf(model).includes(group))
        .map(([modelId, model]) => this.serviceState(modelId, model, connection, settings));
      return services.length === 0
        ? []
        : [this.providerState(connectionId, connection, services, config, settings)];
    });

    const defaultModelId = settings.defaultModels[group];
    const defaultConnectionId =
      defaultModelId === undefined ? undefined : config.models[defaultModelId]?.connection;
    return {
      group,
      providers,
      ...(defaultConnectionId === undefined ? {} : { defaultConnectionId }),
      ...(defaultModelId === undefined ? {} : { defaultModelId }),
    };
  }

  private providerState(
    connectionId: string,
    connection: Connection,
    services: ServiceState[],
    config: TroupeConfig,
    settings: UserSettings,
  ): ProviderState {
    const keyRequired = this.keyRequired(connection);
    const presence = keyRequired ? this.secrets.presence(connection.api_key) : undefined;
    const keyName = parseSecretRef(connection.api_key);
    const monthlyCapUsd =
      settings.spendCaps.monthlyByConnection?.[connectionId] ?? connection.monthly_cap_usd;

    return {
      connectionId,
      label: connection.label ?? connectionId,
      adapter: connection.adapter,
      enabled: connection.enabled,
      keyRequired,
      ...(keyRequired && keyName !== undefined && keyName.kind !== 'none'
        ? {
            key: {
              name: keyName.name,
              present: presence !== undefined,
              ...(presence === undefined ? {} : { foundIn: presence }),
            },
          }
        : {}),
      keyWritable: this.secrets.writable,
      ...(monthlyCapUsd === undefined ? {} : { monthlyCapUsd }),
      canTest: adapterCanTest(connection.adapter),
      services,
      usedBy: Object.entries(config.roles).flatMap(([roleId, role]) => {
        if (role === undefined) return [];
        const used = [role.model, ...(role.routing?.candidates ?? [])];
        return used.some((id) => id !== undefined && config.models[id]?.connection === connectionId)
          ? [{ roleId, label: role.label }]
          : [];
      }),
    };
  }

  private serviceState(
    modelId: string,
    model: ModelEntry,
    connection: Connection,
    settings: UserSettings,
  ): ServiceState {
    const unusableReason = this.unusableReason(connection, model);
    return {
      modelId,
      label: model.label,
      kind: model.kind,
      status: model.status,
      price: model.pricing,
      vision: isVision(model),
      enabled: settings.enabledModelIds.includes(modelId),
      usable: unusableReason === undefined,
      ...(unusableReason === undefined ? {} : { unusableReason }),
      isProviderDefault: settings.defaultModelByConnection[model.connection] === modelId,
    };
  }
}

function isVision(model: ModelEntry): boolean {
  return model.kind === 'llm' && model.capabilities.includes('vision');
}

/** I gruppi in cui compare un servizio: il suo tipo, e «Lettura immagini» se sa leggerle. */
function groupsOf(model: ModelEntry): ModelGroup[] {
  return isVision(model)
    ? [modelGroupForKind(model.kind), 'vision']
    : [modelGroupForKind(model.kind)];
}

/**
 * Spegnere un servizio toglie anche le scelte che puntavano a lui: un predefinito deve essere un
 * servizio attivato (§4.3), e quello di un ruolo torna a quello della release.
 */
function withoutServices(settings: UserSettings, modelIds: readonly string[]): UserSettings {
  if (modelIds.length === 0) return settings;
  const gone = new Set(modelIds);

  return {
    ...settings,
    defaultModels: Object.fromEntries(
      Object.entries(settings.defaultModels).filter(([, id]) => !gone.has(id)),
    ),
    defaultModelByConnection: Object.fromEntries(
      Object.entries(settings.defaultModelByConnection).filter(([, id]) => !gone.has(id)),
    ),
    roleSettings: Object.fromEntries(
      Object.entries(settings.roleSettings).flatMap(([roleId, role]) => {
        const { modelId, ...rest } = role;
        const kept = modelId !== undefined && gone.has(modelId) ? rest : role;
        return Object.keys(kept).length === 0 ? [] : [[roleId, kept]];
      }),
    ),
  };
}
