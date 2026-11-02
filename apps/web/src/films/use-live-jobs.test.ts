import { describe, expect, it } from 'vitest';

import type { LiveEvent } from '../api/events';
import { matchesFilter } from './use-live-jobs';

const job = (extra: Partial<Extract<LiveEvent, { type: 'job.changed' }>> = {}): LiveEvent => ({
  type: 'job.changed',
  jobId: 'j-1',
  kind: 'take_generate',
  status: 'done',
  projectId: 'film-1',
  subjectId: 'shot-1',
  ...extra,
});

describe('matchesFilter', () => {
  it('interessa un lavoro del tipo giusto', () => {
    expect(matchesFilter(job(), { kinds: ['take_generate'] })).toBe(true);
    expect(matchesFilter(job(), { kinds: ['storyboard_images', 'take_generate'] })).toBe(true);
    expect(matchesFilter(job(), { kinds: ['location_images'] })).toBe(false);
    expect(matchesFilter(job(), { kinds: [] })).toBe(false);
  });

  it('se si chiede un film o un oggetto, gli altri non interessano', () => {
    const filter = { kinds: ['take_generate'], projectId: 'film-1', subjectId: 'shot-1' };

    expect(matchesFilter(job(), filter)).toBe(true);
    expect(matchesFilter(job({ projectId: 'film-2' }), filter)).toBe(false);
    expect(matchesFilter(job({ subjectId: 'shot-2' }), filter)).toBe(false);
    expect(matchesFilter(job({ subjectId: undefined }), filter)).toBe(false);
  });

  it('una riconnessione interessa sempre: può essere cambiato qualsiasi cosa', () => {
    expect(
      matchesFilter({ type: 'reconnected' }, { kinds: ['take_generate'], projectId: 'x' }),
    ).toBe(true);
  });
});
