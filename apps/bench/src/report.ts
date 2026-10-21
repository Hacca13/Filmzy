import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { BenchPlan } from '@filmzy/contracts';

import type { BenchTake } from './run.js';

/**
 * Il report della prova (architettura §4.13): i take si guardano **alla cieca**, in ordine
 * mescolato e con un'etichetta anonima, e si votano sui criteri del piano. Il nome del servizio si
 * scopre solo dopo, con un pulsante: così il voto non è influenzato da chi lo ha fatto.
 *
 * È una pagina sola, da aprire col doppio clic: niente server, niente rete.
 */
export interface ReportInput {
  dir: string;
  plan: BenchPlan;
  takes: readonly BenchTake[];
}

export async function writeReport(input: ReportInput): Promise<string> {
  const file = path.join(input.dir, 'report.html');
  await writeFile(file, html(input), 'utf8');
  return file;
}

/** Mescola in modo ripetibile: la stessa prova dà sempre lo stesso ordine. */
function shuffled(takes: readonly BenchTake[]): BenchTake[] {
  return [...takes].sort((a, b) => (hash(a.id) < hash(b.id) ? -1 : 1));
}

/**
 * Nomi dei servizi, id delle inquadrature e nomi dei file arrivano dalla configurazione e dal
 * piano: file locali, ma finiscono in una pagina HTML, quindi si sfuggono sempre.
 */
function escaped(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function hash(value: string): string {
  let total = 0;
  for (const character of value) total = (total * 31 + character.charCodeAt(0)) % 1_000_003;
  return String(total).padStart(7, '0');
}

function html(input: ReportInput): string {
  const takes = shuffled(input.takes);
  const criteri = input.plan.voting.criteria;
  const [min, max] = input.plan.voting.scale;

  const schede = takes
    .map((take, index) => {
      const etichetta = `Take ${String.fromCharCode(65 + (index % 26))}${index >= 26 ? String(Math.floor(index / 26)) : ''}`;
      const media =
        take.file === undefined
          ? '<p class="errore">Non generato' +
            (take.errorCode === undefined ? '' : ` (${escaped(take.errorCode)})`) +
            '</p>'
          : `<video src="${escaped(take.file)}" controls loop muted playsinline></video>`;

      const voti = criteri
        .map(
          (criterio) =>
            `<label>${escaped(criterio)}<input type="number" min="${String(min)}" max="${String(max)}" data-take="${escaped(take.id)}" data-criterio="${escaped(criterio)}"></label>`,
        )
        .join('');

      return `<article>
  <h2>${etichetta}</h2>
  ${media}
  <div class="voti">${voti}</div>
  <p class="nome" hidden>${escaped(take.modelLabel)} · inquadratura ${escaped(take.shotId)} · take ${String(take.take)}</p>
</article>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prova dei modelli · ${escaped(input.plan.name)}</title>
<style>
  :root { color-scheme: light dark; --bordo: #8883; }
  body { font-family: system-ui, sans-serif; margin: 0 auto; padding: 24px 16px; max-width: 70rem; line-height: 1.5; }
  header p { max-width: 42rem; }
  main { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); }
  article { border: 1px solid var(--bordo); border-radius: 12px; padding: 12px; }
  h2 { font-size: 1rem; margin: 0 0 8px; }
  video { width: 100%; border-radius: 8px; background: #0002; }
  .voti { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  label { display: grid; font-size: .8rem; gap: 2px; }
  input { width: 4.5rem; padding: 4px; }
  .errore { color: #b00; font-size: .9rem; }
  .nome { font-size: .8rem; opacity: .75; margin: 8px 0 0; }
  .barra { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 24px; }
  button { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--bordo); background: transparent; font: inherit; cursor: pointer; }
  textarea { width: 100%; min-height: 8rem; margin-top: 12px; font-family: ui-monospace, monospace; }
</style>
</head>
<body>
<header>
  <h1>Prova dei modelli · ${escaped(input.plan.name)}</h1>
  <p>Guarda i take e dai un voto da ${String(min)} a ${String(max)} per ogni criterio. I nomi dei
  servizi sono nascosti di proposito: si scoprono solo dopo aver votato. Alla fine premi
  <strong>Prepara i voti</strong> e salva il testo in <code>voti.json</code> nella cartella della
  prova, poi lancia <code>pnpm bench score</code>.</p>
</header>
<div class="barra">
  <button id="prepara">Prepara i voti</button>
  <button id="scopri">Mostra i nomi dei servizi</button>
</div>
<main>
${schede}
</main>
<textarea id="uscita" hidden readonly></textarea>
<script>
  const campi = () => [...document.querySelectorAll('input[data-take]')];
  document.getElementById('scopri').addEventListener('click', () => {
    for (const nome of document.querySelectorAll('.nome')) nome.hidden = false;
  });
  document.getElementById('prepara').addEventListener('click', () => {
    const voti = {};
    for (const campo of campi()) {
      if (campo.value === '') continue;
      const take = campo.dataset.take;
      voti[take] = voti[take] ?? {};
      voti[take][campo.dataset.criterio] = Number(campo.value);
    }
    const uscita = document.getElementById('uscita');
    uscita.hidden = false;
    uscita.value = JSON.stringify({ votante: '', voti }, null, 2);
    uscita.select();
  });
</script>
</body>
</html>
`;
}
