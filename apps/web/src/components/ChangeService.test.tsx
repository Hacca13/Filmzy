import type { ModelOption } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ChangeService } from './ChangeService';
import { costText, generateLabel, qualityText, selectedOption } from './change-service';

const kling: ModelOption = {
  modelId: 'kling-o3-standard',
  label: 'Kling Standard',
  estimatedCostUsd: 0.42,
  quality: 4,
  isDefault: true,
};
const seedance: ModelOption = {
  modelId: 'seedance-2',
  label: 'Seedance',
  estimatedCostUsd: 1.2,
  isDefault: false,
};

describe('selectedOption', () => {
  it('quello scelto; altrimenti il predefinito; altrimenti il primo', () => {
    expect(selectedOption([kling, seedance], 'seedance-2')).toBe(seedance);
    expect(selectedOption([seedance, kling], undefined)).toBe(kling);
    expect(selectedOption([seedance], undefined)).toBe(seedance);
    expect(selectedOption([], undefined)).toBeUndefined();
  });

  it("un servizio scelto che non è più nell'elenco non blocca: si torna al predefinito", () => {
    expect(selectedOption([kling, seedance], 'sparito')).toBe(kling);
  });
});

describe('costText e generateLabel', () => {
  it('la stima segue il servizio scelto, in dollari', () => {
    expect(costText(kling)).toBe('circa 0,42 $');
    expect(costText(seedance)).toBe('circa 1,20 $');
    expect(generateLabel(seedance)).toBe('Genera · circa 1,20 $');
    expect(generateLabel(undefined)).toBe('Genera');
  });
});

describe('qualityText', () => {
  it('un giudizio semplice, non un numero', () => {
    expect(qualityText(undefined)).toBe('non ancora provato');
    expect(qualityText(5)).toBe('ottimo');
    expect(qualityText(4)).toBe('buono');
    expect(qualityText(3)).toBe('discreto');
    expect(qualityText(1.5)).toBe('scarso');
  });
});

describe('ChangeService', () => {
  const render = (props: Partial<Parameters<typeof ChangeService>[0]> = {}) =>
    renderToStaticMarkup(
      <ChangeService
        options={[kling, seedance]}
        selectedId={undefined}
        onSelect={() => undefined}
        startOpen
        {...props}
      />,
    );

  it('chiuso, mostra solo il pulsante e il servizio in uso con la sua stima', () => {
    const html = render({ startOpen: false });

    expect(html).toContain('Cambia servizio');
    expect(html).toContain('Kling Standard · circa 0,42 $');
    expect(html).not.toContain('role="listbox"');
  });

  it('aperto, elenca nome, costo e giudizio di ogni servizio, e dice quale è «di solito»', () => {
    const html = render();

    expect(html).toContain('Seedance');
    expect(html).toContain('circa 1,20 $');
    expect(html).toContain('buono');
    expect(html).toContain('non ancora provato');
    expect(html).toContain('di solito');
  });

  it('la stima mostrata segue il servizio scelto', () => {
    expect(render({ startOpen: false, selectedId: 'seedance-2' })).toContain(
      'Seedance · circa 1,20 $',
    );
  });

  it('senza servizi adatti lo dice e rimanda alle Connessioni', () => {
    expect(render({ options: [] })).toContain('Nessun servizio adatto');
  });

  it("mentre l'elenco si carica non mostra un elenco vuoto", () => {
    const html = render({ options: undefined, loading: true });

    expect(html).toContain('Un attimo…');
    expect(html).not.toContain('Nessun servizio adatto');
  });

  it('non mostra id tecnici né parole come prompt o modello', () => {
    const html = render();

    expect(html).not.toContain('kling-o3-standard</');
    expect(html).not.toMatch(/prompt|token|modello/i);
  });
});
