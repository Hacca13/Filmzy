import { describe, expect, it } from 'vitest';

import { SEED_CONFIG_DIR } from '../config/seed.fixtures.js';
import { runCheck } from './main.js';

describe('runCheck sui file di seme', () => {
  // Legge tutta la configurazione e rende le istruzioni di ogni ruolo: lento per natura, quindi il
  // tempo concesso è esplicito e non dipende dall'umore della CI.
  it('con il fornitore finto non trova niente da dire (T1.7)', async () => {
    const issues = await runCheck(SEED_CONFIG_DIR, 'offline');

    // Dopo la verifica degli id e dei prezzi il seme passa pulito: né errori né avvisi.
    expect(issues).toEqual([]);
  }, 30_000);

  it('dice quale file manca se la cartella non è una configurazione', async () => {
    const issues = await runCheck('cartella-che-non-esiste', 'offline');

    expect(issues.every((issue) => issue.code === 'file_unreadable')).toBe(true);
    expect(issues.length).toBeGreaterThan(0);
  });
});
