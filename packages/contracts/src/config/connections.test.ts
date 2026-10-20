import { describe, expect, it } from 'vitest';

import { connectionSchema, connectionsFileSchema, secretRefSchema } from './connections.js';

describe('secretRefSchema', () => {
  it.each(['env:ANTHROPIC_API_KEY', 'env:HTTPS_PROXY?', 'secret:FAL_KEY', 'none'])(
    'accetta %j',
    (value) => {
      expect(secretRefSchema.parse(value)).toBe(value);
    },
  );

  it.each(['ANTHROPIC_API_KEY', 'sk-abcdef123456', 'env:', 'secret:fal_key'])(
    'rifiuta %j: mai una chiave in chiaro (regola d\'oro 7)',
    (invalid) => {
      expect(secretRefSchema.safeParse(invalid).success).toBe(false);
    },
  );
});

describe('connectionSchema', () => {
  it('accetta la connessione anthropic del seme', () => {
    const connection = {
      adapter: 'anthropic',
      api_key: 'env:ANTHROPIC_API_KEY',
      http_proxy: 'env:HTTPS_PROXY?',
      timeout_s: 120,
      max_concurrency: 4,
      enabled: true,
    };
    expect(connectionSchema.parse(connection).adapter).toBe('anthropic');
  });

  it('accetta la connessione fal con delivery e retention', () => {
    const connection = {
      adapter: 'fal',
      api_key: 'env:FAL_KEY',
      http_proxy: 'env:HTTPS_PROXY?',
      delivery: 'polling' as const,
      media_retention: 'short',
      data_region: 'us',
      timeout_s: 900,
      max_concurrency: 3,
      enabled: true,
    };
    expect(connectionSchema.parse(connection).delivery).toBe('polling');
  });

  it('accetta la connessione locale senza chiave (api_key: none)', () => {
    const connection = {
      adapter: 'openai_compatible',
      base_url: 'http://localhost:11434/v1',
      api_key: 'none' as const,
      timeout_s: 300,
      max_concurrency: 1,
      enabled: false,
    };
    expect(connectionSchema.parse(connection).api_key).toBe('none');
  });

  it('rifiuta un campo sconosciuto (refuso nella configurazione)', () => {
    expect(
      connectionSchema.safeParse({
        adapter: 'fal',
        api_key: 'env:FAL_KEY',
        timeout_s: 900,
        max_concurrency: 3,
        enabled: true,
        deliver: 'polling',
      }).success,
    ).toBe(false);
  });
});

describe('connectionsFileSchema', () => {
  it('accetta il file con più connessioni', () => {
    const file = {
      version: 1 as const,
      connections: {
        anthropic: {
          adapter: 'anthropic',
          api_key: 'env:ANTHROPIC_API_KEY',
          timeout_s: 120,
          max_concurrency: 4,
          enabled: true,
        },
      },
    };
    expect(connectionsFileSchema.parse(file).connections.anthropic?.enabled).toBe(true);
  });
});
