# Filmzy — Design

Qui vivono i prompt dati a Figma e, quando arrivano, gli export dei mockup. Il design è un riferimento per l'interfaccia (`apps/web`); le regole del prodotto restano in `docs/`.

## Come funziona

C'è **un solo prompt da lanciare alla volta**: [`prossimo-prompt.md`](prossimo-prompt.md). Quando lo lanci in Figma:

1. dì a Claude «lanciato»;
2. il file passa in `storico/` con il numero e la data, e il registro qui sotto si aggiorna;
3. quando serve un altro prompt, Claude ne scrive uno nuovo in `prossimo-prompt.md`.

Nello storico restano solo i prompt davvero lanciati: quelli ancora da lanciare non si accumulano.

## Cartelle

| Percorso | Contenuto |
|---|---|
| `prossimo-prompt.md` | l'unico prompt da lanciare adesso, con le note su cosa controllare nella risposta |
| `storico/` | i prompt già lanciati, uno per file, numerati nell'ordine in cui sono stati dati (`NN-nome-breve.md`) |
| `riferimenti/` | export di Figma: PNG delle schermate a 2x, colori e font, logo in SVG. Una sottocartella per ogni prompt (per esempio `riferimenti/01-mockup-iniziale/`). Si crea quando arrivano i file |

## Storico dei prompt lanciati

| N. | File | Cosa chiede | Lanciato il | Esito |
|---|---|---|---|---|
| 01 | [`storico/01-mockup-iniziale.md`](storico/01-mockup-iniziale.md) | i 6 schermi base, lo stile (scuro, ambra), i componenti | 20/10/2026 | in corso: la risposta di Figma è da esportare in `riferimenti/01-mockup-iniziale/` |

## Regole per i prompt

- Il testo dell'interfaccia è in italiano e semplice. Non compaiono mai "prompt", "modello", "token" o "temperatura" (regola 12 di `CLAUDE.md`), tranne nelle Impostazioni avanzate.
- I prompt per Figma sono scritti in inglese, con i testi dell'interfaccia in italiano tra virgolette.
- Un prompt già lanciato non si riscrive: se cambia qualcosa, si scrive un prompt nuovo, così lo storico racconta come è nato il design.
