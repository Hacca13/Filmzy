import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  audioClipSchema,
  audioOverviewSchema,
  domainErrorSchema,
  projectSchema,
  sheetOptionsSchema,
  shotPlansSchema,
  type AudioClip,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  CONFIG_DIR,
  startApp,
  startAppWithFixtures,
  type Client,
  type Reply,
} from '../../test-support/app-client.js';
import { filmWithFinal, filmWithShot } from '../../test-support/film-with-shot.js';

/** Musica ed effetti col server vero, la coda e il fornitore finto: nessuna spesa (regola 5). */
let app: NestExpressApplication;
let client: Client;

beforeAll(async () => {
  ({ app, client } = await startApp());
}, 60_000);

afterAll(async () => {
  await app.close();
});

const audioOf = (filmId: string) => `/projects/${filmId}/audio`;
const failure = (reply: Reply) => ({
  status: reply.status,
  ...domainErrorSchema.parse(reply.body),
});

const musicBody = {
  kind: 'music',
  sceneId: 'scene-1',
  durationS: 20,
  description: 'Un piano che accompagna la partenza.',
  mood: 'bittersweet',
};

async function clipOf(from: Client, audio: string, body: object = musicBody): Promise<AudioClip> {
  const created = await from.call('POST', `${audio}/clips`, body);
  expect(created.status).toBe(201);
  return audioClipSchema.parse(created.body);
}

/** Aspetta che tutte le varianti della clip siano chiuse. */
async function settled(from: Client, audio: string, clipId: string): Promise<AudioClip> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const { clips } = audioOverviewSchema.parse((await from.call('GET', audio)).body);
    const clip = clips.find((candidate) => candidate.id === clipId);
    if (clip === undefined) throw new Error('la clip non c’è più');
    if (clip.variants.every((v) => v.status === 'succeeded' || v.status === 'failed')) return clip;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('la variante non è arrivata in tempo');
}

async function generate(from: Client, audio: string, clipId: string): Promise<AudioClip> {
  const started = await from.call('POST', `${audio}/clips/${clipId}/variants`, {});
  expect(started.status).toBe(201);
  return settled(from, audio, clipId);
}

describe('le tracce di un film', () => {
  it('un film appena nato ha le sue quattro tracce e nessuna clip', async () => {
    const { film } = await filmWithFinal(client);

    const overview = audioOverviewSchema.parse((await client.call('GET', audioOf(film.id))).body);

    expect(overview.tracks.map((track) => track.kind)).toEqual([
      'native',
      'dialogue',
      'music',
      'sfx',
    ]);
    expect(overview.clips).toEqual([]);
  });

  it('un film che non c’è è 404', async () => {
    expect((await client.call('GET', audioOf('inventato'))).status).toBe(404);
  });
});

describe('creare una clip', () => {
  it('la musica sta su una scena della stesura, e il film passa alla fase del suono', async () => {
    const { film } = await filmWithFinal(client);

    const clip = await clipOf(client, audioOf(film.id));

    expect(clip).toMatchObject({ kind: 'music', sceneId: 'scene-1', source: 'generated' });
    const project = projectSchema.parse((await client.call('GET', `/projects/${film.id}`)).body);
    expect(project.phase).toBe('sound');
  });

  it('un effetto sta su un’inquadratura di quella scena, dentro la sua durata', async () => {
    const { film, final, shot } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const effect = { ...musicBody, kind: 'sfx', shotId: shot.id, durationS: 2 };
    // Una seconda scena nella stesura: l'inquadratura resta della prima.
    const [scene] = final.screenplay.scenes;
    if (scene === undefined) throw new Error('doveva esserci una scena');
    await client.call('PUT', `/projects/${film.id}/screenplay/final`, {
      screenplay: {
        ...final.screenplay,
        scenes: [...final.screenplay.scenes, { ...scene, number: 2 }],
      },
    });

    expect(await clipOf(client, audio, { ...effect, startS: 0.5 })).toMatchObject({
      kind: 'sfx',
      shotId: shot.id,
      startS: 0.5,
    });

    expect(
      failure(await client.call('POST', `${audio}/clips`, { ...effect, startS: 9999 })),
    ).toMatchObject({ status: 400, code: 'invalid_request', details: { field: 'startS' } });
    expect(
      failure(await client.call('POST', `${audio}/clips`, { ...effect, sceneId: 'scene-2' })),
    ).toMatchObject({ status: 400, details: { field: 'shotId' } });
    expect(
      failure(await client.call('POST', `${audio}/clips`, { ...effect, shotId: 'inventata' })),
    ).toMatchObject({ status: 404, details: { field: 'shotId' } });
  });

  it('una scena che non c’è, o un corpo sbagliato, si rifiutano', async () => {
    const { film } = await filmWithFinal(client);
    const clips = `${audioOf(film.id)}/clips`;

    expect(
      failure(await client.call('POST', clips, { ...musicBody, sceneId: 'scene-99' })),
    ).toMatchObject({ status: 404, details: { field: 'sceneId' } });
    expect((await client.call('POST', clips, { ...musicBody, description: '' })).status).toBe(400);
    expect((await client.call('POST', clips, { ...musicBody, durationS: -1 })).status).toBe(400);
  });

  it('senza la funzione accesa non si crea', async () => {
    const configDir = await mkdtemp(path.join(tmpdir(), 'filmzy-config-'));
    await cp(CONFIG_DIR, configDir, { recursive: true });
    const features = path.join(configDir, 'features.yaml');
    await writeFile(
      features,
      (await readFile(features, 'utf8')).replace(/^ {2}music: true/m, '  music: false'),
    );
    const started = await startApp(undefined, 'offline', configDir);

    try {
      const { film } = await filmWithFinal(started.client);
      const reply = await started.client.call('POST', `${audioOf(film.id)}/clips`, musicBody);

      expect(failure(reply)).toMatchObject({ status: 409, details: { field: 'feature' } });
    } finally {
      await started.app.close();
    }
  }, 60_000);
});

describe('i servizi tra cui scegliere', () => {
  it('c’è la stima; una durata che nessuno regge dà un elenco vuoto e «Genera» si ferma prima di spendere', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);
    const tooLong = await clipOf(client, audio, { ...musicBody, durationS: 500 });
    const optionsOf = async (id: string) =>
      sheetOptionsSchema.parse((await client.call('GET', `${audio}/clips/${id}/options`)).body)
        .options;

    const [first] = await optionsOf(clip.id);
    expect(first?.modelId).toBe('music-stable-audio-3');
    expect(first?.estimatedCostUsd).toBeGreaterThan(0);
    expect(await optionsOf(tooLong.id)).toEqual([]);

    expect(
      failure(await client.call('POST', `${audio}/clips/${tooLong.id}/variants`, {})),
    ).toMatchObject({ status: 409, code: 'no_eligible_model' });
  });

  it('un servizio di un altro tipo non si può scegliere: nessun altro al suo posto', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);

    const reply = await client.call('POST', `${audio}/clips/${clip.id}/variants`, {
      modelId: 'kling-o3-standard',
    });

    expect(failure(reply)).toMatchObject({ status: 409, code: 'no_eligible_model' });
  });
});

describe('generare e cambiare', () => {
  it('la prima variante riuscita diventa quella in uso, con servizio e costo', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);

    const done = await generate(client, audio, clip.id);

    const [variant] = done.variants;
    expect(variant).toMatchObject({
      status: 'succeeded',
      modelId: 'music-stable-audio-3',
      modelLabel: 'Stable Audio 3 · Musica',
    });
    expect(variant?.assetId).toBeDefined();
    expect(done.chosenVariantId).toBe(variant?.id);
  });

  it('il file si scarica ed è audio, senza link esterni (regola 11)', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const done = await generate(client, audio, (await clipOf(client, audio)).id);

    const reply = await fetch(
      `${await app.getUrl()}/api/assets/${done.variants[0]?.assetId ?? ''}`,
    );

    expect(reply.status).toBe(200);
    expect(reply.headers.get('content-type')).toContain('audio/');
  });

  it('una variante nuova non prende il posto di quella in uso: si cambia a mano, e si può tornare indietro', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);
    const first = await generate(client, audio, clip.id);
    const second = await generate(client, audio, clip.id);
    const [newest, oldest] = second.variants;

    expect(second.variants).toHaveLength(2);
    expect(second.chosenVariantId).toBe(first.chosenVariantId);

    const choose = (variantId: string | undefined) =>
      client.call('PUT', `${audio}/clips/${clip.id}/variant`, { variantId });

    expect(audioClipSchema.parse((await choose(newest?.id)).body).chosenVariantId).toBe(newest?.id);
    expect(audioClipSchema.parse((await choose(oldest?.id)).body).chosenVariantId).toBe(oldest?.id);
    expect(failure(await choose('inventata'))).toMatchObject({
      status: 409,
      details: { field: 'variantId' },
    });
  });

  it('un doppio clic non paga due volte', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);
    const variants = `${audio}/clips/${clip.id}/variants`;

    const [one, two] = await Promise.all([
      client.call('POST', variants, {}),
      client.call('POST', variants, {}),
    ]);

    expect([one.status, two.status].sort()).toEqual([201, 409]);
    expect((await settled(client, audio, clip.id)).variants).toHaveLength(1);
  });

  it('una clip di un altro film non si trova', async () => {
    const mine = await filmWithFinal(client);
    const other = await filmWithFinal(client);
    const clip = await clipOf(client, audioOf(mine.film.id));
    const elsewhere = `${audioOf(other.film.id)}/clips/${clip.id}`;

    expect((await client.call('GET', `${elsewhere}/options`)).status).toBe(404);
    expect((await client.call('POST', `${elsewhere}/variants`, {})).status).toBe(404);
    expect((await client.call('DELETE', elsewhere)).status).toBe(404);
  });
});

describe('togliere il suono non tocca il video', () => {
  it('eliminare una clip la toglie con le varianti; le inquadrature restano', async () => {
    const { film, shots } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);
    await generate(client, audio, clip.id);
    const planBefore = shotPlansSchema.parse((await client.call('GET', shots)).body);

    const reply = await client.call('DELETE', `${audio}/clips/${clip.id}`);

    expect(reply.status).toBe(200);
    expect(audioOverviewSchema.parse(reply.body).clips).toEqual([]);
    expect(shotPlansSchema.parse((await client.call('GET', shots)).body)).toEqual(planBefore);
  });

  it('rifare il piano toglie gli effetti delle inquadrature che spariscono, non la musica della scena', async () => {
    const { film, shot, shots } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const music = await clipOf(client, audio);
    await clipOf(client, audio, { ...musicBody, kind: 'sfx', shotId: shot.id, durationS: 2 });
    const before = shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0];
    expect(before?.hasWork).toBe(true);

    await client.call('POST', shots, { sceneNumber: 1 });

    const { clips } = audioOverviewSchema.parse((await client.call('GET', audio)).body);
    expect(clips.map((clip) => clip.id)).toEqual([music.id]);
  });
});

describe('quando qualcosa non va', () => {
  const REJECTION = {
    error: { code: 'content_rejected', retryable: false, message: 'il fornitore finto rifiuta' },
  };

  it('un servizio che rifiuta ferma la variante col suo motivo, e nessun altro prova al suo posto', async () => {
    const started = await startAppWithFixtures({ composer: REJECTION });

    try {
      const { film } = await filmWithFinal(started.client);
      const audio = audioOf(film.id);
      const clip = await clipOf(started.client, audio);

      const done = await generate(started.client, audio, clip.id);

      expect(done.variants).toEqual([
        expect.objectContaining({ status: 'failed', errorCode: 'content_rejected' }),
      ]);
      expect(done.chosenVariantId).toBeUndefined();
      expect(
        failure(
          await started.client.call('PUT', `${audio}/clips/${clip.id}/variant`, {
            variantId: done.variants[0]?.id,
          }),
        ),
      ).toMatchObject({ status: 409, details: { field: 'variantId' } });
    } finally {
      await started.app.close();
    }
  }, 60_000);

  it('una descrizione che il moderatore rifiuta non spende niente', async () => {
    const started = await startAppWithFixtures({
      moderator: { data: { allowed: false, category: 'violence', reason: 'Non si può.' } },
    });

    try {
      // Il moderatore finto rifiuta tutto: il film si scrive con la prudenza spenta, e poi si riaccende.
      const preferences = (await started.client.call('GET', '/preferences')).body as object;
      await started.client.call('PUT', '/preferences', { ...preferences, moderation: false });
      const { film } = await filmWithFinal(started.client);
      await started.client.call('PUT', '/preferences', { ...preferences, moderation: true });
      const audio = audioOf(film.id);
      const clip = await clipOf(started.client, audio);

      const reply = await started.client.call('POST', `${audio}/clips/${clip.id}/variants`, {});

      expect(failure(reply)).toMatchObject({ status: 422, code: 'content_rejected' });
      expect((await settled(started.client, audio, clip.id)).variants).toEqual([]);
    } finally {
      await started.app.close();
    }
  }, 60_000);
});
