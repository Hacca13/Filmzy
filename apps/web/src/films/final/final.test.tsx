import type { ReviewDifference, Screenplay, ScreenplayVersionSummary } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FinalEditor } from './FinalEditor';
import { FinalView } from './FinalView';
import { ReviewList } from './ReviewList';
import {
  answersFor,
  applyEdits,
  canSave,
  canWrite,
  describeDifference,
  editsOf,
  finalVersionNote,
} from './model';

const oste: ReviewDifference = {
  key: 'character:not_chosen:oste-p',
  kind: 'character',
  reason: 'not_chosen',
  name: 'L’oste',
  choices: ['adapt', 'keep'],
};
const marco: ReviewDifference = {
  key: 'character:not_in_draft:c-2',
  kind: 'character',
  reason: 'not_in_draft',
  name: 'Marco',
  choices: [],
};
const stazione: ReviewDifference = {
  key: 'location:not_chosen:stazione-p',
  kind: 'location',
  reason: 'not_chosen',
  name: 'La stazione',
  choices: ['adapt', 'keep'],
};

const screenplay: Screenplay = {
  title: 'L’ultima corsa',
  logline: 'Una bobina dimenticata.',
  characters: [],
  locations: [],
  scenes: [
    {
      number: 1,
      heading: 'INT. STAZIONE - NOTTE',
      locationId: 'l-1',
      timeOfDay: 'notte',
      characterIds: ['c-1', 'sconosciuto'],
      summary: 'Anna trova la bobina.',
      beats: [],
      durationS: 30,
    },
  ],
};

describe('describeDifference', () => {
  it('dice in parole semplici cosa non torna, per personaggi e luoghi', () => {
    expect(describeDifference(oste)).toBe(
      'Nella bozza c’è L’oste, ma non l’hai scelto tra i personaggi.',
    );
    expect(describeDifference(stazione)).toBe(
      'Nella bozza c’è il luogo «La stazione», ma non l’hai aggiunto ai luoghi.',
    );
    expect(describeDifference(marco)).toContain('Hai scelto Marco, ma la bozza non lo nomina');
  });
});

describe('le risposte', () => {
  const differences = [oste, marco, stazione];

  it('si può scrivere solo quando ogni differenza su cui si decide ha la sua risposta', () => {
    expect(canWrite(differences, {})).toBe(false);
    expect(canWrite(differences, { [oste.key]: 'keep' })).toBe(false);
    expect(canWrite(differences, { [oste.key]: 'keep', [stazione.key]: 'adapt' })).toBe(true);
    expect(canWrite([], {})).toBe(true);
    expect(canWrite([marco], {})).toBe(true);
  });

  it('si mandano solo le risposte a differenze che ci sono ancora', () => {
    expect(
      answersFor(differences, { [oste.key]: 'keep', 'character:not_chosen:vecchia': 'adapt' }),
    ).toEqual([{ key: oste.key, decision: 'keep' }]);
  });
});

describe('ReviewList', () => {
  const noop = () => undefined;

  it('senza differenze dice che tutto torna', () => {
    const html = renderToStaticMarkup(
      <ReviewList
        differences={[]}
        answers={{}}
        onAnswer={noop}
        onChangeChoice={noop}
        busy={false}
      />,
    );

    expect(html).toContain('Tutto torna');
  });

  it('dove si decide ci sono i tre pulsanti, dove non c’è da decidere solo «Cambia la mia scelta»', () => {
    const html = renderToStaticMarkup(
      <ReviewList
        differences={[oste, marco]}
        answers={{}}
        onAnswer={noop}
        onChangeChoice={noop}
        busy={false}
      />,
    );

    expect(html.match(/Adatta la storia/g)).toHaveLength(1);
    expect(html.match(/Va bene così/g)).toHaveLength(1);
    expect(html.match(/Cambia la mia scelta/g)).toHaveLength(2);
  });

  it('la risposta data si vede (pulsante premuto) e il lavoro in corso blocca i pulsanti', () => {
    const html = renderToStaticMarkup(
      <ReviewList
        differences={[oste]}
        answers={{ [oste.key]: 'keep' }}
        onAnswer={noop}
        onChangeChoice={noop}
        busy
      />,
    );

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('disabled');
  });
});

describe('finalVersionNote', () => {
  const base: ScreenplayVersionSummary = {
    id: 'v-1',
    projectId: 'film-1',
    stage: 'final',
    version: 1,
    title: 'L’ultima corsa',
    createdAt: '2026-11-02T10:00:00.000Z',
  };

  it('dice se l’ha scritta lo sceneggiatore o l’utente a mano', () => {
    expect(finalVersionNote({ ...base, generationId: 's-1' })).toBe('Scritta dallo sceneggiatore');
    expect(finalVersionNote({ ...base, version: 2 })).toBe('Corretta a mano');
  });
});

describe('FinalView', () => {
  it('nomina chi ci sta e dove, con i nomi del cast e dei luoghi; un id sconosciuto si salta', () => {
    const html = renderToStaticMarkup(
      <FinalView
        screenplay={screenplay}
        characters={[{ id: 'c-1', name: 'Anna' }]}
        locations={[{ id: 'l-1', name: 'La stazione' }]}
      />,
    );

    expect(html).toContain('L’ultima corsa');
    expect(html).toContain('Anna trova la bobina.');
    expect(html).toContain('Con Anna');
    expect(html).toContain('Luogo: La stazione');
    expect(html).not.toContain('sconosciuto');
  });
});

describe('la correzione a mano', () => {
  it('parte dai testi della stesura', () => {
    expect(editsOf(screenplay)).toEqual({
      title: 'L’ultima corsa',
      logline: 'Una bobina dimenticata.',
      scenes: [
        { heading: 'INT. STAZIONE - NOTTE', timeOfDay: 'notte', summary: 'Anna trova la bobina.' },
      ],
    });
  });

  it('applicare le correzioni cambia solo i testi, e toglie gli spazi ai bordi', () => {
    const next = applyEdits(screenplay, {
      ...editsOf(screenplay),
      title: '  La corsa di notte ',
    });

    expect(next.title).toBe('La corsa di notte');
    expect(next.scenes).toEqual(screenplay.scenes);
  });

  it('si salva solo se è cambiato qualcosa e nessun testo è rimasto vuoto', () => {
    const edits = editsOf(screenplay);

    expect(canSave(screenplay, edits)).toBe(false);
    expect(canSave(screenplay, { ...edits, title: 'La corsa' })).toBe(true);
    expect(canSave(screenplay, { ...edits, title: '   ' })).toBe(false);
    expect(
      canSave(screenplay, {
        ...edits,
        scenes: [{ heading: 'INT. STAZIONE', timeOfDay: 'notte', summary: '' }],
      }),
    ).toBe(false);
  });

  it('il modulo mostra i testi da correggere, un campo per scena', () => {
    const html = renderToStaticMarkup(
      <FinalEditor
        screenplay={screenplay}
        busy={false}
        onSave={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(html).toContain('value="L’ultima corsa"');
    expect(html).toContain('Scena 1');
    expect(html).toContain('Anna trova la bobina.');
    expect(html).toContain('Salva la correzione');
  });
});
