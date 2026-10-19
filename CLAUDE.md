# CLAUDE.md — Film Gen Ai

Piattaforma web per creare cortometraggi con la gen AI, pensata per chi non sa programmare: idea → personaggi coerenti → sceneggiatura → scene generate una alla volta → film esportato. La piattaforma è un **direttore di produzione**: i modelli generano, noi ricordiamo.

## Leggi prima di lavorare

- `docs/contesto-progetto.md` — cosa fa il prodotto e perché. È una copia: non modificarla; se serve cambiarla, proponilo.
- `docs/architettura.md` — com'è fatto il sistema. È la fonte di verità tecnica.
- `docs/piano-di-lavoro.md` — cosa fare e in che ordine. Lavora un task alla volta e leggi le sezioni indicate dal task.
- `docs/decisioni.md` — perché è fatto così. Aggiungi una voce quando prendi una decisione.
- `docs/ricerca-ottobre-2026.md` — modelli, prezzi e aspetti legali al 13/10/2026. Utile in M1; i dati vanno ricontrollati.

## Stack

- Monorepo pnpm + Turborepo, TypeScript strict ovunque.
- `apps/api` NestJS · `apps/worker` NestJS standalone con BullMQ · `apps/web` React + Vite · `apps/bench` riga di comando.
- `packages/contracts` schemi Zod · `packages/troupe` livello AI · `packages/db` Drizzle + PostgreSQL · `packages/media` ffmpeg.
- Redis, storage S3 compatibile (MinIO in locale). AI SDK e client fal **solo** dentro `packages/troupe/src/adapters/`.

## Comandi

Si creano durante M0–M2 (vedi il piano).

```bash
docker compose up -d                      # postgres, redis, minio, mailpit
pnpm install
pnpm dev                                  # api, worker, web
pnpm test                                 # fornitore finto: zero costi
pnpm lint && pnpm typecheck
pnpm troupe check                         # valida la configurazione (file o bozza)
pnpm troupe import config/ai              # crea una bozza dai file di seme
pnpm troupe export config/ai              # salva la release attiva su file
TROUPE_ENV=offline pnpm dev               # tutto col fornitore finto, senza rete
pnpm eval <ruolo> --model <voce>          # a mano: costa
pnpm bench run config/bench/week1.yaml    # a mano: costa
```

## Regole d'oro

1. **Il codice chiama ruoli, mai modelli:** `troupe.run(role, input)` e `troupe.submit(role, input)`. Nessuna libreria o `fetch` verso fornitori AI fuori da `packages/troupe/src/adapters/`.
2. **Nel codice non ci sono nomi di modelli, URL dei fornitori, temperature o testi di prompt.** Stanno nella configurazione della troupe (pannello e `config/`). La CI blocca le violazioni: non aggirarla.
3. **Contratti prima:** ogni dato che attraversa un confine ha uno schema Zod in `packages/contracts`. Prima lo schema, poi il codice.
4. **Ogni chiamata a un fornitore produce uno scontrino**, anche se fallisce.
5. **I test non spendono:** nei test le connessioni sono `fake`. Non scrivere test che chiamano fornitori veri.
6. **Riserve solo per errori tecnici.** `content_rejected` si ferma lì: mai provare un altro modello per aggirare un rifiuto.
7. **Nessun segreto nel repository:** nella configurazione solo `env:NOME`; `.env` resta fuori da git.
8. **La logica sta nel backend.** L'interfaccia mostra e invia, non decide.
9. **Lavori lunghi in coda.** Nessuna chiamata a un modello immagine o video dentro una richiesta HTTP.
10. **Idempotenza:** un webhook o un lavoro ripetuto non deve addebitare due volte.
11. **I file dei fornitori si copiano subito** nel nostro storage: mai salvare solo il loro link.
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
| Inquadratura, scheda inquadratura | `Shot`, `ShotSpec` |
| Take | `Take` |
| Continuità, giallo | `ContinuityState`, `ContinuityFlag` |
| Troupe, ruolo | `Troupe`, `Role` |
| Connessione, catalogo dei modelli | `Connection`, `ModelEntry` |
| Istruzioni | `Instructions` (`id@version`) |
| Bozza, release | `TroupeDraft`, `TroupeRelease` |
| Traduttore | `Translator` |
| Scontrino | `GenerationReceipt` |
| Caparra, addebito, rilascio | `hold`, `capture`, `void` |
| Persona reale, consenso | `RealPerson`, `Consent` |
| Fornitore finto | adapter `fake` |

## Ruoli della troupe

`moderator` Moderatore · `casting` Direttore del casting · `screenwriter` Sceneggiatore · `shot_planner` Aiuto regista · `cinematographer` Direttore della fotografia · `character_designer` Character designer · `storyboard_artist` Storyboard · `camera_operator` Operatore di ripresa · `script_supervisor` Segretaria di edizione · `composer` Compositore. Più avanti: `voice_actor`, `lip_sync`, `dialogue_adapter`.

## Come aggiungere

- **Un modello:** architettura §4.12. Di solito basta il pannello.
- **Un ruolo:** schemi di input e output in `packages/contracts/src/roles.ts` → istruzioni `v1` → voce nel seme `config/ai/roles.yaml` → uso nel modulo → test con il fornitore finto → esempi fissi per `pnpm eval`.
- **Un adapter o un traduttore:** in `packages/troupe/src/adapters/` o `translators/`, con le interfacce di §4.7, test su fixture registrate e registrazione nell'indice dei plugin. Nessuna modifica alle app.
- **Uno stile o un preset di fotografia:** è un dato. Si aggiunge dal pannello, oppure in `config/presets/` per il seme.

## "Fatto" significa

- Il criterio del task è soddisfatto.
- `pnpm lint typecheck test` verdi; `pnpm troupe check` verde se hai toccato la configurazione.
- Schemi e documenti aggiornati se è cambiato un contratto; una voce in `docs/decisioni.md` se hai deciso qualcosa.
- Nessuna chiamata reale ai fornitori nei test.

## Da non fare

- Non introdurre LangChain, LlamaIndex o framework agentici.
- Non aggirare i filtri dei fornitori né il moderatore.
- Non mostrare all'utente finale prompt, nomi di modelli o parametri.
- Non accendere `real_people` senza una decisione registrata e la consulenza legale.
- Non cambiare un contratto senza aggiornare schemi, test e documenti nello stesso commit.
