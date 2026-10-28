import type { ModeratorInput } from '@filmzy/contracts';
import type { PreferencesStore } from '@filmzy/db';
import type { Troupe } from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { PREFERENCES_STORE } from '../preferences/tokens.js';
import { TROUPE } from '../troupe/tokens.js';

export interface ModerationRequest {
  /** Il testo che ha scritto l'utente, così com'è. */
  text: string;
  /** Cos'è: l'idea del film, la descrizione di un personaggio, una scena. */
  context: ModeratorInput['context'];
  language: string;
  projectId?: string;
}

/**
 * Il controllo dei testi dell'utente prima di ogni spesa (T3.3, architettura §10, D54): lo chiama
 * chiunque stia per mandare un testo dell'utente a un servizio che si paga (l'idea, le richieste di
 * modifica allo sceneggiatore, la descrizione di un personaggio…).
 *
 * È una **prudenza** che l'utente può spegnere dalle impostazioni: spenta, non chiama nessuno e non
 * costa niente. Se il moderatore non riesce a rispondere (nessuna chiave, servizio fermo) il testo
 * **non passa**: nessun servizio di riserva e nessun «per questa volta va bene» (regola 6).
 */
@Injectable()
export class ModerationService {
  constructor(
    @Inject(TROUPE) private readonly troupe: Pick<Troupe, 'run'>,
    @Inject(PREFERENCES_STORE) private readonly preferences: Pick<PreferencesStore, 'get'>,
  ) {}

  /** Non fa niente se il testo si può usare; altrimenti `content_rejected` col motivo e il suggerimento. */
  async assertAllowed(request: ModerationRequest): Promise<void> {
    if (!this.preferences.get().moderation) return;

    const { data: verdict } = await this.troupe.run(
      'moderator',
      { text: request.text, context: request.context, language: request.language },
      {
        purpose: 'product',
        ...(request.projectId === undefined ? {} : { projectId: request.projectId }),
      },
    );
    if (verdict.allowed) return;

    throw domainError(422, 'content_rejected', {
      details: {
        moderation: {
          ...(verdict.category === undefined ? {} : { category: verdict.category }),
          reason: verdict.reason,
          ...(verdict.suggestion === undefined ? {} : { suggestion: verdict.suggestion }),
        },
      },
    });
  }
}
