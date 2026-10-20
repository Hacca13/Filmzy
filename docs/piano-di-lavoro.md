# Filmzy — Piano di lavoro

_Versione 3 · 20 ottobre 2026 · Filmzy è software libero e gira in locale (D28–D32) · Stime in giornate di lavoro pieno con Claude Code._

## Come usarlo con Claude Code

- Un task alla volta, nell'ordine. Ogni task dice cosa leggere prima e quando è "fatto".
- Ogni task ha il suo ramo, da `main`. Si unisce con una pull request dopo l'ok.
- Per i task grandi, prima un piano (la modalità piano di Claude Code), poi il codice.
- Prima di aprire la pull request si rilegge tutto il diff con i criteri di «Qualità del codice» di `CLAUDE.md`: codice non ripetitivo, funzioni né troppo specifiche né troppo generiche, nomi parlanti, commenti sul *perché*, efficienza e sicurezza.
- A fine task: `pnpm check` verde (lint, typecheck, test, build e stile), `pnpm troupe check` verde se hai toccato la configurazione, documenti aggiornati se è cambiato un contratto, una voce in `docs/decisioni.md` se hai deciso qualcosa.

## Riepilogo

| Milestone | Obiettivo | Giornate |
|---|---|---|
| **M0** Fondamenta | repository, contratti, validatore della configurazione, fornitore finto | 2–3 |
| **M1** Troupe e test di coerenza | troupe funzionante su file, bench, test reale (circa 45 $) | 5–7 |
| **M2** Impostazioni | database e coda locali, configurazione nel database, prova, pubblicazione, storico, connessioni guidate con chiavi nel portachiavi | 6–9 |
| **M3** Storia, personaggi e luoghi | costi e tetti di spesa, progetto, moderatore, bozza, casting, schede, luoghi, riepilogo, stesura, inquadrature | 10–14 |
| **M4** Storyboard, immagini e video | storyboard, immagini dell'inquadratura, take video con polling, aggiornamenti live, spesa | 7–10 |
| **M5** Continuità, suoni e montaggio | giallo, segretaria di edizione, tracce audio (musica, effetti, file propri), esportazione con dicitura AI | 9–14 |
| **M6** Installatore e beta chiusa | Electron, aggiornamenti, licenza e avviso, prove su tre sistemi, 5–10 tester | 8–12 |
| **Totale MVP** (senza opzioni) | | **47–69** (circa 9½–14 settimane) |
| Opzione: caricamento di luoghi e oggetti | T4.8 | +2–3 |
| Opzione: ritocco col pennello | T4.9 | +3–4 |
| Opzione: moodboard del film e delle scene (D37) | T4.10 | +3–4 |
| **Con tutte le opzioni** | | **55–80** (circa 11–16 settimane) |

### Cosa è cambiato il 20/10/2026

La versione 1 (19/10) diceva 32–45 giornate. Il 20/10 sono arrivate prima le nuove funzioni (flusso con bozza, luoghi, immagini dell'inquadratura, tracce audio, connessioni: D18–D27, circa +16–25 giornate) e poi la svolta a software libero in locale (D28–D32), che quasi si compensa:

- **Si toglie:** accesso e ruoli, registro dei crediti con caparra, deploy con Docker e Caddy, webhook con firma, URL firmati, Redis, pannello dei lavori in coda, e la marcatura C2PA dall'MVP.
- **Si aggiunge:** database e coda locali (SQLite), tetti di spesa con conferma, procedura guidata al primo avvio, esportazione e importazione dei progetti, impacchettamento con Electron, aggiornamenti e prove su Windows, macOS e Linux.

Le cifre sono stime grossolane, da rivedere dopo M1 e dopo il primo installatore.

### Perimetro dell'MVP

- **Dentro:** il flusso con bozza e stesura, i luoghi, il controllo dei fotogrammi, «usa un fotogramma del video come punto di partenza», le tracce di musica ed effetti con «Suggerisci i suoni» e il caricamento di file audio propri (anche una voce fuori campo), la pagina Connessioni, i tetti di spesa e l'app installabile.
- **Opzioni con la funzione spenta** (si decide a metà di M4, dopo T4.7): caricamento di luoghi e oggetti, ritocco col pennello, moodboard.
- **Dopo l'MVP:** marcatura C2PA, modifica vera del video (`video_edit`), generazione delle voci e labiale (Fase 2), timeline libera (Fase 3). Una modalità server non è prevista (D29).

## Prima di iniziare

- Account fal con **limite di spesa** impostato nel pannello di fal, e la chiave API: servono per provare, come per ogni utente.
- La chiave di un fornitore LLM (nel seme: Anthropic).
- Node.js LTS e pnpm. Docker non serve. Per costruire gli installatori (M6) bastano le macchine della CI di GitHub.

## M0 — Fondamenta (2–3 giornate)

_Leggere: architettura §2, §3, §4.3–4.6._

**T0.1 Monorepo.** pnpm workspaces + Turborepo, TypeScript strict, ESLint + Prettier, Vitest, GitHub Actions.
_Fatto quando:_ `pnpm check` (lint, typecheck, test, build e stile) passa in locale e in CI, su Ubuntu e su Windows, e ognuno dei controlli fallisce davvero se introduci un errore apposta.

**T0.2 Ambiente locale.** `.env.example` per lo sviluppo; `apps/api` (server locale) e `apps/web` vuote ma avviabili.
_Fatto quando:_ da un clone pulito, `pnpm install && pnpm dev` avvia tutto, senza Docker.

**T0.3 Contratti di base.** In `packages/contracts`: ruoli con schemi di input e output (§5.3, compresi i tre modi dello sceneggiatore, il casting con tag e dettagli, `set_designer`, `retoucher` e i due modi di `storyboard_artist`), ShotSpec 0.2 con le immagini, Bibbia con profilo del personaggio e proposte della bozza, scontrino, stime e tetti di spesa, eventi, schemi della configurazione (connessioni e modelli con `monthly_cap_usd`, catalogo con `input_modes` e `label`, ruoli, istruzioni, preset, funzioni e limiti, ambienti, piano di bench). Per la scelta del servizio (D36, architettura §5.6): `modelId` facoltativo nel contesto delle richieste di generazione, `ModelOption`, le scelte dell'utente (`UserSettings`: servizi attivati, predefiniti, tetti), `modelId` e `modelLabel` nello scontrino. In più i codici di errore del dominio (§4.10) e il corpo dell'errore con `code`, `retryable` e `details`, perché l'interfaccia capisca perché una chiamata è fallita.
_Fatto quando:_ ci sono test di validazione su esempi validi e non validi.

**T0.4 Validatore della configurazione.** `ConfigSource` da file, risoluzione di `env:` e `secret:`, adattamenti d'ambiente con `"*"`, controlli di §4.6, hash; comando `pnpm troupe check`. La `ConfigSource` consegna anche le scelte dell'utente (`UserSettings`, D36): da file non ce ne sono e valgono tutte le voci della release (§4.3).
_Fatto quando:_ i file di seme passano (con avvisi per gli id da verificare); un riferimento rotto, un parametro non accettato o una variabile inesistente danno errori leggibili che nominano ruolo e campo.

**T0.5 Confini imposti.** Regole sugli import (§3) e controllo che vieta id di modelli e URL di fornitori nel codice.
_Fatto quando:_ un import vietato o un id di modello in `apps/` fanno fallire la CI.

**T0.6 Fornitore finto.** Adapter `fake` per LLM, immagini e video, con fixture.
_Fatto quando:_ un test esegue un ruolo LLM e uno video senza rete.

## M1 — Troupe e test di coerenza (5–7 giornate, più l'esecuzione del test)

_Leggere: architettura §4 per intero. In M1 la configurazione arriva dai file; il database arriva in M2._

**T1.1 Ruoli LLM.** `troupe.run`: risoluzione della configurazione, adapter `anthropic` e `openai_compatible` con AI SDK, output strutturato con riparazione, pochi nuovi tentativi secondo §4.10 (nessuna riserva: D36), scontrino su `ReceiptSink`.
_Fatto quando:_ il direttore della fotografia risponde sia con il fornitore finto sia con un LLM vero; un errore tecnico simulato dà pochi tentativi e poi si ferma con codice e dettagli, un rifiuto simulato non riprova.

**T1.2 Istruzioni.** Caricamento delle versioni, varianti per famiglia (`append`, `replace`), rendering LiquidJS in modalità rigorosa, con le variabili facoltative a `null`.
_Fatto quando:_ una variabile inesistente è un errore di validazione, non un prompt con un buco.

**T1.3 Adapter fal e storage.** Invio in coda, polling, retention breve, copia immediata su `AssetStore` (cartella locale). Niente webhook né verifica delle firme (D29). Per le immagini, anche la modifica di un'immagine data (con maschera o con la zona evidenziata).
_Fatto quando:_ un'immagine, una modifica e un video reali vengono generati e salvati, con scontrino completo.

**T1.4 Traduttori.** `kling`, `seedance`, `gemini_omni`, `image_generic`; segnaposto `[[char:id]]`; durata, formato e risoluzione portati ai valori ammessi; modi d'ingresso della voce scelta (riferimenti, primo e ultimo fotogramma, D20).
_Fatto quando:_ la stessa ShotSpec produce tre richieste valide, verificate su fixture, e una richiesta con primo e ultimo fotogramma per le famiglie che la accettano.

**T1.5 Router.** Filtro, ordinamento per politica; servizio scelto dall'utente come requisito (`modelId`, D36) e `troupe.options`.
_Fatto quando:_ ci sono test unitari sui casi principali: durata non ammessa, troppi riferimenti, volti reali richiesti, combinazione di immagini non supportata (nessun declassamento in silenzio), servizio scelto non attivato o non adatto (`no_eligible_model`, senza passare a un altro). Le scelte dell'utente entrano nei test come dati, senza database.

**T1.6 Bench e valutazioni.** `apps/bench`: `pnpm bench run <piano>` esegue la matrice e salva in `bench-output/<run>/` video, scontrini e un report HTML con voto alla cieca; `pnpm bench score` calcola i take usabili e il costo per secondo usabile. `pnpm eval <ruolo>` per i ruoli LLM, con i primi esempi fissi per il direttore della fotografia. Un secondo piano può provare il modo con primo e ultimo fotogramma.
_Fatto quando:_ report e punteggi si generano con il fornitore finto.

**T1.7 Test reale.** Esecuzione di `config/bench/week1.yaml` su fal (circa 45 $), voti di 3 persone alla cieca, voti nel catalogo (`quality`), id dei modelli verificati e aggiornati nel seme. Da verificare anche id e capacità dei punti d'accesso con primo e ultimo fotogramma, da aggiungere al catalogo come voci a parte. Facoltativo: provare il modo con primo e ultimo fotogramma su 3 inquadrature con le voci che lo dichiarano (circa 11–21 $ in più, stima sui prezzi del seme per 45 s di video a modello).
_Fatto quando:_ sono scelti i modelli immagine e video per l'MVP e la scelta è registrata in `docs/decisioni.md`.
Nota: Seedance potrebbe rifiutare anche volti realistici inventati, se non sono registrati come asset virtuali. È una delle cose che il test misura.

## M2 — Impostazioni (6–9 giornate)

_Leggere: architettura §4.5, §4.6, §6, §10._

**T2.1 Database e coda locali.** SQLite con Drizzle (si conferma D11), migrazioni, scelta del driver (`better-sqlite3` oppure `node:sqlite`) e del portachiavi; coda interna salvata in SQLite, con nuovi tentativi e limiti di concorrenza.
_Fatto quando:_ un lavoro messo in coda riparte dopo la chiusura e la riapertura dell'app.

**T2.2 Configurazione nel database.** Tabelle `troupe_drafts`, `troupe_releases`, `instruction_versions`; `pnpm troupe import` ed `export`; `ConfigSource` dal database, che consegna anche le scelte dell'utente (`settings`, D36); ricarica immediata senza riavvio; se la nuova release non è valida si tiene la precedente.
_Fatto quando:_ pubblicare una release cambia subito il comportamento dei lavori in coda, senza riavviare.

**T2.3 Moduli generati dagli schemi.** Pagine Connessioni, Modelli, Ruoli, Preset (stili, generi, toni, fotografia, tag, movimenti di macchina) e Funzioni e limiti generate dagli schemi Zod, con validazione in linea; delle chiavi si vede solo "presente" o "mancante".
_Fatto quando:_ dalle impostazioni avanzate si cambia il modello dello sceneggiatore.

**T2.4 Istruzioni.** Editor con versioni e varianti, elenco delle variabili, anteprima con un input di esempio.
_Fatto quando:_ si crea una nuova versione senza toccare la precedente.

**T2.5 Prova.** Esecuzione di un ruolo dalla bozza della troupe su un input di esempio, con risultato, costo e scontrino `draft_test`.
_Fatto quando:_ si vede il risultato prima di pubblicare.

**T2.6 Pubblica, storico, ripristino.** Differenze rispetto alla release attiva, nota obbligatoria, ripristino come nuova release.
_Fatto quando:_ un ripristino riporta la configurazione precedente in meno di un minuto.

**T2.7 Connessioni e chiavi.** Chiavi nel portachiavi del sistema (Electron `safeStorage`), riferimenti `secret:NOME` accanto a `env:NOME`, in sola scrittura, mai nei log né negli export (D25, D29). Procedura guidata al primo avvio e pagina «Impostazioni > Connessioni», divisa in gruppi (testo, immagini, video, musica ed effetti, voci): per ogni gruppo «Aggiungi un fornitore» apre una finestra in tre passi (fornitore, chiave con «Prova la connessione», modelli da aggiungere con un eventuale tetto di spesa mensile), dettaglio del fornitore (Modelli, Chiave, Chi lo usa) e pagina «Chi fa cosa». Si sceglie il modello predefinito di ogni fornitore e il fornitore predefinito del gruppo. I servizi attivati e i predefiniti si salvano nella tabella `settings` e valgono subito, senza pubblicare una release (D36). Un promemoria invita a impostare un limite di spesa anche nel pannello del fornitore. Ogni adapter ha una prova di connessione che non costa.
_Fatto quando:_ da una chiave incollata nella procedura il programma chiama il fornitore; la chiave non si rivede più dopo l'inserimento e non compare in nessun log né export; una chiave sbagliata dà «Chiave non valida».

## M3 — Storia, personaggi e luoghi (10–14 giornate)

_Leggere: architettura §3.1, §5 e §6; contesto del progetto, "Flusso utente" (con le modifiche del 20/10: D18)._

**T3.1 Costi, tetti di spesa e scelta del servizio.** La stima della troupe mostrata in dollari prima di ogni generazione; limiti facoltativi e senza valori preimpostati (D36): mensile per fornitore (`monthly_cap_usd`), per film (`film_budget_usd`) e «conferma sopra una cifra» (`confirm_above_usd`), salvati nella tabella `settings`; per ogni fornitore, quanto speso nel mese e quanto manca al limite, con avviso all'80% e al limite; spesa calcolata dagli scontrini; errore `spend_cap_reached` (D30). Il componente condiviso «Cambia servizio» (D36): chiede a `troupe.options` l'elenco dei servizi attivati e adatti, con nome, costo stimato e voto delle prove, e la stima segue il servizio scelto. Lo riusano tutti i pulsanti che generano immagini, video e suoni (T3.6, T3.7, T4.1, T4.2, T4.3, T4.9, T5.6).
_Fatto quando:_ senza alcun limite acceso nulla viene bloccato e si vede solo la spesa; con un limite acceso, una generazione che lo supera chiede conferma e l'utente può alzarlo o proseguire; cambiando servizio cambiano nome, costo e stima mostrati; i test sui calcoli passano.

**T3.2 Progetto.** Wizard "La tua idea": idea, genere, tono, stile, fotografia e durata, tutto dai preset. Il progetto ricorda la sua fase (§3.1).
_Fatto quando:_ si crea un film in meno di un minuto senza leggere un termine tecnico.

**T3.3 Moderatore.** Controllo dei testi dell'utente prima di ogni spesa (impostazione prudente), comprese le richieste di modifica allo sceneggiatore.
_Fatto quando:_ il nome di una persona famosa o una richiesta vietata vengono fermati con un messaggio semplice e un suggerimento.

**T3.4 Bozza della sceneggiatura.** `screenwriter` nei modi `draft` e `revise`: bozza breve con personaggi e luoghi proposti; «Parla con lo sceneggiatore» come richiesta a turno singolo, moderata; versioni.
_Fatto quando:_ la bozza ha scene riassunte e proposte di personaggi e luoghi; ogni richiesta di modifica crea una nuova versione e la precedente resta consultabile.

**T3.5 Casting.** Numero di personaggi (non oltre `limits.max_characters`), proposte dalla bozza e durante le scene, tag e dettagli facoltativi; card Aggiungi / Cambia / Scarta; il cast attuale è sempre nell'input.
_Fatto quando:_ le proposte sono quante richieste, rispettano trama e stile, senza doppioni; i dettagli facoltativi si possono ignorare e le istruzioni funzionano anche a campi vuoti.

**T3.6 Schede personaggio.** Character designer a tre angolazioni, scelta, blocco del volto; «Cambia servizio» (T3.1).
_Fatto quando:_ un personaggio bloccato ha tre immagini di riferimento salvate.

**T3.7 Luoghi.** `set_designer`: 3–4 immagini per luogo, scelta; i luoghi scelti entrano nella Bibbia con le immagini di riferimento; «Cambia servizio» (T3.1).
_Fatto quando:_ ogni luogo ha un'immagine scelta e salvata.

**T3.8 Riepilogo e stesura ufficiale.** Confronto, fatto dal codice, tra la bozza e la Bibbia (collegamento `proposalId`); per ogni differenza «Adatta la storia», «Cambia la mia scelta» o «Va bene così»; il passo si salta se non ci sono differenze. Poi la stesura ufficiale (`screenwriter` in modo `final`), modificabile come testo, con versioni.
_Fatto quando:_ scartare un personaggio mostra la differenza giusta con le tre scelte; la stesura usa solo cast e luoghi scelti più gli elementi accettati; ogni modifica crea una nuova versione.

**T3.9 Inquadrature.** Aiuto regista: scene → ShotSpec → striscia di card; movimento di macchina scelto da `camera_movements`.
_Fatto quando:_ ogni inquadratura ha gli stati di continuità di entrata e uscita e un movimento valido.

**T3.10 Valutazioni.** Cinque esempi fissi ciascuno per moderatore, casting, sceneggiatore (bozza e stesura) e aiuto regista.
_Fatto quando:_ `pnpm eval` produce un report per ognuno.

## M4 — Storyboard, immagini dell'inquadratura e video (7–10 giornate)

_Leggere: architettura §4.7–4.11, §5.2 e §7._

**T4.1 Storyboard.** Due o tre varianti per inquadratura, scelta; «Cambia servizio» (T3.1).
_Fatto quando:_ la variante scelta diventa il riferimento visivo della card.

**T4.2 Imposta le immagini.** Funzione `keyframes`. Per ogni inquadratura l'utente imposta immagini come ispirazione, primo o ultimo fotogramma (generate o prese da un take); il movimento si sceglie da una lista; l'ultimo fotogramma mancante lo genera `storyboard_artist` in modo `end_frame`, con «Cambia servizio» (T3.1); il router rispetta la scelta (D20).
_Fatto quando:_ l'utente fissa primo e ultimo fotogramma e il take parte da lì; con una combinazione che nessun modello accetta riceve un messaggio semplice, senza spese e senza declassamenti in silenzio.

**T4.3 Take video.** Pipeline completa di §7: stima, tetti, coda, polling, copia, spesa. «Genera» ha accanto «Cambia servizio» (T3.1): la richiesta porta il `modelId` scelto, il router lo tratta come requisito (`no_eligible_model` con un messaggio semplice, mai un altro servizio in silenzio) e lo scontrino e il take registrano il servizio che ha lavorato davvero (D36).
_Fatto quando:_ un take compare nella card e lo scontrino riporta il costo reale; lo stesso movimento rigenerato con un altro servizio dà un secondo take che dice con quale servizio è stato fatto; un servizio non adatto alla richiesta è rifiutato senza spese.

**T4.4 Aggiornamenti live.** SSE per lo stato delle card.
_Fatto quando:_ la card passa da "in lavorazione" a "pronto" senza ricaricare la pagina.

**T4.5 Rifiuti ed errori.** Messaggi semplici, nessun tentativo di aggirare i filtri.
_Fatto quando:_ un rifiuto simulato non registra spesa e non prova altri modelli.

**T4.6 Rigenera e scegli.** Più take per inquadratura, scelta del take; «Usa un fotogramma del video come punto di partenza» (estratto con ffmpeg).
_Fatto quando:_ si può rigenerare una sola inquadratura senza toccare le altre, e partire da un fotogramma di un take.

**T4.7 Quanto ho speso.** Pannello della spesa costruito sugli scontrini: per film, ruolo e modello, e la spesa del mese di ogni connessione rispetto al suo tetto.
_Fatto quando:_ si vede quanto è costato ogni film, per ruolo e per modello.

**Opzioni** (funzioni spente finché non sono pronte; si decide dopo T4.7 se entrano nell'MVP):

**T4.8 Caricamento di luoghi e oggetti** (+2–3 giornate). Funzione `image_upload`: controllo facoltativo con un modello con visione, rifiuto delle immagini con persone con un messaggio semplice (impostazione prudente, D19).
_Fatto quando:_ una foto di una stanza si carica; una foto con una persona viene rifiutata.

**T4.9 Ritocco col pennello** (+3–4 giornate). Funzione `retouch`: editor con maschera, `retoucher` (togli, sostituisci, cambia colore) con «Cambia servizio» (T3.1), regole R3 e R6, controllo del testo (D21).
_Fatto quando:_ si toglie un oggetto da un'immagine del set e le inquadrature che la usano diventano gialle.

**T4.10 Moodboard** (+3–4 giornate). Funzione `moodboard` (D37), da fare a piccoli passi: (1) tabelle, contratti e modulo `moodboard` con palette e consigli modificabili a mano; (2) ruolo `moodboard_designer` e ruolo `moodboard_artist` (immagini di riferimento, con «Cambia servizio»); (3) caricamento di immagini e ruolo `image_analyst` (descrizione, atmosfera, luce, controllo di persone e marchi; colori dominanti calcolati dal codice); (4) il campo `moodboard` negli ingressi dei ruoli che scrivono o generano immagini, la sorgente «Dal moodboard» in «Imposta le immagini» e la regola R9. Le istruzioni dei tre ruoli si scrivono insieme all'autore.
_Fatto quando:_ un film senza moodboard funziona come prima; con un moodboard generato o caricato, palette e consigli arrivano alle istruzioni del direttore della fotografia; un'immagine con una persona viene rifiutata con un messaggio semplice; cambiare la palette fa ingiallire in modo leggero i take già girati.

## M5 — Continuità, suoni e montaggio (9–14 giornate)

_Leggere: architettura §5.5, §8 e §9._

**T5.1** Regole R1–R8 (R9 arriva con il moodboard, T4.10), con segnalazioni gialle (R4 e R8 con avviso leggero) e motivo.
**T5.2** Segretaria di edizione sulle incoerenze di trama.
**T5.3** Azioni sul giallo: Rigenera o Ignora.
**T5.4** Fornitori audio: mini-ricerca su musica ed effetti sonori (API, prezzi, diritti commerciali, durata massima), voci nel catalogo e prova d'ascolto. La ricerca del 13/10 copre solo la musica.
_Fatto quando:_ musica ed effetti hanno un fornitore scelto e collegato dalla pagina Connessioni, e la scelta è registrata in `docs/decisioni.md`.
**T5.5** Tracce audio: tabelle `audio_tracks`, `audio_clips` e `audio_variants`, ruoli `composer`, `sfx_artist` e `sound_planner` («Suggerisci i suoni»), adapter audio, funzioni `music` e `sound_effects`. Caricamento di file propri su qualunque traccia; i file caricati non vanno mai a un fornitore AI (D27).
_Fatto quando:_ la musica di una scena e un effetto su un'inquadratura si generano, si cambiano tra le varianti e si eliminano senza toccare il video; un file caricato finisce nel mix senza uscire dal computer.
**T5.6** Editor delle tracce: Video (audio originale spento), Dialoghi (registrazioni caricate, come voce fuori campo), Musica ed Effetti, con muto e volume; pannello del blocco (descrizione, «Genera» con «Cambia servizio» (T3.1), «Cambia» tra le varianti, «Carica un file», «Elimina»).
**T5.7** Montaggio: normalizzazione con l'audio originale tolto, concatenazione, mix delle tracce con livellamento del volume, titoli con la dicitura AI.
**T5.8** Esportazione: il file finale nella cartella del progetto.

_Fatto quando:_ un corto di 60 secondi con due personaggi si esporta con musica, effetti, titoli e dicitura; una modifica a monte accende il giallo giusto con il motivo giusto; cambiare la musica o un effetto e riesportare non rigenera i video.

## M6 — Installatore e beta chiusa (8–12 giornate)

_Leggere: architettura §2, §10 e §12._

**T6.1** Onboarding e rifinitura dell'interfaccia, procedura guidata al primo avvio compresa.
**T6.2** Licenza e avviso: `LICENSE` AGPL-3.0, README con l'avviso di uso responsabile e il link alle donazioni (`.github/FUNDING.yml`), nessuna telemetria.
**T6.3** Esporta e importa un progetto, come copia di sicurezza.
**T6.4** Impacchettamento con Electron: `apps/desktop`, installatori per Windows, macOS e Linux costruiti dalla CI, portachiavi, aggiornamenti da GitHub Releases. Senza firma del codice i sistemi mostrano un avviso all'installazione.
_Fatto quando:_ da un computer senza Node l'installatore avvia l'app, un film di prova si genera con il fornitore finto e un aggiornamento si scarica.
**T6.5** Prove su Windows, macOS e Linux: installazione pulita, aggiornamento, chiavi, cartelle dei progetti.
**T6.6** Test con 5–10 persone non tecniche: dove si bloccano, cosa non capiscono.

_Fatto quando:_ almeno 5 persone non tecniche installano Filmzy, collegano i loro servizi e finiscono un corto da sole.

## Fuori dal codice

- [ ] Account fal con limite di spesa e un fornitore LLM, per provare
- [ ] Budget del test di coerenza: circa 45 $
- [x] Licenza del codice: AGPL-3.0 (D28)
- [ ] Link per le donazioni (GitHub Sponsors, Ko-fi o altro) e `.github/FUNDING.yml`
- [ ] Rendere pubblico il repository: prima `LICENSE`, avviso di uso responsabile e link alle donazioni
- [ ] Mockup in Figma e loro esportazione in `design/riferimenti/`
- [ ] Parere legale prima di una versione 1.0 pubblica: obblighi di trasparenza (art. 50 dell'AI Act) e uso responsabile
- [ ] Consulenza legale prima di accendere i volti reali
- [ ] Certificato per la firma del codice (Windows e macOS), oppure accettare gli avvisi sugli installatori non firmati
- [ ] 5–10 tester non tecnici
- [x] Nome del prodotto: Filmzy (D17)

## Dopo l'MVP

- **Cast personale:** test dedicato sui volti reali; poi consenso dato dalla persona stessa (link, selfie dal vivo, frase per la voce) e router limitato ai modelli che accettano volti verificati.
- **Marcatura C2PA** (`c2pa_marking`): dopo il parere legale (D31).
- **Modifica vera del video** (`video_edit`): prova su 3–4 clip, con costo e affidabilità misurati.
- **Fase 2:** generazione delle voci per personaggio (nella traccia Dialoghi) e labiale.
- **Fase 3:** timeline modificabile, luoghi ricorrenti, doppiaggio.
