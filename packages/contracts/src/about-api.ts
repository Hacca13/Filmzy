import { z } from 'zod';

/**
 * «Informazioni» e «I tuoi dati» (T6.2, D91): la versione del programma e dove stanno i dati. Il percorso
 * si mostra all'utente sul suo computer: non va a nessun altro (D29).
 */
export const aboutSchema = z.object({
  version: z.string().min(1),
  /** La cartella dei dati: database, film e copie di sicurezza. */
  dataDir: z.string().min(1),
});

export type About = z.infer<typeof aboutSchema>;

/** La pagina del progetto: il codice, la licenza, le segnalazioni. È di Filmzy, non di un fornitore. */
export const PROJECT_URL = 'https://github.com/Hacca13/Filmzy';
