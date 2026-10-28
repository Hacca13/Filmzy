import type {
  ReviseBody,
  ScreenplayEstimate,
  ScreenplayEstimateBody,
  ScreenplayVersion,
  ScreenplayVersions,
  WriteDraftBody,
} from '@filmzy/contracts';
import type { ScreenplayStore } from '@filmzy/db';
import type { ConfigSource, Troupe, TroupeConfig } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { ModerationService } from '../moderation/moderation.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { CONFIG_SOURCE, TROUPE } from '../troupe/tokens.js';
import { screenwriterInput } from './screenwriter-input.js';
import { SCREENPLAY_STORE } from './tokens.js';

/** Basta una frase qualunque per stimare una modifica ancora da scrivere: pesa quasi niente. */
const ESTIMATE_PLACEHOLDER_REQUEST = 'Modifica la storia.';

/**
 * La bozza della sceneggiatura (T3.4, architettura §3.1, §5.3): lo sceneggiatore la scrive dall'idea
 * del film, e l'utente può chiedere modifiche con una frase («Parla con lo sceneggiatore»). Ogni
 * scrittura è una **versione nuova** e le precedenti restano da rileggere.
 *
 * Una richiesta di modifica è un testo dell'utente: passa dal moderatore prima di spendere (T3.3).
 * Le chiamate costano, quindi passano dai limiti di spesa come ogni altra (`spendConfirmed` è la
 * conferma dell'utente a proseguire).
 */
@Injectable()
export class ScreenplayService {
  constructor(
    @Inject(SCREENPLAY_STORE) private readonly store: ScreenplayStore,
    @Inject(TROUPE) private readonly troupe: Troupe,
    @Inject(CONFIG_SOURCE) private readonly configSource: ConfigSource,
    private readonly projects: ProjectsService,
    private readonly moderation: ModerationService,
  ) {}

  /** Quanto costerebbe scrivere la bozza o una modifica, senza chiamare nessuno (D30). */
  async estimate(projectId: string, body: ScreenplayEstimateBody): Promise<ScreenplayEstimate> {
    const project = this.projects.get(projectId);
    const config = await this.config();
    const revise = body.mode === 'revise';
    const draft = revise ? this.latestOrFail(projectId).screenplay : null;

    const estimate = await this.troupe.estimate(
      'screenwriter',
      screenwriterInput({
        project,
        config,
        mode: body.mode,
        draft,
        request: revise ? body.request || ESTIMATE_PLACEHOLDER_REQUEST : null,
      }),
    );
    return { estimate };
  }

  /** La bozza da zero: una versione nuova, anche se ce n'erano già. */
  async writeDraft(projectId: string, body: WriteDraftBody): Promise<ScreenplayVersion> {
    const project = this.projects.get(projectId);
    const config = await this.config();

    const { data, receipt } = await this.troupe.run(
      'screenwriter',
      screenwriterInput({ project, config, mode: 'draft', draft: null, request: null }),
      { purpose: 'product', projectId, ...confirmed(body) },
    );
    return this.store.create({
      projectId,
      stage: 'draft',
      screenplay: data,
      generationId: receipt.id,
    });
  }

  /** «Parla con lo sceneggiatore»: una richiesta a turno singolo sull'ultima versione. */
  async revise(projectId: string, body: ReviseBody): Promise<ScreenplayVersion> {
    const project = this.projects.get(projectId);
    const latest = this.latestOrFail(projectId);
    const config = await this.config();

    // Prima il moderatore, poi lo sceneggiatore: un testo respinto non deve costare la modifica.
    await this.moderation.assertAllowed({
      text: body.request,
      context: 'idea',
      language: project.language,
      projectId,
    });

    const { data, receipt } = await this.troupe.run(
      'screenwriter',
      screenwriterInput({
        project,
        config,
        mode: 'revise',
        draft: latest.screenplay,
        request: body.request,
      }),
      { purpose: 'product', projectId, ...confirmed(body) },
    );
    return this.store.create({
      projectId,
      stage: 'draft',
      screenplay: data,
      request: body.request,
      generationId: receipt.id,
    });
  }

  /** L'ultima versione della bozza. */
  latest(projectId: string): ScreenplayVersion {
    this.projects.get(projectId);
    return this.latestOrFail(projectId);
  }

  versions(projectId: string): ScreenplayVersions {
    this.projects.get(projectId);
    return { versions: this.store.list(projectId, 'draft') };
  }

  /** Una versione di quel film: l'id di un altro film non vale. */
  version(projectId: string, versionId: string): ScreenplayVersion {
    this.projects.get(projectId);
    const version = this.store.get(versionId);
    if (version?.projectId !== projectId || version.stage !== 'draft') {
      throw domainError(404, 'not_found', { details: { field: 'version' } });
    }
    return version;
  }

  private latestOrFail(projectId: string): ScreenplayVersion {
    const latest = this.store.latest(projectId, 'draft');
    if (latest === undefined) throw domainError(404, 'not_found', { details: { field: 'draft' } });
    return latest;
  }

  private async config(): Promise<TroupeConfig> {
    const loaded = await this.configSource.load();
    if (loaded.config === undefined) throw domainError(503, 'config_invalid', { retryable: true });
    return loaded.config;
  }
}

function confirmed(body: { spendConfirmed?: boolean | undefined }) {
  return body.spendConfirmed === true ? { spendConfirmed: true } : {};
}
