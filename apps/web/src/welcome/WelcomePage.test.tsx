import type { ModelGroup, ProviderState } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { MergedProvider } from '../settings/connections/model';
import {
  ChooseProviders,
  ReadySummary,
  SpendStep,
  previousStage,
  providerSections,
} from './WelcomePage';

function entry(extra: Partial<ProviderState> = {}): MergedProvider {
  return {
    provider: {
      connectionId: 'fal',
      label: 'fal.ai',
      adapter: 'fal',
      enabled: true,
      keyRequired: true,
      key: { name: 'FAL_KEY', present: false },
      keyWritable: true,
      canTest: true,
      services: [],
      usedBy: [],
      ...extra,
    },
    groups: [
      { group: 'image', hasDefault: false },
      { group: 'video', hasDefault: false },
    ],
  };
}

describe('ChooseProviders', () => {
  function render(offered: MergedProvider[], chosen: string[] = []): string {
    return renderToStaticMarkup(
      <ChooseProviders
        offered={offered}
        chosen={chosen}
        onChange={() => undefined}
        onNext={() => undefined}
        onSkip={() => undefined}
      />,
    );
  }

  it('un fornitore che lavora per più tipi è una riga sola, coi suoi tipi di lavoro', () => {
    const html = render([entry()]);

    expect(html).toContain('fal.ai');
    expect(html).toContain('immagini, video');
    expect(html.match(/aria-pressed/g)).toHaveLength(1);
  });

  it('si sceglie con un pulsante che dice com’è', () => {
    expect(render([entry()])).toMatch(/aria-pressed="false"[^>]*>Scegli/);
    expect(render([entry()], ['fal'])).toMatch(/aria-pressed="true"[^>]*>✓ Scelto/);
  });

  it('dice dove si prende la chiave, se lo sa', () => {
    const url = 'https://esempio.it/chiavi';

    expect(render([entry({ keyUrl: url })])).toContain(`href="${url}"`);
    expect(render([entry({ keyUrl: url })])).toContain('Come ottengo la chiave?');
    expect(render([entry()])).not.toContain('Come ottengo la chiave?');
    // A chi non serve una chiave non si chiede di prenderla.
    expect(render([entry({ keyUrl: url, keyRequired: false })])).not.toContain('Come ottengo');
  });

  it('«Continua» resta spento finché non se ne sceglie uno, e si può saltare', () => {
    expect(render([entry()])).toMatch(/<button[^>]*disabled[^>]*>Continua/);
    expect(render([entry()], ['fal'])).not.toMatch(/<button[^>]*disabled[^>]*>Continua/);
    expect(render([entry()])).toContain('Salta per ora');
  });

  it('senza fornitori da collegare lo dice e rimanda alle avanzate', () => {
    expect(render([])).toContain('Impostazioni › Avanzate');
  });

  it("le parole per l'utente non nominano prompt, modelli o token", () => {
    expect(render([entry()])).not.toMatch(/prompt|token|temperatura/i);
  });
});

describe('le sezioni dei fornitori', () => {
  const withGroups = (id: string, ...groups: ModelGroup[]): MergedProvider => ({
    ...entry({ connectionId: id }),
    groups: groups.map((group) => ({ group, hasDefault: false })),
  });

  it('un fornitore sta una volta sola, nella prima sezione in cui lavora', () => {
    const sections = providerSections([
      withGroups('testo', 'text', 'vision'),
      withGroups('tutto', 'image', 'video', 'audio'),
      withGroups('musica', 'audio'),
    ]);

    expect(sections.map(({ title, entries }) => [title, entries.length])).toEqual([
      ['Testo', 1],
      ['Immagini e video', 1],
      ['Musica ed effetti', 1],
    ]);
  });

  it('un fornitore che non lavora per nessuna sezione nota non si perde', () => {
    expect(providerSections([withGroups('testo', 'vision')])[0]?.title).toBe('Testo');
    expect(providerSections([])).toEqual([]);
  });
});

describe('tornare indietro', () => {
  it('dalla chiave del primo fornitore si torna alla scelta', () => {
    expect(previousStage({ name: 'provider', index: 0, step: 'key' }, 2)).toEqual({
      name: 'choose',
    });
  });

  it('dalla chiave del secondo si torna ai servizi del primo', () => {
    expect(previousStage({ name: 'provider', index: 1, step: 'key' }, 2)).toEqual({
      name: 'provider',
      index: 0,
      step: 'services',
    });
  });

  it('dai servizi si torna alla chiave dello stesso fornitore', () => {
    expect(previousStage({ name: 'provider', index: 1, step: 'services' }, 2)).toEqual({
      name: 'provider',
      index: 1,
      step: 'key',
    });
  });

  it('dalle spese si torna ai servizi dell’ultimo fornitore', () => {
    expect(previousStage({ name: 'spend' }, 2)).toEqual({
      name: 'provider',
      index: 1,
      step: 'services',
    });
    expect(previousStage({ name: 'spend' }, 0)).toEqual({ name: 'choose' });
  });
});

describe('ReadySummary', () => {
  const service = {
    modelId: 'm',
    label: 'M',
    enabled: true,
    usable: true,
  } as unknown as ProviderState['services'][number];

  it('elenca solo i fornitori collegati davvero', () => {
    const linked = entry({ key: { name: 'K', present: true }, services: [service] });
    const notYet = entry({ connectionId: 'altro', label: 'Altro' });

    const html = renderToStaticMarkup(<ReadySummary entries={[linked, notYet]} />);

    expect(html).toContain('Tutto pronto per la tua prima storia');
    expect(html).toContain('✓ fal.ai collegato');
    expect(html).not.toContain('Altro');
  });

  it('senza nessuno non dice che è tutto pronto', () => {
    expect(renderToStaticMarkup(<ReadySummary entries={[entry()]} />)).toBe('');
  });
});

describe('SpendStep', () => {
  it('il limite per film è facoltativo e si può saltare', () => {
    const html = renderToStaticMarkup(
      <SpendStep
        overview={{ hasChoices: false, limits: {}, groups: [] }}
        onOverview={() => undefined}
        onNext={() => undefined}
      />,
    );

    expect(html).toContain('Limite per film');
    expect(html).toContain('vuoto significa nessun limite');
    expect(html).toContain('Salta, non mettere un limite');
  });

  it("parte dal limite già scelto, se c'è", () => {
    const html = renderToStaticMarkup(
      <SpendStep
        overview={{ hasChoices: true, limits: { filmBudgetUsd: 8 }, groups: [] }}
        onOverview={() => undefined}
        onNext={() => undefined}
      />,
    );

    expect(html).toContain('value="8"');
  });
});
