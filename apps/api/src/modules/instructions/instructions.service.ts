import {
  ROLE_INPUT_EXAMPLES,
  USER_INSTRUCTION_VERSION_BASE,
  type ConfigIssue,
  type CreateInstructionVersionResponse,
  type InstructionText,
  type InstructionVersionInfo,
  type InstructionsOverview,
  type PreviewInstructionsResponse,
  type RoleInstructions,
  type RoleSettings,
  type TroupeConfigData,
  type UserSettings,
} from '@filmzy/contracts';
import type { TroupeStore } from '@filmzy/db';
import {
  checkInstructionText,
  parseInstructionFile,
  parseInstructionsRef,
  type InstructionsSource,
} from '@filmzy/troupe';
import { Inject, Injectable } from '@nestjs/common';

import { domainError } from '../../http/domain-error.js';
import { TROUPE_STORE } from '../troupe/tokens.js';
import { UserSettingsService } from '../troupe/user-settings.service.js';
import { isUserFile } from './db-instructions-source.js';
import { INSTRUCTIONS_SOURCE } from './tokens.js';

type ManifestEntry = Awaited<ReturnType<InstructionsSource['manifest']>>['versions'][number];

/**
 * Le istruzioni per le impostazioni (T2.4, D38): le versioni di ogni ruolo, il controllo di un
 * testo, la creazione di una versione nuova (che **non tocca le altre**: una versione pubblicata
 * non si modifica, §4.4) e la scelta di quale usare.
 */
@Injectable()
export class InstructionsService {
  constructor(
    @Inject(TROUPE_STORE) private readonly store: TroupeStore,
    @Inject(INSTRUCTIONS_SOURCE) private readonly source: InstructionsSource,
    private readonly userSettings: UserSettingsService,
  ) {}

  async overview(): Promise<InstructionsOverview> {
    const config = this.activeConfig();
    const roles = await Promise.all(
      Object.entries(config.roles).flatMap(([roleId, role]) =>
        role?.instructions === undefined ? [] : [this.roleInstructions(config, roleId)],
      ),
    );
    return { roles };
  }

  async versionText(roleId: string, version: number): Promise<InstructionText> {
    const { instructionsId } = this.roleOf(this.activeConfig(), roleId);
    const entry = await this.entryOf(instructionsId, version);

    return {
      version,
      text: await this.source.file(instructionsId, entry.file),
      variants: await Promise.all(
        (entry.variants ?? []).map(async (variant) => ({
          family: variant.family,
          mode: variant.mode,
          text: await this.source.file(instructionsId, variant.file),
        })),
      ),
    };
  }

  async preview(roleId: string, text: string): Promise<PreviewInstructionsResponse> {
    this.roleOf(this.activeConfig(), roleId);
    const { issues, rendered } = await checkInstructionText(text, {
      roleId,
      example: ROLE_INPUT_EXAMPLES[roleId as keyof typeof ROLE_INPUT_EXAMPLES],
    });
    return { issues, ...(rendered === undefined ? {} : { rendered }) };
  }

  async createVersion(
    roleId: string,
    text: string,
    basedOn?: number,
  ): Promise<CreateInstructionVersionResponse> {
    const { instructionsId } = this.roleOf(this.activeConfig(), roleId);
    const { issues } = await this.preview(roleId, text);
    if (issues.length > 0) return { issues };

    // Le varianti della versione di partenza si copiano come sono; si leggono prima di scrivere
    // qualsiasi cosa, così una versione di partenza che non c'è non lascia niente a metà.
    let variants: { family: string; text: string }[] = [];
    if (basedOn !== undefined) {
      const start = await this.versionText(roleId, basedOn).catch(() => undefined);
      if (start === undefined) return { issues: [missingVersion(roleId, basedOn)] };
      variants = start.variants;
    }

    const version = this.nextUserVersion(instructionsId);
    const createdAt = new Date().toISOString();
    for (const entry of [{ family: undefined, text }, ...variants]) {
      this.store.addInstructionVersion({
        instructionsId,
        version,
        ...(entry.family === undefined ? {} : { family: entry.family }),
        origin: 'user',
        body: withVersion(entry.text, version),
        createdAt,
      });
    }

    const created = await this.entryOf(instructionsId, version);
    return { version: await this.describe(instructionsId, created), issues: [] };
  }

  /** `null` toglie la scelta: si torna alla versione della release o alla consigliata. */
  async choose(roleId: string, version: number | null): Promise<RoleInstructions> {
    const config = this.activeConfig();
    const { instructionsId } = this.roleOf(config, roleId);
    if (version !== null) await this.entryOf(instructionsId, version);

    this.userSettings.update(config, (settings) =>
      withInstructionsChoice(
        settings,
        roleId as RoleKey,
        version === null ? undefined : `${instructionsId}@${String(version)}`,
      ),
    );
    return this.roleInstructions(config, roleId);
  }

  private activeConfig(): TroupeConfigData {
    const { release } = this.store.activeRelease();
    if (release === undefined) throw domainError(404, 'not_found');
    return release.config;
  }

  /** Il ruolo che ha istruzioni: da lui si ricava l'id delle istruzioni. Altrimenti 404. */
  private roleOf(config: TroupeConfigData, roleId: string) {
    const role = config.roles[roleId];
    if (role?.instructions === undefined) throw domainError(404, 'not_found');
    return { role, instructionsId: parseInstructionsRef(role.instructions).id };
  }

  private async entryOf(instructionsId: string, version: number): Promise<ManifestEntry> {
    const manifest = await this.source.manifest(instructionsId);
    const entry = manifest.versions.find((candidate) => candidate.version === version);
    if (entry === undefined) throw domainError(404, 'not_found', { details: { field: 'version' } });
    return entry;
  }

  private async roleInstructions(
    config: TroupeConfigData,
    roleId: string,
  ): Promise<RoleInstructions> {
    const { role, instructionsId } = this.roleOf(config, roleId);
    const manifest = await this.source.manifest(instructionsId);
    const chosen = this.store.getSettings().settings?.roleSettings[roleId as RoleKey]?.instructions;
    // Stessa precedenza di `resolveInstructions`: scelta dell'utente, release, consigliata.
    const pinned = chosen ?? role.instructions;
    const inUse =
      pinned === undefined ? manifest.recommended : parseInstructionsRef(pinned).version;

    return {
      roleId,
      instructionsId,
      label: role.label,
      recommended: manifest.recommended,
      ...(chosen === undefined ? {} : { chosen }),
      inUse,
      availableVariables: Object.keys(
        (ROLE_INPUT_EXAMPLES[roleId as keyof typeof ROLE_INPUT_EXAMPLES] as object | undefined) ??
          {},
      ),
      versions: await Promise.all(
        manifest.versions.map((entry) => this.describe(instructionsId, entry)),
      ),
    };
  }

  /** Nome, descrizione e registro dei cambiamenti di una versione, dalla sua intestazione. */
  private async describe(
    instructionsId: string,
    entry: ManifestEntry,
  ): Promise<InstructionVersionInfo> {
    const isUser = isUserFile(entry.file);
    const header = parseInstructionFile(await this.source.file(instructionsId, entry.file))
      .instruction?.header;
    const row = isUser
      ? this.store.getInstructionVersion(instructionsId, entry.version)
      : undefined;

    return {
      version: entry.version,
      origin: isUser ? 'user' : 'bundled',
      label: isUser
        ? `Le mie istruzioni ${String(entry.version - USER_INSTRUCTION_VERSION_BASE)}`
        : `Versione ${String(entry.version)}`,
      description: header?.description ?? '',
      changelog: header?.changelog ?? [],
      variables: header?.variables ?? [],
      variants: (entry.variants ?? []).map((variant) => variant.family),
      ...(row === undefined ? {} : { createdAt: row.createdAt }),
    };
  }

  private nextUserVersion(instructionsId: string): number {
    const mine = this.store
      .listInstructionVersions(instructionsId)
      .filter((row) => row.origin === 'user')
      .map((row) => row.version);
    return Math.max(USER_INSTRUCTION_VERSION_BASE, ...mine) + 1;
  }
}

type RoleKey = keyof UserSettings['roleSettings'];

/**
 * Le scelte con la versione di istruzioni di un ruolo cambiata (o tolta). Se al ruolo non resta
 * nessuna regolazione, la sua voce sparisce: niente righe vuote in `roleSettings`.
 */
function withInstructionsChoice(
  settings: UserSettings,
  roleId: RoleKey,
  ref: string | undefined,
): UserSettings {
  const { [roleId]: current, ...others } = settings.roleSettings;
  const role: RoleSettings = { ...current };
  if (ref === undefined) delete role.instructions;
  else role.instructions = ref;

  return {
    ...settings,
    roleSettings: Object.keys(role).length === 0 ? others : { ...others, [roleId]: role },
  };
}

/** Il numero di versione lo dà il programma: nel testo si riscrive, così il file combacia. */
function withVersion(text: string, version: number): string {
  return text.replace(
    /^(---\r?\n(?:[^\r\n]*\r?\n)*?)version:[^\r\n]*/,
    `$1version: ${String(version)}`,
  );
}

function missingVersion(roleId: string, version: number): ConfigIssue {
  return {
    severity: 'error',
    code: 'instructions_version_missing',
    message: `La versione ${String(version)} da cui partire non c'è.`,
    section: 'instructions',
    role: roleId,
    key: roleId,
    field: 'basedOn',
  };
}
