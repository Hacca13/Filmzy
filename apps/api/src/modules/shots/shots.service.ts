import type {
  CameraMovement,
  ChangeShotBody,
  PlanSceneBody,
  PlanSceneEstimate,
  ScenePlan,
  ScreenplayScene,
  ScreenplayVersion,
  ShotPlannerInput,
  ShotPlans,
  ShotSpec,
} from '@filmzy/contracts';
import { SHOT_DURATION_RANGE_S } from '@filmzy/contracts';
import type { ShotStore, StoredShotPlan, TakeStore } from '@filmzy/db';
import type { ConfigSource, Troupe, TroupeConfig } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { BibleService } from '../bible/bible.service.js';
import { withoutImages } from '../bible/without-images.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { CONFIG_SOURCE, TROUPE } from '../troupe/tokens.js';
import { hashScene, isStale, sceneIdOf, settleShots, type KnownIds } from './plan-shots.js';
import { SHOT_STORE, TAKE_STORE } from './tokens.js';
import { STALE_WORK_MS } from './work.js';

/**
 * Le inquadrature (T3.9, architettura §3.1, §5.2): l'aiuto regista divide una scena della
 * sceneggiatura finale in inquadrature, una scena alla volta. Il piano di una scena si **rifà** a
 * richiesta e sostituisce quello di prima; se la scena cambia dopo (la stesura è corretta o
 * riscritta) o il film perde un personaggio o un luogo che il piano cita, il piano si segna da
 * rifare, senza toccarlo.
 *
 * Pensare le inquadrature costa: la stima si vede prima e passa dai limiti di spesa come ogni
 * chiamata (`spendConfirmed`). Il movimento di macchina si cambia a mano, scegliendolo dalla lista
 * dei movimenti attivi (D20).
 */
@Injectable()
export class ShotsService {
  constructor(
    @Inject(SHOT_STORE) private readonly store: ShotStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    private readonly screenplays: ScreenplayService,
    private readonly bible: BibleService,
    private readonly projects: ProjectsService,
    @Inject(TAKE_STORE) private readonly takes: TakeStore,
  ) {}

  /** Le scene dell'ultima stesura con le loro inquadrature, e i movimenti di macchina attivi. */
  async plans(projectId: string): Promise<ShotPlans> {
    this.projects.get(projectId);
    const final = this.screenplays.latest(projectId, 'final');
    const config = await this.config();
    const known = this.bible.knownIds(projectId);
    const stored = new Map(this.store.plans(projectId).map((plan) => [plan.sceneNumber, plan]));
    const extras = {
      chosen: this.store.chosenStoryboards(projectId),
      clips: this.takes.latestClips(projectId),
      working: this.workingNow(projectId),
    };

    return {
      finalVersionId: final.id,
      scenes: final.screenplay.scenes.map((scene) =>
        scenePlan(scene, stored.get(scene.number), known, extras),
      ),
      cameraMovements: activeMovements(config).map(({ id, label, description }) => ({
        id,
        label,
        description,
      })),
    };
  }

  /** Cosa si sta facendo adesso per ogni inquadratura del film (T4.4): il video vince sulle immagini. */
  private workingNow(projectId: string): Record<string, Work> {
    const since = new Date(Date.now() - STALE_WORK_MS);
    const working: Record<string, Work> = { ...this.store.drawing(projectId, since) };
    for (const shotId of this.takes.inProgress(projectId, since)) working[shotId] = 'video';
    return working;
  }

  /** Quanto costerebbe pensare le inquadrature di una scena, senza chiamare nessuno (D30). */
  async estimate(projectId: string, sceneNumber: number): Promise<PlanSceneEstimate> {
    const { input } = await this.inputFor(projectId, sceneNumber);
    return { estimate: await this.troupe.estimate('shot_planner', input) };
  }

  /** «Pensa le inquadrature»: sostituisce il piano della scena, se c'era. */
  async plan(projectId: string, body: PlanSceneBody): Promise<ScenePlan> {
    const { input, final, scene, bible, config } = await this.inputFor(projectId, body.sceneNumber);

    const { data, receipt } = await this.troupe.run('shot_planner', input, {
      purpose: 'product',
      projectId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    });

    const shots = settleShots({
      proposed: data.shots,
      sceneId: input.scene.id,
      scene,
      bible,
      movementIds: activeMovements(config).map((movement) => movement.id),
    });
    const saved = this.store.replaceScene({
      projectId,
      sceneNumber: scene.number,
      sceneHash: hashScene(scene),
      screenplayId: final.id,
      generationId: receipt.id,
      ...(data.notes === undefined ? {} : { notes: data.notes }),
      shots,
    });
    this.projects.reach(projectId, 'shots');
    // Il piano è appena stato rifatto: le inquadrature sono nuove e nessuna ha ancora una variante né un take.
    return scenePlan(scene, saved, this.bible.knownIds(projectId), {
      chosen: {},
      clips: {},
      working: {},
    });
  }

  /** Cambia il movimento di macchina di un'inquadratura, scegliendolo dai movimenti attivi. */
  async changeMovement(projectId: string, shotId: string, body: ChangeShotBody): Promise<ShotSpec> {
    this.projects.get(projectId);
    const config = await this.config();
    if (!activeMovements(config).some((movement) => movement.id === body.cameraMovement)) {
      throw domainError(400, 'invalid_request', { details: { field: 'cameraMovement' } });
    }

    // Si legge e si scrive di seguito, senza attese in mezzo: se nel frattempo il piano della scena
    // è stato rifatto, l'inquadratura non c'è più e lo si dice invece di far finta di salvare.
    const stored = this.store.get(shotId);
    if (stored?.projectId !== projectId) {
      throw domainError(404, 'not_found', { details: { field: 'shotId' } });
    }
    const spec: ShotSpec = {
      ...stored.spec,
      intent: { ...stored.spec.intent, cameraMovement: body.cameraMovement },
    };
    if (!this.store.updateSpec(shotId, spec)) {
      throw domainError(404, 'not_found', { details: { field: 'shotId' } });
    }
    return spec;
  }

  /**
   * Cosa si dice all'aiuto regista per una scena: la scena, la Bibbia (senza immagini), i movimenti
   * attivi e come finisce la scena pianificata prima, se c'è, perché l'entrata della prima
   * inquadratura combaci (architettura §8). Restituisce anche la Bibbia **intera**, da cui il codice
   * prende i riferimenti dopo la chiamata: la si legge una volta sola, così il modello e il
   * controllo vedono lo stesso film.
   */
  private async inputFor(projectId: string, sceneNumber: number) {
    const project = this.projects.get(projectId);
    const final: ScreenplayVersion = this.screenplays.latest(projectId, 'final');
    const scene = final.screenplay.scenes.find((candidate) => candidate.number === sceneNumber);
    if (scene === undefined) {
      throw domainError(404, 'not_found', { details: { field: 'sceneNumber' } });
    }
    const config = await this.config();
    const bible = await this.bible.assemble(projectId);
    // Senza luoghi le schede non si possono scrivere: ogni inquadratura ne ha uno.
    const firstLocation = bible.locations[0];
    if (firstLocation === undefined) {
      throw domainError(409, 'invalid_request', { details: { field: 'locations' } });
    }
    // Il luogo della scena è sempre uno che esiste: quello scritto nella stesura, o il primo del
    // film (lo stesso ripiego che userà `settleShots`). Così il modello non vede mai un id vuoto.
    const sceneLocation = bible.locations.some((location) => location.id === scene.locationId)
      ? scene.locationId
      : firstLocation.id;

    const input: ShotPlannerInput = {
      scene: { ...scene, id: sceneIdOf(scene.number), locationId: sceneLocation },
      bible: withoutImages(bible),
      shotDurationS: SHOT_DURATION_RANGE_S,
      previousExit: this.exitBefore(projectId, scene.number, final, this.bible.knownIds(projectId)),
      cameraMovements: activeMovements(config),
      language: project.language,
      moodboard: null,
    };
    return { input, final, scene, bible, config };
  }

  /**
   * Come finisce l'ultima inquadratura della scena pensata più vicina prima di questa. Un piano
   * vecchio (la scena è cambiata, o cita ciò che il film non ha più) non vale: se ne parte da zero.
   */
  private exitBefore(
    projectId: string,
    sceneNumber: number,
    final: ScreenplayVersion,
    known: KnownIds,
  ) {
    const before = this.store.planBefore(projectId, sceneNumber);
    const beforeScene = final.screenplay.scenes.find(
      (scene) => scene.number === before?.sceneNumber,
    );
    if (before === undefined || beforeScene === undefined) return null;
    if (isStale(beforeScene, before, known)) return null;
    return before.shots.at(-1)?.continuity.exit ?? null;
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

const activeMovements = (config: TroupeConfig): CameraMovement[] =>
  config.presets.cameraMovements.filter((movement) => movement.enabled);

/** Ciò che sta fuori dal piano ma la card mostra: la variante di storyboard scelta e la clip più recente, di tutto il film. */
interface PerShot {
  chosen: Readonly<Record<string, string>>;
  clips: Readonly<Record<string, string>>;
  working: Readonly<Record<string, Work>>;
}

type Work = ScenePlan['working'][string];

/** Di un elenco per inquadratura (di tutto il film) si tengono solo quelle della scena. */
const forShots = <T>(
  shots: readonly ShotSpec[],
  all: Readonly<Record<string, T>>,
): Record<string, T> =>
  Object.fromEntries(
    shots.flatMap((shot) => {
      const value = all[shot.id];
      return value === undefined ? [] : [[shot.id, value]];
    }),
  );

/** Una scena della stesura con il suo piano, se c'è, e ciò che la card mostra di ogni sua inquadratura. */
function scenePlan(
  scene: ScreenplayScene,
  plan: StoredShotPlan | undefined,
  known: KnownIds,
  extras: PerShot,
): ScenePlan {
  const shots = plan?.shots ?? [];
  return {
    sceneNumber: scene.number,
    heading: scene.heading,
    summary: scene.summary,
    durationS: scene.durationS,
    planned: plan !== undefined,
    stale: plan !== undefined && isStale(scene, plan, known),
    ...(plan?.notes === undefined ? {} : { notes: plan.notes }),
    shots,
    chosenStoryboards: forShots(shots, extras.chosen),
    latestTakes: forShots(shots, extras.clips),
    working: forShots(shots, extras.working),
  };
}
