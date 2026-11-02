import {
  connectionSchema,
  featuresSchema,
  modelEntrySchema,
  roleConfigEntrySchema,
} from '@filmzy/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SECTIONS } from '../settings/advanced/sections';
import { sampleConfig } from '../settings/advanced/test.fixtures';
import { validate } from './issues';
import { SchemaField } from './SchemaField';
import { formSchemaOf } from './json-schema';
import type { z } from 'zod';

/** Disegna una voce com'è nella pagina, senza browser: basta a vedere cosa compare e cosa no. */
function render(schema: z.ZodType, value: unknown): string {
  return renderToStaticMarkup(
    <SchemaField
      schema={formSchemaOf(schema)}
      value={value}
      onChange={() => undefined}
      path=""
      name=""
      label=""
      required
      issues={validate(schema, value)}
    />,
  );
}

describe('SchemaField', () => {
  it('disegna una connessione con le etichette in italiano e il nome vero accanto', () => {
    const html = render(connectionSchema, sampleConfig.connections.fal);

    expect(html).toContain('Tipo di collegamento');
    expect(html).toContain('>adapter<');
    expect(html).toContain('Tempo massimo (secondi)');
    expect(html).toContain('aria-checked="false"');
  });

  it("mostra l'errore sotto il campo sbagliato", () => {
    const html = render(connectionSchema, { ...sampleConfig.connections.fal, timeout_s: -5 });

    expect(html).toContain('role="alert"');
    expect(html).toContain('Deve essere più di 0.');
  });

  it('un valore a posto non mostra nessun errore', () => {
    expect(render(connectionSchema, sampleConfig.connections.fal)).not.toContain('role="alert"');
  });

  it('un modello mostra il suo tipo e i campi di quel tipo, e il prezzo giusto', () => {
    const html = render(modelEntrySchema, sampleConfig.models.clip);

    expect(html).toContain('<option value="3" selected="">Musica</option>');
    expect(html).toContain('Prezzo');
    expect(html).toContain('value="0.3"');
  });

  it("un gruppo facoltativo che manca si può aggiungere, e uno che c'è si può togliere", () => {
    const moderator = sampleConfig.roles.moderator;
    const withoutRetries = render(roleConfigEntrySchema, moderator);
    const withRetries = render(roleConfigEntrySchema, {
      ...moderator,
      retries: { technical_error: 2 },
    });

    expect(withoutRetries).toContain('Aggiungi');
    expect(withoutRetries).not.toContain('Togli nuovi tentativi');
    expect(withRetries).toContain('Togli nuovi tentativi');
  });

  it('funzioni: ogni interruttore ha il suo nome', () => {
    const html = render(featuresSchema, sampleConfig.features);

    expect(html).toContain('Persone reali');
    expect(html).toContain('Marcatura C2PA');
  });
});

describe('ogni voce del seme si disegna', () => {
  it.each(SECTIONS.map((section) => [section.title, section] as const))('%s', (_title, section) => {
    for (const item of section.items(sampleConfig)) {
      const html = render(item.schema, item.value);

      expect(html.length).toBeGreaterThan(0);
      // La voce di prova è valida: nessun campo deve risultare in errore.
      expect(html, item.id).not.toContain('role="alert"');
    }
  });
});
