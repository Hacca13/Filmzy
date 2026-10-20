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
import { parse as parseYaml } from 'yaml';
import type { z } from 'zod';

import type { ConfigIssue } from './issues.js';

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

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
