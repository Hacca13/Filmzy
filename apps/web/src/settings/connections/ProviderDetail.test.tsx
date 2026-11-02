import type { ConnectionsOverview, GroupState, ProviderState } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProviderDetail } from './ProviderDetail';
import { ProviderWizard } from './ProviderWizard';

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
      {
        modelId: 'seedance-2',
        label: 'Seedance 2',
        kind: 'video',
        status: 'active',
        price: { unit: 'per_second', value: 0.3034, checked: '2026-10-21' },
        vision: false,
        enabled: false,
        usable: false,
        unusableReason: 'key_missing',
        isProviderDefault: false,
      },
    ],
    usedBy: [{ roleId: 'camera_operator', label: 'Operatore di ripresa' }],
    ...extra,
  };
}

function overviewOf(
  p: ProviderState,
  groupExtra: Partial<GroupState> = {},
): {
  overview: ConnectionsOverview;
  group: GroupState;
} {
  const group: GroupState = { group: 'video', providers: [p], ...groupExtra };
  return { overview: { hasChoices: true, groups: [group] }, group };
}

function renderDetail(p: ProviderState, groupExtra: Partial<GroupState> = {}): string {
  const { overview, group } = overviewOf(p, groupExtra);
  return renderToStaticMarkup(
    <ProviderDetail
      overview={overview}
      group={group}
      provider={p}
      onOverview={() => undefined}
      onReload={() => Promise.resolve()}
    />,
  );
}

describe('ProviderDetail', () => {
  it('mostra servizi con prezzo, chiave, limite di spesa e chi lo usa', () => {
    const html = renderDetail(provider());

    expect(html).toContain('Kling Standard');
    expect(html).toContain('0,0840 $ al secondo');
    expect(html).toContain('✓ Scelto');
    expect(html).toContain('Chiave');
    expect(html).toContain('Prova la connessione');
    expect(html).toContain('Limite di spesa mensile (facoltativo)');
    expect(html).toContain('Operatore di ripresa');
  });

  it('un servizio che non si può usare dice perché, e non si può accendere', () => {
    const html = renderDetail(provider());

    expect(html).toContain('Non si può usare: manca la chiave.');
  });

  it('con il portachiavi si può incollare una chiave, ma il valore non compare mai', () => {
    const html = renderDetail(provider());

    expect(html).toContain('type="password"');
    expect(html).toContain('Sostituisci');
    expect(html).toContain('Rimuovi');
    expect(html).not.toMatch(/value="[^"]*FAL/);
  });

  it('senza il portachiavi dice dove mettere la chiave, e non offre di scriverla', () => {
    const html = renderDetail(provider({ keyWritable: false }));

    expect(html).toContain('solo nel programma installato');
    expect(html).toContain('FAL_KEY');
    expect(html).not.toContain('type="password"');
  });

  it('senza la chiave la prova di connessione è spenta', () => {
    const html = renderDetail(provider({ key: { name: 'FAL_KEY', present: false } }));

    expect(html).toContain('Chiave mancante');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Prova la connessione/);
  });

  it('il fornitore di solito dello stesso gruppo lo dice, gli altri offrono di sceglierlo', () => {
    expect(renderDetail(provider(), { defaultConnectionId: 'fal' })).toContain('si usa di solito');
    expect(renderDetail(provider())).toContain('Usa questo fornitore di solito');
  });

  it("le parole per l'utente non nominano prompt, modelli o token", () => {
    expect(renderDetail(provider())).not.toMatch(/prompt|token|temperatura/i);
  });
});

describe('ProviderWizard', () => {
  function renderWizard(providers: ProviderState[]): string {
    const group: GroupState = { group: 'video', providers };
    return renderToStaticMarkup(
      <ProviderWizard
        group={group}
        overview={{ hasChoices: false, groups: [group] }}
        onOverview={() => undefined}
        onReload={() => Promise.resolve()}
        onClose={() => undefined}
      />,
    );
  }

  it('parte dalla scelta del fornitore, con i passi che servono', () => {
    const html = renderWizard([provider()]);

    expect(html).toContain('Aggiungi un fornitore · Video');
    expect(html).toContain('Passo 1 di 3');
    expect(html).toContain('Fornitore → Chiave → Servizi');
    expect(html).toContain('fal.ai');
    expect(html).toContain('type="radio"');
  });

  it('i fornitori spenti nella release non si propongono', () => {
    const html = renderWizard([
      provider(),
      provider({ connectionId: 'altro', label: 'Altro', enabled: false }),
    ]);

    expect(html).not.toContain('Altro');
  });

  it('senza nessun fornitore da collegare lo dice e rimanda alle avanzate', () => {
    expect(renderWizard([provider({ enabled: false })])).toContain('Impostazioni › Avanzate');
  });

  it('«Continua» è spento finché non si sceglie un fornitore', () => {
    expect(renderWizard([provider()])).toMatch(/<button[^>]*disabled[^>]*>Continua/);
  });
});
