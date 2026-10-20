import { z } from 'zod';

/** Tipo di un servizio nel catalogo (`config/ai/models.yaml`): architettura §4.3. */
export const MODEL_KINDS = ['llm', 'image', 'video', 'music', 'sfx', 'voice'] as const;

export const modelKindSchema = z.enum(MODEL_KINDS);

export type ModelKind = z.infer<typeof modelKindSchema>;

/**
 * Gruppo che l'utente vede nelle impostazioni (architettura §5.6): testo, lettura immagini,
 * immagini, video, musica ed effetti, voci. `vision` è un gruppo di ruoli di testo (oggi solo
 * `image_analyst`), non un `ModelKind`: condivide fornitori e chiavi del gruppo `text`.
 */
export const MODEL_GROUPS = ['text', 'vision', 'image', 'video', 'audio', 'voice'] as const;

export const modelGroupSchema = z.enum(MODEL_GROUPS);

export type ModelGroup = z.infer<typeof modelGroupSchema>;

/**
 * Il gruppo di un tipo di servizio (architettura §4.3): `music` e `sfx` stanno entrambi in
 * «Musica ed effetti». `vision` non ha un `ModelKind` corrispondente: un ruolo ci entra in base a
 * `requires: [vision]`, non al tipo del suo modello.
 */
export function modelGroupForKind(kind: ModelKind): ModelGroup {
  switch (kind) {
    case 'llm':
      return 'text';
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'music':
    case 'sfx':
      return 'audio';
    case 'voice':
      return 'voice';
  }
}
