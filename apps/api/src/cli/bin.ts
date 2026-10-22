#!/usr/bin/env node
// L'avvio sta qui e non in main.ts, così importare la CLI in un test non la esegue.
import { main } from './main.js';

process.exitCode = await main(process.argv.slice(2));
