import {
  ROLE_INPUT_EXAMPLES,
  ROLE_OUTPUT_EXAMPLES,
  SHOT_DURATION_RANGE_S,
  shotPlannerInputSchema,
  shotPlannerOutputSchema,
  type CameraMovement,
  type GenerationContext,
  type Project,
  type ScreenplayScene,
  type ScreenplayVersion,
  type ShotPlannerInput,
  type StoryBible,
} from '@filmzy/contracts';
import {
  createShotStore,
  openFilmzyDatabase,
  type LocationStore,
  type ShotStore,
  type TakeStore,
} from '@filmzy/db';
import type { ConfigSource, LoadedConfig, Troupe } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import type { BibleService } from '../bible/bible.service.js';
import type { ProjectsService } from '../projects/projects.service.js';
import type { ScreenplayService } from '../screenplay/screenplay.service.js';
import { hashScene } from './plan-shots.js';
import { ShotsService } from './shots.service.js';

const exampleInput = shotPlannerInputSchema.parse(ROLE_INPUT_EXAMPLES.shot_planner);
const proposal = shotPlannerOutputSchema.parse(ROLE_OUTPUT_EXAMPLES.shot_planner);

const film: Project = {
  id: 'film-1',
  title: 'L’ultima corsa',
  idea: 'Una bobina dimenticata sull’ultimo treno',
  genre: 'drama',
  tone: 'moving',
  style: 'realistic',
  cinematography: 'noir',
  language: 'it',
  durationS: 90,
  phase: 'final',
  createdAt: '2026-11-02T10:00:00.000Z',
  updatedAt: '2026-11-02T10:00:00.000Z',
};

const bible: StoryBible = exampleInput.bible;
const locationId = bible.locations[0]?.id ?? 'piazza';

const movement = (id: string, enabled = true): CameraMovement => ({
  id,
  label: id,
  description: `Movimento ${id}`,
  hint: id,
  endFrameHint: id,
  enabled,
});

function sceneNumbered(number: number, summary: string): ScreenplayScene {
  return {
    number,
    heading: `SCENA ${String(number)}`,
    locationId,
    timeOfDay: 'sera',
    characterIds: [],
    summary,
    beats: [],
    durationS: 20,
  };
}

let final: ScreenplayVersion;
let store: ShotStore;
let runs: { input: ShotPlannerInput; ctx: GenerationContext }[];
let estimates: ShotPlannerInput[];
let reached: string[];
let clips: Record<string, string>;
let videoInProgress: string[];

function build(options: { bible?: StoryBible; movements?: CameraMovement[] } = {}) {
  const troupe = {
    run: (_role: string, input: ShotPlannerInput, ctx: GenerationContext) => {
      runs.push({ input, ctx });
      return Promise.resolve({
        data: { ...proposal, notes: 'Fotografia come il film.' },
        receipt: { id: `scontrino-${String(runs.length)}` },
      });
    },
    estimate: (_role: string, input: ShotPlannerInput) => {
      estimates.push(input);
      return Promise.resolve({ modelId: 'finto', modelLabel: 'Finto', estimatedCostUsd: 0.03 });
    },
  } as unknown as Troupe;
  const configSource: ConfigSource = {
    load: () =>
      Promise.resolve({
        config: {
          presets: {
            cameraMovements: options.movements ?? [movement('static'), movement('push_in')],
          },
        },
        origin: 'prova',
        releaseId: 'prova',
        issues: [],
      } as unknown as LoadedConfig),
  };
  const screenplays = { latest: () => final } as unknown as ScreenplayService;
  const current = options.bible ?? bible;
  const bibles = {
    assemble: () => Promise.resolve(current),
    knownIds: () => ({
      characters: new Set(current.characters.map((character) => character.id)),
      locations: new Set(current.locations.map((location) => location.id)),
    }),
  } as unknown as BibleService;
  const projects = {
    get: (id: string) => {
      if (id !== film.id) throw new HttpException({ code: 'not_found', retryable: false }, 404);
      return film;
    },
    reach: (_id: string, phase: string) => {
      reached.push(phase);
    },
  } as unknown as ProjectsService;
  const takes = {
    latestClips: () => clips,
    inProgress: () => videoInProgress,
    lastTakeAt: () => ({}),
  } as unknown as TakeStore;
  const locations = { referenceChanges: () => ({}) } as unknown as LocationStore;
  return new ShotsService(
    store,
    troupe,
    configSource,
    screenplays,
    bibles,
    projects,
    takes,
    locations,
  );
}

async function failure(call: () => Promise<unknown>): Promise<{ status: number; code: string }> {
  try {
    await call();
  } catch (error) {
    if (error instanceof HttpException) {
      return { status: error.getStatus(), code: (error.getResponse() as { code: string }).code };
    }
    throw error;
  }
  throw new Error('doveva fallire');
}

beforeEach(async () => {
  const opened = await openFilmzyDatabase({
    dataDir: await mkdtemp(path.join(tmpdir(), 'filmzy-inquadrature-')),
    appVersion: '0.0.0-test',
  });
  store = createShotStore(opened.db);
  runs = [];
  estimates = [];
  reached = [];
  clips = {};
  videoInProgress = [];
  final = {
    id: 'stesura-1',
    projectId: film.id,
    stage: 'final',
    version: 1,
    screenplay: {
      title: film.title,
      logline: 'Una bobina dimenticata.',
      characters: [],
      locations: [],
      scenes: [sceneNumbered(1, 'Anna arriva.'), sceneNumbered(2, 'Anna aspetta.')],
    },
    createdAt: '2026-11-02T10:00:00.000Z',
  };
  return () => {
    opened.close();
  };
});

describe('le scene e le loro inquadrature', () => {
  it('prima di pensarle le scene della stesura ci sono, non pianificate, con i movimenti attivi', async () => {
    const plans = await build({
      movements: [movement('static'), movement('push_in'), movement('spento', false)],
    }).plans(film.id);

    expect(plans.finalVersionId).toBe('stesura-1');
    expect(plans.scenes.map((s) => [s.sceneNumber, s.planned, s.stale, s.shots.length])).toEqual([
      [1, false, false, 0],
      [2, false, false, 0],
    ]);
    expect(plans.cameraMovements.map((m) => m.id)).toEqual(['static', 'push_in']);
  });

  it('pensare una scena dà inquadrature valide, salva lo scontrino e le note, e porta il film alla fase «shots»', async () => {
    const plan = await build().plan(film.id, { sceneNumber: 1 });

    expect(plan).toMatchObject({
      sceneNumber: 1,
      planned: true,
      stale: false,
      notes: 'Fotografia come il film.',
    });
    expect(plan.shots.length).toBe(proposal.shots.length);
    for (const shot of plan.shots) {
      expect(shot.sceneId).toBe('scene-1');
      expect(['static', 'push_in']).toContain(shot.intent.cameraMovement);
      expect(shot.continuity.entry.locationId).toBe(locationId);
      expect(shot.continuity.exit.locationId).toBe(locationId);
    }
    expect(store.plan(film.id, 1)).toMatchObject({ generationId: 'scontrino-1' });
    expect(reached).toEqual(['shots']);
  });

  it('all’aiuto regista arrivano la scena col suo id, la Bibbia senza immagini, i movimenti attivi e la durata', async () => {
    await build().plan(film.id, { sceneNumber: 2 });

    const { input, ctx } = runs[0] ?? { input: undefined, ctx: undefined };
    expect(input?.scene).toMatchObject({ id: 'scene-2', number: 2, summary: 'Anna aspetta.' });
    expect(input?.shotDurationS).toEqual(SHOT_DURATION_RANGE_S);
    expect(input?.cameraMovements.map((m) => m.id)).toEqual(['static', 'push_in']);
    expect(input?.language).toBe('it');
    expect(input?.moodboard).toBeNull();
    expect(input?.bible.characters.every((c) => c.sheet.length === 0)).toBe(true);
    expect(input?.bible.locations.every((l) => l.references.length === 0)).toBe(true);
    expect(ctx).toEqual({ purpose: 'product', projectId: film.id });
  });

  it('con la conferma dell’utente il limite di spesa si supera per questa richiesta sola', async () => {
    await build().plan(film.id, { sceneNumber: 1, spendConfirmed: true });
    await build().plan(film.id, { sceneNumber: 1 });

    expect(runs[0]?.ctx.spendConfirmed).toBe(true);
    expect(runs[1]?.ctx.spendConfirmed).toBeUndefined();
  });

  it('come finisce la scena pensata prima entra nell’ingresso della scena dopo', async () => {
    const service = build();
    expect((await service.plan(film.id, { sceneNumber: 1 })).planned).toBe(true);
    const lastExit = store.plan(film.id, 1)?.shots.at(-1)?.continuity.exit;

    await service.plan(film.id, { sceneNumber: 2 });

    expect(runs[0]?.input.previousExit).toBeNull();
    expect(runs[1]?.input.previousExit).toEqual(lastExit);
  });

  it('rifare una scena sostituisce le sue inquadrature e non tocca quelle delle altre', async () => {
    const service = build();
    await service.plan(film.id, { sceneNumber: 1 });
    await service.plan(film.id, { sceneNumber: 2 });
    const secondBefore = store.plan(film.id, 2)?.shots.map((s) => s.id);
    const firstBefore = store.plan(film.id, 1)?.shots.map((s) => s.id);

    await service.plan(film.id, { sceneNumber: 1 });

    expect(store.plan(film.id, 1)?.shots.map((s) => s.id)).not.toEqual(firstBefore);
    expect(store.plan(film.id, 2)?.shots.map((s) => s.id)).toEqual(secondBefore);
  });

  it('se la scena cambia dopo, il piano si segna da rifare e le inquadrature restano', async () => {
    const service = build();
    await service.plan(film.id, { sceneNumber: 1 });
    await service.plan(film.id, { sceneNumber: 2 });
    const [first, second] = final.screenplay.scenes;
    if (first === undefined || second === undefined) throw new Error('servono due scene');
    // La stesura viene corretta: cambia il riassunto della scena 2.
    final = {
      ...final,
      id: 'stesura-2',
      screenplay: { ...final.screenplay, scenes: [first, { ...second, summary: 'Anna parte.' }] },
    };

    const plans = await service.plans(film.id);

    expect(plans.scenes.map((s) => [s.sceneNumber, s.planned, s.stale])).toEqual([
      [1, true, false],
      [2, true, true],
    ]);
    expect(plans.scenes[1]?.shots.length).toBeGreaterThan(0);
    expect(store.plan(film.id, 2)?.sceneHash).toBe(hashScene(sceneNumbered(2, 'Anna aspetta.')));
  });

  it('se il film perde un luogo che il piano cita, il piano si segna da rifare e le inquadrature restano', async () => {
    await build().plan(film.id, { sceneNumber: 1 });

    const afterRemoval = await build({ bible: { ...bible, locations: [] } }).plans(film.id);

    expect(afterRemoval.scenes[0]).toMatchObject({ planned: true, stale: true });
    expect(afterRemoval.scenes[0]?.shots.length).toBeGreaterThan(0);
  });

  it('un piano vecchio non fa da punto di partenza per la scena dopo', async () => {
    const service = build();
    await service.plan(film.id, { sceneNumber: 1 });
    const [first, second] = final.screenplay.scenes;
    if (first === undefined || second === undefined) throw new Error('servono due scene');
    // La scena 1 viene riscritta: il suo piano è vecchio e la sua uscita non vale più.
    final = {
      ...final,
      screenplay: { ...final.screenplay, scenes: [{ ...first, summary: 'Anna parte.' }, second] },
    };

    await service.plan(film.id, { sceneNumber: 2 });

    expect(runs[1]?.input.previousExit).toBeNull();
  });

  it('il luogo della scena che arriva all’aiuto regista esiste sempre: se la stesura non ne scrive uno, è il primo del film', async () => {
    const [first, second] = final.screenplay.scenes;
    if (first === undefined || second === undefined) throw new Error('servono due scene');
    const { locationId: ignored, ...withoutPlace } = first;
    expect(ignored).toBeDefined();
    final = { ...final, screenplay: { ...final.screenplay, scenes: [withoutPlace, second] } };

    await build().plan(film.id, { sceneNumber: 1 });

    expect(runs[0]?.input.scene.locationId).toBe(locationId);
  });

  it('la stima usa gli stessi ingressi e non chiama nessuno', async () => {
    const { estimate } = await build().estimate(film.id, 1);

    expect(estimate.estimatedCostUsd).toBe(0.03);
    expect(estimates[0]?.scene.id).toBe('scene-1');
    expect(runs).toEqual([]);
  });

  it('una scena che non c’è dà «non trovato», un film senza luoghi chiede di aggiungerne uno', async () => {
    expect(await failure(() => build().plan(film.id, { sceneNumber: 9 }))).toEqual({
      status: 404,
      code: 'not_found',
    });
    expect(
      await failure(() =>
        build({ bible: { ...bible, locations: [] } }).plan(film.id, { sceneNumber: 1 }),
      ),
    ).toEqual({ status: 409, code: 'invalid_request' });
    expect(runs).toEqual([]);
  });
});

describe('il movimento di macchina', () => {
  async function planned() {
    const service = build();
    const plan = await service.plan(film.id, { sceneNumber: 1 });
    const shot = plan.shots[0];
    if (shot === undefined) throw new Error('doveva esserci un’inquadratura');
    return { service, shot };
  }

  it('si cambia scegliendolo dalla lista, e si rilegge cambiato', async () => {
    const { service, shot } = await planned();
    const other = shot.intent.cameraMovement === 'static' ? 'push_in' : 'static';

    const changed = await service.changeMovement(film.id, shot.id, { cameraMovement: other });

    expect(changed.intent.cameraMovement).toBe(other);
    expect(store.get(shot.id)?.spec.intent.cameraMovement).toBe(other);
  });

  it('un movimento che non è tra quelli attivi è rifiutato', async () => {
    const { service, shot } = await planned();

    expect(
      await failure(() => service.changeMovement(film.id, shot.id, { cameraMovement: 'volo' })),
    ).toEqual({ status: 400, code: 'invalid_request' });
    expect(store.get(shot.id)?.spec.intent.cameraMovement).toBe(shot.intent.cameraMovement);
  });

  it('un’inquadratura che non c’è o è di un altro film dà «non trovato»', async () => {
    const { service, shot } = await planned();
    store.replaceScene({
      projectId: 'altro-film',
      sceneNumber: 1,
      sceneHash: 'h',
      screenplayId: 's',
      shots: [{ ...shot, id: 'di-altri' }],
    });

    for (const id of ['non-esiste', 'di-altri']) {
      expect(
        await failure(() => service.changeMovement(film.id, id, { cameraMovement: 'static' })),
      ).toEqual({ status: 404, code: 'not_found' });
    }
  });
});

describe('la variante di storyboard scelta', () => {
  it('sta nella scena della sua inquadratura, e solo lì', async () => {
    const service = build();
    const first = await service.plan(film.id, { sceneNumber: 1 });
    await service.plan(film.id, { sceneNumber: 2 });
    const shot = first.shots[0];
    if (shot === undefined) throw new Error('doveva esserci un’inquadratura');

    store.chooseStoryboard(shot.id, 'immagine-1');
    const plans = await service.plans(film.id);

    expect(plans.scenes[0]?.chosenStoryboards).toEqual({ [shot.id]: 'immagine-1' });
    expect(plans.scenes[1]?.chosenStoryboards).toEqual({});
  });

  it('rifare il piano della scena la toglie con le inquadrature vecchie', async () => {
    const service = build();
    const first = await service.plan(film.id, { sceneNumber: 1 });
    const shot = first.shots[0];
    if (shot === undefined) throw new Error('doveva esserci un’inquadratura');
    store.chooseStoryboard(shot.id, 'immagine-1');

    const again = await service.plan(film.id, { sceneNumber: 1 });

    expect(again.chosenStoryboards).toEqual({});
    expect((await service.plans(film.id)).scenes[0]?.chosenStoryboards).toEqual({});
  });
});

describe('la clip più recente', () => {
  it('sta nella scena della sua inquadratura, e solo lì', async () => {
    const service = build();
    const first = await service.plan(film.id, { sceneNumber: 1 });
    await service.plan(film.id, { sceneNumber: 2 });
    const shot = first.shots[0];
    if (shot === undefined) throw new Error('doveva esserci un’inquadratura');
    clips = { [shot.id]: 'clip-1', altra: 'clip-di-altri' };

    const plans = await service.plans(film.id);

    expect(plans.scenes[0]?.clips).toEqual({ [shot.id]: 'clip-1' });
    expect(plans.scenes[1]?.clips).toEqual({});
  });

  it('un piano appena rifatto non ha ancora nessun take', async () => {
    const again = await build().plan(film.id, { sceneNumber: 1 });

    expect(again.clips).toEqual({});
  });
});

describe('cosa si sta facendo adesso', () => {
  it('ogni inquadratura con un lavoro in corso lo dice, e il video vince sulle immagini (T4.4)', async () => {
    const service = build();
    const first = await service.plan(film.id, { sceneNumber: 1 });
    const second = await service.plan(film.id, { sceneNumber: 2 });
    const one = first.shots[0];
    const two = second.shots[0];
    if (one === undefined || two === undefined) throw new Error('servono due inquadrature');
    // La prima disegna lo storyboard e gira già il video; la seconda disegna lo storyboard e l'ultimo fotogramma.
    store.startStoryboard(one.id, 'storyboard');
    store.startStoryboard(two.id, 'storyboard');
    store.startStoryboard(two.id, 'end_frame');
    videoInProgress = [one.id];

    const plans = await service.plans(film.id);

    expect(plans.scenes[0]?.working).toEqual({ [one.id]: 'video' });
    expect(plans.scenes[1]?.working).toEqual({ [two.id]: 'end_frame' });
  });

  it('un piano appena rifatto non ha niente in corso', async () => {
    const again = await build().plan(film.id, { sceneNumber: 1 });

    expect(again.working).toEqual({});
  });
});
