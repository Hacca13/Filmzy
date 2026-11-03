import { MediaError } from '@filmzy/media';

import { domainError } from '../../http/domain-error.js';

/**
 * Un passo di ffmpeg: se non riesce l'errore diventa un errore del dominio (`media_failed`) con un
 * messaggio semplice per l'interfaccia. Il testo di ffmpeg non arriva all'utente: potrebbe contenere
 * percorsi.
 */
export async function mediaStep<T>(step: () => Promise<T>): Promise<T> {
  try {
    return await step();
  } catch (error) {
    if (error instanceof MediaError) {
      throw domainError(error.code === 'ffmpeg_missing' ? 503 : 422, 'media_failed', {
        // Un file rovinato resta tale; un ffmpeg troppo lento, invece, può riuscire la volta dopo.
        retryable: error.code === 'timeout',
      });
    }
    throw error;
  }
}
