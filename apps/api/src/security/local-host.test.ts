import { describe, expect, it } from 'vitest';

import { isLocalHostHeader } from './local-host.js';

describe('isLocalHostHeader', () => {
  it.each([
    'localhost',
    'localhost:3001',
    'LOCALHOST:5173',
    '127.0.0.1',
    '127.0.0.1:3001',
    '[::1]',
    '[::1]:3001',
  ])('accetta %s', (hostHeader) => {
    expect(isLocalHostHeader(hostHeader)).toBe(true);
  });

  it.each([
    undefined,
    '',
    'evil.example',
    'evil.example:3001',
    'localhost.evil.example',
    'evil.example@localhost',
    'localhost:99999999',
    '192.168.1.20:3001',
    'localhost/evil',
    ' localhost',
  ])('rifiuta %j', (hostHeader) => {
    expect(isLocalHostHeader(hostHeader)).toBe(false);
  });
});
