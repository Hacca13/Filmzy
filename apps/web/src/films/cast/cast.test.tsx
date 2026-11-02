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
  angleLabel,
  attemptIsComplete,
  attemptLabel,
  imageStatusText,
  sheetIsWorking,
} from './sheet-model';
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
          filmId="film-1"
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

describe('sheet-model', () => {
  const attempt = (statuses: ('queued' | 'running' | 'succeeded' | 'failed')[]) => ({
    attempt: 2,
    createdAt: '2026-10-28T10:00:00.000Z',
    images: (['front', 'profile', 'three_quarter'] as const).map((angle, index) => ({
      angle,
      status: statuses[index] ?? 'queued',
    })),
  });

  it('le angolazioni hanno nomi semplici', () => {
    expect(['front', 'profile', 'three_quarter'].map((a) => angleLabel(a as never))).toEqual([
      'Fronte',
      'Profilo',
      'Tre quarti',
    ]);
  });

  it('ogni stato dice cosa sta succedendo, e un’immagine fallita dice perché in parole semplici', () => {
    expect(imageStatusText('queued')).toBe('In coda…');
    expect(imageStatusText('running')).toBe('Sto disegnando…');
    expect(imageStatusText('failed', 'content_rejected')).toContain('rifiutato');
    expect(imageStatusText('failed', 'codice_inventato')).toContain('Puoi riprovare');
  });

  it('si continua a guardare finché qualcosa lavora, e basta quando tutto è finito', () => {
    const base = { characterId: 'c-1' };

    expect(
      sheetIsWorking({ ...base, attempts: [attempt(['succeeded', 'running', 'queued'])] }),
    ).toBe(true);
    expect(
      sheetIsWorking({ ...base, attempts: [attempt(['succeeded', 'failed', 'succeeded'])] }),
    ).toBe(false);
    expect(sheetIsWorking({ ...base, attempts: [] })).toBe(false);
  });

  it('un tentativo si sceglie solo se tutte e tre le immagini sono pronte', () => {
    expect(attemptIsComplete(attempt(['succeeded', 'succeeded', 'succeeded']))).toBe(true);
    expect(attemptIsComplete(attempt(['succeeded', 'failed', 'succeeded']))).toBe(false);
    expect(attemptIsComplete({ ...attempt([]), images: [] })).toBe(false);
  });

  it('il tentativo col volto bloccato lo dice', () => {
    expect(attemptLabel(attempt([]), undefined)).toBe('Tentativo 2');
    expect(attemptLabel(attempt([]), 2)).toBe('Tentativo 2 · volto bloccato');
  });
});
