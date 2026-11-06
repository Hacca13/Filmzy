import {
  modelGroupForRole,
  ROLE_TUNINGS,
  type RoleChangeResult,
  type RoleId,
  type RoleInstructions,
  type RoleState,
  type RoleTuning,
  type RolesOverview,
  type UserSettings,
} from '@filmzy/contracts';
import {
  ineligibilityReasons,
  paramProblems,
  ProviderError,
  resolveRole,
  type ConfigSource,
  type ResolvedRole,
  type TroupeConfig,
} from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { ConnectionsService } from '../connections/connections.service.js';
import { InstructionsService } from '../instructions/instructions.service.js';
import { CONFIG_SOURCE } from '../troupe/tokens.js';
import { updateRoleSettings, UserSettingsService } from '../troupe/user-settings.service.js';

type Role = NonNullable<TroupeConfig['roles'][string]>;

/**
 * «Chi fa cosa» (T2.7, architettura §4.3, D38): per ogni ruolo, quale servizio lavora e quali altri
 * si possono scegliere, con la creatività dove il servizio la accetta. Le scelte valgono subito,
 * senza pubblicare, e vincono sul predefinito del gruppo e sulla release.
 *
 * Fra le alternative ci sono solo servizi attivati, utilizzabili, del tipo giusto e adatti al
 * ruolo (§4.6 punto 9): scegliere un servizio che il ruolo non può usare non è possibile, invece di
 * fallire più tardi con un lavoro fermo.
 */
@Injectable()
export class RolesService {
  constructor(
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    private readonly userSettings: UserSettingsService,
    private readonly connections: ConnectionsService,
    private readonly instructions: InstructionsService,
  ) {}

  async overview(): Promise<RolesOverview> {
    const config = await this.config();
    const { settings } = this.userSettings.read(config);
    const instructions = new Map(
      (await this.instructions.overview()).roles.map((role) => [role.roleId, role]),
    );

    return {
      roles: Object.entries(config.roles).flatMap(([roleId, role]) =>
        role === undefined
          ? []
          : [this.roleState(config, settings, roleId, role, instructions.get(roleId))],
      ),
    };
  }

  /** `null` torna al servizio della release (o al predefinito del gruppo). */
  async setService(roleId: string, modelId: string | null): Promise<RoleChangeResult> {
    const config = await this.config();
    const role = this.roleOf(config, roleId);

    // Un oggetto, non una variabile: lo cambia la funzione di aggiornamento qui sotto.
    const outcome: { discarded: RoleTuning[] } = { discarded: [] };
    this.userSettings.update(config, (settings) => {
      if (modelId !== null && !this.options(config, settings, role).has(modelId)) {
        throw domainError(409, 'no_eligible_model', { details: { role: roleId, modelId } });
      }
      const next = updateRoleSettings(settings, roleId, (current) => ({
        ...current,
        modelId: modelId ?? undefined,
      }));
      const { settings: cleaned, discarded } = this.withoutRefusedTunings(config, next, roleId);
      outcome.discarded = discarded;
      return cleaned;
    });
    return { overview: await this.overview(), discarded: outcome.discarded };
  }

  /** `null` torna al valore del programma. Il servizio in uso deve accettarla, nei suoi limiti (D42). */
  setTemperature(roleId: string, value: number | null): Promise<RoleChangeResult> {
    return this.setTuning(roleId, 'temperature', value);
  }

  /** `null` torna al predefinito del fornitore. Il servizio in uso deve accettare quel livello (D95). */
  setEffort(roleId: string, value: string | null): Promise<RoleChangeResult> {
    return this.setTuning(roleId, 'effort', value);
  }

  private async setTuning(
    roleId: string,
    tuning: RoleTuning,
    value: number | string | null,
  ): Promise<RoleChangeResult> {
    const config = await this.config();
    this.roleOf(config, roleId);

    this.userSettings.update(config, (settings) => {
      if (value !== null) {
        const model = this.inUse(config, settings, roleId)?.model;
        if (model === undefined) {
          throw domainError(409, 'no_eligible_model', { details: { role: roleId } });
        }
        if (paramProblems({ [tuning]: value }, model).length > 0) {
          throw domainError(400, 'invalid_request', { details: { field: 'value', role: roleId } });
        }
      }
      return updateRoleSettings(settings, roleId, (current) => ({
        ...current,
        params: { ...current.params, [tuning]: value ?? undefined },
      }));
    });
    return { overview: await this.overview(), discarded: [] };
  }

  /**
   * Cambiando servizio, le regolazioni che il nuovo non accetta si scartano (§4.3): la creatività, o un
   * livello d'impegno che non ha. Si guarda il servizio che lavorerebbe **dopo** la modifica, anche quando
   * si torna a quello della release.
   *
   * Lo si cerca **senza** le regolazioni scelte: con quelle dentro, un servizio che non le accetta
   * risulterebbe non idoneo e non si saprebbe più quale sia, lasciando il ruolo bloccato.
   */
  private withoutRefusedTunings(
    config: TroupeConfig,
    settings: UserSettings,
    roleId: string,
  ): { settings: UserSettings; discarded: RoleTuning[] } {
    const params = settings.roleSettings[roleId as RoleId]?.params;
    const chosen = ROLE_TUNINGS.filter((tuning) => params?.[tuning] !== undefined);
    if (chosen.length === 0) return { settings, discarded: [] };

    const without = updateRoleSettings(settings, roleId, (current) => ({
      ...current,
      params: {
        ...current.params,
        ...Object.fromEntries(chosen.map((tuning) => [tuning, undefined])),
      },
    }));
    const model = this.inUse(config, without, roleId)?.model;
    if (model === undefined) return { settings, discarded: [] };

    const discarded = chosen.filter(
      (tuning) => paramProblems({ [tuning]: params?.[tuning] ?? '' }, model).length > 0,
    );
    if (discarded.length === 0) return { settings, discarded };
    return {
      settings: updateRoleSettings(settings, roleId, (current) => ({
        ...current,
        params: {
          ...current.params,
          ...Object.fromEntries(discarded.map((tuning) => [tuning, undefined])),
        },
      })),
      discarded,
    };
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(404, 'not_found');
    return loaded.config;
  }

  private roleOf(config: TroupeConfig, roleId: string): Role {
    const role = config.roles[roleId];
    if (role === undefined) throw domainError(404, 'not_found', { details: { role: roleId } });
    return role;
  }

  /** Il servizio che lavorerebbe, o `undefined` se nessuno può (ruolo spento, nessun servizio idoneo…). */
  private inUse(
    config: TroupeConfig,
    settings: UserSettings,
    roleId: string,
  ): ResolvedRole | undefined {
    try {
      return resolveRole(config, roleId, settings);
    } catch (error) {
      // «Nessun servizio idoneo» è una risposta, non un guasto: si mostra con il suo motivo.
      if (error instanceof ProviderError) return undefined;
      throw error;
    }
  }

  /** I servizi che il ruolo può usare: attivati, utilizzabili, del suo tipo, con parametri accettati. */
  private options(config: TroupeConfig, settings: UserSettings, role: Role): Map<string, string> {
    return new Map(
      Object.entries(config.models)
        .filter(
          ([modelId, model]) =>
            this.connections.isUsable(config, modelId) &&
            ineligibilityReasons({
              role,
              modelId,
              model,
              connection: config.connections[model.connection],
              enabledModelIds: settings.enabledModelIds,
            }).length === 0,
        )
        .map(([modelId, model]) => [modelId, model.connection]),
    );
  }

  private roleState(
    config: TroupeConfig,
    settings: UserSettings,
    roleId: string,
    role: Role,
    instructions: RoleInstructions | undefined,
  ): RoleState {
    const resolved = this.inUse(config, settings, roleId);
    const problem = resolved === undefined ? this.problemOf(config, settings, roleId) : undefined;
    const roleSettings = settings.roleSettings[roleId as RoleId];
    const options = this.options(config, settings, role);

    return {
      roleId,
      label: role.label,
      kind: role.kind,
      group: modelGroupForRole(role),
      enabled: role.enabled !== false,
      ...(resolved === undefined
        ? {}
        : {
            inUse: {
              connectionId: resolved.connectionId,
              connectionLabel: resolved.connection.label ?? resolved.connectionId,
              modelId: resolved.modelId,
              modelLabel: resolved.model.label,
            },
          }),
      ...(problem === undefined ? {} : { problem }),
      ...(roleSettings?.modelId === undefined ? {} : { chosenModelId: roleSettings.modelId }),
      providers: this.providers(config, options),
      ...(resolved === undefined
        ? {}
        : {
            ...this.temperatureOf(resolved, roleSettings?.params?.temperature),
            ...this.effortOf(resolved, roleSettings?.params?.effort),
          }),
      ...(instructions === undefined ? {} : { instructions: summarize(instructions) }),
    };
  }

  /** Il codice che spiega perché il ruolo non ha un servizio (§4.10): lo dice `resolveRole` stesso. */
  private problemOf(config: TroupeConfig, settings: UserSettings, roleId: string) {
    try {
      resolveRole(config, roleId, settings);
    } catch (error) {
      if (error instanceof ProviderError) return error.code;
    }
    return undefined;
  }

  private providers(config: TroupeConfig, options: Map<string, string>): RoleState['providers'] {
    const byConnection = new Map<string, RoleState['providers'][number]>();
    for (const [modelId, connectionId] of options) {
      const label = config.connections[connectionId]?.label ?? connectionId;
      const provider = byConnection.get(connectionId) ?? { connectionId, label, services: [] };
      provider.services.push({ modelId, label: config.models[modelId]?.label ?? modelId });
      byConnection.set(connectionId, provider);
    }
    return [...byConnection.values()];
  }

  /** La creatività c'è solo dove il servizio in uso la accetta, dentro i suoi limiti (D42). */
  private temperatureOf(
    resolved: ResolvedRole,
    chosen: number | undefined,
  ): Pick<RoleState, 'temperature'> {
    const spec = resolved.model.params?.temperature;
    if (spec === undefined || 'values' in spec) return {};

    const current = chosen ?? resolved.role.params?.temperature;
    return {
      temperature: {
        ...(typeof current === 'number' ? { value: current } : {}),
        ...(spec.min === undefined ? {} : { min: spec.min }),
        ...(spec.max === undefined ? {} : { max: spec.max }),
        chosen: chosen !== undefined,
      },
    };
  }

  /** L'impegno c'è solo dove il servizio in uso lo accetta, con i suoi livelli (D95). */
  private effortOf(resolved: ResolvedRole, chosen: string | undefined): Pick<RoleState, 'effort'> {
    const spec = resolved.model.params?.effort;
    if (spec === undefined || !('values' in spec)) return {};

    const current = chosen ?? resolved.role.params?.effort;
    return {
      effort: {
        ...(typeof current === 'string' ? { value: current } : {}),
        levels: spec.values.map(String),
        chosen: chosen !== undefined,
      },
    };
  }
}

function summarize(role: RoleInstructions): NonNullable<RoleState['instructions']> {
  const inUse = role.versions.find((version) => version.version === role.inUse);
  return {
    label: inUse?.label ?? `Versione ${String(role.inUse)}`,
    recommended: role.inUse === role.recommended,
    newerAvailable: role.inUse < role.recommended,
  };
}
