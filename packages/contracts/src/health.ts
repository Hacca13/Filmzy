import { z } from 'zod';

/**
 * Perché il programma non può aprire i dati (architettura §6.2): sono di una versione più nuova,
 * l'aggiornamento non è riuscito, oppure non si leggono proprio. `backupFile` dice dov'è la copia di
 * sicurezza, se c'è, e `file` dove stanno i dati: l'utente deve poterli ritrovare.
 */
export const startupBlockSchema = z.object({
  reason: z.enum(['database_too_new', 'migration_failed', 'database_unreadable']),
  backupFile: z.string().min(1).optional(),
  file: z.string().min(1).optional(),
});

export type StartupBlock = z.infer<typeof startupBlockSchema>;

/**
 * Risposta di `GET /api/health`: dice all'interfaccia se il server locale è in piedi. Se i dati non si
 * aprono il server resta acceso solo per dire perché, e l'interfaccia mostra la schermata giusta.
 */
export const healthResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok') }),
  z.object({ status: z.literal('blocked'), block: startupBlockSchema }),
]);

export type HealthResponse = z.infer<typeof healthResponseSchema>;
