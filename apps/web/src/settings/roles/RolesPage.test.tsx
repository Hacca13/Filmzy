import type { RoleState } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { RoleRow } from './RolesPage';

function role(extra: Partial<RoleState> = {}): RoleState {
  return {
    roleId: 'screenwriter',
    label: 'Sceneggiatore',
    kind: 'llm',
    group: 'text',
    enabled: true,
    inUse: {
      connectionId: 'anthropic',
      connectionLabel: 'Anthropic',
      modelId: 'claude-sonnet',
      modelLabel: 'Claude Sonnet',
    },
    providers: [
      {
        connectionId: 'anthropic',
        label: 'Anthropic',
        services: [
          { modelId: 'claude-sonnet', label: 'Claude Sonnet' },
          { modelId: 'claude-haiku', label: 'Claude Haiku' },
        ],
      },
    ],
    instructions: { label: 'Versione 1', recommended: false, newerAvailable: true },
    ...extra,
  };
}

function render(r: RoleState, open = true): string {
  return renderToStaticMarkup(
    <RoleRow role={r} open={open} onToggle={() => undefined} onApplied={() => undefined} />,
  );
}

describe('RoleRow', () => {
  it('chiusa, mostra solo il riassunto', () => {
    const html = render(role(), false);

    expect(html).toContain('Sceneggiatore · Anthropic · Claude Sonnet · Versione 1');
    expect(html).toContain('Cambia');
    expect(html).not.toContain('<select');
  });

  it('aperta, offre fornitore e servizio in una scelta sola, più «come da programma»', () => {
    const html = render(role());

    expect(html).toContain('Fornitore e servizio');
    expect(html).toContain('Come da programma');
    expect(html).toContain('<optgroup label="Anthropic">');
    expect(html).toContain('Claude Haiku');
  });

  it('il servizio scelto per il ruolo è quello selezionato', () => {
    const html = render(role({ chosenModelId: 'claude-haiku' }));

    expect(html).toMatch(/<option value="claude-haiku" selected="">Claude Haiku/);
  });

  it('la creatività compare solo dove il servizio la accetta, coi suoi limiti', () => {
    expect(render(role())).not.toContain('Creatività');

    const html = render(role({ temperature: { value: 0.7, min: 0, max: 1, chosen: true } }));
    expect(html).toContain('Creatività (da 0 a 1)');
    expect(html).toContain('value="0,7"');
    expect(html).toContain('Torna al valore del programma');
  });

  it('senza creatività scelta non offre di tornare indietro', () => {
    const html = render(role({ temperature: { value: 0.7, min: 0, max: 1, chosen: false } }));

    expect(html).not.toContain('Torna al valore del programma');
  });

  it("dice la versione delle istruzioni, se ce n'è una più nuova, e rimanda alla loro pagina", () => {
    const html = render(role());

    expect(html).toContain('c’è una versione più nuova');
    expect(html).toContain('href="#/impostazioni/istruzioni"');
  });

  it('senza servizi adatti lo dice e rimanda alle Connessioni', () => {
    const html = render(role({ inUse: undefined, problem: 'no_eligible_model', providers: [] }));

    expect(html).toContain('Nessun servizio adatto: attivane uno in Connessioni');
  });
});
