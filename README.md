# Filmzy

Programma libero (AGPL-3.0) per creare cortometraggi con la gen AI, pensato per chi non sa programmare. Gira sul tuo computer, con le tue chiavi dei servizi AI: nessun server, nessun account, nessun pagamento a noi.

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

Il file `.env` è facoltativo: copia `.env.example` in `.env` solo per cambiare le impostazioni (per esempio la porta); `pnpm dev` lo legge. Una variabile già impostata nel terminale ha la precedenza sul file. Prima di una pull request: `pnpm check`.

## Licenza

Filmzy è software libero con licenza **AGPL-3.0** (vedi `LICENSE`). Chi pubblica una copia modificata, anche solo come servizio online, deve rendere disponibile il codice.

## Uso responsabile

Filmzy è fornito «così com'è», senza garanzie. Sei tu a rispondere dei file che carichi, dei contenuti che crei e di come li pubblichi.

- Usa solo musica, immagini e voci di cui hai i diritti.
- Non creare contenuti che imitano persone reali o che ingannano chi guarda, e dichiara quando un video è generato con intelligenza artificiale. Per impostazione predefinita Filmzy aggiunge una dicitura nei titoli.
- Rispetta le condizioni dei servizi che colleghi con le tue chiavi: violarle può far bloccare il tuo account presso il fornitore.
- I costi dei servizi AI sono a tuo carico. Filmzy ti mostra una stima prima di ogni generazione e ti lascia impostare dei tetti di spesa, ma imposta un limite anche nel pannello di ogni fornitore.
