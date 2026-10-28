import {
  ROLE_OUTPUT_EXAMPLES,
  castingOutputSchema,
  type Character,
  type ProjectChoice,
} from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CharacterCard, SuggestionCard } from './Cards';
import {
  appearanceSummary,
  countOptions,
  profileDraftOf,
  sameProfile,
  slotsLeft,
  tagLabel,
  toProfile,
} from './model';

const suggestion = castingOutputSchema.parse(ROLE_OUTPUT_EXAMPLES.casting).suggestions[0];
if (suggestion === undefined) throw new Error('manca la proposta di esempio');

const tags: ProjectChoice[] = [
  { id: 'protagonist', label: 'Protagonista' },
  { id: 'ally', label: 'Alleato' },
];

const character: Character = {
  id: 'c-1',
  name: suggestion.name,
  tag: 'ally',
  role: suggestion.role,
  description: suggestion.description,
  appearance: suggestion.appearance,
  sheet: [],
};

const noop = () => undefined;

describe('model', () => {
  it('il ruolo si dice col suo nome, mai con l’id', () => {
    expect(tagLabel(tags, 'ally')).toBe('Alleato');
    expect(tagLabel(tags, 'inventato')).toBeUndefined();
  });

  it('i posti liberi sono il massimo meno i personaggi, mai meno di zero', () => {
    expect(slotsLeft({ characters: [], maxCharacters: 2 })).toBe(2);
    expect(slotsLeft({ characters: [character], maxCharacters: 2 })).toBe(1);
    expect(slotsLeft({ characters: [character, character, character], maxCharacters: 2 })).toBe(0);
  });

  it('si può chiedere da uno al numero di posti liberi', () => {
    expect(countOptions(3)).toEqual([1, 2, 3]);
    expect(countOptions(0)).toEqual([]);
  });

  it('l’aspetto è una riga, senza i campi vuoti', () => {
    expect(appearanceSummary({ ...suggestion.appearance, distinctive: ' ' })).toBe(
      '60 · robusta · barba grigia corta · occhiali tondi, sguardo stanco · maglione verde scuro',
    );
  });

  it('i dettagli facoltativi: i campi vuoti non ci sono, gli altri senza spazi attorno', () => {
    expect(toProfile({ personality: ' testarda ', behavior: '', goal: '   ' })).toEqual({
      personality: 'testarda',
    });
    expect(toProfile({ personality: '', behavior: '', goal: '' })).toEqual({});
    expect(profileDraftOf(undefined)).toEqual({ personality: '', behavior: '', goal: '' });
  });

  it('due bozze dei dettagli dicono la stessa cosa anche con spazi e vuoti diversi', () => {
    const original = profileDraftOf({ personality: 'testarda' });

    expect(sameProfile(original, { personality: ' testarda ', behavior: ' ', goal: '' })).toBe(
      true,
    );
    expect(sameProfile(original, { ...original, goal: 'ritrovare Luca' })).toBe(false);
  });
});

describe('SuggestionCard', () => {
  const render = (extra: { busy?: boolean; canAdd?: boolean } = {}) =>
    renderToStaticMarkup(
      <ul>
        <SuggestionCard
          suggestion={suggestion}
          tags={tags}
          busy={extra.busy ?? false}
          canAdd={extra.canAdd ?? true}
          onAdd={noop}
          onChange={noop}
          onDiscard={noop}
        />
      </ul>,
    );

  it('mostra il personaggio e offre «Aggiungi», «Cambia» e «Scarta»', () => {
    const html = render();

    expect(html).toContain(suggestion.name);
    expect(html).toContain('Alleato');
    expect(html).toContain(suggestion.relationToProtagonist);
    expect(html).toContain('Perché lo proponiamo');
    for (const label of ['Aggiungi', 'Cambia', 'Scarta']) expect(html).toContain(label);
  });

  it('i dettagli facoltativi mancanti non lasciano righe vuote', () => {
    const html = render();

    expect(html).not.toContain('Carattere:');
    expect(html).not.toContain('Cosa vuole:');
  });

  it('senza posti liberi «Aggiungi» è spento, e mentre lavora lo sono tutti', () => {
    expect(render({ canAdd: false }).match(/disabled/g)).toHaveLength(1);
    expect(render({ busy: true }).match(/disabled/g)).toHaveLength(3);
  });

  it('non mostra parole tecniche', () => {
    const html = render().toLowerCase();

    for (const word of ['prompt', 'modello', 'token', 'temperatura']) {
      expect(html).not.toContain(word);
    }
  });
});

describe('CharacterCard', () => {
  const render = (busy = false) =>
    renderToStaticMarkup(
      <ul>
        <CharacterCard
          character={character}
          tags={tags}
          busy={busy}
          onSave={noop}
          onRemove={noop}
        />
      </ul>,
    );

  it('mostra il ruolo da scegliere e i tre dettagli, tutti facoltativi', () => {
    const html = render();

    expect(html).toContain('Ruolo nella storia');
    expect(html).toContain('Carattere (facoltativo)');
    expect(html).toContain('Come si comporta (facoltativo)');
    expect(html).toContain('Cosa vuole (facoltativo)');
    expect(html).toContain('Togli dal film');
  });

  it('senza modifiche «Salva» è spento: non c’è niente da salvare', () => {
    expect(render()).toContain('disabled=""');
  });
});
