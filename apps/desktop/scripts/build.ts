// Prepara il programma da impacchettare (T6.4). In `dist/app` la finestra e il server in un file solo, con
// l'interfaccia compilata; in `dist/resources` quello che non sta in un file JavaScript: la configurazione,
// le migrazioni, il modulo nativo di SQLite, ffmpeg e il font dei titoli. L'impacchettamento vero lo fa
// electron-builder (`pnpm pacchetto`), che mette `resources` accanto al programma.
import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { build, type Plugin } from 'esbuild';

const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(desktop, '..', '..');
const out = path.join(desktop, 'dist');
const appDir = path.join(out, 'app');
const resources = path.join(out, 'resources');

/** Si risolve come lo fanno i pacchetti che li usano: così le versioni sono quelle del monorepo. */
const fromMedia = createRequire(path.join(repo, 'packages', 'media', 'package.json'));
const fromDb = createRequire(path.join(repo, 'packages', 'db', 'package.json'));

/**
 * I pacchetti che Nest carica solo se ci sono (microservizi, websocket, validazione): Filmzy non li usa, e
 * nel file unico restano fuori. Nest se ne accorge da solo e va avanti.
 */
const NEST_OPTIONAL = [
  '@nestjs/microservices',
  '@nestjs/microservices/*',
  '@nestjs/websockets',
  '@nestjs/websockets/*',
  'class-transformer',
  'class-transformer/*',
  'class-validator',
];

/**
 * Nel file unico le variabili dei moduli CommonJS non esistono: si ricreano. I percorsi relativi a questo
 * file non servono, perché il programma passa i suoi in modo esplicito (configurazione, migrazioni, SQLite).
 */
const BANNER = [
  "import { createRequire as __filmzyRequire } from 'node:module';",
  "import { fileURLToPath as __filmzyPath } from 'node:url';",
  'const require = __filmzyRequire(import.meta.url);',
  'const __filename = __filmzyPath(import.meta.url);',
  "const __dirname = __filmzyPath(new URL('.', import.meta.url));",
].join('\n');

/** ffmpeg arriva fra le risorse e lo si indica con `FILMZY_FFMPEG`: il pacchetto che lo cerca non serve. */
const ffmpegInstallerStub: Plugin = {
  name: 'ffmpeg-installer-stub',
  setup(builder) {
    builder.onResolve({ filter: /^@ffmpeg-installer\/ffmpeg$/ }, () => ({
      path: 'ffmpeg-installer',
      namespace: 'filmzy-stub',
    }));
    builder.onLoad({ filter: /.*/, namespace: 'filmzy-stub' }, () => ({
      contents: "export default { path: '', version: '', url: '' };",
      loader: 'js',
    }));
  },
};

async function bundle(): Promise<void> {
  await build({
    entryPoints: [path.join(desktop, 'src', 'main.ts')],
    outfile: path.join(appDir, 'main.mjs'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node24',
    external: ['electron', ...NEST_OPTIONAL],
    plugins: [ffmpegInstallerStub],
    banner: { js: BANNER },
    // Gli errori nel registro dicono il file e la riga veri, non quelli del file unico.
    sourcemap: 'linked',
    // Le licenze dei pacchetti dentro il file unico restano in un file a parte (AGPL e le loro).
    legalComments: 'linked',
    // Nest legge i tipi dei costruttori: i nomi delle classi devono restare quelli.
    keepNames: true,
    logLevel: 'warning',
  });
}

async function appManifest(): Promise<void> {
  const own = JSON.parse(await readFile(path.join(desktop, 'package.json'), 'utf8')) as {
    version: string;
    description: string;
    license: string;
  };
  const manifest = {
    name: 'filmzy',
    productName: 'Filmzy',
    version: own.version,
    description: own.description,
    license: own.license,
    author: 'Hacca13',
    homepage: 'https://github.com/Hacca13/Filmzy',
    type: 'module',
    main: 'main.mjs',
  };
  await writeFile(path.join(appDir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function copyResources(): Promise<void> {
  const platformTarget = `${process.platform}-${process.arch}`;
  const sqlitePackage = path.dirname(fromDb.resolve('better-sqlite3/package.json'));
  const ffmpeg = (fromMedia('@ffmpeg-installer/ffmpeg') as { path: string }).path;
  await Promise.all([
    cp(path.join(repo, 'apps', 'web', 'dist'), path.join(appDir, 'web'), { recursive: true }),
    cp(path.join(repo, 'config'), path.join(resources, 'config'), { recursive: true }),
    cp(path.join(repo, 'packages', 'db', 'migrations'), path.join(resources, 'migrations'), {
      recursive: true,
    }),
    copyInto(
      path.join(sqlitePackage, 'prebuilds', `${platformTarget}.node`),
      path.join(resources, 'sqlite', 'better_sqlite3.node'),
    ),
    copyInto(ffmpeg, path.join(resources, 'ffmpeg', path.basename(ffmpeg))),
    copyInto(
      fromMedia.resolve('dejavu-fonts-ttf/ttf/DejaVuSans.ttf'),
      path.join(resources, 'fonts', 'DejaVuSans.ttf'),
    ),
    copyInto(path.join(repo, 'LICENSE'), path.join(resources, 'LICENSE.txt')),
  ]);
}

async function copyInto(from: string, to: string): Promise<void> {
  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
}

await rm(out, { recursive: true, force: true });
await bundle();
await Promise.all([appManifest(), copyResources()]);
console.log(`Programma pronto in ${path.relative(repo, out)}.`);
