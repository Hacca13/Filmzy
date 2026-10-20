import { z } from 'zod';

/** Il server locale ascolta solo su questo indirizzo: altri computer della rete non lo raggiungono (D29). */
export const LOCAL_API_HOST = '127.0.0.1';

/** Porta predefinita del server locale. Si cambia con la variabile d'ambiente `FILMZY_API_PORT`. */
export const DEFAULT_API_PORT = 3001;

/** Numero di porta valido. Accetta anche il testo di una variabile d'ambiente ("3001"). */
export const portSchema = z.coerce.number().int().min(1).max(65535);

/**
 * Legge la porta del server locale dalle variabili d'ambiente.
 * La usano sia il server sia la configurazione di sviluppo dell'interfaccia (proxy), così il
 * nome della variabile e il suo controllo stanno in un posto solo.
 */
export function readApiPort(env: Record<string, string | undefined>): number {
  const rawPort = env['FILMZY_API_PORT'] ?? DEFAULT_API_PORT;
  const parsed = portSchema.safeParse(rawPort);
  if (!parsed.success) {
    throw new Error(
      `FILMZY_API_PORT non è valida: serve un numero intero da 1 a 65535 (trovato "${String(rawPort)}").`,
    );
  }
  return parsed.data;
}
