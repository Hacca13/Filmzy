import {
  DEFAULT_APP_PREFERENCES,
  domainErrorSchema,
  type GenerationContext,
  type ModeratorInput,
  type ModeratorOutput,
} from '@filmzy/contracts';
import { ProviderError, type Troupe } from '@filmzy/troupe';
import { HttpException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ModerationService } from './moderation.service.js';

interface Call {
  role: string;
  input: ModeratorInput;
  ctx: GenerationContext;
}

/** Una troupe finta che risponde col verdetto dato e ricorda come l'hanno chiamata. */
function setup(options: { verdict?: ModeratorOutput; error?: Error; moderation?: boolean } = {}) {
  const calls: Call[] = [];
  const troupe = {
    run: (role: string, input: ModeratorInput, ctx: GenerationContext) => {
      calls.push({ role, input, ctx });
      if (options.error !== undefined) return Promise.reject(options.error);
      return Promise.resolve({ data: options.verdict ?? { allowed: true, reason: 'ok' } });
    },
  } as unknown as Pick<Troupe, 'run'>;
  const preferences = {
    get: () => ({ ...DEFAULT_APP_PREFERENCES, moderation: options.moderation ?? true }),
  };
  return { calls, service: new ModerationService(troupe, preferences) };
}

const request = { text: 'Una donna ritrova un amico', context: 'idea', language: 'it' } as const;

async function rejection(promise: Promise<unknown>): Promise<HttpException> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HttpException) return error;
    throw error;
  }
  throw new Error('doveva essere respinto');
}

describe('ModerationService', () => {
  it('un testo che si può usare passa, e il moderatore è chiamato come ruolo, per il film', async () => {
    const { calls, service } = setup();

    await service.assertAllowed({ ...request, projectId: 'film-1' });

    expect(calls).toEqual([
      {
        role: 'moderator',
        input: { text: request.text, context: 'idea', language: 'it' },
        ctx: { purpose: 'product', projectId: 'film-1' },
      },
    ]);
  });

  it('un testo respinto dà «contenuto rifiutato» col motivo, il suggerimento e nient’altro', async () => {
    const { service } = setup({
      verdict: {
        allowed: false,
        category: 'real_person',
        reason: 'Il testo nomina una persona famosa.',
        suggestion: 'Inventa un personaggio che le somigli.',
      },
    });

    const error = await rejection(service.assertAllowed(request));

    expect(error.getStatus()).toBe(422);
    expect(domainErrorSchema.parse(error.getResponse())).toEqual({
      code: 'content_rejected',
      retryable: false,
      details: {
        moderation: {
          category: 'real_person',
          reason: 'Il testo nomina una persona famosa.',
          suggestion: 'Inventa un personaggio che le somigli.',
        },
      },
    });
  });

  it('senza suggerimento né categoria resta solo il motivo', async () => {
    const { service } = setup({ verdict: { allowed: false, reason: 'Contenuto non ammesso.' } });

    const error = await rejection(service.assertAllowed(request));

    expect(domainErrorSchema.parse(error.getResponse()).details?.moderation).toEqual({
      reason: 'Contenuto non ammesso.',
    });
  });

  it('con la prudenza spenta non chiama nessuno e il testo passa', async () => {
    const { calls, service } = setup({
      moderation: false,
      verdict: { allowed: false, reason: 'non si deve nemmeno chiedere' },
    });

    await expect(service.assertAllowed(request)).resolves.toBeUndefined();
    expect(calls).toHaveLength(0);
  });

  it('se il moderatore non riesce a rispondere il testo non passa: nessun «per questa volta va bene»', async () => {
    const failure = new ProviderError('secret_missing', false, 'manca la chiave', {
      role: 'moderator',
    });
    const { service } = setup({ error: failure });

    await expect(service.assertAllowed(request)).rejects.toBe(failure);
  });
});
