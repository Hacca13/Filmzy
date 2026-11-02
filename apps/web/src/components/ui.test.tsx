import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Chip, Notice } from './ui';

describe('Chip', () => {
  it('ha sempre le sue parole, oltre al colore e all’icona', () => {
    const html = renderToStaticMarkup(<Chip tone="confirmed">3 inquadrature</Chip>);

    expect(html).toContain('data-tone="confirmed"');
    expect(html).toContain('3 inquadrature');
    expect(html).toContain('<svg');
    expect(html).toContain('aria-hidden="true"');
  });

  it('ogni tono ha la sua icona', () => {
    const tones = ['confirmed', 'warning', 'info', 'error'] as const;
    const icons = tones.map((tone) => renderToStaticMarkup(<Chip tone={tone}>x</Chip>));

    expect(new Set(icons.map((html) => /<svg.*<\/svg>/.exec(html)?.[0])).size).toBe(4);
  });
});

describe('Notice', () => {
  it('senza titolo resta la riga semplice di prima', () => {
    const html = renderToStaticMarkup(<Notice tone="error">Qualcosa non va.</Notice>);

    expect(html).toContain('class="notice"');
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('chip');
  });

  it('con un titolo è un riquadro con il suo chip, e un errore resta un avviso per chi legge a voce', () => {
    const info = renderToStaticMarkup(
      <Notice tone="info" title="Informazione">
        È cambiato qualcosa.
      </Notice>,
    );
    const error = renderToStaticMarkup(
      <Notice tone="error" title="Non compatibile">
        Nessun servizio.
      </Notice>,
    );

    expect(info).toContain('notice boxed');
    expect(info).toContain('role="status"');
    expect(info).toContain('Informazione');
    expect(info).toContain('È cambiato qualcosa.');
    expect(error).toContain('role="alert"');
    expect(error).toContain('data-tone="error"');
    expect(error).toContain('Non compatibile');
  });
});
