import { randomUUID } from 'node:crypto';

import {
  characterAppearanceSchema,
  characterProfileSchema,
  characterSchema,
  type Character,
} from '@filmzy/contracts';
import { asc, eq } from 'drizzle-orm';

import type { FilmzyDb } from './open.js';
import { characters, type CharacterRow } from './schema.js';

/** Un personaggio nuovo: tutto tranne ciò che assegna il database e la scheda, che arriva con T3.6. */
export type NewCharacter = Omit<Character, 'id' | 'sheet'>;

/** Quello che si può cambiare di un personaggio già aggiunto, un campo alla volta. */
export type CharacterChanges = Partial<
  Pick<Character, 'name' | 'tag' | 'role' | 'description' | 'profile'>
>;

/**
 * I personaggi dei film nel database (architettura §6). Quello che entra è già stato controllato
 * dal backend; una riga che non torna come `Character` fa un errore invece di sparire dal cast.
 */
export interface CharacterStore {
  create: (projectId: string, input: NewCharacter) => Character;
  get: (id: string) => Character | undefined;
  /** Nell'ordine in cui sono stati aggiunti. */
  list: (projectId: string) => Character[];
  /** Cambia i campi dati; `undefined` se il personaggio non c'è. */
  update: (id: string, changes: CharacterChanges) => Character | undefined;
  /** `true` se c'era e adesso non c'è più. */
  remove: (id: string) => boolean;
}

export interface CharacterStoreOptions {
  now?: () => Date;
}

function parseJson(text: string): unknown {
  return JSON.parse(text);
}

function toCharacter(row: CharacterRow): Character {
  return characterSchema.parse({
    id: row.id,
    name: row.name,
    tag: row.tag,
    role: row.role,
    description: row.description,
    ...(row.profile === null
      ? {}
      : { profile: characterProfileSchema.parse(parseJson(row.profile)) }),
    appearance: characterAppearanceSchema.parse(parseJson(row.appearance)),
    sheet: [],
    ...(row.voiceId === null ? {} : { voiceId: row.voiceId }),
    ...(row.proposalId === null ? {} : { proposalId: row.proposalId }),
  });
}

export function createCharacterStore(
  db: FilmzyDb,
  options: CharacterStoreOptions = {},
): CharacterStore {
  const now = options.now ?? (() => new Date());

  const get = (id: string): Character | undefined => {
    const row = db.select().from(characters).where(eq(characters.id, id)).get();
    return row === undefined ? undefined : toCharacter(row);
  };

  return {
    create(projectId, input) {
      const at = now().getTime();
      const row = db
        .insert(characters)
        .values({
          id: randomUUID(),
          projectId,
          name: input.name,
          tag: input.tag,
          role: input.role,
          description: input.description,
          profile: input.profile === undefined ? null : JSON.stringify(input.profile),
          appearance: JSON.stringify(input.appearance),
          voiceId: input.voiceId ?? null,
          proposalId: input.proposalId ?? null,
          createdAt: at,
          updatedAt: at,
        })
        .returning()
        .get();
      return toCharacter(row);
    },

    get,

    list(projectId) {
      return db
        .select()
        .from(characters)
        .where(eq(characters.projectId, projectId))
        .orderBy(asc(characters.createdAt), asc(characters.id))
        .all()
        .map(toCharacter);
    },

    update(id, changes) {
      if (get(id) === undefined) return undefined;
      const { profile, ...rest } = changes;
      db.update(characters)
        .set({
          ...rest,
          ...(profile === undefined ? {} : { profile: JSON.stringify(profile) }),
          updatedAt: now().getTime(),
        })
        .where(eq(characters.id, id))
        .run();
      return get(id);
    },

    remove(id) {
      return db.delete(characters).where(eq(characters.id, id)).run().changes > 0;
    },
  };
}
