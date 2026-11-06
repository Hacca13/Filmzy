# Filmzy

Programma libero (AGPL-3.0) per creare cortometraggi con la gen AI, pensato per chi non sa programmare. Gira sul tuo computer, con le tue chiavi dei servizi AI: nessun server, nessun account, nessun pagamento a noi.

Dall'idea al film: scrivi l'idea, Filmzy ti aiuta con la storia, i personaggi, i luoghi e la sceneggiatura, poi gira le scene una alla volta, aggiunge musica ed effetti e monta il film coi titoli.

## Scaricare Filmzy

Gli installatori per Windows, macOS e Linux arriveranno nelle **Release** di questa pagina: si scarica solo il programma, non il codice. Non è ancora uscita la prima versione.

Cosa ti serve:

- un computer con Windows, macOS o Linux;
- le chiavi dei servizi AI che vuoi usare. Per cominciare servono **Anthropic** (per il testo) e **fal.ai** (per immagini, video, musica ed effetti). Al primo avvio Filmzy ti guida, e ti dice dove prenderle;
- un credito presso quei servizi: le generazioni le paghi a loro, non a Filmzy. Prima di ogni generazione vedi quanto costa.

Su Windows l'installatore si chiama `Filmzy-<versione>-installa.exe`. Il programma non è ancora firmato: Windows può mostrare l'avviso «Windows ha protetto il PC»; si va avanti con «Ulteriori informazioni» › «Esegui comunque». Disinstallando, i film restano dove sono.

Se qualcosa si rompe, Filmzy lo scrive nel **registro**: un file al giorno nella cartella `log` dentro la cartella dei tuoi dati (qui sotto). Il registro non contiene le chiavi, e la tua cartella personale ci compare come `~`. Se chiedi aiuto, allega il file del giorno in cui è successo.

## I tuoi dati

- I film, le immagini e i video stanno solo sul tuo computer. Su Windows in `%APPDATA%\Filmzy`, su macOS in `~/Library/Application Support/Filmzy`, su Linux in `~/.local/share/filmzy`. Li trovi anche in Impostazioni › I tuoi dati.
- Le chiavi stanno nel portachiavi del sistema e non finiscono mai nella copia di un film.
- **Nessuna telemetria:** Filmzy non manda niente a chi l'ha fatto. Contatta solo i servizi che colleghi tu e, se lo lasci acceso, GitHub per sapere se c'è una versione nuova.

## Per chi sviluppa

| Documento | Contenuto |
|---|---|
| `CLAUDE.md` | regole per Claude Code |
| `docs/contesto-progetto.md` | cosa fa il prodotto e perché (copia dal progetto Claude) |
| `docs/architettura.md` | com'è fatto il sistema |
| `docs/piano-di-lavoro.md` | cosa fare, in ordine |
| `docs/decisioni.md` | perché è fatto così |
| `docs/ricerca-ottobre-2026.md` | ricerca su modelli, prezzi e aspetti legali (13/10/2026) |
| `config/` | seme della configurazione: troupe, preset, funzioni, prove sui modelli |
| `design/` | il prossimo prompt per Figma, lo storico di quelli lanciati e i riferimenti grafici esportati |

Sviluppo (serve Node 24 e pnpm; Docker no):

```bash
pnpm install
pnpm dev    # server locale su http://127.0.0.1:3001 e interfaccia su http://localhost:5173
```

Il programma per computer (Electron, `apps/desktop`): `pnpm pacchetto` costruisce l'installatore per il sistema su cui gira (per ora Windows) in `apps/desktop/release`. Per provarlo senza installare: `pnpm --filter @filmzy/desktop build` e poi `pnpm --filter @filmzy/desktop start`.

Il file `.env` è facoltativo: copia `.env.example` in `.env` solo per cambiare le impostazioni (per esempio la porta); `pnpm dev` lo legge. Una variabile già impostata nel terminale ha la precedenza sul file. Prima di una pull request: `pnpm check`.

## Licenza

Filmzy è software libero con licenza **AGPL-3.0** (vedi `LICENSE`). Chi pubblica una copia modificata, anche solo come servizio online, deve rendere disponibile il codice.

## Uso responsabile

Filmzy è fornito «così com'è», senza garanzie. Sei tu a rispondere dei file che carichi, dei contenuti che crei e di come li pubblichi.

- Usa solo musica, immagini e voci di cui hai i diritti.
- Non creare contenuti che imitano persone reali o che ingannano chi guarda, e dichiara quando un video è generato con intelligenza artificiale. Per impostazione predefinita Filmzy aggiunge una dicitura nei titoli.
- Rispetta le condizioni dei servizi che colleghi con le tue chiavi: violarle può far bloccare il tuo account presso il fornitore.
- I costi dei servizi AI sono a tuo carico. Filmzy ti mostra una stima prima di ogni generazione e ti lascia impostare dei tetti di spesa, ma imposta un limite anche nel pannello di ogni fornitore.
