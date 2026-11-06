import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AboutBody, DataBody } from './AboutPages';

const about = { version: '0.3.2', dataDir: 'C:\\Users\\anna\\AppData\\Roaming\\Filmzy' };

describe('Informazioni', () => {
  it('dice la versione, la licenza, e che niente va a chi l’ha fatto', () => {
    const html = renderToStaticMarkup(<AboutBody about={about} />);

    expect(html).toContain('Filmzy 0.3.2');
    expect(html).toContain('AGPL-3.0');
    expect(html).toContain('nessuna statistica d’uso');
    expect(html).toContain('/blob/main/LICENSE');
    expect(html).toContain('Uso responsabile');
  });

  it('non chiede soldi: il modo per contribuire arriverà più avanti', () => {
    const html = renderToStaticMarkup(<AboutBody about={about} />);

    expect(html).not.toContain('Sostieni');
    expect(html).toContain('arriverà presto');
  });
});

describe('I tuoi dati', () => {
  const body = (problem?: string) =>
    renderToStaticMarkup(
      <DataBody about={about} busy={false} problem={problem} onOpen={() => undefined} />,
    );

  it('dice dove stanno i film, e si può aprire la cartella', () => {
    const html = body();

    expect(html).toContain('AppData');
    expect(html).toContain('readOnly');
    expect(html).toContain('Apri la cartella');
    expect(html).toContain('Le chiavi dei servizi non vengono incluse');
  });

  it('se la cartella non si apre lo dice', () => {
    expect(body('Non riesco ad aprire la cartella.')).toContain(
      'Non riesco ad aprire la cartella.',
    );
  });
});
