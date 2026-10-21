import path from 'node:path';

import { ROLE_INPUT_EXAMPLES, type InstructionsManifest } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { SEED_CONFIG_DIR } from '../config/seed.fixtures.js';
import { renderSections } from './render.js';
import { FileInstructionsSource, resolveInstructions, type InstructionsSource } from './resolve.js';

const seedSource = new FileInstructionsSource(path.join(SEED_CONFIG_DIR, 'ai', 'instructions'));

/** Una sorgente finta, per provare scelte e varianti senza inventare file nel seme. */
function fakeSource(
  manifest: InstructionsManifest,
  files: Record<string, string>,
): InstructionsSource {
  return {
    manifest: () => Promise.resolve(manifest),
    file: (_id, file) => {
      const raw = files[file];
      if (raw === undefined) throw new Error(`file inatteso: ${file}`);
      return Promise.resolve(raw);
    },
  };
}

function instructionFile(options: {
  version: number;
  variant?: string;
  mode?: string;
  system: string;
}): string {
  const variantLine = options.variant === undefined ? '' : `variant: ${options.variant}\n`;
  const modeLine = options.mode === undefined ? '' : `mode: ${options.mode}\n`;
  return `---
id: moderator
version: ${String(options.version)}
${variantLine}${modeLine}description: Prova.
variables: [text, context, language]
changelog: ["${String(options.version)} (2026-10-21): prova"]
---

## system
${options.system}

## user
Testo: {{ text }}
`;
}

describe('resolveInstructions sul seme', () => {
  it('prende la versione citata dal ruolo', async () => {
    const resolved = await resolveInstructions(seedSource, {
      fallbackId: 'moderator',
      releaseRef: 'moderator@1',
    });

    expect(resolved).toMatchObject({ id: 'moderator', version: 1 });
    expect(resolved.variant).toBeUndefined();
    expect(resolved.sections.system).toContain('moderatore');
    expect(resolved.variables).toContain('text');
  });

  it('senza riferimenti segue la consigliata del manifesto (§4.4)', async () => {
    const resolved = await resolveInstructions(seedSource, { fallbackId: 'casting' });
    expect(resolved.version).toBe(1);
  });

  it("applica la variante della famiglia e la rende con l'input di esempio", async () => {
    const resolved = await resolveInstructions(seedSource, {
      fallbackId: 'cinematographer',
      releaseRef: 'cinematographer@1',
      family: 'image_generic',
    });

    expect(resolved.variant).toBe('image_generic');
    const rendered = await renderSections(resolved.sections, ROLE_INPUT_EXAMPLES.cinematographer);
    // La variante parla dell'ultimo fotogramma: nel sistema composto c'è sia la base sia l'aggiunta.
    expect(rendered.system).toContain('direttore della fotografia');
    expect(rendered.system?.length).toBeGreaterThan(0);
  });

  it('una famiglia senza variante usa la base, senza lamentarsi (§4.8)', async () => {
    const resolved = await resolveInstructions(seedSource, {
      fallbackId: 'cinematographer',
      releaseRef: 'cinematographer@1',
      family: 'kling',
    });

    expect(resolved.variant).toBeUndefined();
  });

  it("dice quando la versione non c'è", async () => {
    await expect(
      resolveInstructions(seedSource, { fallbackId: 'moderator', releaseRef: 'moderator@7' }),
    ).rejects.toMatchObject({ code: 'instructions_version_missing' });
  });

  it('dice quando il riferimento è scritto male', async () => {
    await expect(
      resolveInstructions(seedSource, { fallbackId: 'moderator', releaseRef: 'moderator' }),
    ).rejects.toMatchObject({ code: 'instructions_ref_invalid' });
  });
});

describe('scelta della versione e varianti', () => {
  const manifest: InstructionsManifest = {
    id: 'moderator',
    recommended: 2,
    versions: [
      { version: 1, file: 'v1.md' },
      {
        version: 2,
        file: 'v2.md',
        variants: [
          { family: 'append_family', file: 'v2.append.md', mode: 'append' },
          { family: 'replace_family', file: 'v2.replace.md', mode: 'replace' },
        ],
      },
    ],
  };

  const files = {
    'v1.md': instructionFile({ version: 1, system: 'Prima versione.' }),
    'v2.md': instructionFile({ version: 2, system: 'Seconda versione.' }),
    'v2.append.md': instructionFile({
      version: 2,
      variant: 'append_family',
      mode: 'append',
      system: 'Regola in più.',
    }),
    'v2.replace.md': instructionFile({
      version: 2,
      variant: 'replace_family',
      mode: 'replace',
      system: 'Testo tutto nuovo.',
    }),
  };

  const source = fakeSource(manifest, files);

  it("la scelta dell'utente vince sulla release (D38)", async () => {
    const resolved = await resolveInstructions(source, {
      fallbackId: 'moderator',
      releaseRef: 'moderator@2',
      userRef: 'moderator@1',
    });

    expect(resolved.version).toBe(1);
    expect(resolved.sections.system).toContain('Prima versione');
  });

  it("senza scelta dell'utente vale la release", async () => {
    const resolved = await resolveInstructions(source, {
      fallbackId: 'moderator',
      releaseRef: 'moderator@1',
    });

    expect(resolved.version).toBe(1);
  });

  it('`append` attacca alla base', async () => {
    const resolved = await resolveInstructions(source, {
      fallbackId: 'moderator',
      family: 'append_family',
    });

    expect(resolved.sections.system).toContain('Seconda versione');
    expect(resolved.sections.system).toContain('Regola in più');
  });

  it('`replace` prende il posto della base', async () => {
    const resolved = await resolveInstructions(source, {
      fallbackId: 'moderator',
      family: 'replace_family',
    });

    expect(resolved.sections.system).toContain('Testo tutto nuovo');
    expect(resolved.sections.system).not.toContain('Seconda versione');
  });
});
