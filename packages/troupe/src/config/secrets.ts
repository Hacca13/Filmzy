/**
 * I riferimenti ai segreti nella configurazione (architettura §4.5, D25): `env:NOME` (variabile
 * d'ambiente), `env:NOME?` (facoltativa), `secret:NOME` (portachiavi del sistema) o `none`.
 *
 * **`env:NOME` ripiega sul portachiavi** (D50): la variabile d'ambiente vince, ma se manca si cerca
 * una chiave salvata con lo stesso NOME. È ciò che permette all'utente di inserire da Impostazioni
 * la chiave di un fornitore che il seme cita con `env:`, senza toccare la configurazione.
 *
 * Il validatore chiede solo se una chiave **c'è**, mai quale sia: così una chiave non può finire
 * in un messaggio, in un log o in un export. Il valore lo legge soltanto l'adapter che deve
 * chiamare il fornitore, con `readSecret`.
 */
export interface SecretStore {
  has(name: string): boolean;
  get(name: string): string | undefined;
}

export interface SecretSources {
  env?: Record<string, string | undefined>;
  /** Il portachiavi del sistema operativo: arriva con l'app (T2.7); senza, `secret:` non c'è. */
  keychain?: SecretStore;
}

export type ParsedSecretRef =
  | { kind: 'none' }
  | { kind: 'env'; name: string; optional: boolean }
  | { kind: 'secret'; name: string; optional: false };

/** Legge la forma del riferimento. `undefined` se non è una forma ammessa. */
export function parseSecretRef(ref: string): ParsedSecretRef | undefined {
  if (ref === 'none') return { kind: 'none' };

  const envMatch = /^env:([A-Z][A-Z0-9_]*)(\?)?$/.exec(ref);
  if (envMatch?.[1] !== undefined) {
    return { kind: 'env', name: envMatch[1], optional: envMatch[2] === '?' };
  }

  const secretMatch = /^secret:([A-Z][A-Z0-9_]*)$/.exec(ref);
  if (secretMatch?.[1] !== undefined) {
    return { kind: 'secret', name: secretMatch[1], optional: false };
  }

  return undefined;
}

export interface SecretPresence {
  /** La chiave c'è (o non serve, come per `none` e per una `env:NOME?` assente). */
  satisfied: boolean;
  parsed: ParsedSecretRef;
}

/** Dice se il riferimento è soddisfatto, senza mai restituire il valore (D25). */
export function secretPresence(
  ref: string,
  sources: SecretSources = {},
): SecretPresence | undefined {
  const parsed = parseSecretRef(ref);
  if (parsed === undefined) return undefined;
  if (parsed.kind === 'none') return { satisfied: true, parsed };

  const present =
    (parsed.kind === 'env' && isNonEmpty(sources.env?.[parsed.name])) ||
    (sources.keychain?.has(parsed.name) ?? false);

  return { satisfied: present || parsed.optional, parsed };
}

/** Il valore del segreto, per chi deve chiamare il fornitore. Mai nei log né negli errori. */
export function readSecret(ref: string, sources: SecretSources = {}): string | undefined {
  const parsed = parseSecretRef(ref);
  if (parsed === undefined || parsed.kind === 'none') return undefined;

  const fromEnv = parsed.kind === 'env' ? sources.env?.[parsed.name] : undefined;
  return isNonEmpty(fromEnv) ? fromEnv : sources.keychain?.get(parsed.name);
}

function isNonEmpty(value: string | undefined): boolean {
  return value !== undefined && value.trim() !== '';
}
