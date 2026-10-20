import { z } from 'zod';

/** Il server locale ascolta solo su questo indirizzo: altri computer della rete non lo raggiungono (D29). */
export const LOCAL_API_HOST = '127.0.0.1';

/** Prefisso di tutte le rotte del server: l'interfaccia chiama `/api/...`. Lo usano server, client e proxy. */
export const API_PREFIX = 'api';

/** Porta predefinita del server locale. Si cambia con la variabile d'ambiente `FILMZY_API_PORT`. */
export const DEFAULT_API_PORT = 3001;

const portNumberSchema = z.number().int().min(1).max(65535);

/**
 * Porta valida (1-65535). Se arriva come testo, per esempio da una variabile d'ambiente, ammette
 * solo cifre decimali: niente "0x50", "1e3" o spazi, che una conversione permissiva accetterebbe.
 */
export const portSchema = z.union([
  portNumberSchema,
  z
    .string()
    .regex(/^\d{1,5}$/)
    .transform(Number)
    .pipe(portNumberSchema),
]);

/**
 * Legge la porta del server locale dalle variabili d'ambiente.
 * La usano sia il server sia la configurazione di sviluppo dell'interfaccia (proxy), così il
 * nome della variabile e il suo controllo stanno in un posto solo.
 */
export function readApiPort(env: Record<string, string | undefined>): number {
  const rawPort = env.FILMZY_API_PORT ?? DEFAULT_API_PORT;
  const parsed = portSchema.safeParse(rawPort);
  if (!parsed.success) {
    throw new Error(
      `FILMZY_API_PORT non è valida: serve un numero intero da 1 a 65535 (trovato "${String(rawPort)}").`,
    );
  }
  return parsed.data;
}
