import { beforeEach, describe, expect, it } from 'vitest';

import { createCharacterStore, type CharacterStore, type NewCharacter } from './character-store.js';
import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { tempDataDir } from './test.fixtures.js';

const anna: NewCharacter = {
  name: 'Anna',
  tag: 'protagonist',
  role: 'La protagonista',
  description: 'Una donna che torna nella città natale.',
  appearance: {
    apparentAge: '35 anni',
    build: 'snella',
    hair: 'castani, corti',
    face: 'occhi chiari',
    clothing: 'giacca di jeans',
    prompt: 'a woman in her mid thirties, short brown hair, denim jacket',
  },
};

let dataDir: string;
let aperto: OpenedDatabase;
let store: CharacterStore;
let clock = new Date('2026-10-28T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-10-28T10:00:00.000Z');
  dataDir = await tempDataDir();
  aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });
  store = createCharacterStore(aperto.db, { now: () => clock });
  return () => {
    aperto.close();
  };
});

describe('CharacterStore', () => {
  it('crea un personaggio e lo rilegge com’è, con la scheda ancora vuota', () => {
    const created = store.create('film-1', {
      ...anna,
      profile: { personality: 'testarda', goal: 'ritrovare un amico' },
      proposalId: 'anna',
    });

    expect(created).toMatchObject({
      ...anna,
      profile: { personality: 'testarda', goal: 'ritrovare un amico' },
      proposalId: 'anna',
      sheet: [],
    });
    expect(store.get(created.id)).toEqual(created);
  });

  it('i dettagli facoltativi si possono omettere: il personaggio resta valido', () => {
    const created = store.create('film-1', anna);

    expect(created.profile).toBeUndefined();
    expect(created.proposalId).toBeUndefined();
    expect(store.get(created.id)).toEqual(created);
  });

  it('elenca i personaggi di un film nell’ordine in cui sono stati aggiunti, e solo i suoi', () => {
    const first = store.create('film-1', anna);
    clock = new Date('2026-10-28T10:01:00.000Z');
    const second = store.create('film-1', { ...anna, name: 'Marco' });
    store.create('film-2', { ...anna, name: 'Altrove' });

    expect(store.list('film-1').map((character) => character.id)).toEqual([first.id, second.id]);
    expect(store.list('film-3')).toEqual([]);
  });

  it('cambia solo i campi indicati; il profilo si riscrive tutto insieme', () => {
    const created = store.create('film-1', { ...anna, profile: { personality: 'testarda' } });

    const changed = store.update(created.id, {
      tag: 'mentor',
      profile: { goal: 'ritrovare Luca' },
    });

    expect(changed).toMatchObject({ ...anna, tag: 'mentor', profile: { goal: 'ritrovare Luca' } });
    expect(changed?.profile?.personality).toBeUndefined();
  });

  it('un personaggio che non c’è non si trova, non si cambia e non si toglie', () => {
    expect(store.get('non-c-e')).toBeUndefined();
    expect(store.update('non-c-e', { tag: 'ally' })).toBeUndefined();
    expect(store.remove('non-c-e')).toBe(false);
  });

  it('si toglie dal cast e non torna', () => {
    const created = store.create('film-1', anna);

    expect(store.remove(created.id)).toBe(true);
    expect(store.get(created.id)).toBeUndefined();
    expect(store.list('film-1')).toEqual([]);
  });

  it('i personaggi restano dopo aver chiuso e riaperto il database', async () => {
    const created = store.create('film-1', anna);
    aperto.close();

    aperto = await openFilmzyDatabase({ dataDir, appVersion: '0.0.0-test' });

    expect(createCharacterStore(aperto.db).get(created.id)).toEqual(created);
  });
});
