import { ROLE_INPUT_EXAMPLES, cinematographerInputSchema, type ShotSpec } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { LOCATION_CHANGED_REASON, locationChangeFlags, oldestWork } from './continuity.js';

const example = cinematographerInputSchema.parse(ROLE_INPUT_EXAMPLES.cinematographer).shot;
const shotIn = (id: string, locationId: string): ShotSpec => ({
  ...example,
  id,
  location: { ...example.location, locationId },
});

describe('R6: un luogo cambiato ingiallisce le inquadrature già fatte (D21)', () => {
  const shots = [shotIn('s1', 'piazza'), shotIn('s2', 'piazza'), shotIn('s3', 'cucina')];

  it('chi ha un lavoro fatto prima del cambiamento ingiallisce; gli altri luoghi no', () => {
    const flags = locationChangeFlags({
      shots,
      changedAt: { piazza: 1000 },
      workedAt: { s1: 500, s2: 800, s3: 100 },
    });

    expect(Object.keys(flags).sort()).toEqual(['s1', 's2']);
    expect(flags['s1']).toEqual([{ code: 'R6', reason: LOCATION_CHANGED_REASON, origin: 'rule' }]);
  });

  it('un’inquadratura mai fatta non ha niente da rifare, e una rifatta dopo il cambiamento è allineata', () => {
    const flags = locationChangeFlags({
      shots,
      changedAt: { piazza: 1000 },
      workedAt: { s2: 1500 },
    });

    expect(flags).toEqual({});
  });

  it('un lavoro arrivato nello stesso istante del cambiamento è allineato', () => {
    expect(
      locationChangeFlags({ shots, changedAt: { piazza: 1000 }, workedAt: { s1: 1000 } }),
    ).toEqual({});
  });

  it('senza cambiamenti non c’è nessun giallo, e senza inquadrature neppure', () => {
    expect(locationChangeFlags({ shots, changedAt: {}, workedAt: { s1: 1 } })).toEqual({});
    expect(locationChangeFlags({ shots: [], changedAt: { piazza: 5 }, workedAt: {} })).toEqual({});
  });

  it('il motivo è in parole semplici e dice cosa fare', () => {
    expect(LOCATION_CHANGED_REASON).toContain('Rifai');
    expect(LOCATION_CHANGED_REASON.toLowerCase()).not.toMatch(/prompt|modello|token/);
  });
});

describe('oldestWork: rifare solo una parte non toglie il giallo', () => {
  it('conta il lavoro più vecchio fra immagini e video', () => {
    expect(oldestWork({ s1: 500, s2: 800 }, { s1: 2000, s3: 300 })).toEqual({
      s1: 500,
      s2: 800,
      s3: 300,
    });
  });

  it('senza nessun lavoro non c’è niente, e con un solo tipo conta quello', () => {
    expect(oldestWork({}, {})).toEqual({});
    expect(oldestWork({ s1: 7 }, {})).toEqual({ s1: 7 });
    expect(oldestWork({}, { s1: 9 })).toEqual({ s1: 9 });
  });

  it('rifatto solo il video, l’inquadratura resta gialla finché lo storyboard è quello di prima', () => {
    const shots = [shotIn('s1', 'piazza')];

    const flags = locationChangeFlags({
      shots,
      changedAt: { piazza: 1000 },
      workedAt: oldestWork({ s1: 500 }, { s1: 2000 }),
    });

    expect(Object.keys(flags)).toEqual(['s1']);
    expect(
      locationChangeFlags({
        shots,
        changedAt: { piazza: 1000 },
        workedAt: oldestWork({ s1: 3000 }, { s1: 2000 }),
      }),
    ).toEqual({});
  });
});
