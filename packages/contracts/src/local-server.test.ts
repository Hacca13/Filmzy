import { describe, expect, it } from 'vitest';

import { DEFAULT_API_PORT, portSchema, readApiPort } from './local-server.js';

describe('portSchema', () => {
  it('accetta numeri e testi con una porta valida', () => {
    expect(portSchema.parse(3001)).toBe(3001);
    expect(portSchema.parse('8080')).toBe(8080);
  });

  it.each([0, 65536, 3.5, 'abc', '', '0', '65536', '0x50', '1e3', ' 80 ', '80.5', '-80'])(
    'rifiuta %j',
    (invalidPort) => {
      expect(portSchema.safeParse(invalidPort).success).toBe(false);
    },
  );
});

describe('readApiPort', () => {
  it('usa la porta predefinita se la variabile manca', () => {
    expect(readApiPort({})).toBe(DEFAULT_API_PORT);
  });

  it('usa la porta della variabile FILMZY_API_PORT', () => {
    expect(readApiPort({ FILMZY_API_PORT: '4000' })).toBe(4000);
  });

  it('dà un errore leggibile se la porta non è valida', () => {
    expect(() => readApiPort({ FILMZY_API_PORT: 'pippo' })).toThrow(/FILMZY_API_PORT.*"pippo"/);
  });
});
