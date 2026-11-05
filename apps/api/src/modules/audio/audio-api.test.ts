import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  audioClipSchema,
  audioOverviewSchema,
  audioTimelineSchema,
  domainErrorSchema,
  draftViewSchema,
  projectOptionsSchema,
  projectSchema,
  sheetOptionsSchema,
  shotPlansSchema,
  shotTakesSchema,
  soundSuggestionsEstimateSchema,
  soundSuggestionsSchema,
  type AudioClip,
} from '@filmzy/contracts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  CONFIG_DIR,
  startApp,
  startAppWithFixtures,
  type Client,
  type Reply,
} from '../../test-support/app-client.js';
import { filmWithFinal, filmWithShot } from '../../test-support/film-with-shot.js';
import { JobRunner } from '../jobs/job-runner.service.js';
import { ModerationService } from '../moderation/moderation.service.js';

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

describe('muto e volume', () => {
  it('si cambiano sulla traccia, e una traccia di un altro film non si trova', async () => {
    const { film } = await filmWithFinal(client);
    const { film: other } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const { tracks } = audioOverviewSchema.parse((await client.call('GET', audio)).body);
    const track = tracks.find(({ kind }) => kind === 'music');
    if (track === undefined) throw new Error('doveva esserci la traccia');

    const reply = await client.call('PUT', `${audio}/tracks/${track.id}`, {
      muted: true,
      volume: 0.4,
    });

    expect(audioOverviewSchema.parse(reply.body).tracks).toContainEqual({
      ...track,
      muted: true,
      volume: 0.4,
    });
    expect((await client.call('PUT', `${audio}/tracks/${track.id}`, {})).status).toBe(400);
    expect((await client.call('PUT', `${audio}/tracks/${track.id}`, { volume: 2 })).status).toBe(
      400,
    );
    expect(
      failure(await client.call('PUT', `${audioOf(other.id)}/tracks/${track.id}`, { muted: true })),
    ).toMatchObject({ status: 404, details: { field: 'trackId' } });
  });
});

describe('la linea del tempo', () => {
  it('senza la stesura finale non c’è: lo dice con «non trovato»', async () => {
    const options = projectOptionsSchema.parse(
      (await client.call('GET', '/projects/options')).body,
    );
    const film = projectSchema.parse(
      (
        await client.call('POST', '/projects', {
          idea: 'Una storia ancora da scrivere.',
          genre: options.defaults.genre,
          tone: options.defaults.tone,
          style: options.defaults.style,
          cinematography: options.defaults.cinematography,
          durationS: 60,
        })
      ).body,
    );

    expect((await client.call('GET', `${audioOf(film.id)}/timeline`)).status).toBe(404);
  });

  it('mette in fila le inquadrature e dice dove cade ogni suono', async () => {
    const { film, shot } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio, { ...musicBody, durationS: 2 });

    const timeline = audioTimelineSchema.parse(
      (await client.call('GET', `${audio}/timeline`)).body,
    );

    expect(timeline.shots[0]).toMatchObject({ shotId: shot.id, startS: 0, nativeAudio: false });
    expect(timeline.placements[clip.id]).toEqual({ startS: 0, durationS: 2 });
    expect(timeline.durationS).toBeGreaterThan(0);
  });
});

describe('il pannello del blocco', () => {
  it('cambia com’è il suono e dove parte; le varianti già fatte restano', async () => {
    const { film, shot } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio, {
      ...musicBody,
      kind: 'sfx',
      shotId: shot.id,
      durationS: 2,
    });
    const done = await generate(client, audio, clip.id);

    const reply = await client.call('PUT', `${audio}/clips/${clip.id}`, {
      description: 'Un altro rumore.',
      startS: 0.5,
      durationS: 3,
    });

    expect(audioClipSchema.parse(reply.body)).toMatchObject({
      description: 'Un altro rumore.',
      startS: 0.5,
      durationS: 3,
      chosenVariantId: done.chosenVariantId,
    });
  });

  it('il secondo di partenza si controlla, e la musica parte con la scena', async () => {
    const { film, shot } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const effect = await clipOf(client, audio, {
      ...musicBody,
      kind: 'sfx',
      shotId: shot.id,
      durationS: 2,
    });
    const music = await clipOf(client, audio);

    expect(
      failure(await client.call('PUT', `${audio}/clips/${effect.id}`, { startS: 9999 })),
    ).toMatchObject({ status: 400, details: { field: 'startS' } });
    expect(
      failure(await client.call('PUT', `${audio}/clips/${music.id}`, { startS: 1 })),
    ).toMatchObject({ status: 400, details: { field: 'startS' } });
    expect((await client.call('PUT', `${audio}/clips/${music.id}`, {})).status).toBe(400);
    expect(
      failure(await client.call('PUT', `${audio}/clips/inventata`, { description: 'x' })),
    ).toMatchObject({ status: 404, details: { field: 'clipId' } });
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

  it('un solo blocco di musica per scena: per cambiarla si cambia la variante o si toglie la clip', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);

    expect(
      failure(
        await client.call('POST', `${audio}/clips`, { ...musicBody, description: 'Un’altra.' }),
      ),
    ).toMatchObject({ status: 409, details: { field: 'music' } });

    await client.call('DELETE', `${audio}/clips/${clip.id}`);
    await clipOf(client, audio);
  });

  it('un’inquadratura il cui piano è da rifare non prende effetti: rifarlo li toglierebbe', async () => {
    const { film, final, shot } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const effect = { ...musicBody, kind: 'sfx', shotId: shot.id, durationS: 2 };
    const placed = await clipOf(client, audio, effect);
    await client.call('PUT', `/projects/${film.id}/screenplay/final`, {
      screenplay: {
        ...final.screenplay,
        scenes: final.screenplay.scenes.map((scene) => ({
          ...scene,
          summary: 'Riscritta a mano.',
        })),
      },
    });

    expect(failure(await client.call('POST', `${audio}/clips`, effect))).toMatchObject({
      status: 409,
      details: { field: 'plan' },
    });
    expect(
      failure(await client.call('POST', `${audio}/clips/${placed.id}/variants`, {})),
    ).toMatchObject({ status: 409, details: { field: 'plan' } });
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
    const other = await filmWithFinal(client);
    const otherAudio = audioOf(other.film.id);
    const tooLong = await clipOf(client, otherAudio, { ...musicBody, durationS: 500 });
    const optionsOf = async (place: string, id: string) =>
      sheetOptionsSchema.parse((await client.call('GET', `${place}/clips/${id}/options`)).body)
        .options;

    const [first] = await optionsOf(audio, clip.id);
    expect(first?.modelId).toBe('music-stable-audio-3');
    expect(first?.estimatedCostUsd).toBeGreaterThan(0);
    expect(await optionsOf(otherAudio, tooLong.id)).toEqual([]);

    expect(
      failure(await client.call('POST', `${otherAudio}/clips/${tooLong.id}/variants`, {})),
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

describe('prima di spendere', () => {
  it('il moderatore legge descrizione e atmosfera, e rispetta la conferma del limite di spesa', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);
    const moderation = app.get(ModerationService, { strict: false });
    const spy = vi.spyOn(moderation, 'assertAllowed');

    try {
      await client.call('POST', `${audio}/clips/${clip.id}/variants`, { spendConfirmed: true });
      await settled(client, audio, clip.id);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('bittersweet') as string,
          spendConfirmed: true,
        }),
      );
      expect(spy.mock.calls[0]?.[0].text).toContain('Un piano');
    } finally {
      spy.mockRestore();
    }
  });

  it('se il lavoro non entra in coda la clip non resta bloccata', async () => {
    const { film } = await filmWithFinal(client);
    const audio = audioOf(film.id);
    const clip = await clipOf(client, audio);
    const runner = app.get(JobRunner, { strict: false });
    const spy = vi.spyOn(runner, 'enqueue').mockImplementationOnce(() => {
      throw new Error('coda piena');
    });

    try {
      const refused = await client.call('POST', `${audio}/clips/${clip.id}/variants`, {});

      expect(refused.status).toBeGreaterThanOrEqual(500);
      expect((await settled(client, audio, clip.id)).variants[0]).toMatchObject({
        status: 'failed',
        errorCode: 'unknown',
      });
    } finally {
      spy.mockRestore();
    }
    expect((await generate(client, audio, clip.id)).chosenVariantId).toBeDefined();
  });

  it('una funzione spenta dopo aver creato la clip non spende', async () => {
    const started = await startApp();

    try {
      const { film } = await filmWithFinal(started.client);
      const audio = audioOf(film.id);
      const clip = await clipOf(started.client, audio);
      const { config } = draftViewSchema.parse(
        (await started.client.call('GET', '/troupe/draft')).body,
      );
      await started.client.call('PUT', '/troupe/draft', {
        config: { ...config, features: { ...config.features, music: false } },
      });
      await started.client.call('POST', '/troupe/publish', { note: 'senza musica' });

      expect(
        failure(await started.client.call('POST', `${audio}/clips/${clip.id}/variants`, {})),
      ).toMatchObject({ status: 409, details: { field: 'feature' } });
    } finally {
      await started.app.close();
    }
  }, 60_000);
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

describe('«Suggerisci i suoni»', () => {
  it('propone clip da accettare, non salva niente, e accettarne una è una richiesta come le altre', async () => {
    const { film } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const estimate = soundSuggestionsEstimateSchema.parse(
      (await client.call('GET', `${audio}/suggestions/estimate`)).body,
    );
    expect(estimate.estimate.estimatedCostUsd).toBeGreaterThan(0);

    const reply = await client.call('POST', `${audio}/suggestions`, {});

    expect(reply.status).toBe(201);
    const { suggestions } = soundSuggestionsSchema.parse(reply.body);
    const music = suggestions.find((suggestion) => suggestion.kind === 'music');
    expect(music?.sceneId).toBe('scene-1');
    // L'esempio del fornitore finto parla di un'inquadratura che in questo film non c'è: si scarta.
    expect(suggestions.map((suggestion) => suggestion.kind)).toEqual(['music']);
    const { clips } = audioOverviewSchema.parse((await client.call('GET', audio)).body);
    expect(clips).toEqual([]);

    expect((await client.call('POST', `${audio}/clips`, music)).status).toBe(201);
  });

  it('senza stesura finale non si può chiedere', async () => {
    const options = projectOptionsSchema.parse(
      (await client.call('GET', '/projects/options')).body,
    );
    const film = projectSchema.parse(
      (
        await client.call('POST', '/projects', {
          idea: 'Una bobina dimenticata sull’ultimo treno della sera.',
          genre: options.defaults.genre,
          tone: options.defaults.tone,
          style: options.defaults.style,
          cinematography: options.defaults.cinematography,
          durationS: 60,
        })
      ).body,
    );

    const reply = await client.call('POST', `${audioOf(film.id)}/suggestions`, {});

    expect(reply.status).toBeGreaterThanOrEqual(400);
  });

  it('due richieste insieme non pagano due volte', async () => {
    const { film } = await filmWithFinal(client);
    const suggestions = `${audioOf(film.id)}/suggestions`;

    const [one, two] = await Promise.all([
      client.call('POST', suggestions, {}),
      client.call('POST', suggestions, {}),
    ]);

    expect([one.status, two.status].sort()).toEqual([201, 409]);
  });
});

describe('R8: il video cambia dopo l’effetto', () => {
  const shoot = async (shotPath: string) => {
    await client.call('POST', `${shotPath}/takes`, {});
    for (let attempt = 0; attempt < 150; attempt += 1) {
      const { takes } = shotTakesSchema.parse((await client.call('GET', `${shotPath}/takes`)).body);
      if (takes.every((take) => take.status === 'succeeded' || take.status === 'failed')) return;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error('il take non è arrivato in tempo');
  };
  const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

  it('un video rifatto dopo l’effetto dà un avviso leggero, senza pulsante; un nuovo effetto lo toglie', async () => {
    const { film, shot, shots } = await filmWithShot(client);
    const audio = audioOf(film.id);
    const shotPath = `${shots}/${shot.id}`;
    const flags = async () =>
      shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0]?.flags[shot.id] ?? [];
    await shoot(shotPath);
    await tick();
    const effect = await clipOf(client, audio, {
      ...musicBody,
      kind: 'sfx',
      shotId: shot.id,
      durationS: 2,
    });
    await generate(client, audio, effect.id);
    expect(await flags()).toEqual([]);

    await tick();
    await shoot(shotPath);

    expect(await flags()).toEqual([
      expect.objectContaining({ code: 'R8', light: true, fix: 'none' }),
    ]);

    await tick();
    const again = await generate(client, audio, effect.id);
    await client.call('PUT', `${audio}/clips/${effect.id}/variant`, {
      variantId: again.variants[0]?.id,
    });
    expect(await flags()).toEqual([]);
  });

  it('un effetto senza una variante in uso non conta', async () => {
    const { film, shot, shots } = await filmWithShot(client);
    await clipOf(client, audioOf(film.id), {
      ...musicBody,
      kind: 'sfx',
      shotId: shot.id,
      durationS: 2,
    });
    await tick();
    await shoot(`${shots}/${shot.id}`);

    const scene = shotPlansSchema.parse((await client.call('GET', shots)).body).scenes[0];
    expect(scene?.flags[shot.id] ?? []).toEqual([]);
  });
});
