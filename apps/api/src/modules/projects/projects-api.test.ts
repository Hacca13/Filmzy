import {
  domainErrorSchema,
  projectOptionsSchema,
  projectSchema,
  projectsListSchema,
  type CreateProjectBody,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startApp, type Client } from '../../test-support/app-client.js';

/**
 * Il giro del wizard «La tua idea» (T3.2), col server vero e i preset di seme: si leggono le
 * scelte, si crea un film, lo si rilegge e lo si cambia. Nessun fornitore: creare un film non spende.
 */
let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
});

afterAll(async () => {
  await app.close();
});

async function options() {
  const reply = await client.call('GET', '/projects/options');
  expect(reply.status).toBe(200);
  return projectOptionsSchema.parse(reply.body);
}

/** Un film valido, con le prime voci attive dei preset di seme. */
async function validBody(extra: Partial<CreateProjectBody> = {}): Promise<CreateProjectBody> {
  const choices = await options();
  return {
    idea: 'Marco trova una vecchia bobina sull’ultimo treno della sera.',
    genre: choices.genres[0]?.id ?? '',
    tone: choices.tones[0]?.id ?? '',
    style: choices.styles[0]?.id ?? '',
    cinematography: choices.cinematography[0]?.id ?? '',
    durationS: 60,
    ...extra,
  };
}

function failure(reply: { status: number; body: unknown }) {
  return { status: reply.status, ...domainErrorSchema.parse(reply.body) };
}

describe('le scelte del wizard', () => {
  it('vengono dai preset di seme e offrono solo le voci attive', async () => {
    const choices = await options();

    expect(choices.genres.length).toBeGreaterThan(0);
    expect(choices.tones.length).toBeGreaterThan(0);
    expect(choices.styles.map((style) => style.id)).toContain('realistic');
    // Nel seme gli altri stili sono spenti: non si possono scegliere.
    expect(choices.styles.map((style) => style.id)).not.toContain('anime');
    expect(choices.durationsS).toContain(60);
    // Le voci già scelte sono fra quelle offerte: un film si può creare scrivendo solo l'idea.
    expect(choices.styles.map((style) => style.id)).toContain(choices.defaults.style);
    expect(choices.durationsS).toContain(choices.defaults.durationS);
  });
});

describe('creare un film', () => {
  it('parte dalla bozza della storia e rilegge il film com’è stato scelto', async () => {
    const body = await validBody({ title: 'L’ultima corsa' });

    const created = await client.call('POST', '/projects', body);
    const project = projectSchema.parse(created.body);

    expect(created.status).toBe(201);
    expect(project).toMatchObject({ ...body, language: 'it', phase: 'draft' });

    const reread = await client.call('GET', `/projects/${project.id}`);
    expect(projectSchema.parse(reread.body)).toEqual(project);
  });

  it('senza titolo lo propone dalle prime parole dell’idea', async () => {
    const reply = await client.call('POST', '/projects', await validBody());

    expect(projectSchema.parse(reply.body).title).toBe('Marco trova una vecchia bobina');
  });

  it('rifiuta uno stile spento e dice quale campo correggere', async () => {
    const reply = await client.call('POST', '/projects', await validBody({ style: 'anime' }));
    const error = failure(reply);

    expect(error).toMatchObject({
      status: 400,
      code: 'invalid_request',
      details: { field: 'style' },
    });
  });

  it('rifiuta un’idea vuota, una durata fuori elenco e un campo in più', async () => {
    const empty = failure(await client.call('POST', '/projects', await validBody({ idea: '   ' })));
    const duration = failure(
      await client.call('POST', '/projects', await validBody({ durationS: 45 as 60 })),
    );
    const extra = failure(
      await client.call('POST', '/projects', { ...(await validBody()), phase: 'final' }),
    );

    expect(empty.details).toEqual({ field: 'idea' });
    expect(duration.details).toEqual({ field: 'durationS' });
    expect(extra.code).toBe('invalid_request');
    expect(extra.status).toBe(400);
  });

  it('un film rifiutato non lascia niente nell’elenco', async () => {
    const before = projectsListSchema.parse((await client.call('GET', '/projects')).body).projects;

    await client.call('POST', '/projects', await validBody({ genre: 'western' }));

    const after = projectsListSchema.parse((await client.call('GET', '/projects')).body).projects;
    expect(after).toHaveLength(before.length);
  });
});

describe('rivedere l’idea', () => {
  async function created() {
    const reply = await client.call('POST', '/projects', await validBody({ title: 'Prima' }));
    return projectSchema.parse(reply.body);
  }

  it('cambia solo i campi mandati e lascia la fase dov’è', async () => {
    const project = await created();

    const reply = await client.call('PATCH', `/projects/${project.id}`, { idea: 'Un’altra idea' });
    const changed = projectSchema.parse(reply.body);

    expect(reply.status).toBe(200);
    const { updatedAt, ...unchanged } = project;
    expect(changed).toMatchObject({ ...unchanged, idea: 'Un’altra idea' });
    expect(changed.updatedAt >= updatedAt).toBe(true);
  });

  it('un titolo svuotato torna a quello proposto dall’idea nuova', async () => {
    const project = await created();

    const reply = await client.call('PATCH', `/projects/${project.id}`, {
      title: '',
      idea: 'Giulia e la bobina perduta',
    });

    expect(projectSchema.parse(reply.body).title).toBe('Giulia e la bobina perduta');
  });

  it('rifiuta una scelta che non esiste, senza cambiare niente', async () => {
    const project = await created();

    const reply = await client.call('PATCH', `/projects/${project.id}`, {
      idea: 'Non deve passare',
      tone: 'sconosciuto',
    });

    expect(failure(reply)).toMatchObject({ status: 400, details: { field: 'tone' } });
    const reread = await client.call('GET', `/projects/${project.id}`);
    expect(projectSchema.parse(reread.body).idea).toBe(project.idea);
  });

  it('un film che non c’è dà «non trovato»', async () => {
    const get = failure(await client.call('GET', '/projects/non-c-e'));
    const patch = failure(await client.call('PATCH', '/projects/non-c-e', { idea: 'x' }));

    expect(get).toMatchObject({ status: 404, code: 'not_found' });
    expect(patch).toMatchObject({ status: 404, code: 'not_found' });
  });
});

describe('l’elenco dei film', () => {
  it('mostra per primo l’ultimo film toccato', async () => {
    const first = projectSchema.parse(
      (await client.call('POST', '/projects', await validBody({ title: 'Elenco A' }))).body,
    );
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = projectSchema.parse(
      (await client.call('POST', '/projects', await validBody({ title: 'Elenco B' }))).body,
    );
    await new Promise((resolve) => setTimeout(resolve, 5));
    await client.call('PATCH', `/projects/${first.id}`, { title: 'Elenco A, rivisto' });

    const { projects } = projectsListSchema.parse((await client.call('GET', '/projects')).body);
    const ids = projects.map((project) => project.id);

    expect(ids.indexOf(first.id)).toBeLessThan(ids.indexOf(second.id));
  });
});
