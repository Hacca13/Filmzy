# Filmzy

Piattaforma per creare cortometraggi con la gen AI, pensata per chi non sa programmare.

| Documento | Contenuto |
|---|---|
| `CLAUDE.md` | regole per Claude Code |
| `docs/contesto-progetto.md` | cosa fa il prodotto e perché (copia dal progetto Claude) |
| `docs/architettura.md` | com'è fatto il sistema |
| `docs/piano-di-lavoro.md` | cosa fare, in ordine |
| `docs/decisioni.md` | perché è fatto così |
| `docs/ricerca-ottobre-2026.md` | ricerca su modelli, prezzi e aspetti legali (13/10/2026) |
| `config/` | seme della configurazione: troupe, preset, funzioni, prove sui modelli |
| `design/` | prompt dati a Figma (con registro) e riferimenti grafici esportati |

Avvio in locale (dopo M0):

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm dev
```
