import type { SecretCipher } from '@filmzy/api/desktop';

/** La parte di `safeStorage` di Electron che serve: così si prova senza Electron. */
export interface SystemKeychain {
  isEncryptionAvailable: () => boolean;
  encryptString: (plain: string) => Buffer;
  decryptString: (data: Buffer) => string;
}

/**
 * Le chiavi dei fornitori cifrate dal portachiavi del sistema (D45): su Windows con l'account dell'utente,
 * su macOS col Portachiavi, su Linux col portachiavi della sessione. Il file cifrato sta nella cartella dei
 * dati; senza l'account dell'utente non si legge.
 */
export function keychainCipher(keychain: SystemKeychain): SecretCipher {
  return {
    isAvailable: () => keychain.isEncryptionAvailable(),
    encrypt: (plain) => keychain.encryptString(plain),
    decrypt: (data) => keychain.decryptString(data),
  };
}
