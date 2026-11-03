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

  describe('il moodboard nelle istruzioni (T4.10, D37)', () => {
    const brief = {
      palette: [{ hex: '#c2813a', name: 'Ambra' }, { hex: '#2b3a55' }],
      notes: 'Luce calda e bassa, ritmo lento.',
      referenceDescriptions: ['a quiet station at dusk'],
      scene: { palette: [], notes: 'Qui è notte fonda.' },
    };

    const renderCinematographer = async (moodboard: unknown) => {
      const resolved = await resolveInstructions(seedSource, {
        fallbackId: 'cinematographer',
        releaseRef: 'cinematographer@1',
        family: 'image_generic',
      });
      const input = { ...(ROLE_INPUT_EXAMPLES.cinematographer as object), moodboard };
      return renderSections(resolved.sections, input);
    };

    it('il direttore della fotografia riceve colori e consigli del film e della scena', async () => {
      const rendered = await renderCinematographer(brief);

      expect(rendered.system).toContain('#c2813a, #2b3a55');
      expect(rendered.system).toContain('Luce calda e bassa, ritmo lento.');
      expect(rendered.system).toContain('Per questa scena: Qui è notte fonda.');
    });

    it('senza moodboard il prompt è quello di prima: niente di nuovo, niente righe vuote in più', async () => {
      const without = await renderCinematographer(null);
      const withBrief = await renderCinematographer(brief);

      expect(without.system).not.toContain('moodboard');
      expect(without.system).not.toContain('Atmosfera del film');
      expect(withBrief.system?.length).toBeGreaterThan(without.system?.length ?? 0);
    });

    it('un moodboard di soli consigli, o di sola palette, non rompe niente', async () => {
      const onlyNotes = await renderCinematographer({
        palette: [],
        notes: 'Solo parole.',
        referenceDescriptions: [],
        scene: null,
      });
      const onlyPalette = await renderCinematographer({
        palette: [{ hex: '#111111' }],
        notes: '',
        referenceDescriptions: [],
        scene: null,
      });

      expect(onlyNotes.system).toContain('Solo parole.');
      expect(onlyNotes.system).not.toContain('colori #');
      expect(onlyPalette.system).toContain('colori #111111');
    });

    it('l’aiuto regista, lo scenografo e il character designer lo leggono', async () => {
      const planner = await resolveInstructions(seedSource, {
        fallbackId: 'shot_planner',
        releaseRef: 'shot_planner@1',
      });
      const plannerInput = {
        ...(ROLE_INPUT_EXAMPLES.shot_planner as object),
        moodboard: brief,
      };
      expect((await renderSections(planner.sections, plannerInput)).user).toContain(
        "Atmosfera voluta dall'utente (moodboard): Luce calda e bassa, ritmo lento.",
      );

      for (const role of ['set_designer', 'character_designer'] as const) {
        const resolved = await resolveInstructions(seedSource, {
          fallbackId: role,
          releaseRef: `${role}@1`,
        });
        const input = { ...(ROLE_INPUT_EXAMPLES[role] as object), moodboard: brief };
        const withBrief = await renderSections(resolved.sections, input);
        const without = await renderSections(resolved.sections, { ...input, moodboard: null });

        expect(withBrief.prompt, role).toContain('Colour palette: #c2813a, #2b3a55.');
        expect(without.prompt, role).not.toContain('Colour palette');
      }
    });
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
