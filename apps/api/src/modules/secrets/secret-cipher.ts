/**
 * Chi cifra e decifra le chiavi dei fornitori. In Electron sarà `safeStorage`, cioè il portachiavi
 * del sistema (D45); qui c'è solo l'interfaccia, così il resto del server non sa chi lo fa.
 */
export interface SecretCipher {
  /** Falso quando il sistema non offre un portachiavi: le chiavi non si possono salvare. */
  isAvailable: () => boolean;
  encrypt: (plain: string) => Buffer;
  decrypt: (data: Buffer) => string;
}

/**
 * Il cifrario di quando non c'è Electron (sviluppo, test, riga di comando): non salva niente. Una
 * chiave in un file senza cifratura basterebbe aprire la cartella per leggerla (D45), quindi
 * piuttosto non si scrive: in sviluppo valgono le variabili d'ambiente (`env:NOME`).
 */
export const unavailableCipher: SecretCipher = {
  isAvailable: () => false,
  encrypt: () => {
    throw new Error('Il portachiavi del sistema non è disponibile.');
  },
  decrypt: () => {
    throw new Error('Il portachiavi del sistema non è disponibile.');
  },
};
