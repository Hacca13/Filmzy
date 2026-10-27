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
| **M1** Troupe | troupe funzionante su file, bench col fornitore finto, id e prezzi veri verificati | 5–7 |
| **M2** Impostazioni | database e coda locali, configurazione nel database, prova, pubblicazione, storico, connessioni guidate con chiavi nel portachiavi | 6–9 |
| **M3** Storia, personaggi e luoghi | costi e tetti di spesa, progetto, moderatore, bozza, casting, schede, luoghi, riepilogo, stesura, inquadrature | 10–14 |
| **M4** Storyboard, immagini e video | bench dei modelli (circa 45 $), storyboard, immagini dell'inquadratura, take video con polling, spesa | 7–10 |
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

- Account fal con **limite di spesa** impostato nel pannello di fal, e la chiave API: servono per provare, come per ogni utente. In M1 la spesa è di pochi dollari (T1.3 prova una immagine e un video veri); il bench da circa 45 $ è in M4 (D40).
- La chiave di un fornitore LLM (nel seme: Anthropic).
- Node.js LTS e pnpm. Docker non serve. Per costruire gli installatori (M6) bastano le macchine della CI di GitHub.

## M0 — Fondamenta (2–3 giornate)

_Leggere: architettura §2, §3, §4.3–4.6._

**T0.1 Monorepo.** pnpm workspaces + Turborepo, TypeScript strict, ESLint + Prettier, Vitest, GitHub Actions.
_Fatto quando:_ `pnpm check` (lint, typecheck, test, build e stile) passa in locale e in CI, su Ubuntu e su Windows, e ognuno dei controlli fallisce davvero se introduci un errore apposta.

**T0.2 Ambiente locale.** `.env.example` per lo sviluppo; `apps/api` (server locale) e `apps/web` vuote ma avviabili.
_Fatto quando:_ da un clone pulito, `pnpm install && pnpm dev` avvia tutto, senza Docker.

**T0.3 Contratti di base.** In `packages/contracts`: ruoli con schemi di input e output (§5.3, compresi i tre modi dello sceneggiatore, il casting con tag e dettagli, `set_designer`, `retoucher` e i due modi di `storyboard_artist`), ShotSpec 0.2 con le immagini, Bibbia con profilo del personaggio e proposte della bozza, scontrino, stime e tetti di spesa, eventi, schemi della configurazione (connessioni e modelli con `monthly_cap_usd`, catalogo con `input_modes` e `label`, ruoli, istruzioni, preset, funzioni e limiti, ambienti, piano di bench). Per la scelta del servizio (D36, architettura §5.6): `modelId` facoltativo nel contesto delle richieste di generazione, `ModelOption`, le scelte dell'utente (`UserSettings`: servizi attivati, predefiniti dei gruppi, regolazioni dei ruoli `RoleSettings`, limiti), `ModelGroup`, lo schema di `manifest.json` delle istruzioni (un `manifest.json` per ruolo nel seme, D38), `modelId` e `modelLabel` nello scontrino. In più i codici di errore del dominio (§4.10) e il corpo dell'errore con `code`, `retryable` e `details`, perché l'interfaccia capisca perché una chiamata è fallita.
_Fatto quando:_ ci sono test di validazione su esempi validi e non validi.

**T0.4 Validatore della configurazione.** `ConfigSource` da file, risoluzione di `env:` e `secret:`, adattamenti d'ambiente con `"*"`, controlli di §4.6, hash; comando `pnpm troupe check`. La `ConfigSource` consegna anche le scelte dell'utente (`UserSettings`, D36): da file non ce ne sono e valgono tutte le voci della release (§4.3).
_Fatto quando:_ i file di seme passano (con avvisi per gli id da verificare); un riferimento rotto, un parametro non accettato o una variabile inesistente danno errori leggibili che nominano ruolo e campo.

**T0.5 Confini imposti.** Regole sugli import (§3) e controllo che vieta id di modelli e URL di fornitori nel codice.
_Fatto quando:_ un import vietato o un id di modello in `apps/` fanno fallire la CI.

**T0.6 Fornitore finto.** Adapter `fake` per LLM, immagini e video, con fixture.
_Fatto quando:_ un test esegue un ruolo LLM e uno video senza rete.

## M1 — Troupe (5–7 giornate)

_Leggere: architettura §4 per intero. In M1 la configurazione arriva dai file; il database arriva in M2._

**T1.1 Ruoli LLM.** `troupe.run`: risoluzione della configurazione, adapter `anthropic` e `openai_compatible` con AI SDK, output strutturato con riparazione, pochi nuovi tentativi secondo §4.10 (nessuna riserva: D36), scontrino su `ReceiptSink`.
_Fatto quando:_ il direttore della fotografia risponde sia con il fornitore finto sia con un LLM vero; un errore tecnico simulato dà pochi tentativi e poi si ferma con codice e dettagli, un rifiuto simulato non riprova.

**T1.2 Istruzioni.** Caricamento di `manifest.json` e delle versioni (D38), varianti per famiglia (`append`, `replace`), rendering LiquidJS in modalità rigorosa, con le variabili facoltative a `null`, scelta della versione per ruolo (consigliata se l'utente non ha scelto).
_Fatto quando:_ una variabile inesistente è un errore di validazione, non un prompt con un buco; con una versione nuova nel manifest, un ruolo fissato alla vecchia continua a usare la vecchia.

**T1.3 Adapter fal e storage.** Invio in coda, polling, retention breve, copia immediata su `AssetStore` (cartella locale). Niente webhook né verifica delle firme (D29). Per le immagini, anche la modifica di un'immagine data (con maschera o con la zona evidenziata).
_Fatto quando:_ col fornitore finto un'immagine, una modifica e un video passano tutta la catena (coda, polling, copia nella cartella, scontrino completo). La prova con fal **vero** si fa insieme a T1.7, perché prima gli id dei punti d'accesso nel seme sono segnaposto e bloccano le chiamate reali (§4.6 punto 7): costa pochi dollari.

**T1.4 Traduttori.** `kling`, `seedance`, `gemini_omni`, `image_generic`; segnaposto `[[char:id]]`; durata, formato e risoluzione portati ai valori ammessi; modi d'ingresso della voce scelta (riferimenti, primo e ultimo fotogramma, D20).
_Fatto quando:_ la stessa ShotSpec produce tre richieste valide, verificate su fixture, e una richiesta con primo e ultimo fotogramma per le famiglie che la accettano.

**T1.5 Router.** Filtro, ordinamento per politica; servizio scelto dall'utente come requisito (`modelId`, D36) e `troupe.options`.
_Fatto quando:_ ci sono test unitari sui casi principali: durata non ammessa, troppi riferimenti, volti reali richiesti, combinazione di immagini non supportata (nessun declassamento in silenzio), servizio scelto non attivato o non adatto (`no_eligible_model`, senza passare a un altro). Le scelte dell'utente entrano nei test come dati, senza database.

**T1.6 Bench e valutazioni.** `apps/bench`: `pnpm bench run <piano>` esegue la matrice e salva in `bench-output/<run>/` video, scontrini e un report HTML con voto alla cieca; `pnpm bench score` calcola i take usabili e il costo per secondo usabile. `pnpm eval <ruolo>` per i ruoli LLM, con i primi esempi fissi per il direttore della fotografia. Un secondo piano può provare il modo con primo e ultimo fotogramma.
_Fatto quando:_ report e punteggi si generano con il fornitore finto.
Fatto il 21/10: cinque esempi fissi per il direttore della fotografia (con il fornitore finto passano quattro su cinque, e il quinto fallisce per il motivo giusto: il finto risponde sempre lo stesso prompt e non cita il secondo personaggio). Il bench stima la spesa e si ferma sopra il `budget_usd` del piano, e con i fornitori veri chiede conferma (D41). Rimandati: il secondo piano con primo e ultimo fotogramma (era facoltativo) e la scelta a mano della scheda migliore, che è un passo dell'interfaccia (T4.0).

**T1.7 Id e prezzi veri (gratis).** Sul sito dei fornitori: id dei punti d'accesso, prezzi, durate, **parametri davvero accettati** e combinazioni di ingressi (`input_modes`, D20) verificati e scritti nel seme, con `checked` aggiornato; le voci verificate passano da `testing` ad `active` e gli id segnaposto restano `testing` finché non si trovano. Nessuna chiamata a pagamento: i voti di qualità arrivano con il bench in T4.0 (D40).
_Fatto quando:_ `pnpm troupe check` non avvisa più su id segnaposto e prezzi vecchi dei modelli che l'MVP usa davvero.
Nota dalla prova di T1.1 (21/10): nel seme l'id del modello di testo era sbagliato di una cifra, e quel modello **non accetta la temperatura**, che il catalogo invece dichiara. Un parametro dichiarato ma ignorato è peggio di uno mancante: lo slider «Creatività» sembrerebbe funzionare senza fare niente (D38).

Fatto il 21/10 (`pnpm troupe check` è pulito: nessun errore, nessun avviso). Cosa è venuto fuori, oltre a id e prezzi:
- **Niente prompt negativo.** Nessuno dei tre video lo accetta: non si manda più (resta nello scontrino, perché dice cosa avevamo chiesto).
- **La durata è testo** per Kling e Seedance (`"8"`), un numero per Gemini Omni.
- **Kling prende anche primo e ultimo fotogramma** sullo stesso punto d'accesso: la domanda aperta di D20 ha una risposta e la funzione `keyframes` ha un servizio.
- **Kling non ha la risoluzione** e **Gemini Omni non ha un interruttore per l'audio**: l'operatore di ripresa ora chiede solo le proporzioni, perché i `params` di un ruolo valgono per tutti i suoi candidati (§4.6 punto 3).
- **Generare e modificare un'immagine sono id diversi** su fal: il catalogo ha due voci per Nano Banana e due per Seedream, e ritocco e storyboard usano quelle che ricevono immagini. Lì le immagini stanno in una lista sola, quindi il traduttore le accoda invece di sovrascriverle.
- **I modelli di testo non accettano la temperatura** (D42): i ruoli non la impostano più.
- **Seedance 2 costa il doppio di quanto stimato** (0,3034 $/s a 720p invece di 0,15): c'è anche la voce «Veloce» a 0,2419. Con i prezzi veri `config/bench/week1.yaml` costerebbe **48,79 $** (43,25 con Seedance Veloce, 11,27 con una matrice ridotta): il budget del piano è 50 $, quindi passa per poco.
- Resta da fare la **prova vera con fal** (T1.3): ora gli id non bloccano più, ma costa qualche dollaro e la fa l'autore quando può.

## M2 — Impostazioni (6–9 giornate)

_Leggere: architettura §4.5, §4.6, §6, §10._

**T2.1 Database e coda locali.** SQLite con Drizzle (si conferma D11), migrazioni, scelta del driver (`better-sqlite3` oppure `node:sqlite`) e del portachiavi; coda interna salvata in SQLite, con nuovi tentativi e limiti di concorrenza. Il database e i file stanno nella **cartella dati dell'utente**, fuori dalla cartella del programma (architettura §6.1): le migrazioni si applicano all'avvio, in transazione, dopo una copia di sicurezza del file, e un database scritto da una versione più nuova non si apre, con un messaggio chiaro (D44).
_Fatto quando:_ un lavoro messo in coda riparte dopo la chiusura e la riapertura dell'app; una migrazione lascia una copia di sicurezza e, se fallisce, l'app riparte dai dati di prima.
Fatto il 22/10: driver `better-sqlite3` e portachiavi `safeStorage` scelti (D45), `packages/db` con cartella dei dati, migrazioni e coda, e l'esecutore dei lavori nel server (architettura §7.1). Le chiavi vere si scriveranno in T2.3, con l'interfaccia `SecretStore`: fino a Electron (M6) arrivano dalle variabili d'ambiente.

**T2.2 Configurazione nel database.** Tabelle `troupe_drafts`, `troupe_releases`, `instruction_versions`; `pnpm troupe import` ed `export`; `ConfigSource` dal database, che consegna anche le scelte dell'utente (`settings`, D36); ricarica immediata senza riavvio; se la nuova release non è valida si tiene la precedente.
_Fatto quando:_ pubblicare una release cambia subito il comportamento dei lavori in coda, senza riavviare.
Fatto il 22/10: lo schema di una release sta nei contratti, il database tiene bozza, release, versioni delle istruzioni e scelte dell'utente, e `DbConfigSource` consegna tutto alla troupe già adattato all'ambiente. Un test prova il criterio: si cambia il servizio del moderatore, si pubblica e la chiamata dopo usa il servizio nuovo, senza riavviare né svuotare cache. La riga di comando (`check`, `import`, `export`) è passata nell'app, perché `import` ed `export` hanno bisogno del database. Le tabelle delle istruzioni ci sono e il magazzino le sa leggere e scrivere: a riempirle con l'editor è T2.4.

**T2.3 Moduli generati dagli schemi.** Pagine Connessioni, Modelli, Ruoli, Preset (stili, generi, toni, fotografia, tag, movimenti di macchina) e Funzioni e limiti generate dagli schemi Zod, con validazione in linea; delle chiavi si vede solo "presente" o "mancante", e si scrivono con `SecretStore` (file cifrato nella cartella dati, non nel database: D45). Fra le impostazioni semplici: «Audio originale dei take», spento, con la spiegazione (la voce cambia da una generazione all'altra, e su alcuni servizi l'audio costa di più) e la nota sui servizi che lo generano sempre (D43); e il controllo degli aggiornamenti, con il pulsante per cercarli subito (D44).
_Fatto quando:_ dalle impostazioni avanzate si cambia il modello dello sceneggiatore.
Fatto il 25/10: la pagina «Avanzate» ha i pannelli «Bozza» per connessioni, modelli, ruoli, preset, funzioni e limiti, disegnati dagli schemi dei contratti, con errori in linea; si salva, si pubblica con una nota, si butta via, si riparte dal seme. Un test del server prova il criterio (cambio il modello dello sceneggiatore, pubblico, e la lettura successiva vede il modello nuovo). Le chiavi si vedono solo «presenti» o «mancanti»; **scriverle funziona solo con il portachiavi, cioè dopo Electron** (D46), e prima il server risponde `secret_store_unavailable`. «Audio dei take» e «Aggiornamenti» ci sono; il controllo vero degli aggiornamenti è T6.4. Non fatti: la procedura guidata e la pagina «Connessioni» per l'utente, «Chi fa cosa» e il ricontrollo delle scelte (T2.7).

**T2.4 Istruzioni.** Editor con versioni e varianti, elenco delle variabili, anteprima con un input di esempio; caricamento di un file di istruzioni proprio (con un modello da scaricare e un errore che nomina la variabile sbagliata); avviso quando arriva una versione nuova, con il suo registro dei cambiamenti (D38).
_Fatto quando:_ si crea una nuova versione senza toccare la precedente; un file proprio caricato si sceglie per un ruolo e uno con una variabile inesistente è rifiutato con un messaggio chiaro.
Fatto il 26/10: pagina «Istruzioni» nelle Impostazioni, per ruolo: versioni del programma e dell'utente, editor con anteprima sull'esempio fisso, «Carica un file», «Scarica un modello», scelta con «Torna ai valori predefiniti», avviso di versione nuova col registro dei cambiamenti e avviso per il moderatore. Le versioni dell'utente partono da 101 (D47). Test del server: crea una versione senza toccare la precedente, la sceglie e la troupe legge il testo nuovo; un testo con una parola che non esiste è rifiutato col suo nome. **Non fatto:** l'editor delle varianti per famiglia (si copiano da una versione di partenza) e la prova col modello vero (T2.5).

**T2.5 Prova.** Esecuzione di un ruolo dalla bozza della troupe su un input di esempio, con risultato, costo e scontrino `draft_test`.
_Fatto quando:_ si vede il risultato prima di pubblicare.
Fatto il 27/10: pannello «Prova» nella pagina Avanzate: si sceglie un ruolo di testo, si vede il servizio e la stima (`troupe.estimate`), si preme «Prova con un esempio fisso» e si vedono esempio, risultato, costo vero contro stima e durata. Esegue la **bozza salvata** con la stessa troupe (D48), e lo scontrino `draft_test` resta nella nuova tabella `generations`, dove ora finisce ogni scontrino, anche della troupe di esercizio. Test del server: la stima non lascia scontrini; la prova cambia con la bozza e non con la release; una bozza che non si esegue dà un errore col suo codice. **Non fatto:** la prova di immagini e video (M4) e i tetti di spesa sulla prova (T3.1): per ora l'unica protezione è il pulsante dopo la stima.

**T2.6 Pubblica, storico, ripristino.** Differenze rispetto alla release attiva, nota obbligatoria, ripristino come nuova release.
_Fatto quando:_ un ripristino riporta la configurazione precedente in meno di un minuto.
Fatto il 27/10: «Pubblica» mostra **cosa cambia** (voce per voce, con i campi) prima della nota obbligatoria; il pannello «Storico» elenca le versioni («Versione 7», dalla più recente, con quella attiva) e «Ripristina» mostra cosa tornerebbe com'era, propone la nota «Ripristino della versione N» e crea una versione nuova (D49). Un test del server prova il ripristino (la configurazione di prima torna, lo storico resta lineare, in meno di un minuto) e che una bozza con modifiche non pubblicate non viene toccata. **Non fatto:** «Salva su file» (serve la finestra del sistema per scegliere la cartella: M6).

**T2.7 Connessioni e chiavi.** Chiavi nel portachiavi del sistema (Electron `safeStorage`), riferimenti `secret:NOME` accanto a `env:NOME`, in sola scrittura, mai nei log né negli export (D25, D29). Procedura guidata al primo avvio e pagina «Impostazioni > Connessioni», divisa in gruppi (testo, immagini, video, musica ed effetti, voci): per ogni gruppo «Aggiungi un fornitore» apre una finestra in tre passi (fornitore, chiave con «Prova la connessione», modelli da aggiungere con un eventuale tetto di spesa mensile), dettaglio del fornitore (Modelli, Chiave, Chi lo usa) e pagina «Chi fa cosa». I gruppi sono testo, lettura immagini, immagini, video, musica ed effetti, voci. Si sceglie il modello predefinito di ogni fornitore e il fornitore predefinito del gruppo; la pagina «Chi fa cosa» permette, per ogni ruolo, di cambiare fornitore, modello, creatività e versione delle istruzioni (D38). I servizi attivati e i predefiniti si salvano nella tabella `settings` e valgono subito, senza pubblicare una release (D36). Un promemoria invita a impostare un limite di spesa anche nel pannello del fornitore. Ogni adapter ha una prova di connessione che non costa.
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

**T4.0 Bench dei modelli video (circa 49 $ con i prezzi verificati il 21/10, D40).** Prima di generare video veri: esecuzione di `config/bench/week1.yaml` su fal, voti di 3 persone alla cieca, voti nel catalogo (`quality`), che il router usa per mettere in fila i candidati. Facoltativo: provare il modo con primo e ultimo fotogramma su 3 inquadrature con le voci che lo dichiarano (circa 11–21 $ in più, stima sui prezzi del seme per 45 s di video a modello). Se il budget è stretto si parte da una matrice ridotta (2 inquadrature, 2 take) e si allarga solo se i risultati non sono chiari.
_Fatto quando:_ sono scelti i modelli immagine e video per l'MVP e la scelta è registrata in `docs/decisioni.md`.
Nota: Seedance potrebbe rifiutare anche volti realistici inventati, se non sono registrati come asset virtuali. È una delle cose che il bench misura.
Nota da T1.6: il bench genera tutte le immagini delle schede (angolazioni × tentativi) ma come riferimento prende la prima riuscita. Qui serve il passo che manca: guardare `schede.json`, scegliere la migliore per ogni personaggio e rilanciare la matrice con quella.

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

**T4.10 Moodboard** (+3–4 giornate). Funzione `moodboard` (D37), da fare a piccoli passi: (1) tabelle, contratti e modulo `moodboard` con palette e consigli modificabili a mano; (2) ruolo `moodboard_designer` e ruolo `moodboard_artist` (immagini di riferimento, con «Cambia servizio»); (3) caricamento di immagini e ruolo `image_analyst` (descrizione, atmosfera, luce; le immagini con persone entrano solo per l'analisi, marchi e minori sospetti si rifiutano; colori dominanti calcolati dal codice; gruppo «Lettura immagini», D38); (4) il campo `moodboard` negli ingressi dei ruoli che scrivono o generano immagini, la sorgente «Dal moodboard» in «Imposta le immagini» e la regola R9. Le istruzioni dei tre ruoli si scrivono insieme all'autore.
_Fatto quando:_ un film senza moodboard funziona come prima; con un moodboard generato o caricato, palette e consigli arrivano alle istruzioni del direttore della fotografia; un'immagine con una persona entra segnata «Solo per l'analisi» e non si può scegliere per un'inquadratura, una con un marchio è rifiutata con un messaggio semplice; cambiare la palette fa ingiallire in modo leggero i take già girati.

## M5 — Continuità, suoni e montaggio (9–14 giornate)

_Leggere: architettura §5.5, §8 e §9._

**T5.1** Regole R1–R8 (R9 arriva con il moodboard, T4.10), con segnalazioni gialle (R4 e R8 con avviso leggero) e motivo.
Nota: le regole non coprono la continuità **tra scene diverse** (architettura §8): è un caso da provare con i tester (T6.6) prima di decidere se serve una regola in più.
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

**T6.1** Onboarding e rifinitura dell'interfaccia, procedura guidata al primo avvio compresa. Anche la **schermata di caricamento** dell'avvio (prompt 04 del 22/10), che oggi è solo il testo «Sto preparando Filmzy…» (§6.2).
**T6.2** Licenza e avviso: `LICENSE` AGPL-3.0, README con l'avviso di uso responsabile e il link alle donazioni (`.github/FUNDING.yml`), nessuna telemetria. La pagina di presentazione del progetto (landing), chiesta col prompt 03, è messa da parte (prompt 04 del 22/10): l'autore voleva una schermata di caricamento (T6.1).
**T6.3** Esporta e importa un progetto, come copia di sicurezza.
**T6.4** Impacchettamento con Electron: `apps/desktop`, installatori per Windows, macOS e Linux costruiti dalla CI, portachiavi, aggiornamenti da GitHub Releases (D44): controllo all'avvio, **finestra sulla home** con le novità della versione e tre scelte — «Aggiorna ora» che scarica e installa, «Ricordamelo più tardi» che torna al prossimo avvio, «Salta questa versione» che non torna finché non esce una versione più nuova — più pulsante e interruttore nelle impostazioni. Senza firma del codice i sistemi mostrano un avviso all'installazione. L'installatore contiene solo il programma compilato: `design/`, `docs/` e gli altri materiali di sviluppo restano nel repository, che può pesare di più (22/10).
_Fatto quando:_ da un computer senza Node l'installatore avvia l'app, un film di prova si genera con il fornitore finto, un aggiornamento si scarica solo dopo l'ok dell'utente e, dopo l'aggiornamento, i film di prima sono ancora lì.
**T6.5** Prove su Windows, macOS e Linux: installazione pulita, aggiornamento, chiavi, cartelle dei progetti.
**T6.6** Test con 5–10 persone non tecniche: dove si bloccano, cosa non capiscono.

_Fatto quando:_ almeno 5 persone non tecniche installano Filmzy, collegano i loro servizi e finiscono un corto da sole.

## Fuori dal codice

- [ ] Account fal con limite di spesa e un fornitore LLM, per provare
- [ ] Budget del bench dei modelli (M4, T4.0): 48,79 $ col piano così com'è, 43,25 $ con Seedance Veloce, 11,27 $ con una matrice ridotta (prezzi verificati il 21/10); in M1 bastano pochi dollari
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
- **Fase 2:** dialoghi (architettura §5.5). Prima una prova su 3–4 clip per scegliere la strada: voce del modello video, col suo labiale e un'identità di voce per personaggio dove il servizio la prevede, oppure voce nostra (`voice_actor`) più un passaggio di labiale (`lip_sync`) che produce un take nuovo. Si misurano costo, qualità del labiale sui primi piani e tenuta della voce fra i take. Poi la traccia Dialoghi si riempie da sola e il doppiaggio (`dialogue_adapter`) diventa possibile.
- **Fase 3:** timeline modificabile, luoghi ricorrenti, doppiaggio.
- **Copia di sicurezza in cloud** (idea del 22/10, da valutare quando ci sarà): una «cartella di backup» scelta dall'utente, dove il programma scrive una copia **chiusa e coerente** (database compattato in un file solo, file dei film, manifest con versione e checksum). Se quella cartella sta in Google Drive, Dropbox, OneDrive o su un NAS, il sincronizzatore fa il resto senza che noi parliamo con nessun servizio: niente credenziali, niente OAuth, funziona con tutti. Più esporta e importa un film o tutto, che è anche il modo onesto di continuare un film su un altro computer. **Vincolo da non dimenticare:** il database **vivo** non va mai in una cartella sincronizzata — SQLite viaggia con i file `-wal` e `-shm`, il sincronizzatore li copia in momenti diversi e il database si corrompe; con due computer che scrivono insieme è garantito. Perciò serve anche un avviso se la cartella dei dati finisce dentro una cartella sincronizzata (§6.1).
