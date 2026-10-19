# Film Gen Ai — Piano di lavoro

_Versione 1 · 19 ottobre 2026 · Stime in giornate di lavoro pieno con Claude Code._

## Come usarlo con Claude Code

- Un task alla volta, nell'ordine. Ogni task dice cosa leggere prima e quando è "fatto".
- Per i task grandi, prima un piano (la modalità piano di Claude Code), poi il codice.
- A fine task: `pnpm lint typecheck test` verdi, `pnpm troupe check` verde se hai toccato la configurazione, documenti aggiornati se è cambiato un contratto, una voce in `docs/decisioni.md` se hai deciso qualcosa.

## Riepilogo

| Milestone | Obiettivo | Giornate |
|---|---|---|
| **M0** Fondamenta | repository, contratti, validatore della configurazione, fornitore finto | 2–3 |
| **M1** Troupe e test di coerenza | troupe funzionante su file, bench, test reale (circa 45 $) | 5–7 |
| **M2** Pannello della troupe | accesso admin, configurazione nel database, prova, pubblicazione, storico | 5–7 |
| **M3** Bibbia e sceneggiatura | utenti e crediti, progetto, moderatore, casting, schede, sceneggiatura, inquadrature | 6–8 |
| **M4** Storyboard e video | storyboard, take video con caparra e webhook, aggiornamenti live, costi | 6–8 |
| **M5** Continuità e montaggio | giallo, segretaria di edizione, esportazione con etichetta AI | 5–7 |
| **M6** Beta chiusa | rifiniture, privacy, deploy, 5–10 tester | 3–5 |
| **Totale MVP** | | **32–45** (circa 6½–9 settimane) |

## Prima di iniziare

- Account fal con **limite di spesa** impostato, e la chiave API.
- La chiave di un fornitore LLM (nel seme: Anthropic).
- Node.js LTS, pnpm e Docker.

## M0 — Fondamenta (2–3 giornate)

_Leggere: architettura §2, §3, §4.3–4.6._

**T0.1 Monorepo.** pnpm workspaces + Turborepo, TypeScript strict, ESLint + Prettier, Vitest, GitHub Actions.
_Fatto quando:_ `pnpm lint typecheck test build` passa in locale e in CI.

**T0.2 Ambiente locale.** `docker-compose.yml` con Postgres, Redis, MinIO e Mailpit; `.env.example`; `apps/api`, `apps/worker` e `apps/web` vuote ma avviabili.
_Fatto quando:_ da un clone pulito, `docker compose up -d && pnpm dev` avvia tutto.

**T0.3 Contratti di base.** In `packages/contracts`: ruoli con schemi di input e output (§5.3), ShotSpec 0.2, scontrino, eventi, schemi della configurazione (connessioni, catalogo, ruoli, istruzioni, preset, funzioni, ambienti, piano di bench).
_Fatto quando:_ ci sono test di validazione su esempi validi e non validi.

**T0.4 Validatore della configurazione.** `ConfigSource` da file, risoluzione di `env:`, adattamenti d'ambiente con `"*"`, controlli di §4.6, hash; comando `pnpm troupe check`.
_Fatto quando:_ i file di seme passano (con avvisi per gli id da verificare); un riferimento rotto, un parametro non accettato o una variabile inesistente danno errori leggibili che nominano ruolo e campo.

**T0.5 Confini imposti.** Regole sugli import (§3) e controllo che vieta id di modelli e URL di fornitori nel codice.
_Fatto quando:_ un import vietato o un id di modello in `apps/` fanno fallire la CI.

**T0.6 Fornitore finto.** Adapter `fake` per LLM, immagini e video, con fixture.
_Fatto quando:_ un test esegue un ruolo LLM e uno video senza rete.

## M1 — Troupe e test di coerenza (5–7 giornate, più l'esecuzione del test)

_Leggere: architettura §4 per intero. In M1 la configurazione arriva dai file; il database arriva in M2._

**T1.1 Ruoli LLM.** `troupe.run`: risoluzione della configurazione, adapter `anthropic` e `openai_compatible` con AI SDK, output strutturato con riparazione, tentativi e riserve secondo §4.10, scontrino su `ReceiptSink`.
_Fatto quando:_ il direttore della fotografia risponde sia con il fornitore finto sia con un LLM vero; un errore tecnico simulato attiva la riserva, un rifiuto simulato no.

**T1.2 Istruzioni.** Caricamento delle versioni, varianti per famiglia (`append`, `replace`), rendering LiquidJS in modalità rigorosa.
_Fatto quando:_ una variabile inesistente è un errore di validazione, non un prompt con un buco.

**T1.3 Adapter fal e storage.** Invio in coda, polling, verifica della firma dei webhook, retention breve, copia immediata su `AssetStore` (cartella locale per il bench, S3 per l'app).
_Fatto quando:_ un'immagine e un video reali vengono generati e salvati, con scontrino completo.

**T1.4 Traduttori.** `kling`, `seedance`, `gemini_omni`, `image_generic`; segnaposto `[[char:id]]`; durata, formato e risoluzione portati ai valori ammessi.
_Fatto quando:_ la stessa ShotSpec produce tre richieste valide, verificate su fixture.

**T1.5 Router.** Filtro, ordinamento per politica, riserve.
_Fatto quando:_ ci sono test unitari sui casi principali: durata non ammessa, troppi riferimenti, budget superato, volti reali richiesti.

**T1.6 Bench e valutazioni.** `apps/bench`: `pnpm bench run <piano>` esegue la matrice e salva in `bench-output/<run>/` video, scontrini e un report HTML con voto alla cieca; `pnpm bench score` calcola i take usabili e il costo per secondo usabile. `pnpm eval <ruolo>` per i ruoli LLM, con i primi esempi fissi per il direttore della fotografia.
_Fatto quando:_ report e punteggi si generano con il fornitore finto.

**T1.7 Test reale.** Esecuzione di `config/bench/week1.yaml` su fal (circa 45 $), voti di 3 persone alla cieca, voti nel catalogo (`quality`), id dei modelli verificati e aggiornati nel seme.
_Fatto quando:_ sono scelti i modelli immagine e video per l'MVP e la scelta è registrata in `docs/decisioni.md`.
Nota: Seedance potrebbe rifiutare anche volti realistici inventati, se non sono registrati come asset virtuali. È una delle cose che il test misura.

## M2 — Pannello della troupe (5–7 giornate)

_Leggere: architettura §4.5, §4.6, §10._

**T2.1 Accesso.** Autenticazione con ruoli `user` e `admin`; la libreria si sceglie all'inizio del task e la scelta va registrata in `docs/decisioni.md`.
_Fatto quando:_ `/admin` è accessibile solo agli admin.

**T2.2 Configurazione nel database.** Tabelle `troupe_drafts`, `troupe_releases`, `instruction_versions`; `pnpm troupe import` ed `export`; `ConfigSource` dal database; ricarica via Redis senza riavvio; se la nuova release non è valida si tiene la precedente.
_Fatto quando:_ pubblicare una release cambia il comportamento del worker senza riavviarlo.

**T2.3 Moduli generati dagli schemi.** Pagine Connessioni, Modelli, Ruoli, Preset e Funzioni generate dagli schemi Zod, con validazione in linea; delle chiavi si vede solo "presente" o "mancante".
_Fatto quando:_ dal pannello si cambia il modello dello sceneggiatore.

**T2.4 Istruzioni.** Editor con versioni e varianti, elenco delle variabili, anteprima con un input di esempio.
_Fatto quando:_ si crea una nuova versione senza toccare la precedente.

**T2.5 Prova.** Esecuzione di un ruolo dalla bozza su un input di esempio, con risultato, costo e scontrino `draft_test`.
_Fatto quando:_ si vede il risultato prima di pubblicare.

**T2.6 Pubblica, storico, ripristino.** Differenze rispetto alla release attiva, nota obbligatoria, ripristino come nuova release, registro delle azioni.
_Fatto quando:_ un ripristino riporta la configurazione precedente in meno di un minuto.

## M3 — Bibbia e sceneggiatura (6–8 giornate)

_Leggere: architettura §5 e §6; contesto del progetto, "Flusso utente" punti 1–3._

**T3.1 Utenti e crediti.** Registrazione, crediti di benvenuto, registro con caparra, addebito e rilascio.
_Fatto quando:_ i test sul registro passano: nessun saldo negativo, caparre rilasciate quando un lavoro fallisce.

**T3.2 Progetto.** Wizard "Idea": idea, genere, tono, stile, fotografia e durata, tutto dai preset.
_Fatto quando:_ si crea un film in meno di un minuto senza leggere un termine tecnico.

**T3.3 Moderatore.** Controllo dei testi dell'utente prima di ogni spesa.
_Fatto quando:_ il nome di una persona famosa o una richiesta vietata vengono fermati con un messaggio semplice e un suggerimento.

**T3.4 Casting.** Proposte iniziali e durante le scene; card Aggiungi / Cambia / Scarta; il cast attuale è sempre nell'input.
_Fatto quando:_ le proposte rispettano trama e stile, senza doppioni.

**T3.5 Schede personaggio.** Character designer a tre angolazioni, scelta, blocco del volto.
_Fatto quando:_ un personaggio bloccato ha tre immagini di riferimento salvate.

**T3.6 Sceneggiatura.** Generazione, modifica scena per scena come testo, versioni.
_Fatto quando:_ ogni modifica crea una nuova versione e la precedente resta consultabile.

**T3.7 Inquadrature.** Aiuto regista: scene → ShotSpec → striscia di card.
_Fatto quando:_ ogni inquadratura ha gli stati di continuità di entrata e uscita.

**T3.8 Valutazioni.** Cinque esempi fissi ciascuno per moderatore, casting, sceneggiatore e aiuto regista.
_Fatto quando:_ `pnpm eval` produce un report per ognuno.

## M4 — Storyboard e video scena per scena (6–8 giornate)

_Leggere: architettura §4.7–4.11 e §7._

**T4.1 Storyboard.** Due o tre varianti per inquadratura, scelta.
_Fatto quando:_ la variante scelta diventa il riferimento visivo della card.

**T4.2 Take video.** Pipeline completa di §7: stima, caparra, coda, webhook, copia, addebito.
_Fatto quando:_ un take compare nella card e lo scontrino riporta il costo reale.

**T4.3 Aggiornamenti live.** SSE per lo stato delle card.
_Fatto quando:_ la card passa da "in lavorazione" a "pronto" senza ricaricare la pagina.

**T4.4 Rifiuti ed errori.** Messaggi semplici, caparre rilasciate, nessun tentativo di aggirare i filtri.
_Fatto quando:_ un rifiuto simulato non addebita nulla e non prova altri modelli.

**T4.5 Rigenera e scegli.** Più take per inquadratura, scelta del take.
_Fatto quando:_ si può rigenerare una sola inquadratura senza toccare le altre.

**T4.6 Costi e code nell'admin.** Pannello dei costi costruito sugli scontrini, bull-board, soglia di spesa giornaliera con avviso.
_Fatto quando:_ si vede quanto è costato ogni film, per ruolo e per modello.

## M5 — Continuità e montaggio (5–7 giornate)

_Leggere: architettura §8 e §9._

**T5.1** Regole R1–R4, con segnalazioni gialle e motivo.
**T5.2** Segretaria di edizione sulle incoerenze di trama.
**T5.3** Azioni sul giallo: Rigenera o Ignora.
**T5.4** Montaggio: normalizzazione, concatenazione, titoli con la dicitura AI; musica se `music` è attiva, dopo aver scelto il fornitore.
**T5.5** Marcatura C2PA: scelta dello strumento; metadati dei fornitori conservati.
**T5.6** Esportazione e download con URL firmato.

_Fatto quando:_ un corto di 60 secondi con due personaggi si esporta con titoli, dicitura e marcatura, e una modifica a monte accende il giallo giusto con il motivo giusto.

## M6 — Beta chiusa (3–5 giornate)

**T6.1** Onboarding e rifinitura dell'interfaccia.
**T6.2** Privacy, termini, segnalazione e rimozione.
**T6.3** Limiti di spesa per utente.
**T6.4** Deploy (Docker + Caddy), backup del database, tracciamento degli errori.
**T6.5** Test con 5–10 persone non tecniche: dove si bloccano, cosa non capiscono.

_Fatto quando:_ almeno 5 persone non tecniche finiscono un corto da sole.

## Fuori dal codice

- [ ] Account fal con limite di spesa, fornitore LLM, Cloudflare R2, dominio
- [ ] Budget del test di coerenza: circa 45 $
- [ ] Privacy policy e termini prima della beta
- [ ] Consulenza legale prima di accendere i volti reali
- [ ] 5–10 tester non tecnici
- [ ] Nome del prodotto

## Dopo l'MVP

- **Cast personale:** test dedicato sui volti reali; poi consenso dato dalla persona stessa (link, selfie dal vivo, frase per la voce) e router limitato ai modelli che accettano volti verificati.
- **Fase 2:** voci per personaggio e labiale, pagamenti.
- **Fase 3:** timeline modificabile, luoghi ricorrenti, doppiaggio.
