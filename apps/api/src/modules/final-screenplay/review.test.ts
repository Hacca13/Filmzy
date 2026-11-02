import type { Character, Location, Screenplay } from '@filmzy/contracts';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { acceptedFromAnswers, compareDraftWithChoices } from './review.js';

const annaProposal = { id: 'anna-p', name: 'Anna', role: 'protagonista' };

function draft(overrides: Partial<Screenplay> = {}): Screenplay {
  return {
    title: 'L’ultima corsa',
    logline: 'Una bobina dimenticata.',
    characters: [annaProposal, { id: 'oste-p', name: 'L’oste', role: 'comparsa' }],
    locations: [
      { id: 'stazione-p', name: 'La stazione', description: 'Di notte', prompt: 'station' },
    ],
    scenes: [],
    ...overrides,
  };
}

const anna = {
  id: 'c-1',
  name: 'Anna',
  proposalId: 'anna-p',
} as unknown as Character;
const marco = { id: 'c-2', name: 'Marco' } as unknown as Character;
const stazione = {
  id: 'l-1',
  name: 'La stazione',
  proposalId: 'stazione-p',
} as unknown as Location;

function codeOf(call: () => unknown): unknown {
  try {
    call();
  } catch (error) {
    if (error instanceof HttpException) return (error.getResponse() as { code: string }).code;
    throw error;
  }
  return undefined;
}

describe('compareDraftWithChoices', () => {
  it('senza differenze l’elenco è vuoto: il passo si salta', () => {
    const everything = draft({ characters: [annaProposal] });
    expect(compareDraftWithChoices(everything, [anna], [stazione])).toEqual([]);
  });

  it('un personaggio citato dalla bozza e non scelto è una differenza su cui l’utente decide', () => {
    expect(compareDraftWithChoices(draft(), [anna], [stazione])).toEqual([
      {
        key: 'character:not_chosen:oste-p',
        kind: 'character',
        reason: 'not_chosen',
        name: 'L’oste',
        choices: ['adapt', 'keep'],
      },
    ]);
  });

  it('un luogo citato dalla bozza e non aggiunto è una differenza come i personaggi', () => {
    const [difference] = compareDraftWithChoices(draft({ characters: [] }), [], []);
    expect(difference).toMatchObject({
      key: 'location:not_chosen:stazione-p',
      kind: 'location',
      choices: ['adapt', 'keep'],
    });
  });

  it('un personaggio del film che la bozza non cita si vede, ma non c’è niente da decidere', () => {
    const only = draft({ characters: [annaProposal] });
    expect(compareDraftWithChoices(only, [anna, marco], [stazione])).toEqual([
      {
        key: 'character:not_in_draft:c-2',
        kind: 'character',
        reason: 'not_in_draft',
        name: 'Marco',
        choices: [],
      },
    ]);
  });

  it('un personaggio con la proposta di un’altra bozza vale come «non nella bozza»', () => {
    const stale: Character = { ...anna, proposalId: 'vecchia-p' };
    const keys = compareDraftWithChoices(draft(), [stale], [stazione]).map((d) => d.key);
    expect(keys).toEqual([
      'character:not_chosen:anna-p',
      'character:not_chosen:oste-p',
      'character:not_in_draft:c-1',
    ]);
  });

  it('prima i personaggi, poi i luoghi', () => {
    const kinds = compareDraftWithChoices(draft(), [], []).map((d) => d.kind);
    expect(kinds).toEqual(['character', 'character', 'location']);
  });
});

describe('acceptedFromAnswers', () => {
  const differences = compareDraftWithChoices(draft(), [anna, marco], []);
  // oste (decide), stazione (decide), marco (solo da leggere)

  it('«Va bene così» porta l’elemento alla stesura, «Adatta la storia» no', () => {
    const accepted = acceptedFromAnswers(differences, [
      { key: 'character:not_chosen:oste-p', decision: 'keep' },
      { key: 'location:not_chosen:stazione-p', decision: 'adapt' },
    ]);
    expect(accepted).toEqual([{ kind: 'character', name: 'L’oste' }]);
  });

  it('una differenza senza risposta ferma la stesura', () => {
    const code = codeOf(() =>
      acceptedFromAnswers(differences, [{ key: 'character:not_chosen:oste-p', decision: 'keep' }]),
    );
    expect(code).toBe('invalid_request');
  });

  it('una risposta a una differenza che non c’è più (il cast è cambiato) ferma la stesura', () => {
    const code = codeOf(() =>
      acceptedFromAnswers(differences, [
        { key: 'character:not_chosen:oste-p', decision: 'keep' },
        { key: 'location:not_chosen:stazione-p', decision: 'keep' },
        { key: 'character:not_chosen:fantasma', decision: 'keep' },
      ]),
    );
    expect(code).toBe('invalid_request');
  });

  it('una risposta non ammessa o data due volte ferma la stesura', () => {
    const notAllowed = codeOf(() =>
      acceptedFromAnswers(differences, [{ key: 'character:not_in_draft:c-2', decision: 'keep' }]),
    );
    const twice = codeOf(() =>
      acceptedFromAnswers(differences, [
        { key: 'character:not_chosen:oste-p', decision: 'keep' },
        { key: 'character:not_chosen:oste-p', decision: 'adapt' },
      ]),
    );
    expect(notAllowed).toBe('invalid_request');
    expect(twice).toBe('invalid_request');
  });

  it('senza differenze non servono risposte', () => {
    expect(acceptedFromAnswers([], [])).toEqual([]);
  });
});

describe('compareDraftWithChoices: senza proposalId', () => {
  it('un personaggio scelto senza legame con la bozza, ma con lo stesso nome, vale come quello della bozza', () => {
    const written = { id: 'c-9', name: ' anna ' } as unknown as Character;
    const keys = compareDraftWithChoices(draft(), [written], [stazione]).map((d) => d.key);

    // Anna non compare né come «non scelto» né come «non nella bozza»; l'oste resta da decidere.
    expect(keys).toEqual(['character:not_chosen:oste-p']);
  });

  it('due scelti con lo stesso nome prendono una proposta sola: l’altro è «non nella bozza»', () => {
    const first = { id: 'c-8', name: 'Anna' } as unknown as Character;
    const second = { id: 'c-9', name: 'anna' } as unknown as Character;
    const keys = compareDraftWithChoices(draft(), [first, second], [stazione]).map((d) => d.key);

    expect(keys).toEqual(['character:not_chosen:oste-p', 'character:not_in_draft:c-9']);
  });

  it('il legame col proposalId vince sul nome', () => {
    const renamed = { id: 'c-1', name: 'Annetta', proposalId: 'anna-p' } as unknown as Character;
    const keys = compareDraftWithChoices(draft(), [renamed], [stazione]).map((d) => d.key);

    expect(keys).toEqual(['character:not_chosen:oste-p']);
  });
});
