import {
  ROLE_OUTPUT_EXAMPLES,
  castingOutputSchema,
  type CastingSuggestion,
  type Character,
  type CharacterTag,
} from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import {
  enabledTags,
  suggestionAsCharacter,
  tagChoices,
  usableSuggestions,
} from './casting-input.js';

const example = castingOutputSchema.parse(ROLE_OUTPUT_EXAMPLES.casting)
  .suggestions[0] as CastingSuggestion;

const tags: CharacterTag[] = [
  {
    id: 'protagonist',
    label: 'Protagonista',
    description: 'La storia segue lui o lei',
    enabled: true,
  },
  { id: 'ally', label: 'Alleato', description: 'Aiuta il protagonista', enabled: true },
];

const suggest = (name: string, extra: Partial<CastingSuggestion> = {}): CastingSuggestion => ({
  ...example,
  name,
  tag: 'ally',
  ...extra,
});

const none: Character[] = [];

describe('enabledTags', () => {
  it('offre solo i ruoli attivi dei preset, con nome e riga che li spiega', () => {
    // Basta la parte che le funzioni leggono: i ruoli dei personaggi.
    const config = {
      presets: {
        characterTags: [
          ...tags,
          { id: 'mentor', label: 'Mentore', description: 'Guida', enabled: false },
        ],
      },
    } as unknown as Parameters<typeof enabledTags>[0];

    expect(enabledTags(config).map((tag) => tag.id)).toEqual(['protagonist', 'ally']);
    expect(tagChoices(config)).toEqual([
      { id: 'protagonist', label: 'Protagonista', description: 'La storia segue lui o lei' },
      { id: 'ally', label: 'Alleato', description: 'Aiuta il protagonista' },
    ]);
  });
});

describe('suggestionAsCharacter', () => {
  it('una proposta sul tavolo si presenta al casting come un personaggio senza scheda', () => {
    const character = suggestionAsCharacter(suggest('Tomás', { proposalId: 'p-1' }), 0);

    expect(character).toMatchObject({ id: 'p-1', name: 'Tomás', sheet: [], proposalId: 'p-1' });
  });

  it('senza proposalId prende un id provvisorio, diverso per ogni proposta', () => {
    const bare = suggest('Tomás');
    delete bare.proposalId;

    expect(suggestionAsCharacter(bare, 0).id).not.toBe(suggestionAsCharacter(bare, 1).id);
  });
});

describe('usableSuggestions', () => {
  const options = { count: 2, taken: none, tags };

  it('tiene al massimo quante ne sono state chieste', () => {
    const many = [suggest('Anna'), suggest('Bruno'), suggest('Carla')];

    expect(usableSuggestions(many, options).map((s) => s.name)).toEqual(['Anna', 'Bruno']);
  });

  it('ne dà di meno, se il casting ne ha date di meno: non se ne inventano', () => {
    expect(usableSuggestions([suggest('Anna')], options)).toHaveLength(1);
  });

  it('toglie i doppioni: tra loro e con chi è già nel cast, senza badare a maiuscole e spazi', () => {
    const taken = [{ ...suggestionAsCharacter(suggest('Marco'), 0) }];

    const result = usableSuggestions(
      [suggest('Anna'), suggest(' anna '), suggest('MARCO'), suggest('Luca')],
      { ...options, taken },
    );

    expect(result.map((s) => s.name)).toEqual(['Anna', 'Luca']);
  });

  it('scarta chi ha un ruolo che non c’è nei preset, e chi vuole riusare un personaggio', () => {
    const result = usableSuggestions(
      [
        suggest('Anna', { tag: 'inventato' }),
        suggest('Bruno', { action: 'reuse', characterId: 'x' }),
        suggest('Carla'),
      ],
      options,
    );

    expect(result.map((s) => s.name)).toEqual(['Carla']);
  });

  it('i dettagli facoltativi mancanti non fanno niente: la proposta resta valida', () => {
    const withoutDetails = suggest('Anna');
    delete withoutDetails.profile;

    expect(usableSuggestions([withoutDetails], options)).toHaveLength(1);
  });
});
