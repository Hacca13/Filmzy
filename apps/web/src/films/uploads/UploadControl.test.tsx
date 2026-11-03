import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { UploadControl } from './UploadControl';

describe('UploadControl', () => {
  it('finché non sa se la funzione c’è non offre niente (e se è spenta, nemmeno dopo)', () => {
    const html = renderToStaticMarkup(
      <UploadControl
        filmId="film-1"
        target={{ kind: 'object' }}
        label="Carica una foto"
        onUploaded={() => undefined}
      />,
    );

    expect(html).toBe('');
  });
});
