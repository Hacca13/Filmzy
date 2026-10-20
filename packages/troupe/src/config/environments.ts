/**
 * Gli ambienti della configurazione (architettura §4.5): un adattamento che sta **sopra** le
 * scelte dell'utente, così `TROUPE_ENV=offline` usa sempre il fornitore finto, qualunque servizio
 * l'utente abbia attivato.
 */
export const CONFIG_ENVIRONMENTS = ['development', 'offline', 'test'] as const;

export type ConfigEnvironment = (typeof CONFIG_ENVIRONMENTS)[number];

function isConfigEnvironment(value: string): value is ConfigEnvironment {
  return (CONFIG_ENVIRONMENTS as readonly string[]).includes(value);
}

/**
 * Legge `TROUPE_ENV`. Senza la variabile non c'è nessun adattamento (vale il seme o la release);
 * un valore che non esiste è un errore subito, perché altrimenti si lavorerebbe con una
 * configurazione diversa da quella che si crede.
 */
export function configEnvironmentFromEnv(
  env: Record<string, string | undefined> = process.env,
): ConfigEnvironment | undefined {
  const value = env.TROUPE_ENV?.trim();
  if (value === undefined || value === '') return undefined;
  if (!isConfigEnvironment(value)) {
    throw new Error(
      `TROUPE_ENV non valido: "${value}". Valori ammessi: ${CONFIG_ENVIRONMENTS.join(', ')}.`,
    );
  }
  return value;
}
