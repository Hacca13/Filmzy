import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PrudenceView } from './PrudencePage';

const noop = () => undefined;

function render(extra: { moderation?: boolean; confirmingOff?: boolean; problem?: string } = {}) {
  return renderToStaticMarkup(
    <PrudenceView
      moderation={extra.moderation ?? true}
      confirmingOff={extra.confirmingOff ?? false}
      busy={false}
      problem={extra.problem}
      onToggle={noop}
      onConfirmOff={noop}
      onKeepOn={noop}
    />,
  );
}

describe('PrudenceView', () => {
  it('il controllo dei testi è acceso all’inizio e lo dice con parole semplici', () => {
    const html = render();

    expect(html).toContain('Controlla i testi prima di ogni spesa');
    expect(html).toContain('aria-checked="true"');
    expect(html).not.toContain('Spegni lo stesso');
  });

  it('spento, si vede spento', () => {
    expect(render({ moderation: false })).toContain('aria-checked="false"');
  });

  it('prima di spegnere avverte cosa si rischia, e chiede di confermare o lasciare acceso', () => {
    const html = render({ confirmingOff: true });

    expect(html).toContain('Conferma lo spegnimento');
    expect(html).toContain('bloccare il tuo account');
    expect(html).toContain('Spegni lo stesso');
    expect(html).toContain('Lascia acceso');
  });

  it('durante la conferma l’interruttore è fermo: non si sceglie due volte', () => {
    expect(render({ confirmingOff: true })).toContain('disabled=""');
  });

  it('se il salvataggio fallisce lo dice in chiaro', () => {
    expect(render({ problem: 'Filmzy non risponde.' })).toContain('Filmzy non risponde.');
  });

  it('non mostra parole tecniche', () => {
    const html = render({ confirmingOff: true }).toLowerCase();

    for (const word of ['prompt', 'modello', 'token', 'temperatura']) {
      expect(html).not.toContain(word);
    }
  });
});
