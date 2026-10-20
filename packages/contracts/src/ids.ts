import { z } from 'zod';

/** Un identificativo del dominio: non vuoto, senza spazi iniziali o finali. */
export const idSchema = z.string().trim().min(1);

/**
 * Una chiave dei file di `config/` (connessioni, modelli, ruoli, preset...): lettere minuscole,
 * cifre, `_` e `-`, senza iniziare con `_` o `-`. Becca i refusi prima che diventino un
 * riferimento rotto (architettura §4.6 punto 2).
 */
export const configKeySchema = z.string().regex(/^[a-z0-9][a-z0-9_-]*$/);

export const projectIdSchema = idSchema;
export const sceneIdSchema = idSchema;
export const shotIdSchema = idSchema;
export const takeIdSchema = idSchema;
export const assetIdSchema = idSchema;
export const characterIdSchema = idSchema;
export const locationIdSchema = idSchema;
export const generationIdSchema = idSchema;
export const modelIdSchema = configKeySchema;
export const connectionIdSchema = configKeySchema;
