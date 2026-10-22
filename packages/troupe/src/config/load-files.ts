import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  benchPlanSchema,
  cameraMovementsFileSchema,
  characterTagsFileSchema,
  cinematographyFileSchema,
  connectionsFileSchema,
  featuresFileSchema,
  genresFileSchema,
  modelsFileSchema,
  rolesConfigFileSchema,
  stylesFileSchema,
  type BenchPlan,
  type CameraMovement,
  type CharacterTag,
  type CinematographyPreset,
  type Connection,
  type Features,
  type Genre,
  type Limits,
  type ModelEntry,
  type RoleConfigEntry,
  type StylePreset,
  type Tone,
} from '@filmzy/contracts';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { z } from 'zod';

import { messageOf, type ConfigIssue } from './issues.js';

/** I preset come li leggono i ruoli: in camelCase, convertiti dalla forma dei file (§5.3). */
export interface TroupePresets {
  styles: StylePreset[];
  cinematography: CinematographyPreset[];
  cameraMovements: CameraMovement[];
  characterTags: CharacterTag[];
  genres: Genre[];
  tones: Tone[];
}

/** La configurazione della troupe: il contenuto di una release, o dei file di seme (§4.3). */
export interface TroupeConfig {
  connections: Record<string, Connection>;
  models: Record<string, ModelEntry>;
  roles: Partial<Record<string, RoleConfigEntry>>;
  features: Features;
  limits: Limits;
  presets: TroupePresets;
}

export interface LoadFilesResult {
  /** Assente se un file non si è potuto leggere: i problemi lo spiegano. */
  config?: TroupeConfig;
  issues: ConfigIssue[];
}

/** I file del seme, relativi alla cartella `config/`. */
const FILES = {
  connections: 'ai/connections.yaml',
  models: 'ai/models.yaml',
  roles: 'ai/roles.yaml',
  features: 'features.yaml',
  styles: 'presets/styles.yaml',
  cinematography: 'presets/cinematography.yaml',
  cameraMovements: 'presets/camera_movements.yaml',
  characterTags: 'presets/character_tags.yaml',
  genres: 'presets/genres.yaml',
} as const;

/**
 * Legge e valida un file YAML con il suo schema. Non lancia: un file illeggibile o fuori schema
 * diventa un problema, così `pnpm troupe check` li elenca tutti insieme invece di fermarsi al
 * primo.
 */
export function parseConfigFile<Schema extends z.ZodType>(
  schema: Schema,
  file: string,
  raw: string,
  section: ConfigIssue['section'],
): { data?: z.output<Schema>; issues: ConfigIssue[] } {
  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (error) {
    return {
      issues: [
        {
          severity: 'error',
          code: 'yaml_invalid',
          message: `${file}: il file non è YAML valido (${messageOf(error)}).`,
          file,
          section,
        },
      ],
    };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      issues: result.error.issues.map((issue) => ({
        severity: 'error' as const,
        code: 'schema_invalid',
        message: `${file}: ${issue.path.length > 0 ? issue.path.join('.') : '(radice)'} — ${issue.message}.`,
        file,
        section,
        field: issue.path.length > 0 ? issue.path.join('.') : undefined,
        key: typeof issue.path[1] === 'string' ? issue.path[1] : undefined,
      })),
    };
  }

  return { data: result.data, issues: [] };
}

/** Legge i file di seme della cartella `config/` indicata (architettura §4.5). */
export async function loadConfigFiles(configDir: string): Promise<LoadFilesResult> {
  const issues: ConfigIssue[] = [];

  const read = async <Schema extends z.ZodType>(
    schema: Schema,
    file: string,
    section: ConfigIssue['section'],
  ): Promise<z.output<Schema> | undefined> => {
    const filePath = path.join(configDir, file);
    let raw: string;
    try {
      raw = await readFile(filePath, 'utf8');
    } catch (error) {
      issues.push({
        severity: 'error',
        code: 'file_unreadable',
        message: `${file}: non si riesce a leggere il file (${messageOf(error)}).`,
        file,
        section,
      });
      return undefined;
    }
    const parsed = parseConfigFile(schema, file, raw, section);
    issues.push(...parsed.issues);
    return parsed.data;
  };

  const [connections, models, roles, features, styles, cinematography, movements, tags, genres] =
    await Promise.all([
      read(connectionsFileSchema, FILES.connections, 'connections'),
      read(modelsFileSchema, FILES.models, 'models'),
      read(rolesConfigFileSchema, FILES.roles, 'roles'),
      read(featuresFileSchema, FILES.features, 'features'),
      read(stylesFileSchema, FILES.styles, 'presets'),
      read(cinematographyFileSchema, FILES.cinematography, 'presets'),
      read(cameraMovementsFileSchema, FILES.cameraMovements, 'presets'),
      read(characterTagsFileSchema, FILES.characterTags, 'presets'),
      read(genresFileSchema, FILES.genres, 'presets'),
    ]);

  if (
    connections === undefined ||
    models === undefined ||
    roles === undefined ||
    features === undefined ||
    styles === undefined ||
    cinematography === undefined ||
    movements === undefined ||
    tags === undefined ||
    genres === undefined
  ) {
    return { issues };
  }

  return {
    config: {
      connections: connections.connections,
      models: models.models,
      roles: roles.roles,
      features: features.features,
      limits: features.limits,
      presets: {
        styles: styles.styles,
        cinematography: cinematography.cinematography,
        // I file usano snake_case, le istruzioni camelCase (§5.3): la conversione sta qui.
        cameraMovements: movements.camera_movements.map(({ end_frame_hint, ...rest }) => ({
          ...rest,
          endFrameHint: end_frame_hint,
        })),
        characterTags: tags.character_tags,
        genres: genres.genres,
        tones: genres.tones,
      },
    },
    issues,
  };
}

/**
 * L'inverso di `loadConfigFiles`: dalla configurazione ai file del seme, già in YAML
 * (`pnpm troupe export`, architettura §4.5). Serve a tenere in git una copia leggibile e
 * confrontabile della release attiva, e a rileggerla con `import`.
 *
 * Il formato dei file è roba della troupe, quindi la conversione sta qui: chi scrive i file (la
 * riga di comando dell'app, che ha il database) riceve solo testo da salvare.
 */
export function configToYamlFiles(config: TroupeConfig): { file: string; text: string }[] {
  // I file usano snake_case, le istruzioni camelCase (§5.3): qui si torna indietro.
  const movements = config.presets.cameraMovements.map(({ endFrameHint, ...rest }) => ({
    ...rest,
    end_frame_hint: endFrameHint,
  }));

  const documents: { file: string; content: Record<string, unknown> }[] = [
    { file: FILES.connections, content: { version: 1, connections: config.connections } },
    { file: FILES.models, content: { version: 1, models: config.models } },
    { file: FILES.roles, content: { version: 1, roles: config.roles } },
    {
      file: FILES.features,
      content: { version: 1, features: config.features, limits: config.limits },
    },
    { file: FILES.styles, content: { version: 1, styles: config.presets.styles } },
    {
      file: FILES.cinematography,
      content: { version: 1, cinematography: config.presets.cinematography },
    },
    { file: FILES.cameraMovements, content: { version: 1, camera_movements: movements } },
    { file: FILES.characterTags, content: { version: 1, character_tags: config.presets.characterTags } },
    {
      file: FILES.genres,
      content: { version: 1, genres: config.presets.genres, tones: config.presets.tones },
    },
  ];

  return documents.map(({ file, content }) => ({
    file,
    // `lineWidth: 0`: niente righe spezzate a metà, così un prompt lungo resta su una riga sola e
    // il confronto in git è leggibile.
    text: stringifyYaml(content, { lineWidth: 0 }),
  }));
}

/** Legge un piano di bench (`config/bench/*.yaml`, architettura §4.13). */
export async function loadBenchPlan(
  planPath: string,
): Promise<{ plan?: BenchPlan; issues: ConfigIssue[] }> {
  let raw: string;
  try {
    raw = await readFile(planPath, 'utf8');
  } catch (error) {
    return {
      issues: [
        {
          severity: 'error',
          code: 'file_unreadable',
          message: `${planPath}: non si riesce a leggere il piano (${messageOf(error)}).`,
          file: planPath,
          section: 'bench',
        },
      ],
    };
  }
  const parsed = parseConfigFile(benchPlanSchema, planPath, raw, 'bench');
  return { plan: parsed.data, issues: parsed.issues };
}
