import type { SpendBreach } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SpendConfirm } from './SpendConfirm';
import { UsdLimitBox } from './UsdLimitBox';

const breach: SpendBreach = {
  limit: 'monthly_cap',
  limitUsd: 20,
  spentUsd: 19.5,
  estimatedUsd: 1.2,
};

describe('SpendConfirm', () => {
  const render = (busy = false) =>
    renderToStaticMarkup(
      <SpendConfirm
        breach={breach}
        providerLabel="fal.ai"
        busy={busy}
        onProceed={() => undefined}
        onRaise={() => undefined}
        onCancel={() => undefined}
      />,
    );

  it('dice quanto costa e cosa supera, e offre le tre scelte', () => {
    const html = render();

    expect(html).toContain('circa 1,20 $');
    expect(html).toContain('per fal.ai');
    expect(html).toContain('Continua');
    expect(html).toContain('Cambia il tetto');
    expect(html).toContain('Annulla');
  });

  it('mentre lavora le scelte sono spente', () => {
    expect(render(true).match(/disabled/g)).toHaveLength(3);
  });
});

describe('UsdLimitBox', () => {
  const render = (value: number | undefined) =>
    renderToStaticMarkup(
      <UsdLimitBox
        id="limite"
        label="Limite per film (facoltativo)"
        placeholder="Importo in $"
        hint="Se lo supera ti chiediamo cosa fare."
        value={value}
        busy={false}
        onSave={() => undefined}
      />,
    );

  it('senza limite il campo è vuoto: nessun limite è preimpostato', () => {
    const html = render(undefined);

    expect(html).toContain('value=""');
    expect(html).not.toContain('field-error');
  });

  it('parte dal limite scelto, con la virgola', () => {
    expect(render(12.5)).toContain('value="12,5"');
  });

  it("mostra l'etichetta, il suggerimento e il pulsante", () => {
    const html = render(undefined);

    expect(html).toContain('Limite per film (facoltativo)');
    expect(html).toContain('Se lo supera ti chiediamo cosa fare.');
    expect(html).toContain('Salva il limite');
  });
});
