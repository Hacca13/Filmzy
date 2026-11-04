import type { RoleId, RoleSettings, TroupeConfigData, UserSettings } from '@filmzy/contracts';
import type { TroupeStore } from '@filmzy/db';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { TROUPE_STORE } from './tokens.js';

/**
 * Le scelte dell'utente (architettura §4.3, D36): servizi attivati, predefiniti, regolazioni dei
 * ruoli, limiti. Valgono subito, senza pubblicare una release. Qui si leggono e si scrivono; le
 * regole su cosa si può scegliere stanno in chi le cambia.
 */
@Injectable()
export class UserSettingsService {
  constructor(@Inject(TROUPE_STORE) private readonly store: TroupeStore) {}

  /** Le scelte salvate, o quelle che equivalgono a «non aver scelto niente». */
  read(config: TroupeConfigData): { settings: UserSettings; explicit: boolean } {
    const stored = this.store.getSettings();
    // Scelte che non si leggono: non si tira a indovinare, perché «nessuna scelta» vorrebbe dire
    // «tutti i servizi attivi» e si spenderebbe su uno che l'utente aveva spento.
    if (stored.problem !== undefined) throw domainError(500, 'config_invalid');
    return stored.settings === undefined
      ? { settings: implicitSettings(config), explicit: false }
      : { settings: stored.settings, explicit: true };
  }

  update(config: TroupeConfigData, change: (settings: UserSettings) => UserSettings): UserSettings {
    const next = change(this.read(config).settings);
    this.store.saveSettings(next);
    return next;
  }
}

/**
 * Le scelte quando non ce n'è ancora nessuna: «tutti i servizi attivi» (§4.3), cioè quelli non
 * ritirati di un fornitore acceso. Si scrivono per
 * intero alla prima modifica perché, appena esiste una riga, il filtro sugli attivati vale: una
 * riga con l'elenco vuoto spegnerebbe tutto.
 */
export function implicitSettings(config: TroupeConfigData): UserSettings {
  return {
    enabledModelIds: Object.entries(config.models)
      .filter(
        ([, model]) =>
          model.status !== 'retired' && config.connections[model.connection]?.enabled === true,
      )
      .map(([id]) => id),
    defaultModels: {},
    defaultModelByConnection: {},
    spendCaps: {},
    roleSettings: {},
  };
}

function withoutUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

/**
 * Cambia le regolazioni di un ruolo (modello, creatività, istruzioni: D38). `change` può mettere
 * `undefined` per togliere un campo; se al ruolo non resta niente la sua voce sparisce, perché in
 * `roleSettings` non devono restare righe vuote.
 */
export function updateRoleSettings(
  settings: UserSettings,
  roleId: string,
  change: (current: RoleSettings) => RoleSettings,
): UserSettings {
  const next = withoutUndefined(change(settings.roleSettings[roleId as RoleId] ?? {}));
  const params = next.params === undefined ? undefined : withoutUndefined(next.params);
  const role = withoutUndefined({
    ...next,
    params: params !== undefined && Object.keys(params).length > 0 ? params : undefined,
  });

  const others = Object.entries(settings.roleSettings).filter(([id]) => id !== roleId);
  return {
    ...settings,
    roleSettings: Object.fromEntries(
      Object.keys(role).length === 0 ? others : [...others, [roleId, role]],
    ),
  };
}
