import { beforeEach, describe, expect, it } from 'vitest';

import { openFilmzyDatabase, type OpenedDatabase } from './open.js';
import { scriptChecks, scriptIssues } from './schema.js';
import { createScriptCheckStore, type ScriptCheckStore } from './script-check-store.js';
import { tempDataDir } from './test.fixtures.js';

let opened: OpenedDatabase;
let store: ScriptCheckStore;
let clock = new Date('2026-11-04T10:00:00.000Z');

beforeEach(async () => {
  clock = new Date('2026-11-04T10:00:00.000Z');
  opened = await openFilmzyDatabase({ dataDir: await tempDataDir(), appVersion: '0.0.0-test' });
  store = createScriptCheckStore(opened.db, { now: () => clock });
  return () => {
    opened.close();
  };
});

const check = (projectId: string, fingerprint: string) => ({
  projectId,
  fingerprint,
  generationId: `scontrino-${fingerprint}`,
  issues: [
    {
      sceneId: 'scene-2',
      shotId: 'a1',
      code: 'costume',
      light: false,
      reason: 'Ha cambiato giacca.',
    },
    { code: 'plot', light: true, reason: 'Una lettera arriva due volte.' },
  ],
});

describe('il controllo della storia', () => {
  it('senza controlli non c’è niente', () => {
    expect(store.latest('film-1')).toBeUndefined();
  });

  it('si salva e si rilegge com’è, con le segnalazioni nell’ordine in cui sono arrivate', () => {
    const saved = store.replace(check('film-1', 'uno'));

    expect(saved.createdAt).toBe(clock.toISOString());
    expect(saved.issues.map((issue) => issue.reason)).toEqual([
      'Ha cambiato giacca.',
      'Una lettera arriva due volte.',
    ]);
    expect(store.latest('film-1')).toEqual(saved);
    // I campi vuoti restano vuoti, non diventano stringhe.
    expect(store.latest('film-1')?.issues[1]).not.toHaveProperty('sceneId');
    expect(store.latest('film-1')?.issues[1]).not.toHaveProperty('shotId');
  });

  it('ripeterlo sostituisce il controllo di prima, senza lasciare segnalazioni orfane, e non tocca gli altri film', () => {
    store.replace(check('film-1', 'uno'));
    store.replace(check('film-2', 'altro'));
    clock = new Date('2026-11-04T11:00:00.000Z');

    const second = store.replace({ ...check('film-1', 'due'), issues: [] });

    expect(store.latest('film-1')).toEqual(second);
    expect(store.latest('film-1')?.issues).toEqual([]);
    expect(store.latest('film-1')?.fingerprint).toBe('due');
    expect(store.latest('film-2')?.issues).toHaveLength(2);
    // Restano solo le due segnalazioni del film 2: quelle del primo controllo del film 1 sono sparite.
    const checkIds = new Set(
      opened.db
        .select()
        .from(scriptChecks)
        .all()
        .map((row) => row.id),
    );
    const issues = opened.db.select().from(scriptIssues).all();
    expect(issues).toHaveLength(2);
    expect(issues.every((issue) => checkIds.has(issue.checkId))).toBe(true);
  });
});
