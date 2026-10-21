import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  SHOT_SPEC_SCHEMA_VERSION,
  type BenchPlan,
  type CinematographerInput,
  type CinematographerOutput,
  type ContinuityState,
  type GenerationReceipt,
} from '@filmzy/contracts';
import {
  createMediaRunner,
  createTroupe,
  FileConfigSource,
  FileInstructionsSource,
  LocalAssetStore,
  loadBenchPlan,
  mediaCostUsd,
  MemoryReceiptSink,
  renderSections,
  resolveInstructions,
  type ConfigEnvironment,
  type MediaInput,
  type StoredAsset,
  type TroupeConfig,
} from '@filmzy/troupe';
import { z } from 'zod';

import { writeReport } from './report.js';

/**
 * La prova dei modelli di immagini e video (architettura §4.13): per ogni inquadratura del piano,
 * per ogni servizio, per ogni take, si genera e si salva tutto in `bench-output/<run>/` con gli
 * scontrini. Poi un report HTML li mostra **alla cieca**, per votarli senza sapere chi li ha fatti.
 *
 * Con `TROUPE_ENV=offline` rispondono i fornitori finti: zero rete, zero costi. È così che si prova
 * che la macchina funziona prima di spendere davvero (T4.0).
 */

/**
 * Com'è andato un lavoro: è lo stesso per un take e per un'immagine di scheda, quindi lo scrivono
 * una volta sola. Gli schemi stanno qui, e non in `packages/contracts`, perché `take.json` e
 * `schede.json` esistono solo tra `bench run` e `bench score`: ma uno schema ci vuole, perché quei
 * file si rileggono dal disco (regola d'oro 3).
 */
const mediaOutcomeFields = {
  state: z.enum(['succeeded', 'failed']),
  /** Dove sta il file salvato, relativo alla cartella della prova. */
  file: z.string().min(1).optional(),
  errorCode: z.string().min(1).optional(),
  costUsd: z.number().nonnegative().optional(),
  seconds: z.number().nonnegative().optional(),
};

/** Un take generato: un'inquadratura, un servizio, un tentativo. */
export const benchTakeSchema = z.strictObject({
  id: z.string().min(1),
  shotId: z.string().min(1),
  modelId: z.string().min(1),
  modelLabel: z.string().min(1),
  take: z.number().int().positive(),
  ...mediaOutcomeFields,
});

export type BenchTake = z.infer<typeof benchTakeSchema>;

/** Un'immagine della scheda di un personaggio: si guardano tutte e si tiene la migliore. */
export const benchSheetImageSchema = z.strictObject({
  characterId: z.string().min(1),
  angle: z.string().min(1),
  attempt: z.number().int().positive(),
  ...mediaOutcomeFields,
});

export type BenchSheetImage = z.infer<typeof benchSheetImageSchema>;

/** Solo l'esito, senza sapere di chi è: è quello che si incolla in un take o in una scheda. */
type MediaOutcome = Omit<BenchTake, 'id' | 'shotId' | 'modelId' | 'modelLabel' | 'take'>;

export interface BenchRunResult {
  dir: string;
  sheets: BenchSheetImage[];
  takes: BenchTake[];
  receipts: GenerationReceipt[];
  estimatedCostUsd: number;
}

export interface BenchRunOptions {
  planPath: string;
  configDir: string;
  environment?: ConfigEnvironment;
  outputDir: string;
  /** Per i test: una data fissa, così la cartella della prova è prevedibile. */
  now?: () => Date;
  /** Quanto si aspetta tra due richieste di stato al fornitore (un secondo, se non si dice). */
  pollIntervalMs?: number;
  /**
   * L'ultima parola prima di spendere: riceve la stima e decide se partire. Senza, si parte
   * subito (è così col fornitore finto, che non costa niente).
   */
  confirm?: (estimateUsd: number) => Promise<boolean>;
}

export async function runBench(options: BenchRunOptions): Promise<BenchRunResult> {
  const { plan, issues } = await loadBenchPlan(options.planPath);
  if (plan === undefined) {
    throw new Error(
      `Il piano non si è letto:\n${issues.map((issue) => `  • ${issue.message}`).join('\n')}`,
    );
  }

  const configSource = new FileConfigSource(options.configDir, options.environment);
  const loaded = await configSource.load();
  if (loaded.config === undefined) {
    throw new Error(
      `La configurazione non si è letta:\n${loaded.issues.map((issue) => `  • ${issue.message}`).join('\n')}`,
    );
  }

  // Il budget si controlla prima di mandare qualsiasi cosa: una matrice sbagliata può costare
  // molto più del previsto, e dopo la prima chiamata è troppo tardi (§4.13). Finché non si parte
  // non si crea nemmeno la cartella della prova.
  const estimatedCostUsd = estimatePlan(plan, loaded.config);
  if (estimatedCostUsd > plan.budget_usd) {
    throw new Error(
      `La prova costerebbe circa ${estimatedCostUsd.toFixed(2)} $, più del budget del piano ` +
        `(${plan.budget_usd.toFixed(2)} $). Riduci take, inquadrature o modelli, oppure alza il budget.`,
    );
  }

  if (options.confirm !== undefined && !(await options.confirm(estimatedCostUsd))) {
    throw new Error('Prova annullata: non è stato mandato nessun lavoro.');
  }

  const now = options.now ?? (() => new Date());
  const dir = path.join(options.outputDir, runName(plan, now()));
  await mkdir(dir, { recursive: true });

  const receipts = new MemoryReceiptSink();
  const assets = new LocalAssetStore(path.join(dir, 'file'));
  const instructions = new FileInstructionsSource(
    path.join(options.configDir, 'ai', 'instructions'),
  );
  const troupe = createTroupe({ configSource, instructions, receiptSink: receipts });
  const media = createMediaRunner({ configSource, assets, receiptSink: receipts });

  const pollIntervalMs = options.pollIntervalMs ?? 1000;
  const { references, images } = await buildSheets({
    plan,
    loaded: loaded.config,
    instructions,
    media,
    dir,
    pollIntervalMs,
  });
  const takes: BenchTake[] = [];

  for (const shot of plan.shots) {
    const shotReferences: MediaInput[] = shot.characters
      .map((characterId) => references.get(characterId))
      .filter((file): file is MediaInput => file !== undefined);

    // Il prompt dipende dall'inquadratura e dalla famiglia, non dal singolo servizio: due servizi
    // della stessa famiglia riusano lo stesso, così non si paga due volte la stessa scrittura.
    const prompts = new Map<string, CinematographerOutput>();

    for (const modelId of plan.models) {
      const model = loaded.config.models[modelId];
      if (model === undefined) {
        takes.push({
          id: takeId(shot.id, modelId, 1),
          shotId: shot.id,
          modelId,
          modelLabel: modelId,
          take: 1,
          state: 'failed',
          errorCode: 'config_invalid',
        });
        continue;
      }

      // Il prompt lo scrive il direttore della fotografia, con la variante della famiglia (§4.7).
      const family = model.family ?? '';
      let visual = prompts.get(family);
      if (visual === undefined) {
        const written = await troupe.run(
          'cinematographer',
          cinematographerInput({ plan, shot, loaded: loaded.config, family }),
          { purpose: 'bench' },
        );
        visual = written.data;
        prompts.set(family, visual);
      }

      for (let take = 1; take <= plan.takes_per_shot; take += 1) {
        const { outcome } = await runJob({
          media,
          dir,
          pollIntervalMs,
          role: 'camera_operator',
          modelId,
          request: {
            role: 'camera_operator',
            prompt: visual.prompt,
            ...(visual.negativePrompt === undefined
              ? {}
              : { negativePrompt: visual.negativePrompt }),
            inputs: shotReferences,
            characterIds: shot.characters,
            durationS: plan.duration_s,
            params: {},
            idempotencyKey: `${plan.name}:${shot.id}:${modelId}:${String(take)}`,
          },
        });

        takes.push({
          id: takeId(shot.id, modelId, take),
          shotId: shot.id,
          modelId,
          modelLabel: model.label,
          take,
          ...outcome,
        });
      }
    }
  }

  await Promise.all([
    writeFile(
      path.join(dir, 'scontrini.json'),
      `${JSON.stringify(receipts.all(), null, 2)}\n`,
      'utf8',
    ),
    writeFile(path.join(dir, 'take.json'), `${JSON.stringify(takes, null, 2)}\n`, 'utf8'),
    writeFile(path.join(dir, 'schede.json'), `${JSON.stringify(images, null, 2)}\n`, 'utf8'),
    writeReport({ dir, plan, takes }),
  ]);

  return { dir, sheets: images, takes, receipts: receipts.all(), estimatedCostUsd };
}

interface SheetsInput {
  plan: BenchPlan;
  loaded: TroupeConfig;
  instructions: FileInstructionsSource;
  media: ReturnType<typeof createMediaRunner>;
  dir: string;
  pollIntervalMs: number;
}

interface SheetsResult {
  /** L'immagine che fa da riferimento alle inquadrature, per personaggio. */
  references: Map<string, MediaInput>;
  images: BenchSheetImage[];
}

/**
 * Le schede dei personaggi: tutte le angolazioni e tutti i tentativi del piano, salvati nella
 * cartella della prova perché la scelta della migliore si fa guardandole (§4.13). Come riferimento
 * per le inquadrature il bench prende la prima riuscita: scegliere a mano quale usare è un passo
 * dell'interfaccia, e arriva in T4.0.
 */
async function buildSheets(input: SheetsInput): Promise<SheetsResult> {
  const references = new Map<string, MediaInput>();
  const images: BenchSheetImage[] = [];
  const style = input.loaded.presets.styles.find((preset) => preset.id === input.plan.style);
  if (style === undefined) {
    throw new Error(`Lo stile "${input.plan.style}" del piano non è fra i preset.`);
  }

  for (const character of input.plan.characters) {
    for (const angle of input.plan.sheet.angles) {
      const prompt = await imagePrompt(input.instructions, 'character_designer', {
        character: { appearance: { prompt: character.brief }, name: character.name },
        style,
        angle,
        moodboard: null,
      });

      for (let attempt = 1; attempt <= input.plan.sheet.attempts_per_angle; attempt += 1) {
        const { outcome, asset } = await runJob({
          media: input.media,
          dir: input.dir,
          pollIntervalMs: input.pollIntervalMs,
          role: 'character_designer',
          modelId: input.plan.sheet.model,
          request: {
            role: 'character_designer',
            prompt,
            inputs: [],
            characterIds: [],
            params: {},
            idempotencyKey: `${input.plan.name}:sheet:${character.id}:${angle}:${String(attempt)}`,
          },
        });
        images.push({ characterId: character.id, angle, attempt, ...outcome });

        if (asset !== undefined && !references.has(character.id)) {
          references.set(character.id, {
            use: 'reference',
            file: {
              fileName: path.basename(asset.path),
              contentType: asset.contentType,
              bytes: new Uint8Array(await readFile(asset.path)),
            },
          });
        }
      }
    }
  }

  return { references, images };
}

/**
 * La stima della prova, dai prezzi del catalogo: schede (a immagine) più take (a secondo). Serve
 * al controllo del budget, quindi è volutamente prudente: un prezzo che non si sa vale zero e il
 * piano non si blocca, ma lo scontrino di ogni chiamata dirà poi il costo vero (§4.11).
 */
export function estimatePlan(plan: BenchPlan, config: TroupeConfig): number {
  const sheetModel = config.models[plan.sheet.model];
  const sheetImages =
    plan.characters.length * plan.sheet.angles.length * plan.sheet.attempts_per_angle;
  const sheets =
    sheetModel === undefined ? 0 : (mediaCostUsd(sheetModel.pricing, { images: sheetImages }) ?? 0);

  const takes = plan.models.reduce((total, modelId) => {
    const model = config.models[modelId];
    if (model === undefined) return total;
    const one = mediaCostUsd(model.pricing, { seconds: plan.duration_s }) ?? 0;
    return total + one * plan.shots.length * plan.takes_per_shot;
  }, 0);

  return sheets + takes;
}

interface JobInput {
  media: ReturnType<typeof createMediaRunner>;
  dir: string;
  pollIntervalMs: number;
  role: 'camera_operator' | 'character_designer';
  /** Il servizio scelto per questo lavoro: nel bench è sempre esplicito (D36). */
  modelId: string;
  request: Parameters<ReturnType<typeof createMediaRunner>['submit']>[1];
}

interface JobResult {
  outcome: MediaOutcome;
  /** Il file salvato, quando c'è: serve come riferimento visivo alle inquadrature. */
  asset?: StoredAsset;
}

/**
 * Manda un lavoro, aspetta che finisca e racconta com'è andato. Un take e un'immagine di scheda
 * qui sono la stessa cosa: cambiano solo il ruolo e la richiesta. Un errore non ferma la prova —
 * si segna e si va avanti, perché una matrice a metà non si rifà da capo per un servizio che ha
 * fatto le bizze.
 */
async function runJob(input: JobInput): Promise<JobResult> {
  try {
    const job = await input.media.submit(input.role, input.request, {
      purpose: 'bench',
      modelId: input.modelId,
    });
    const collected = await collect(input.media, job.receiptId, input.pollIntervalMs);
    const asset = collected.assets?.[0];

    if (collected.state !== 'succeeded' || asset === undefined) {
      return {
        outcome: {
          state: 'failed',
          ...(collected.receipt.errorCode === undefined
            ? {}
            : { errorCode: collected.receipt.errorCode }),
        },
      };
    }

    return {
      outcome: {
        state: 'succeeded',
        file: path.relative(input.dir, asset.path).replaceAll('\\', '/'),
        ...(collected.receipt.actualCostUsd === undefined
          ? {}
          : { costUsd: collected.receipt.actualCostUsd }),
        ...(collected.receipt.usage?.seconds === undefined
          ? {}
          : { seconds: collected.receipt.usage.seconds }),
      },
      asset,
    };
  } catch (error) {
    return {
      outcome: {
        state: 'failed',
        errorCode:
          error instanceof Error && 'code' in error ? String(error.code) : 'provider_unavailable',
      },
    };
  }
}

/** Il polling: qui è un ciclo semplice, nell'app è la coda salvata in SQLite (§7). */
async function collect(
  media: ReturnType<typeof createMediaRunner>,
  receiptId: string,
  intervalMs: number,
): Promise<Awaited<ReturnType<ReturnType<typeof createMediaRunner>['collect']>>> {
  for (let attempt = 0; attempt < 600; attempt += 1) {
    const collected = await media.collect(receiptId);
    if (collected.state === 'succeeded' || collected.state === 'failed') return collected;
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 0 : intervalMs));
  }
  throw new Error(`Il lavoro "${receiptId}" non è finito in tempo.`);
}

/** Il prompt di un ruolo immagine: è un template, non un LLM (§4.4). */
async function imagePrompt(
  instructions: FileInstructionsSource,
  role: string,
  input: unknown,
): Promise<string> {
  const resolved = await resolveInstructions(instructions, { fallbackId: role });
  const rendered = await renderSections(resolved.sections, input);
  const prompt = rendered.prompt ?? '';
  if (prompt === '') throw new Error(`Le istruzioni di "${role}" non hanno prodotto un prompt.`);
  return prompt;
}

interface CinematographerInputArgs {
  plan: BenchPlan;
  shot: BenchPlan['shots'][number];
  loaded: TroupeConfig;
  family: string;
}

function cinematographerInput(input: CinematographerInputArgs): CinematographerInput {
  const { plan, shot, loaded } = input;
  const style = loaded.presets.styles.find((preset) => preset.id === plan.style);
  const cinematography = loaded.presets.cinematography.find(
    (preset) => preset.id === plan.cinematography,
  );
  const movement = loaded.presets.cameraMovements[0];
  if (style === undefined || cinematography === undefined || movement === undefined) {
    throw new Error('Il piano cita preset che non esistono.');
  }

  return {
    shot: {
      schema: SHOT_SPEC_SCHEMA_VERSION,
      id: shot.id,
      sceneId: 'bench',
      order: 0,
      intent: {
        action: shot.action,
        emotion: 'neutra',
        framing: shot.framing,
        cameraMovement: movement.id,
        lighting: shot.lighting ?? cinematography.lighting,
        durationS: plan.duration_s,
      },
      characters: shot.characters.map((characterId) => ({
        characterId,
        costume: 'come nella scheda',
        references: [],
      })),
      location: { locationId: 'bench', references: [] },
      images: [],
      dialogue: [],
      cinematography: 'inherit',
      continuity: {
        entry: continuityOf(shot.characters),
        exit: continuityOf(shot.characters),
      },
    },
    characters: shot.characters.map((characterId) => ({
      id: characterId,
      name: plan.characters.find((character) => character.id === characterId)?.name ?? characterId,
      costume: 'come nella scheda',
    })),
    location: {
      id: 'bench',
      name: 'Set della prova',
      description: 'Ambiente neutro per la prova dei modelli',
      prompt: 'a neutral set for a model test',
      references: [],
    },
    style,
    cinematography: {
      camera: cinematography.camera,
      lighting: cinematography.lighting,
      lens: cinematography.lens,
      grade: cinematography.grade,
    },
    movement,
    target: {
      family: input.family,
      kind: 'video',
      maxPromptChars: 900,
      frame: 'clip',
      inputs: ['references'],
    },
  };
}

/** L'id di un take: inquadratura, servizio e numero del tentativo. Lo usano i voti del report. */
function takeId(shotId: string, modelId: string, take: number): string {
  return `${shotId}-${modelId}-${String(take)}`;
}

function continuityOf(characters: readonly string[]): ContinuityState {
  return {
    locationId: 'bench',
    timeOfDay: 'giorno',
    present: [...characters],
    costumes: Object.fromEntries(characters.map((id) => [id, 'come nella scheda'])),
    props: [],
  };
}

function runName(plan: BenchPlan, at: Date): string {
  const stamp = at.toISOString().replaceAll(/[:.]/g, '-');
  return `${stamp}-${plan.name}`;
}
