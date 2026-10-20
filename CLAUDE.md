# CLAUDE.md — Filmzy

Programma per creare cortometraggi con la gen AI, pensato per chi non sa programmare: idea → bozza della storia → personaggi coerenti → luoghi → sceneggiatura finale → scene generate una alla volta → film esportato. È **software libero (AGPL-3.0) e gira in locale** sul computer dell'utente, con le sue chiavi: nessun server, nessun account, nessun pagamento (D28, D29). Il programma è un **direttore di produzione**: i modelli generano, noi ricordiamo.

## Leggi prima di lavorare

- `docs/contesto-progetto.md` — cosa fa il prodotto e perché. È una copia: non modificarla; se serve cambiarla, proponilo.
- `docs/architettura.md` — com'è fatto il sistema. È la fonte di verità tecnica.
- `docs/piano-di-lavoro.md` — cosa fare e in che ordine. Lavora un task alla volta e leggi le sezioni indicate dal task.
- `docs/decisioni.md` — perché è fatto così. Aggiungi una voce quando prendi una decisione.
- `docs/ricerca-ottobre-2026.md` — modelli, prezzi e aspetti legali al 13/10/2026. Utile in M1; i dati vanno ricontrollati.
- `design/` — il prossimo prompt da dare a Figma, lo storico di quelli lanciati e i riferimenti grafici dell'interfaccia.

## Stack

- Monorepo pnpm + Turborepo, TypeScript strict ovunque.
- `apps/api` NestJS, server locale con i lavori in coda · `apps/web` React + Vite · `apps/desktop` Electron · `apps/bench` riga di comando.
- `packages/contracts` schemi Zod · `packages/troupe` livello AI · `packages/db` Drizzle + SQLite · `packages/media` ffmpeg.
- Coda interna salvata in SQLite, file in una cartella locale, chiavi nel portachiavi del sistema; niente Redis, Postgres, Docker. AI SDK e client fal **solo** dentro `packages/troupe/src/adapters/`.

## Comandi

Si creano durante M0–M2 (vedi il piano).

```bash
pnpm install
pnpm dev                                  # api e web in locale
pnpm test                                 # fornitore finto: zero costi
pnpm lint && pnpm typecheck
pnpm check                                # lint, typecheck, test, build e stile: tutto insieme (D34)
pnpm troupe check                         # valida la configurazione (file o bozza)
pnpm troupe import config/ai              # crea una bozza dai file di seme
pnpm troupe export config/ai              # salva la release attiva su file
TROUPE_ENV=offline pnpm dev               # tutto col fornitore finto, senza rete
pnpm eval <ruolo> --model <voce>          # a mano: costa
pnpm bench run config/bench/week1.yaml    # a mano: costa
```

## Regole d'oro

1. **Il codice chiama ruoli, mai modelli:** `troupe.run(role, input)` e `troupe.submit(role, input)`. Nessuna libreria o `fetch` verso fornitori AI fuori da `packages/troupe/src/adapters/`.
2. **Nel codice non ci sono nomi di modelli, URL dei fornitori, temperature o testi di prompt.** Stanno nella configurazione della troupe (impostazioni avanzate e `config/`). La CI blocca le violazioni: non aggirarla.
3. **Contratti prima:** ogni dato che attraversa un confine ha uno schema Zod in `packages/contracts`. Prima lo schema, poi il codice.
4. **Ogni chiamata a un fornitore produce uno scontrino**, anche se fallisce.
5. **I test non spendono:** nei test le connessioni sono `fake`. Non scrivere test che chiamano fornitori veri.
6. **Riserve solo per errori tecnici.** `content_rejected` si ferma lì: mai provare un altro modello per aggirare un rifiuto.
7. **Nessun segreto nel repository:** nella configurazione solo `env:NOME` oppure `secret:NOME` (le chiavi inserite dall'utente, nel portachiavi del sistema); `.env` resta fuori da git.
8. **La logica sta nel backend.** L'interfaccia mostra e invia, non decide.
9. **Lavori lunghi in coda.** Nessuna chiamata a un modello immagine o video dentro una richiesta HTTP.
10. **Idempotenza:** un lavoro ripetuto (per esempio dopo un riavvio) non deve contare due volte nella spesa.
11. **I file dei fornitori si copiano subito** nella cartella del progetto: mai salvare solo il loro link.
12. **Interfaccia in italiano e semplice:** l'utente finale non vede mai "prompt", "modello", "token" o "temperatura".

## Convenzioni

- Codice in inglese; interfaccia, istruzioni e documenti in italiano.
- Configurazione in snake_case; oggetti del dominio e variabili delle istruzioni in camelCase.
- Un modulo NestJS per dominio (`apps/api/src/modules/<modulo>`); niente logica nei controller.
- Errori del dominio con codici (`content_rejected`, `budget_exceeded`, …); i messaggi per l'utente stanno nell'interfaccia.
- Migrazioni Drizzle generate e committate insieme al cambio di schema.
- Test accanto al codice (`*.test.ts`); fixture dei fornitori in `packages/troupe/test/fixtures/`.
- Niente `any` senza un commento che spieghi perché.
- `.env` e `bench-output/` (video e report delle prove) restano fuori da git.

## Glossario

| Prodotto (italiano) | Codice |
|---|---|
| Film, progetto | `Project` |
| Bibbia | `StoryBible` |
| Personaggio, scheda personaggio | `Character`, `CharacterSheet` |
| Luogo | `Location` |
| Stile, fotografia | `StylePreset`, `CinematographyPreset` |
| Sceneggiatura, scena | `Screenplay`, `Scene` |
| Bozza della sceneggiatura, stesura ufficiale | `Screenplay` con `stage` (`draft`, `final`); la «bozza» della troupe resta `TroupeDraft` |
| Riepilogo (bozza contro scelte) | `DraftReview` |
| Tag e dettagli del personaggio | `CharacterTag`, `CharacterProfile` |
| Immagine dell'inquadratura (ispirazione, primo, ultimo fotogramma) | `ShotImage` (`reference`, `first_frame`, `last_frame`) |
| Movimento di macchina | `CameraMovement` |
| Ritocco, maschera | `Retouch`, `Mask` |
| Traccia audio, clip audio | `AudioTrack`, `AudioClip` |
| Chiave del fornitore (segreto) | `Secret` |
| Inquadratura, scheda inquadratura | `Shot`, `ShotSpec` |
| Take | `Take` |
| Continuità, giallo | `ContinuityState`, `ContinuityFlag` |
| Troupe, ruolo | `Troupe`, `Role` |
| Connessione, catalogo dei modelli | `Connection`, `ModelEntry` |
| Istruzioni | `Instructions` (`id@version`) |
| Bozza, release | `TroupeDraft`, `TroupeRelease` |
| Traduttore | `Translator` |
| Scontrino | `GenerationReceipt` |
| Stima, tetto di spesa | `estimate`, `SpendCap` |
| Persona reale, consenso | `RealPerson`, `Consent` |
| Fornitore finto | adapter `fake` |

## Ruoli della troupe

`moderator` Moderatore · `casting` Direttore del casting · `screenwriter` Sceneggiatore · `shot_planner` Aiuto regista · `cinematographer` Direttore della fotografia · `character_designer` Character designer · `set_designer` Scenografo · `retoucher` Ritocco · `storyboard_artist` Storyboard (modi `storyboard` e `end_frame`) · `camera_operator` Operatore di ripresa · `script_supervisor` Segretaria di edizione · `composer` Compositore · `sfx_artist` Rumorista · `sound_planner` Sound designer. Più avanti: `voice_actor`, `lip_sync`, `dialogue_adapter`.

## Come aggiungere

- **Un modello:** architettura §4.12. Di solito bastano le impostazioni.
- **Un ruolo:** schemi di input e output in `packages/contracts/src/roles.ts` → istruzioni `v1` → voce nel seme `config/ai/roles.yaml` → uso nel modulo → test con il fornitore finto → esempi fissi per `pnpm eval`.
- **Un adapter o un traduttore:** in `packages/troupe/src/adapters/` o `translators/`, con le interfacce di §4.7, test su fixture registrate e registrazione nell'indice dei plugin. Nessuna modifica alle app.
- **Uno stile, un preset di fotografia, un tag di personaggio o un movimento di macchina:** è un dato. Si aggiunge dalle impostazioni avanzate, oppure in `config/presets/` per il seme.

## "Fatto" significa

- Il criterio del task è soddisfatto.
- `pnpm check` verde (lint, typecheck, test, build e stile); `pnpm troupe check` verde se hai toccato la configurazione. Attenzione: `pnpm lint typecheck test` non lancia tre script, solo il primo.
- Schemi e documenti aggiornati se è cambiato un contratto; una voce in `docs/decisioni.md` se hai deciso qualcosa.
- Nessuna chiamata reale ai fornitori nei test.

## Da non fare

- Non introdurre LangChain, LlamaIndex o framework agentici.
- Non aggirare i filtri dei fornitori né il moderatore.
- Non mostrare all'utente finale prompt, nomi di modelli o parametri.
- Non accendere `real_people` senza una decisione registrata e la consulenza legale.
- Non togliere le impostazioni prudenti di default (moderatore, solo persone generate, dicitura AI nei titoli): l'utente le può cambiare, ma con un'avvertenza (D19, D28).
- Non accettare di default immagini con persone caricate dall'utente e non ritoccare foto di persone: i personaggi li crea Filmzy (D19).
- Non declassare in silenzio una scelta dell'utente sulle immagini dell'inquadratura (primo o ultimo fotogramma): se nessun modello la accetta, si ferma con un messaggio semplice (D20).
- Non mostrare né registrare mai una chiave dopo l'inserimento: né nell'interfaccia, né nei log, né negli export (D25).
- Non inviare mai a un fornitore AI i file audio caricati dall'utente (D27): servono solo al mix.
- Non aggiungere un server, account, pagamenti o telemetria: Filmzy gira in locale e nessun dato dell'utente va all'autore (D28, D29).
- Non cambiare un contratto senza aggiornare schemi, test e documenti nello stesso commit.
