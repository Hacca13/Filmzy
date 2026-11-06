import { describe, expect, it } from 'vitest';

import { PROJECT_URL, aboutSchema } from './about-api.js';

describe('le informazioni sul programma', () => {
  it('portano la versione e la cartella dei dati', () => {
    const about = { version: '0.3.2', dataDir: 'C:\\Users\\anna\\AppData\\Roaming\\Filmzy' };

    expect(aboutSchema.parse(about)).toEqual(about);
    expect(aboutSchema.safeParse({ version: '', dataDir: 'x' }).success).toBe(false);
  });

  it('la pagina del progetto è in https', () => {
    expect(PROJECT_URL.startsWith('https://')).toBe(true);
  });
});
