import type { SecretsView, SecretStatus, TroupeConfigData } from '@filmzy/contracts';
import { parseSecretRef, type SecretSources } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import type { FileSecretStore } from './file-secret-store.js';
import { SECRET_SOURCES, SECRET_STORE } from './tokens.js';

/**
 * Lo stato delle chiavi per l'interfaccia (D25): quali la configurazione cita, se ci sono, da dove
 * arrivano. **Mai il valore**: una chiave si scrive e si cancella, non si rilegge.
 */
@Injectable()
export class SecretsService {
  constructor(
    @Inject(SECRET_STORE) private readonly store: FileSecretStore,
    @Inject(SECRET_SOURCES) private readonly sources: SecretSources,
  ) {}

  view(config: TroupeConfigData | undefined): SecretsView {
    const byKey = new Map<string, SecretStatus>();

    for (const [connectionId, connection] of Object.entries(config?.connections ?? {})) {
      for (const ref of [connection.api_key, connection.http_proxy]) {
        const parsed = ref === undefined ? undefined : parseSecretRef(ref);
        if (parsed === undefined || parsed.kind === 'none') continue;

        const key = `${parsed.kind}:${parsed.name}`;
        const foundIn = this.foundIn(parsed.kind, parsed.name);
        const status = byKey.get(key) ?? {
          name: parsed.name,
          source: parsed.kind,
          present: foundIn !== undefined,
          ...(foundIn === undefined ? {} : { foundIn }),
          connectionIds: [],
        };
        if (!status.connectionIds.includes(connectionId)) status.connectionIds.push(connectionId);
        byKey.set(key, status);
      }
    }

    return {
      secrets: [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name)),
      writable: this.writable,
    };
  }

  /** Si possono scrivere chiavi solo con il portachiavi del sistema (Electron, D45). */
  get writable(): boolean {
    return this.store.writable;
  }

  /** Dove sta la chiave di un riferimento, se c'è. Mai il valore. `none` e forme sbagliate: niente. */
  presence(ref: string): 'env' | 'stored' | undefined {
    const parsed = parseSecretRef(ref);
    return parsed === undefined || parsed.kind === 'none'
      ? undefined
      : this.foundIn(parsed.kind, parsed.name);
  }

  set(name: string, value: string): void {
    this.store.set(name, value);
  }

  delete(name: string): void {
    this.store.delete(name);
  }

  /** Una `env:` si cerca prima nell'ambiente e poi fra le chiavi salvate (D50); una `secret:` solo fra le salvate. */
  private foundIn(kind: 'env' | 'secret', name: string): 'env' | 'stored' | undefined {
    const value = kind === 'env' ? this.sources.env?.[name] : undefined;
    if (value !== undefined && value.trim() !== '') return 'env';
    return this.store.has(name) ? 'stored' : undefined;
  }
}
