import type { UserSettings } from '@filmzy/contracts';
import { beforeAll, describe, expect, it } from 'vitest';

import type { MediaInput } from './adapters/types.js';
import type { TroupeConfig } from './config/load-files.js';
import { loadSeedConfig, modelOf, roleOf } from './config/seed.fixtures.js';
import { route, routeOptions, type RouteInput } from './router.js';
import type { TranslateInput } from './translators/types.js';

let seed: TroupeConfig;

beforeAll(async () => {
  seed = await loadSeedConfig();
});

function withSeed(change: (config: TroupeConfig) => void): TroupeConfig {
  const copy = structuredClone(seed);
  change(copy);
  return copy;
}

function reference(name: string): MediaInput {
  return {
    use: 'reference',
    file: { fileName: name, contentType: 'image/png', bytes: new Uint8Array([1, 2, 3]) },
  };
}

function videoRequest(): Omit<TranslateInput, 'modelId'> {
  return {
    role: 'camera_operator',
    prompt: 'medium shot of [[char:anna]] at a table, warm light',
    inputs: [reference('anna.png')],
    characterIds: ['anna'],
    durationS: 5,
    params: { resolution: '720p', aspect_ratio: '16:9', audio: false },
    idempotencyKey: 'shot-1:abc',
  };
}

function input(overrides: Partial<RouteInput> = {}): RouteInput {
  return {
    roleId: 'camera_operator',
    config: seed,
    request: videoRequest(),
    ...overrides,
  };
}

const noSettings: UserSettings = {
  enabledModelIds: [],
  defaultModels: {},
  defaultModelByConnection: {},
  spendCaps: {},
  roleSettings: {},
};

describe('il router sceglie il principale (§4.8)', () => {
  it('senza impostazioni prende un candidato idoneo del ruolo', () => {
    const chosen = route(input());

    expect(['kling-o3-standard', 'seedance-2', 'gemini-omni-flash']).toContain(chosen.modelId);
    expect(chosen.translator.family).toBe(chosen.model.family);
    expect(chosen.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('con la politica "cheap" prende il meno caro', () => {
    const config = withSeed((c) => {
      c.roles.camera_operator = {
        ...roleOf(c, 'camera_operator'),
        routing: {
          policy: 'cheap',
          candidates: ['kling-o3-standard', 'seedance-2', 'gemini-omni-flash'],
        },
      };
    });

    // 0,10 $/s contro 0,15 e 0,224: per 5 secondi vince Gemini.
    expect(route(input({ config })).modelId).toBe('gemini-omni-flash');
  });

  it('con la politica "quality" prende il voto più alto delle prove', () => {
    const config = withSeed((c) => {
      c.roles.camera_operator = {
        ...roleOf(c, 'camera_operator'),
        routing: {
          policy: 'quality',
          candidates: ['kling-o3-standard', 'seedance-2', 'gemini-omni-flash'],
        },
      };
      c.models['seedance-2'] = { ...modelOf(c, 'seedance-2'), quality: { overall: 4.5 } };
      c.models['kling-o3-standard'] = {
        ...modelOf(c, 'kling-o3-standard'),
        quality: { overall: 3 },
      };
    });

    expect(route(input({ config })).modelId).toBe('seedance-2');
  });

  it('la stessa richiesta dà sempre la stessa risposta', () => {
    const primo = route(input()).modelId;
    const secondo = route(input()).modelId;

    expect(secondo).toBe(primo);
  });
});

describe('i requisiti della richiesta escludono i servizi (§4.8 punto 1)', () => {
  it('una durata che nessuno accetta: si ferma, non accorcia la clip', () => {
    const request = { ...videoRequest(), durationS: 40 };

    expect(() => route(input({ request }))).toThrow(/no.*servizio|Nessun servizio/i);
    expect(() => route(input({ request }))).toThrow(/secondi/);
  });

  it('troppe immagini di riferimento', () => {
    const request = {
      ...videoRequest(),
      inputs: Array.from({ length: 13 }, (_, index) => reference(`ref-${String(index)}.png`)),
      characterIds: ['anna'],
    };

    expect(() => route(input({ request }))).toThrow(/immagini di riferimento/);
  });

  it('volti reali dove non si possono usare (D4)', () => {
    const config = withSeed((c) => {
      c.roles.camera_operator = {
        ...roleOf(c, 'camera_operator'),
        routing: { policy: 'balanced', candidates: ['gemini-omni-flash'] },
      };
    });
    const request = { ...videoRequest(), realFaces: true };

    expect(() => route(input({ config, request }))).toThrow(/volti di persone reali/);
  });

  it('primo e ultimo fotogramma che nessuno accetta: niente declassamenti in silenzio (D20)', () => {
    const request = {
      ...videoRequest(),
      inputs: [
        { use: 'first_frame' as const, file: reference('primo.png').file },
        { use: 'last_frame' as const, file: reference('ultimo.png').file },
      ],
      characterIds: [],
    };

    expect(() => route(input({ request }))).toThrow(/combinazione di immagini/);
  });
});

describe("il servizio scelto dall'utente è un requisito (D36)", () => {
  it('si usa anche se il ruolo di solito non lo userebbe', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: ['kling-o3-standard', 'seedance-2', 'gemini-omni-flash'],
    };

    expect(route(input({ settings, chosenModelId: 'gemini-omni-flash' })).modelId).toBe(
      'gemini-omni-flash',
    );
  });

  it('se non è attivato si ferma, senza passare a un altro', () => {
    const settings: UserSettings = { ...noSettings, enabledModelIds: ['kling-o3-standard'] };

    expect(() => route(input({ settings, chosenModelId: 'seedance-2' }))).toThrow(
      /"seedance-2".*non è tra i servizi attivati/s,
    );
  });

  it('se non è adatto alla richiesta si ferma, dicendo perché', () => {
    const request = { ...videoRequest(), durationS: 20 };

    expect(() => route(input({ request, chosenModelId: 'gemini-omni-flash' }))).toThrow(
      /"gemini-omni-flash".*secondi/s,
    );
  });

  it('un servizio di un altro tipo non si usa', () => {
    expect(() => route(input({ chosenModelId: 'nano-banana-2' }))).toThrow(/tipo image/);
  });
});

describe("«Cambia servizio»: l'elenco per l'utente (D36)", () => {
  it('elenca tutti i servizi attivati che passano il filtro, con nome e costo', () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: ['kling-o3-standard', 'seedance-2', 'gemini-omni-flash', 'claude-sonnet'],
      defaultModels: { video: 'seedance-2' },
    };

    const options = routeOptions(input({ settings }));

    expect(options.map((option) => option.modelId).sort()).toEqual([
      'gemini-omni-flash',
      'kling-o3-standard',
      'seedance-2',
    ]);
    expect(options.every((option) => option.estimatedCostUsd > 0)).toBe(true);
    expect(options.find((option) => option.isDefault)?.modelId).toBe('seedance-2');
    expect(options[0]?.label).toBeTypeOf('string');
  });

  it('un servizio mai provato non ha voto, e non è un errore', () => {
    const options = routeOptions(input());

    expect(options.every((option) => option.quality === undefined)).toBe(true);
  });

  it("porta il voto delle prove quando c'è", () => {
    const config = withSeed((c) => {
      c.models['seedance-2'] = { ...modelOf(c, 'seedance-2'), quality: { overall: 4 } };
    });

    const options = routeOptions(input({ config }));
    expect(options.find((option) => option.modelId === 'seedance-2')?.quality).toBe(4);
  });

  it('non elenca ciò che non passa il filtro', () => {
    const request = { ...videoRequest(), durationS: 12 }; // Gemini si ferma a 10
    const options = routeOptions(input({ request }));

    expect(options.map((option) => option.modelId)).not.toContain('gemini-omni-flash');
  });

  it("il predefinito dell'utente passa in testa, se è idoneo", () => {
    const settings: UserSettings = {
      ...noSettings,
      enabledModelIds: ['kling-o3-standard', 'seedance-2', 'gemini-omni-flash'],
      defaultModels: { video: 'kling-o3-standard' },
    };

    expect(route(input({ settings })).modelId).toBe('kling-o3-standard');
  });
});
