import { defineConfig } from 'drizzle-kit';

/**
 * Serve solo a `pnpm --filter @filmzy/db migrazioni`, che genera il file SQL della migrazione
 * dallo schema. Le migrazioni si committano insieme al cambio di schema (CLAUDE.md) e in esercizio
 * le applica `openFilmzyDatabase`, non drizzle-kit: il programma dell'utente non ha strumenti di
 * sviluppo. Nessun percorso di database qui, per non puntare per sbaglio ai dati di qualcuno.
 */
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/schema.ts',
  out: './migrations',
  strict: true,
  verbose: true,
});
