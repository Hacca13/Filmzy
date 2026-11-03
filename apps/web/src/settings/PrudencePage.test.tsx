import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PrudenceView, type PrudenceKey } from './PrudencePage';

const noop = () => undefined;

function render(
  extra: {
    moderation?: boolean;
    imageCheck?: boolean;
    confirmingOff?: PrudenceKey;
    problem?: string;
  } = {},
) {
  return renderToStaticMarkup(
    <PrudenceView
      moderation={extra.moderation ?? true}
      imageCheck={extra.imageCheck ?? true}
      confirmingOff={extra.confirmingOff}
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

  it('c’è anche il controllo delle foto, acceso, e dice che una copia va al servizio (D19)', () => {
    const html = render();

    expect(html).toContain('Controlla le foto che carichi');
    expect(html).toContain('Una copia della foto va a quel servizio');
    expect(html.match(/aria-checked="true"/g)).toHaveLength(2);
  });

  it('spento, si vede spento: ognuno per conto suo', () => {
    expect(render({ moderation: false })).toContain('aria-checked="false"');
    const onlyPhotos = render({ imageCheck: false });
    expect(onlyPhotos.match(/aria-checked="false"/g)).toHaveLength(1);
    expect(onlyPhotos.match(/aria-checked="true"/g)).toHaveLength(1);
  });

  it('prima di spegnere i testi avverte cosa si rischia, e chiede di confermare o lasciare acceso', () => {
    const html = render({ confirmingOff: 'moderation' });

    expect(html).toContain('Conferma lo spegnimento');
    expect(html).toContain('bloccare il tuo account');
    expect(html).toContain('i tuoi testi vanno al servizio');
    expect(html).toContain('Spegni lo stesso');
    expect(html).toContain('Lascia acceso');
  });

  it('prima di spegnere le foto avverte che persone e marchi passano, e che la responsabilità è tua', () => {
    const html = render({ confirmingOff: 'imageCheck' });

    expect(html).toContain('le foto che carichi si salvano così come sono');
    expect(html).toContain('persone, marchi o personaggi noti');
    expect(html).not.toContain('i tuoi testi vanno al servizio');
  });

  it('durante la conferma gli interruttori sono fermi: non si sceglie due volte', () => {
    const html = render({ confirmingOff: 'imageCheck' });

    expect(html.match(/disabled=""/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('se il salvataggio fallisce lo dice in chiaro', () => {
    expect(render({ problem: 'Filmzy non risponde.' })).toContain('Filmzy non risponde.');
  });

  it('non mostra parole tecniche', () => {
    const html = render({ confirmingOff: 'imageCheck' }).toLowerCase();

    for (const word of ['prompt', 'modello', 'token', 'temperatura']) {
      expect(html).not.toContain(word);
    }
  });
});
