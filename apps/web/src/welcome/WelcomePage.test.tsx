import type { ProviderState } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { MergedProvider } from '../settings/connections/model';
import { ChooseProviders, SpendStep } from './WelcomePage';

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
    expect(html.match(/type="checkbox"/g)).toHaveLength(1);
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
