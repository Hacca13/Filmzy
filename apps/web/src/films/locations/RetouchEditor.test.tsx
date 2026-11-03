import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { RetouchEditor } from './RetouchEditor';

const render = () =>
  renderToStaticMarkup(
    <RetouchEditor
      filmId="f-1"
      locationId="l-1"
      assetId={'a'.repeat(64)}
      onStarted={() => undefined}
      onClose={() => undefined}
    />,
  );

describe('RetouchEditor', () => {
  it('mostra l’immagine con la tela, le tre operazioni e il pennello, tutto in parole semplici', () => {
    const html = render();

    expect(html).toContain('Ritocca l’immagine');
    expect(html).toContain(`/api/assets/${'a'.repeat(64)}`);
    expect(html).toContain('<canvas');
    for (const label of ['Togli', 'Sostituisci', 'Cambia colore']) expect(html).toContain(label);
    expect(html).toContain('Pennello');
  });

  it('all’inizio «Togli» è scelto, non chiede parole, e il pulsante è spento finché non si dipinge', () => {
    const html = render();

    expect(html).not.toContain('<textarea');
    expect(html).toContain('Dipingi la zona da ritoccare.');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[^<]*Ritocca/);
  });

  it('avverte che le parole passano dal moderatore e che le inquadrature già fatte ingialliscono', () => {
    const html = render();

    expect(html).toContain('passa dal moderatore');
    expect(html).toContain('in giallo');
  });

  it('non mostra parole tecniche', () => {
    const html = render().toLowerCase();

    for (const word of ['prompt', 'modello', 'token', 'temperatura', 'maschera']) {
      expect(html).not.toContain(word);
    }
  });
});
