import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MoodboardPanel } from './MoodboardPanel';

describe('MoodboardPanel', () => {
  it('mentre legge dice «Un attimo…»: non resta mai vuoto', () => {
    expect(renderToStaticMarkup(<MoodboardPanel filmId="film-1" />)).toContain('Un attimo');
  });
});
