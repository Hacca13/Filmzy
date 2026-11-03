import { describe, expect, it } from 'vitest';

import { ApiError } from '../api/client';
import { describeError, describeImageProblems } from './messages';

function httpError(serverCode: string): ApiError {
  return new ApiError('http_error', { status: 422, serverCode });
}

describe('describeError', () => {
  it('ogni codice che la prova può dare ha una frase semplice, senza il codice', () => {
    for (const code of [
      'config_invalid',
      'secret_missing',
      'provider_auth_failed',
      'provider_quota_exhausted',
      'provider_unavailable',
      'timeout',
      'rate_limited',
      'content_rejected',
      'invalid_output',
      'no_eligible_model',
      'spend_cap_reached',
      'media_failed',
    ]) {
      const message = describeError(httpError(code));

      expect(message, code).not.toContain(code);
      expect(message, code).not.toMatch(/prompt|modello|token|temperatura/i);
      expect(message, code).not.toBe(describeError(httpError('codice_inventato')));
    }
  });

  it('un rifiuto del contenuto non invita ad aggirarlo con un altro servizio (D36)', () => {
    expect(describeError(httpError('content_rejected'))).toContain('non si prova con un altro');
  });

  describe('il «no» del moderatore (T3.3)', () => {
    const rejected = (moderation: { reason: string; suggestion?: string }) =>
      new ApiError('http_error', {
        status: 422,
        serverCode: 'content_rejected',
        details: { moderation },
      });

    it('dice il motivo e il suggerimento così come li ha scritti il moderatore', () => {
      const message = describeError(
        rejected({
          reason: 'Il testo nomina una persona famosa.',
          suggestion: 'Inventa un personaggio che le somigli.',
        }),
      );

      expect(message).toBe(
        'Questo testo non si può usare. Il testo nomina una persona famosa. Suggerimento: Inventa un personaggio che le somigli.',
      );
    });

    it('senza suggerimento dice solo il motivo, senza un «Suggerimento:» vuoto', () => {
      const message = describeError(rejected({ reason: 'Contenuto non ammesso.' }));

      expect(message).toBe('Questo testo non si può usare. Contenuto non ammesso.');
    });

    it('un rifiuto senza motivo del moderatore (quello di un servizio) resta la frase di prima', () => {
      expect(describeError(httpError('content_rejected'))).toContain('non si prova con un altro');
    });
  });

  it('un server che non risponde dice di riaprire il programma', () => {
    expect(describeError(new ApiError('network_error'))).toContain('Chiudi il programma');
  });

  it("un errore che non conosce non mostra mai l'eccezione grezza", () => {
    expect(describeError(new Error('ECONNRESET sk-segreto'))).toBe(
      'Qualcosa è andato storto. Riprova tra un attimo.',
    );
    expect(describeError(httpError('codice_inventato'))).toBe(
      'Qualcosa è andato storto. Riprova tra un attimo.',
    );
  });
});

describe('il riepilogo cambiato nel frattempo (T3.8)', () => {
  it('se il server rifiuta le risposte, la frase dice che le differenze sono cambiate', () => {
    const stale = new ApiError('http_error', {
      status: 409,
      serverCode: 'invalid_request',
      details: { field: 'answers' },
    });

    expect(describeError(stale)).toContain('sono cambiate');
    expect(describeError(stale)).not.toBe(describeError(httpError('invalid_request')));
  });
});

describe('i film senza luoghi (T3.9)', () => {
  it('prima di pensare le inquadrature la frase dice di aggiungere un luogo', () => {
    const noLocations = new ApiError('http_error', {
      status: 409,
      serverCode: 'invalid_request',
      details: { field: 'locations' },
    });

    expect(describeError(noLocations)).toContain('almeno un luogo');
  });
});

describe('lo storyboard (T4.1)', () => {
  const refused = (field: string) =>
    new ApiError('http_error', {
      status: 409,
      serverCode: 'invalid_request',
      details: { field },
    });

  it('se il piano è cambiato la frase dice di rifare le inquadrature', () => {
    expect(describeError(refused('plan'))).toContain('Rifalle');
  });

  it('se un tentativo sta ancora lavorando la frase dice di aspettare', () => {
    expect(describeError(refused('storyboard'))).toContain('già in lavorazione');
  });
});

describe('le immagini dell’inquadratura (T4.2)', () => {
  const refused = (field: string) =>
    new ApiError('http_error', {
      status: 409,
      serverCode: 'invalid_request',
      details: { field },
    });

  it('ogni rifiuto dice cosa fare, senza parole tecniche', () => {
    expect(describeError(refused('firstFrame'))).toContain('primo fotogramma');
    expect(describeError(refused('images'))).toContain('un solo primo e un solo ultimo');
    expect(describeError(refused('assetId'))).toContain('non è tra quelle');
  });
});

describe('il video (T4.3)', () => {
  it('se un take sta ancora lavorando la frase dice di aspettare', () => {
    const refused = new ApiError('http_error', {
      status: 409,
      serverCode: 'invalid_request',
      details: { field: 'takes' },
    });

    expect(describeError(refused)).toContain('già in lavorazione');
  });
});

describe('rigenera e scegli (T4.6)', () => {
  const refused = (field: string) =>
    new ApiError('http_error', {
      status: 409,
      serverCode: 'invalid_request',
      details: { field },
    });

  it('un take che non c’è più o un momento oltre la fine dicono cosa fare', () => {
    expect(describeError(refused('takeId'))).toContain('non c’è più');
    expect(describeError(refused('atS'))).toContain('oltre la fine');
  });
});

describe('le foto caricate (T4.8)', () => {
  const rejected = (imageProblems?: string[]) =>
    new ApiError('http_error', {
      status: 422,
      serverCode: 'image_rejected',
      ...(imageProblems === undefined ? {} : { details: { imageProblems } as never }),
    });

  it('una foto con persone dice che i personaggi li crea Filmzy, e cosa caricare', () => {
    const text = describeError(rejected(['people']));

    expect(text).toContain('ci sono delle persone');
    expect(text).toContain('i personaggi li crea Filmzy');
    expect(text).toContain('un luogo o di un oggetto');
  });

  it('più motivi si elencano in una frase sola, con «e» prima dell’ultimo', () => {
    expect(describeImageProblems(['people', 'brand', 'minor'])).toContain(
      'ci sono delle persone (i personaggi li crea Filmzy: tu carichi luoghi e oggetti), si vede un marchio o un logo e c’è un minore.',
    );
    expect(describeImageProblems(['explicit'])).toContain('il contenuto non è adatto.');
    expect(describeImageProblems(['other'])).toContain('c’è qualcosa che non si può usare');
  });

  it('senza motivi la frase è lo stesso chiara', () => {
    expect(describeError(rejected())).toContain('Non posso usare questa foto');
    expect(describeError(rejected([]))).toContain('Non posso usare questa foto');
  });

  it('un file sbagliato, un luogo che non c’è o la funzione spenta hanno la loro frase', () => {
    const refused = (field: string) =>
      new ApiError('http_error', {
        status: 400,
        serverCode: 'invalid_request',
        details: { field },
      });

    expect(describeError(refused('file'))).toContain('PNG, JPEG o WebP');
    expect(describeError(refused('locationId'))).toContain('luogo');
    expect(describeError(refused('feature'))).toContain('spento');
  });

  it('il ritocco: la zona da dipingere, un’immagine che non si può ritoccare e una foto senza controllo', () => {
    const refused = (field: string) =>
      new ApiError('http_error', {
        status: 400,
        serverCode: 'invalid_request',
        details: { field },
      });

    expect(describeError(refused('mask'))).toContain('Dipingi');
    expect(describeError(refused('image'))).toContain('non si può ritoccare');
    expect(describeError(refused('unchecked'))).toContain('senza controllo');
    expect(describeError(refused('instruction'))).toContain('Controlla cosa hai scritto');
  });
});
