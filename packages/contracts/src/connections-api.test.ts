import { describe, expect, it } from 'vitest';

import {
  connectionsOverviewSchema,
  setGroupDefaultBodySchema,
  setMonthlyCapBodySchema,
  setServicesBodySchema,
} from './connections-api.js';

describe('setMonthlyCapBodySchema', () => {
  it('un importo positivo, oppure null per togliere il limite', () => {
    expect(setMonthlyCapBodySchema.parse({ usd: 25 })).toEqual({ usd: 25 });
    expect(setMonthlyCapBodySchema.parse({ usd: 0.5 })).toEqual({ usd: 0.5 });
    expect(setMonthlyCapBodySchema.parse({ usd: null })).toEqual({ usd: null });
  });

  it.each([{}, { usd: 0 }, { usd: -3 }, { usd: '10' }, { usd: 2_000_000 }])(
    'rifiuta %j',
    (body) => {
      expect(setMonthlyCapBodySchema.safeParse(body).success).toBe(false);
    },
  );
});

describe('setServicesBodySchema', () => {
  it('un elenco di servizi, anche vuoto (li spegne tutti)', () => {
    expect(setServicesBodySchema.parse({ modelIds: [] })).toEqual({ modelIds: [] });
    expect(setServicesBodySchema.parse({ modelIds: ['kling-o3-standard'] }).modelIds).toHaveLength(
      1,
    );
  });

  it('un id che non è una chiave valida è rifiutato', () => {
    expect(setServicesBodySchema.safeParse({ modelIds: ['Kling Standard'] }).success).toBe(false);
  });
});

describe('setGroupDefaultBodySchema', () => {
  it('serve un fornitore', () => {
    expect(setGroupDefaultBodySchema.safeParse({ connectionId: 'fal' }).success).toBe(true);
    expect(setGroupDefaultBodySchema.safeParse({}).success).toBe(false);
  });
});

describe('connectionsOverviewSchema', () => {
  it('un gruppo con un fornitore, i suoi servizi e la chiave senza il valore', () => {
    const overview = {
      hasChoices: true,
      groups: [
        {
          group: 'video',
          defaultConnectionId: 'fal',
          defaultModelId: 'kling-o3-standard',
          providers: [
            {
              connectionId: 'fal',
              label: 'fal.ai',
              adapter: 'fal',
              enabled: true,
              keyRequired: true,
              key: { name: 'FAL_KEY', present: true, foundIn: 'stored' },
              keyWritable: true,
              monthlyCapUsd: 20,
              canTest: true,
              services: [
                {
                  modelId: 'kling-o3-standard',
                  label: 'Kling Standard',
                  kind: 'video',
                  status: 'active',
                  price: { unit: 'per_second', value: 0.084, checked: '2026-10-21' },
                  vision: false,
                  enabled: true,
                  usable: true,
                  isProviderDefault: true,
                },
              ],
              usedBy: [{ roleId: 'camera_operator', label: 'Operatore di ripresa' }],
            },
          ],
        },
      ],
    };
    expect(connectionsOverviewSchema.parse(overview)).toEqual(overview);
  });

  it('non porta mai il valore di una chiave, nemmeno se qualcuno lo aggiungesse', () => {
    const parsed = connectionsOverviewSchema.parse({
      hasChoices: false,
      groups: [
        {
          group: 'text',
          providers: [
            {
              connectionId: 'anthropic',
              label: 'Anthropic',
              adapter: 'anthropic',
              enabled: true,
              keyRequired: true,
              key: { name: 'ANTHROPIC_API_KEY', present: true, value: 'sk-segreto' },
              keyWritable: false,
              canTest: true,
              services: [],
              usedBy: [],
            },
          ],
        },
      ],
    });

    expect(JSON.stringify(parsed)).not.toContain('sk-segreto');
  });
});
