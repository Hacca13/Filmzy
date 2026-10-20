import { z } from 'zod';

/**
 * Corpo di una risposta di errore del server locale. Il `code` è un codice del dominio
 * (per esempio `forbidden_host`), mai un testo per l'utente: i messaggi stanno nell'interfaccia.
 */
export const apiErrorSchema = z.object({
  code: z.string().min(1),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
