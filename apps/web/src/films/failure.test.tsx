import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FailureActions } from './FailureActions';
import { COST_NOTE, failureOf, failureText } from './failure';
import type { Generation } from './generation';

/** Una «generazione» di mestiere: basta per vedere cosa si offre, senza server. */
const generation = {
  options: { state: { status: 'ready', data: { options: [] } }, reload: () => undefined },
  choices: [{ modelId: 'servizio-a', label: 'Servizio A', estimatedCostUsd: 0.2, isDefault: true }],
  chosen: { modelId: 'servizio-a', label: 'Servizio A', estimatedCostUsd: 0.2, isDefault: true },
  created: {},
  setModelId: () => undefined,
  busy: false,
  run: () => undefined,
} as unknown as Generation<unknown>;

const render = (code: string | undefined, busy = false) =>
  renderToStaticMarkup(<FailureActions code={code} generation={generation} busy={busy} />);

describe('failureOf', () => {
  it('un rifiuto del contenuto non offre nessuna scelta che lo aggiri: né «Riprova» né un altro servizio (D36)', () => {
    for (const code of ['content_rejected', 'image_rejected']) {
      const failure = failureOf(code);

      expect(failure.actions).toEqual([]);
      expect(failure.advice).toContain('non si prova con un altro servizio');
    }
  });

  it('gli errori tecnici si possono riprovare, anche con un altro servizio', () => {
    for (const code of ['provider_unavailable', 'timeout', 'rate_limited', 'invalid_output']) {
      expect(failureOf(code).actions.map((action) => action.kind)).toEqual([
        'retry',
        'change_service',
      ]);
    }
  });

  it('chiave, fondi e limite di spesa portano alle impostazioni dove si risolvono, con un altro servizio accanto', () => {
    const labels = (code: string) =>
      failureOf(code).actions.map((action) =>
        action.kind === 'link' ? action.label : action.kind,
      );

    expect(labels('provider_auth_failed')).toEqual(['Sostituisci la chiave', 'change_service']);
    expect(labels('secret_missing')).toEqual(['Inserisci la chiave', 'change_service']);
    expect(labels('provider_quota_exhausted')).toEqual(['Apri il fornitore', 'change_service']);
    expect(labels('spend_cap_reached')).toEqual(['Alza il limite', 'change_service']);
  });

  it('un codice che non conosciamo si tratta da errore tecnico, mai con una schermata vuota', () => {
    expect(failureOf('codice_inventato')).toEqual(failureOf(undefined));
    expect(failureOf(undefined).actions.map((action) => action.kind)).toEqual([
      'retry',
      'change_service',
    ]);
    expect(failureOf(undefined).advice).toContain('Puoi riprovare');
  });

  it('nessun nome di codice finisce all’utente, e le frasi sono quelle del disegno', () => {
    expect(failureText('provider_unavailable')).toBe(
      'Il servizio non risponde · Riprova più tardi o cambia servizio',
    );
    expect(failureText('provider_quota_exhausted')).toBe(
      'I fondi presso il fornitore sono finiti · Ricarica il conto o cambia servizio',
    );
    expect(failureText('provider_auth_failed')).toBe(
      'La chiave non è valida · Sostituisci la chiave',
    );
    expect(failureText('spend_cap_reached')).toBe(
      'Hai raggiunto il limite di spesa · Alza il limite o prosegui',
    );
    for (const code of ['content_rejected', 'timeout', 'secret_missing', 'invalid_output']) {
      expect(failureText(code)).not.toMatch(/[a-z]+_[a-z_]+/);
    }
  });

  it('la nota sui costi c’è solo quando il servizio può aver già iniziato il lavoro', () => {
    expect(failureOf('timeout').mayHaveCost).toBe(true);
    expect(failureOf('provider_unavailable').mayHaveCost).toBe(true);
    expect(failureOf('provider_auth_failed').mayHaveCost).toBe(false);
    expect(failureOf('content_rejected').mayHaveCost).toBe(false);
  });
});

describe('FailureActions', () => {
  it('dopo un rifiuto non c’è niente da premere: né «Riprova» né «Cambia servizio»', () => {
    const html = render('content_rejected');

    expect(html).toBe('');
  });

  it('dopo un errore tecnico ci sono «Riprova» e «Cambia servizio», e la nota sui costi', () => {
    const html = render('provider_unavailable');

    expect(html).toContain('Riprova');
    expect(html).toContain('Cambia servizio');
    expect(html).toContain(COST_NOTE.replace("'", '&#x27;'));
  });

  it('con la chiave sbagliata c’è il collegamento alle connessioni, e niente «Riprova»', () => {
    const html = render('provider_auth_failed');

    expect(html).toContain('href="#/impostazioni/connessioni"');
    expect(html).toContain('Sostituisci la chiave');
    expect(html).not.toContain('>Riprova<');
    expect(html).not.toContain(COST_NOTE);
  });

  it('con il limite di spesa il collegamento porta a «Spese e tetti»', () => {
    expect(render('spend_cap_reached')).toContain('href="#/impostazioni/spese"');
  });

  it('mentre qualcosa lavora «Riprova» è spento: non si apre un secondo tentativo', () => {
    expect(render('timeout', true)).toMatch(/<button[^>]*disabled[^>]*>Riprova/);
  });
});
