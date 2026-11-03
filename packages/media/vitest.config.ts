import { defineConfig } from 'vitest/config';

/** I test lanciano ffmpeg per davvero (poche decine di fotogrammi): su Windows in CI serve più tempo. */
export default defineConfig({
  test: {
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
