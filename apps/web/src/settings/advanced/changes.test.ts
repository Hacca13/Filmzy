import type { ConfigChange } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { describeChange } from './changes';

function change(extra: Partial<ConfigChange>): ConfigChange {
  return {
    section: 'models',
    key: 'kling-o3-standard',
    label: 'Kling Standard',
    kind: 'changed',
    fields: [],
    ...extra,
  };
}

describe('describeChange', () => {
  it('una voce modificata dice i campi, col nome che hanno nei moduli', () => {
    expect(describeChange(change({ fields: ['pricing', 'status'] }))).toBe(
      'Modello · Kling Standard · modificato: Prezzo, Stato',
    );
  });

  it('una voce nuova o tolta lo dice senza campi', () => {
    expect(describeChange(change({ kind: 'added' }))).toBe('Modello · Kling Standard · nuovo');
    expect(
      describeChange(change({ section: 'roles', label: 'Sceneggiatore', kind: 'removed' })),
    ).toBe('Ruolo · Sceneggiatore · tolto');
  });

  it('un preset dice la categoria, in italiano', () => {
    expect(
      describeChange(
        change({
          section: 'presets',
          key: 'cameraMovements:avvicinati',
          label: 'Avvicinati',
          fields: ['hint'],
        }),
      ),
    ).toBe('Preset · Movimenti macchina · Avvicinati · modificato: Frase per il modello');
  });

  it('funzioni e limiti usano il nome del campo', () => {
    expect(
      describeChange(change({ section: 'features', key: 'real_people', label: 'real_people' })),
    ).toBe('Funzione · Persone reali · modificato');
    expect(
      describeChange(change({ section: 'limits', key: 'max_characters', label: 'max_characters' })),
    ).toBe('Limite · Personaggi principali per film · modificato');
  });

  it('un campo senza nome in italiano resta col suo nome vero', () => {
    expect(describeChange(change({ fields: ['campo_nuovo'] }))).toContain('campo_nuovo');
  });
});
