import { describe, expect, it } from 'vitest';

import { SEED_CONFIG_DIR } from '../config/seed.fixtures.js';
import { runCheck } from './main.js';

describe('runCheck sui file di seme', () => {
  it('con il fornitore finto non trova errori: solo gli avvisi sugli id da verificare', async () => {
    const issues = await runCheck(SEED_CONFIG_DIR, 'offline');

    expect(issues.filter((issue) => issue.severity === 'error')).toEqual([]);
    expect(new Set(issues.map((issue) => issue.code))).toEqual(new Set(['model_testing']));
  });

  it('dice quale file manca se la cartella non è una configurazione', async () => {
    const issues = await runCheck('cartella-che-non-esiste', 'offline');

    expect(issues.every((issue) => issue.code === 'file_unreadable')).toBe(true);
    expect(issues.length).toBeGreaterThan(0);
  });
});
