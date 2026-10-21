#!/usr/bin/env node
// L'avvio sta qui e non in main.ts, così importare i comandi in un test non li esegue.
import process from 'node:process';

import { main } from './main.js';

process.exitCode = await main(process.argv.slice(2));
