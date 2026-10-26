import type { InstructionsManifest, InstructionVersion } from '@filmzy/contracts';
import type { TroupeStore } from '@filmzy/db';
import {
  InstructionResolveError,
  parseInstructionFile,
  type InstructionsSource,
} from '@filmzy/troupe';

/**
 * Le istruzioni come le vede la troupe in esercizio (architettura §4.4, D38): quelle che arrivano
 * col programma, lette dai file, **più** quelle scritte o caricate dall'utente, lette dalla
 * tabella `instruction_versions`. La troupe non conosce il database (§3): vede un'unica sorgente.
 *
 * Le versioni dell'utente hanno un nome di file inventato (`user-v101.md`, `user-v101.seedance.md`)
 * che esiste solo qui: serve a far passare dal manifesto un testo che sta nel database.
 */
const USER_FILE = /^user-v(\d+)(?:\.([a-z0-9_-]+))?\.md$/;

export function userFileName(version: number, family?: string): string {
  return family === undefined
    ? `user-v${String(version)}.md`
    : `user-v${String(version)}.${family}.md`;
}

export function isUserFile(file: string): boolean {
  return USER_FILE.test(file);
}

export class DbInstructionsSource implements InstructionsSource {
  constructor(
    private readonly bundled: InstructionsSource,
    private readonly store: TroupeStore,
  ) {}

  async manifest(id: string): Promise<InstructionsManifest> {
    const base = await this.bundled.manifest(id);
    const mine = groupByVersion(
      this.store.listInstructionVersions(id).filter((row) => row.origin === 'user'),
    );

    // Il consigliato resta quello del programma: chi non ha scelto non passa mai a un testo suo.
    return {
      ...base,
      versions: [
        ...base.versions,
        ...[...mine.entries()]
          .filter(([, rows]) => rows.some((row) => row.family === undefined))
          .sort(([a], [b]) => a - b)
          .map(([version, rows]) => ({
            version,
            file: userFileName(version),
            variants: rows.flatMap((row) =>
              row.family === undefined
                ? []
                : [
                    {
                      family: row.family,
                      file: userFileName(version, row.family),
                      mode: parseInstructionFile(row.body).instruction?.header.mode ?? 'append',
                    },
                  ],
            ),
          })),
      ],
    };
  }

  async file(id: string, file: string): Promise<string> {
    const match = USER_FILE.exec(file);
    if (match?.[1] === undefined) return this.bundled.file(id, file);

    const row = this.store.getInstructionVersion(id, Number(match[1]), match[2]);
    if (row?.origin !== 'user') {
      throw new InstructionResolveError(
        'instruction_file_missing',
        `il file di istruzioni "${id}/${file}" non esiste`,
        { id, file },
      );
    }
    return row.body;
  }
}

function groupByVersion(rows: InstructionVersion[]): Map<number, InstructionVersion[]> {
  const groups = new Map<number, InstructionVersion[]>();
  for (const row of rows) groups.set(row.version, [...(groups.get(row.version) ?? []), row]);
  return groups;
}
