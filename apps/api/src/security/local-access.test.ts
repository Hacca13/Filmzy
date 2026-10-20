import { describe, expect, it } from 'vitest';

import { isLocalHostHeader, isLocalOrigin } from './local-access.js';

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

describe('isLocalOrigin', () => {
  it.each([
    'http://localhost:5173',
    'http://127.0.0.1:3001',
    'http://[::1]:5173',
    'http://LOCALHOST',
  ])('accetta %s', (origin) => {
    expect(isLocalOrigin(origin)).toBe(true);
  });

  it.each([
    'null',
    '',
    'https://evil.example',
    'http://localhost.evil.example',
    'http://evil.example@localhost',
    'http://user:password@localhost',
    'localhost',
  ])('rifiuta %j', (origin) => {
    expect(isLocalOrigin(origin)).toBe(false);
  });
});
