import type { ConfigChange } from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ChangeList } from './ChangeList';

const changes: ConfigChange[] = [
  {
    section: 'roles',
    key: 'screenwriter',
    label: 'Sceneggiatore',
    kind: 'changed',
    fields: ['model'],
  },
  { section: 'models', key: 'nuovo', label: 'Nuovo servizio', kind: 'added', fields: [] },
];

describe('ChangeList', () => {
  it('una riga per differenza, in parole', () => {
    const html = renderToStaticMarkup(<ChangeList changes={changes} empty="Niente." />);

    expect(html).toContain('Ruolo · Sceneggiatore · modificato: Servizio');
    expect(html).toContain('Modello · Nuovo servizio · nuovo');
    expect(html).not.toContain('Niente.');
  });

  it('senza differenze lo dice, invece di mostrare un elenco vuoto', () => {
    const html = renderToStaticMarkup(<ChangeList changes={[]} empty="Niente: è uguale." />);

    expect(html).toContain('Niente: è uguale.');
    expect(html).not.toContain('<li>');
  });
});
