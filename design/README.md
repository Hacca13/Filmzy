# Filmzy — Design

Qui vivono i prompt dati a Figma e, quando arrivano, gli export dei mockup. Il design è un riferimento per l'interfaccia (`apps/web`); le regole del prodotto restano in `docs/`.

## Cartelle

| Cartella | Contenuto |
|---|---|
| `prompts/` | un file per ogni prompt dato a Figma, numerato nell'ordine in cui è stato dato |
| `riferimenti/` | export di Figma: PNG degli schermi a 2x, colori e font, logo in SVG. Una sottocartella per ogni prompt (per esempio `riferimenti/01-mockup-iniziale/`). Si crea quando arrivano i file |

## Registro dei prompt

Ogni prompt dato a Figma si aggiunge qui. Stati: `inviato`, `pronto da inviare`, `bozza` (da confermare), `da scrivere`.

| N. | File | Cosa chiede | Stato | Note |
|---|---|---|---|---|
| 01 | [`prompts/01-mockup-iniziale.md`](prompts/01-mockup-iniziale.md) | i 6 schermi base, lo stile (scuro, ambra), i componenti | inviato | Registrato il 20/10/2026, testo identico a quello dato. L'ordine dei passi è superato dal 02 |
| 02 | [`prompts/02-flusso-luoghi-ritocco.md`](prompts/02-flusso-luoghi-ritocco.md) | nuovo ordine dei passi, schermo Luoghi, ritocco col pennello, "Imposta le immagini" | pronto da inviare | Scritto il 20/10/2026 |
| 03 | [`prompts/03-bozza-riepilogo-personaggi.md`](prompts/03-bozza-riepilogo-personaggi.md) | bozza della storia, riepilogo con cast e luoghi, scheda personaggio con tag e dettagli facoltativi | pronto da inviare | Scritto il 20/10/2026. Si può incollare insieme al 02 in un solo invio, se i crediti di Figma scarseggiano: dove si contraddicono prevale il 03 |
| 04 | [`prompts/04-audio-e-connessioni.md`](prompts/04-audio-e-connessioni.md) | tracce audio nel montaggio (video, dialoghi, musica, effetti) e area Connessioni per fornitori, modelli e chiavi API | bozza | Scritto il 20/10/2026. Due domande aperte in fondo al file |

## Come si aggiunge un prompt

1. Copia l'ultimo file in `prompts/`, cambia numero e titolo (`NN-nome-breve.md`) e incolla il testo nel blocco `Prompt`.
2. Aggiungi una riga al registro qui sopra.
3. Un prompt dato non si riscrive: se cambia qualcosa, si scrive un prompt nuovo, così il registro racconta come è nato il design.
4. Quando Figma risponde, esporta gli schermi in `riferimenti/NN-nome-breve/` e annota nel registro cosa è stato accettato e cosa no.

## Regole per i prompt

- Il testo dell'interfaccia è in italiano e semplice. Non compaiono mai "prompt", "modello", "token" o "temperatura" (regola 12 di `CLAUDE.md`).
- I prompt per Figma sono scritti in inglese, con i testi dell'interfaccia in italiano tra virgolette.
- Un prompt dice cosa cambia rispetto ai precedenti, senza ripetere quello che c'è già.
