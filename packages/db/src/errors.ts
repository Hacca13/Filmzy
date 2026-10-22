import type { DomainErrorCode } from '@filmzy/contracts';

/**
 * Un errore del database, con il suo codice del dominio (architettura §4.10): l'interfaccia deve
 * poter dire *cosa* è andato storto all'avvio — un database di una versione più nuova non è la
 * stessa cosa di una migrazione fallita — e cosa fare. Mai un'eccezione grezza in faccia all'utente.
 */
export class DatabaseError extends Error {
  constructor(
    readonly code: Extract<
      DomainErrorCode,
      'database_too_new' | 'migration_failed' | 'config_invalid'
    >,
    message: string,
    readonly details?: { file?: string; backupFile?: string; found?: number; expected?: number },
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'DatabaseError';
  }
}
