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
import type { ShotStore, StoredShotPlan } from '@filmzy/db';
import type { ConfigSource, Troupe, TroupeConfig } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { BibleService } from '../bible/bible.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { CONFIG_SOURCE, TROUPE } from '../troupe/tokens.js';
import { hashScene, sceneIdOf, settleShots, withoutImages } from './plan-shots.js';
import { SHOT_STORE } from './tokens.js';

/**
 * Le inquadrature (T3.9, architettura §3.1, §5.2): l'aiuto regista divide una scena della
 * sceneggiatura finale in inquadrature, una scena alla volta. Il piano di una scena si **rifà** a
 * richiesta e sostituisce quello di prima; se la scena cambia dopo (la stesura è corretta o
 * riscritta) il piano si segna da rifare, senza toccarlo.
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
  ) {}

  /** Le scene dell'ultima stesura con le loro inquadrature, e i movimenti di macchina attivi. */
  async plans(projectId: string): Promise<ShotPlans> {
    this.projects.get(projectId);
    const final = this.screenplays.latest(projectId, 'final');
    const config = await this.config();
    const stored = new Map(this.store.plans(projectId).map((plan) => [plan.sceneNumber, plan]));

    return {
      finalVersionId: final.id,
      scenes: final.screenplay.scenes.map((scene) => scenePlan(scene, stored.get(scene.number))),
      cameraMovements: activeMovements(config).map(({ id, label, description }) => ({
        id,
        label,
        description,
      })),
    };
  }

  /** Quanto costerebbe pensare le inquadrature di una scena, senza chiamare nessuno (D30). */
  async estimate(projectId: string, sceneNumber: number): Promise<PlanSceneEstimate> {
    const { input } = await this.inputFor(projectId, sceneNumber);
    return { estimate: await this.troupe.estimate('shot_planner', input) };
  }

  /** «Pensa le inquadrature»: sostituisce il piano della scena, se c'era. */
  async plan(projectId: string, body: PlanSceneBody): Promise<ScenePlan> {
    const { input, final, scene, config } = await this.inputFor(projectId, body.sceneNumber);

    const { data, receipt } = await this.troupe.run('shot_planner', input, {
      purpose: 'product',
      projectId,
      ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
    });

    const shots = settleShots({
      proposed: data.shots,
      sceneId: input.scene.id,
      scene,
      bible: await this.bible.assemble(projectId),
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
    return scenePlan(scene, saved);
  }

  /** Cambia il movimento di macchina di un'inquadratura, scegliendolo dai movimenti attivi. */
  async changeMovement(projectId: string, shotId: string, body: ChangeShotBody): Promise<ShotSpec> {
    this.projects.get(projectId);
    const stored = this.store.get(shotId);
    if (stored?.projectId !== projectId) {
      throw domainError(404, 'not_found', { details: { field: 'shotId' } });
    }
    const config = await this.config();
    if (!activeMovements(config).some((movement) => movement.id === body.cameraMovement)) {
      throw domainError(400, 'invalid_request', { details: { field: 'cameraMovement' } });
    }

    const spec: ShotSpec = {
      ...stored.spec,
      intent: { ...stored.spec.intent, cameraMovement: body.cameraMovement },
    };
    this.store.updateSpec(shotId, spec);
    return spec;
  }

  /**
   * Cosa si dice all'aiuto regista per una scena: la scena, la Bibbia (senza immagini), i movimenti
   * attivi e come finisce la scena pianificata prima, se c'è, perché l'entrata della prima
   * inquadratura combaci (architettura §8).
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
    if (bible.locations.length === 0) {
      throw domainError(409, 'invalid_request', { details: { field: 'locations' } });
    }

    const input: ShotPlannerInput = {
      scene: { ...scene, id: sceneIdOf(scene.number) },
      bible: withoutImages(bible),
      shotDurationS: SHOT_DURATION_RANGE_S,
      previousExit: this.exitBefore(projectId, scene.number),
      cameraMovements: activeMovements(config),
      language: project.language,
      moodboard: null,
    };
    return { input, final, scene, config };
  }

  /** Come finisce l'ultima inquadratura della scena pianificata più vicina prima di questa. */
  private exitBefore(projectId: string, sceneNumber: number) {
    const before = this.store
      .plans(projectId)
      .filter((plan) => plan.sceneNumber < sceneNumber)
      .at(-1);
    return before?.shots.at(-1)?.continuity.exit ?? null;
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

const activeMovements = (config: TroupeConfig): CameraMovement[] =>
  config.presets.cameraMovements.filter((movement) => movement.enabled);

/** Una scena della stesura con il suo piano, se c'è; `stale` se la scena è cambiata dopo. */
function scenePlan(scene: ScreenplayScene, plan: StoredShotPlan | undefined): ScenePlan {
  return {
    sceneNumber: scene.number,
    heading: scene.heading,
    summary: scene.summary,
    durationS: scene.durationS,
    planned: plan !== undefined,
    stale: plan !== undefined && plan.sceneHash !== hashScene(scene),
    ...(plan?.notes === undefined ? {} : { notes: plan.notes }),
    shots: plan?.shots ?? [],
  };
}
