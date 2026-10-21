import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { validateInstructions } from './instructions.js';
import type { TroupeConfig } from './load-files.js';
import { loadSeedConfig, roleOf, SEED_CONFIG_DIR } from './seed.fixtures.js';

const INSTRUCTIONS_DIR = path.join(SEED_CONFIG_DIR, 'ai', 'instructions');

let seed: TroupeConfig;

beforeAll(async () => {
  seed = await loadSeedConfig();
});

describe('validateInstructions sulle istruzioni del seme', () => {
  it('non trova problemi: ogni ruolo rende le sue istruzioni con l\'input di esempio', async () => {
    const issues = await validateInstructions(seed, INSTRUCTIONS_DIR);
    expect(issues).toEqual([]);
  });

  it('dice quando un ruolo cita una versione che il manifesto non ha', async () => {
    const config: TroupeConfig = {
      ...seed,
      roles: { ...seed.roles, moderator: { ...roleOf(seed, 'moderator'), instructions: 'moderator@7' } },
    };
    const issues = await validateInstructions(config, INSTRUCTIONS_DIR);

    expect(issues[0]?.code).toBe('instructions_version_missing');
    expect(issues[0]?.role).toBe('moderator');
  });

  it('dice quando le istruzioni non esistono affatto', async () => {
    const config: TroupeConfig = {
      ...seed,
      roles: {
        ...seed.roles,
        moderator: { ...roleOf(seed, 'moderator'), instructions: 'moderatore@1' },
      },
    };
    const issues = await validateInstructions(config, INSTRUCTIONS_DIR);

    expect(issues[0]?.code).toBe('instructions_manifest_missing');
  });

  it('una variabile inesistente nel template è un errore, con ruolo e variabile', async () => {
    const examples = { moderator: { text: 'ciao', context: 'idea', language: 'it' } };
    const config: TroupeConfig = { ...seed, roles: { moderator: roleOf(seed, 'moderator') } };

    // L'esempio è quello giusto: nessun problema.
    expect(await validateInstructions(config, INSTRUCTIONS_DIR, { examples })).toEqual([]);

    // Togliendo una variabile che il template usa, il rendering rigoroso lo dice.
    const incomplete = { moderator: { context: 'idea', language: 'it' } };
    const issues = await validateInstructions(config, INSTRUCTIONS_DIR, { examples: incomplete });

    expect(issues.map((issue) => issue.code)).toContain('instruction_variable_unknown');
    expect(issues.some((issue) => issue.code === 'instruction_render_failed')).toBe(true);
    expect(issues[0]?.message).toContain('text');
  });

  it('senza input di esempio non si può provare il rendering', async () => {
    const config: TroupeConfig = { ...seed, roles: { moderator: roleOf(seed, 'moderator') } };
    const issues = await validateInstructions(config, INSTRUCTIONS_DIR, { examples: {} });

    expect(issues.map((issue) => issue.code)).toContain('instruction_example_missing');
  });

  it('prova anche le varianti per famiglia del direttore della fotografia', async () => {
    const config: TroupeConfig = {
      ...seed,
      roles: { cinematographer: roleOf(seed, 'cinematographer') },
    };
    // v1.md, v1.image_generic.md (che usa movement.endFrameHint) e v1.seedance.md.
    expect(await validateInstructions(config, INSTRUCTIONS_DIR)).toEqual([]);
  });
});
