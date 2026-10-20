import { describe, expect, it } from 'vitest';

import { assetIdSchema, configKeySchema, idSchema, modelIdSchema } from './ids.js';

describe('idSchema', () => {
  it('accetta un testo non vuoto', () => {
    expect(idSchema.parse('anna')).toBe('anna');
  });

  it.each(['', '   ', undefined, null, 42])('rifiuta %j', (invalid) => {
    expect(idSchema.safeParse(invalid).success).toBe(false);
  });

  it('è la base degli altri id del dominio', () => {
    expect(assetIdSchema.parse('asset-1')).toBe('asset-1');
  });
});

describe('configKeySchema', () => {
  it.each(['nano-banana-2', 'claude_sonnet', 'fal'])('accetta %j', (valid) => {
    expect(configKeySchema.parse(valid)).toBe(valid);
  });

  it.each(['-fal', '_fal', 'Fal', 'fal key', '', 'fal!'])('rifiuta %j', (invalid) => {
    expect(configKeySchema.safeParse(invalid).success).toBe(false);
  });

  it('è la base degli id dei servizi e delle connessioni', () => {
    expect(modelIdSchema.parse('kling-o3-standard')).toBe('kling-o3-standard');
  });
});
