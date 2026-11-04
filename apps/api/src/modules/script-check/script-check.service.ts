import {
  type RunScriptCheckBody,
  type ScriptCheckEstimate,
  type ScriptCheckView,
  type ScriptSupervisorInput,
  type ShotPlans,
} from '@filmzy/contracts';
import type { ScriptCheckStore } from '@filmzy/db';
import type { Troupe } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ScreenplayService } from '../screenplay/screenplay.service.js';
import { sceneIdOf } from '../shots/plan-shots.js';
import { ShotsService } from '../shots/shots.service.js';
import { TROUPE } from '../troupe/tokens.js';
import {
  checkState,
  fingerprintOf,
  issuesView,
  placesOf,
  settleIssues,
  usableScenes,
} from './script-check.js';
import { SCRIPT_CHECK_STORE } from './tokens.js';

const ROLE = 'script_supervisor';

/**
 * «Controlla la storia» (T5.2, architettura §8): la segretaria di edizione legge la stesura finale e le
 * inquadrature pensate e dice dove la trama non torna. Non cambia niente da sola: le segnalazioni
 * ingialliscono la scena o l'inquadratura (origine `llm`) e l'utente decide. Costa una chiamata a un
 * modello di testo, quindi ha la stima prima e il limite di spesa controllato dalla troupe; il lavoro è
 * breve e non va in coda (la regola 9 vale per immagini e video).
 */
@Injectable()
export class ScriptCheckService {
  /** I film che hanno un controllo in corso: due richieste insieme pagherebbero due volte lo stesso. */
  private readonly running = new Set<string>();

  constructor(
    @Inject(SCRIPT_CHECK_STORE) private readonly store: ScriptCheckStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    private readonly shots: ShotsService,
    private readonly screenplays: ScreenplayService,
    private readonly projects: ProjectsService,
  ) {}

  /** L'ultimo controllo, con le scene e le inquadrature numerate, e se vale ancora. */
  async view(projectId: string): Promise<ScriptCheckView> {
    this.projects.get(projectId);
    return this.viewOf(projectId, await this.shots.plans(projectId));
  }

  /** Il controllo com'è rispetto alle scene che si hanno in mano: il piano si legge una volta sola. */
  private viewOf(projectId: string, plans: ShotPlans): ScriptCheckView {
    const check = this.store.latest(projectId);
    if (check === undefined) return { state: 'none', issues: [] };
    return {
      state: checkState(check, plans.finalVersionId, plans.scenes),
      checkedAt: check.createdAt,
      issues: issuesView(check, plans.scenes, this.shots.ignoredFlags(projectId)),
    };
  }

  /** Quanto costerebbe il controllo, senza chiamare nessuno (D30). */
  async estimate(projectId: string): Promise<ScriptCheckEstimate> {
    const { input } = await this.inputFor(projectId);
    return { estimate: await this.troupe.estimate(ROLE, input) };
  }

  async run(projectId: string, body: RunScriptCheckBody): Promise<ScriptCheckView> {
    if (this.running.has(projectId)) {
      throw domainError(409, 'invalid_request', { details: { field: 'check' } });
    }
    this.running.add(projectId);
    let plans: ShotPlans;
    try {
      const read = await this.inputFor(projectId);
      const { input, fingerprint, places } = read;
      plans = read.plans;
      const { data, receipt } = await this.troupe.run(ROLE, input, {
        purpose: 'product',
        projectId,
        ...(body.spendConfirmed === true ? { spendConfirmed: true } : {}),
      });
      // Si salva solo a risposta arrivata e ripulita: se la chiamata fallisce il controllo di prima resta.
      this.store.replace({
        projectId,
        fingerprint,
        generationId: receipt.id,
        issues: settleIssues(data.issues, places),
      });
    } finally {
      this.running.delete(projectId);
    }
    return this.viewOf(projectId, plans);
  }

  /**
   * Cosa legge la segretaria: tutta la stesura finale e le inquadrature delle scene pensate il cui piano
   * vale ancora. Senza nessuna scena pensata non c'è niente da controllare, e lo si dice.
   */
  private async inputFor(projectId: string) {
    this.projects.get(projectId);
    const plans = await this.shots.plans(projectId);
    const used = usableScenes(plans.scenes);
    if (used.length === 0) {
      throw domainError(409, 'invalid_request', { details: { field: 'shots' } });
    }

    const final = this.screenplays.latest(projectId, 'final');
    const input: ScriptSupervisorInput = {
      screenplay: final.screenplay,
      scenes: final.screenplay.scenes.map((scene) => ({ ...scene, id: sceneIdOf(scene.number) })),
      shots: used.flatMap((scene) => scene.shots),
      language: this.projects.get(projectId).language,
    };
    return {
      plans,
      input,
      fingerprint: fingerprintOf(plans.finalVersionId, plans.scenes),
      places: placesOf(plans.scenes),
    };
  }
}
