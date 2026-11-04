import type { ScriptCheckIssue, ScriptCheckView } from '@filmzy/contracts';
import { describe, expect, it } from 'vitest';

import { checkSummary, issuePlace } from './ScriptCheckSection';

const issue = (patch: Partial<ScriptCheckIssue> = {}): ScriptCheckIssue => ({
  id: 'i1',
  code: 'plot',
  light: false,
  reason: 'Qualcosa non torna.',
  key: 'llm:i1',
  ignored: false,
  ...patch,
});

describe('issuePlace', () => {
  it('dice la scena e l’inquadratura, numerate da 1; per il film intero non dice niente', () => {
    expect(issuePlace(issue({ sceneNumber: 2, shotNumber: 1 }))).toBe('Scena 2 · Inquadratura 1');
    expect(issuePlace(issue({ sceneNumber: 3 }))).toBe('Scena 3');
    expect(issuePlace(issue())).toBe('');
  });
});

describe('checkSummary', () => {
  const view = (state: ScriptCheckView['state'], issues: ScriptCheckIssue[]): ScriptCheckView => ({
    state,
    issues,
  });

  it('tutto torna, una cosa, tante cose; con solo dubbi leggeri il tono è calmo', () => {
    expect(checkSummary(view('current', []))).toEqual({ tone: 'confirmed', text: 'Tutto torna' });
    expect(checkSummary(view('current', [issue()]))).toEqual({
      tone: 'warning',
      text: 'Una cosa da guardare',
    });
    expect(checkSummary(view('current', [issue(), issue({ light: true })]))).toEqual({
      tone: 'warning',
      text: '2 cose da guardare',
    });
    expect(checkSummary(view('current', [issue({ light: true })])).tone).toBe('info');
  });

  it('le segnalazioni ignorate non contano; se lo sono tutte lo dice (T5.3)', () => {
    expect(checkSummary(view('current', [issue(), issue({ ignored: true })])).text).toBe(
      'Una cosa da guardare',
    );
    expect(checkSummary(view('current', [issue({ ignored: true })]))).toEqual({
      tone: 'info',
      text: 'Segnalazioni ignorate',
    });
  });

  it('un controllo vecchio dice di rifarlo, anche se non aveva trovato niente', () => {
    expect(checkSummary(view('outdated', [])).text).toBe('Da rifare: la storia è cambiata');
    expect(checkSummary(view('outdated', [issue()])).tone).toBe('info');
  });
});
