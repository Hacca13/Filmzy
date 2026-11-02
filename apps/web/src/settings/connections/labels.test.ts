import type { ProviderState, ServiceState } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { ApiError } from '../../api/client';
import {
  describeTestError,
  formatPrice,
  GROUP_LABELS,
  GROUP_ORDER,
  isLinked,
  keyOriginText,
  providerStatus,
} from './labels';

function service(extra: Partial<ServiceState> = {}): ServiceState {
  return {
    modelId: 's',
    label: 'S',
    kind: 'video',
    status: 'active',
    price: { unit: 'per_second', value: 0.3034, checked: '2026-10-21' },
    vision: false,
    enabled: true,
    usable: true,
    isProviderDefault: false,
    ...extra,
  };
}

function provider(extra: Partial<ProviderState> = {}): ProviderState {
  return {
    connectionId: 'fal',
    label: 'fal.ai',
    adapter: 'fal',
    enabled: true,
    keyRequired: true,
    key: { name: 'FAL_KEY', present: true, foundIn: 'stored' },
    keyWritable: true,
    canTest: true,
    services: [service()],
    usedBy: [],
    ...extra,
  };
}

describe('gruppi', () => {
  it("ogni gruppo ha un nome in italiano, e l'ordine li contiene tutti", () => {
    expect([...GROUP_ORDER].sort()).toEqual(Object.keys(GROUP_LABELS).sort());
    expect(GROUP_LABELS.vision).toBe('Lettura immagini');
    expect(GROUP_LABELS.audio).toBe('Musica ed effetti');
  });
});

describe('formatPrice', () => {
  it('a secondo e a immagine con la virgola, il testo «a consumo»', () => {
    expect(formatPrice({ unit: 'per_second', value: 0.3034, checked: '2026-10-21' })).toBe(
      '0,3034 $ al secondo',
    );
    expect(formatPrice({ unit: 'per_image', value: 0.04, checked: '2026-10-21' })).toBe(
      '0,0400 $ a immagine',
    );
    const text = formatPrice({ unit: 'per_mtok', input: 3, output: 15, checked: '2026-10-21' });
    expect(text).toBe('a consumo');
    expect(text).not.toMatch(/token/i);
  });
});

describe('providerStatus', () => {
  it('collegato: acceso, con la chiave e un servizio attivato e utilizzabile', () => {
    expect(providerStatus(provider())).toEqual({ text: '✓ Collegato', tone: 'ok' });
    expect(isLinked(provider())).toBe(true);
  });

  it('senza la chiave dice «Chiave mancante»', () => {
    const missing = provider({ key: { name: 'FAL_KEY', present: false } });

    expect(providerStatus(missing)).toEqual({ text: 'Chiave mancante', tone: 'warning' });
    expect(isLinked(missing)).toBe(false);
  });

  it('spento nella release dice «Spento»', () => {
    expect(providerStatus(provider({ enabled: false })).tone).toBe('off');
  });

  it('senza servizi attivati non è collegato', () => {
    expect(providerStatus(provider({ services: [service({ enabled: false })] })).tone).toBe(
      'warning',
    );
    expect(providerStatus(provider({ services: [service({ usable: false })] })).tone).toBe(
      'warning',
    );
  });

  it('un fornitore senza chiave richiesta (come il finto) è collegato con un servizio attivato', () => {
    expect(providerStatus(provider({ keyRequired: false, key: undefined })).tone).toBe('ok');
  });
});

describe('keyOriginText', () => {
  it("dice se la chiave c'è e dove, senza mai mostrarla", () => {
    expect(keyOriginText(provider())).toContain('salvata nel programma');
    expect(
      keyOriginText(provider({ key: { name: 'FAL_KEY', present: true, foundIn: 'env' } })),
    ).toContain('.env');
    expect(keyOriginText(provider({ key: { name: 'FAL_KEY', present: false } }))).toBe(
      'Chiave mancante.',
    );
    expect(keyOriginText(provider({ keyRequired: false, key: undefined }))).toBe(
      'Non serve una chiave.',
    );
  });
});

describe('describeTestError', () => {
  it('una chiave rifiutata dice «Chiave non valida»', () => {
    const error = new ApiError('http_error', { status: 502, serverCode: 'provider_auth_failed' });

    expect(describeTestError(error)).toBe('Chiave non valida');
  });

  it('gli altri errori hanno le frasi di sempre', () => {
    const error = new ApiError('http_error', { status: 502, serverCode: 'provider_unavailable' });

    expect(describeTestError(error)).toContain('non risponde');
  });
});
