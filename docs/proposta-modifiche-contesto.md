# Filmzy — Proposta di modifiche al contesto del progetto

_20 ottobre 2026._ `docs/contesto-progetto.md` è una copia: l'originale vive nel progetto Claude, dove si prendono le decisioni di prodotto. Questo documento raccoglie il testo da incollare lì; quando l'originale è aggiornato si sostituisce la copia e si cancella questo file. Le decisioni sono D17–D32 e D36–D37 in `docs/decisioni.md`.

## 1. Titolo e nome

Titolo: **Filmzy — Contesto del progetto**. In tutto il documento «Film Gen Ai» diventa «Filmzy» (D17). Togliere dalle «Domande aperte» il nome del prodotto, se c'è.

## 2. Visione: aggiungere in fondo

> **Software libero, in locale (D28, D29).** Filmzy è un programma libero (licenza AGPL-3.0) che si installa sul computer e funziona con le chiavi che l'utente ha presso i servizi AI. Non c'è un server dell'autore, non ci sono account né pagamenti: il progetto si sostiene con donazioni. L'utente risponde dei file che carica e dei contenuti che crea e pubblica; le impostazioni prudenti (moderatore, solo persone generate, dicitura AI nei titoli) restano attive di default.

## 3. Principi: aggiungere il sesto e il settimo

> 6. **Il controllo sta nelle immagini:** l'utente può guidare il risultato (da dove parte un'inquadratura, dove finisce, cosa togliere da un'immagine) sulle immagini, dove un tentativo costa centesimi. Il video si spende per ultimo.
> 7. **I costi sono dell'utente e sempre visibili:** una stima prima di ogni generazione e tetti di spesa che l'utente regola (D30).

## 4. Flusso utente: sostituire l'elenco

> 1. **Idea:** tema, genere, stile visivo, fotografia.
> 2. **La storia:** una bozza breve della sceneggiatura (titolo, trama in una riga, scene riassunte). Se non convince, l'utente chiede una modifica allo sceneggiatore con una frase. Poi, se vuole, il **moodboard** (facoltativo ma consigliato): palette, consigli e immagini di riferimento per il film e per le scene.
> 3. **Personaggi:** l'utente sceglie quanti personaggi vuole; il suggeritore li propone partendo dalla bozza, con un tag (protagonista, antagonista…) e dettagli facoltativi (carattere, comportamento, obiettivo). L'utente approva e il volto viene «bloccato».
> 4. **Luoghi:** per ogni luogo della storia, 3–4 immagini del set tra cui scegliere (e, se la funzione è attiva, il ritocco col pennello).
> 5. **Riepilogo:** il sistema confronta la bozza con cast e luoghi scelti. Per ogni differenza l'utente sceglie «Adatta la storia», «Cambia la mia scelta» o «Va bene così». Se non ci sono differenze il passo non compare. Poi la stesura ufficiale, modificabile come testo normale.
> 6. **Scene:** una fila di card, come una striscia a fumetti. Per ognuna: storyboard → 2–3 varianti → scelta → (facoltativo) «Imposta le immagini» → video → scena successiva. A ogni generazione si può «Cambiare servizio».
> 7. **Film:** voci, musica, montaggio, esportazione, eventuale doppiaggio in altre lingue.

## 5. Feature decise

### Personaggi e suggeritore: sostituire i due momenti

> - Il suggeritore lavora in due momenti:
>   - **all'inizio:** dalla bozza della storia propone il cast, nel numero che l'utente ha chiesto (al massimo 2 nell'MVP), con ruolo nella storia, tag, rapporto con il protagonista e aspetto coerente con lo stile visivo;
>   - **durante:** leggendo la scena successiva suggerisce un nuovo personaggio o propone di riusarne uno esistente.
> - Riceve sempre il cast attuale, per non proporre doppioni.
> - Ogni personaggio ha un nucleo obbligatorio (nome, tag, ruolo, descrizione breve, aspetto) e dettagli facoltativi (carattere, comportamento, obiettivo). I dettagli servono a tenerlo coerente lungo il film; per uno spot o un corto breve si possono ignorare. I tag sono una lista di dati che potrà crescere.

### Nuova sezione: Luoghi e ritocco

> - Per ogni luogo della storia il sistema genera 3–4 immagini del set; l'utente sceglie, e l'immagine scelta diventa il riferimento del luogo nelle inquadrature.
> - **Ritocco col pennello** (funzione opzionale): l'utente evidenzia un elemento di un'immagine, per esempio una lampada, e lo toglie, lo sostituisce o ne cambia il colore. Vale per le immagini (luoghi, storyboard, fotogrammi chiave). Per un video si corregge il fotogramma e si rigenera, oppure si parte da un fotogramma del video. La modifica vera del video si prova dopo l'MVP.
> - Un luogo ritoccato o cambiato fa ingiallire le inquadrature che lo usano.

### Nuova sezione: Immagini dell'inquadratura

> - Per ogni inquadratura l'utente può, se vuole, impostare un'immagine come **ispirazione**, come **primo fotogramma** («da qui parte») o come **ultimo fotogramma** («qui finisce»). Le immagini si generano o si caricano. Se manca l'ultimo fotogramma, il sistema lo genera partendo dal primo, in base al movimento di macchina scelto (resta fermo, avvicinati, allontanati, panoramica).
> - La scelta dell'utente è un requisito: se nessun modello disponibile la accetta, il sistema lo dice con un messaggio semplice e non la cambia in silenzio.
> - Di default decide l'aiuto regista; l'impostazione manuale è facoltativa.

### Nuova sezione: Suono

> - Il suono sta su **tracce separate dal video**: Video (l'audio originale dei take, spento di default), Dialoghi (registrazioni caricate dall'utente, come una voce fuori campo; la generazione delle voci è Fase 2), Musica (un blocco per scena) ed Effetti (agganciati a un'inquadratura, con il secondo in cui partono). Ogni traccia ha muto e volume.
> - Musica ed effetti si generano con modelli a parte. «Suggerisci i suoni» propone musica ed effetti leggendo il copione, e l'utente accetta o scarta ogni proposta. Per ogni blocco si può descrivere il suono («abbaio di un cane»), generarlo, scegliere tra tre varianti o eliminarlo.
> - Cambiare una musica o un effetto costa pochi centesimi e non tocca il video: il mix si rifà a ogni esportazione. L'audio generato dentro i video viene silenziato.
> - L'utente può caricare file audio propri (musica, effetti, registrazioni di voce) su qualunque traccia. I file restano nella cartella del progetto e non vanno mai a un fornitore AI.
> - La timeline libera resta in Fase 3.

### Pannello admin della troupe: sostituire con «Impostazioni»

> - La configurazione della troupe (modelli, connessioni, parametri, istruzioni, preset, funzioni) si cambia da **Impostazioni avanzate**, per chiunque usi l'app: bozza → prova → pubblicazione → storico e ripristino. Non ci sono account né ruoli.
> - **Connessioni:** una procedura guidata, anche al primo avvio, per collegare i servizi (testo, immagini, video, musica ed effetti, voci): si sceglie il servizio, si incolla la chiave, si prova la connessione, si scelgono i modelli da aggiungere (con un eventuale tetto di spesa mensile) e si assegnano ai ruoli in «Chi fa cosa». Le chiavi stanno nel portachiavi del sistema operativo e non si rivedono più dopo l'inserimento.

### Costi e tetti di spesa: sostituire «Sistema a crediti dal primo giorno»

> - Non ci sono crediti: l'utente paga i servizi con le proprie chiavi. Prima di ogni generazione il programma mostra una stima in dollari («circa 1,20 $»).
> - Limiti facoltativi, nessuno preimpostato: mensile per fornitore (si sceglie quando lo si aggiunge), per film e «chiedi conferma sopra una cifra». Il programma mostra quanto si è speso e quanto manca, avvisa quando ci si avvicina al limite e quando lo si raggiunge, e l'utente decide se proseguire; lo storyboard resta il «cancello» prima della spesa sul video.
> - Il programma ricorda di impostare un limite di spesa anche nel pannello di ogni servizio.

### Nuova sezione: Moodboard (D37)

> - Ogni film può avere un moodboard, facoltativo ma consigliato (anche per gli utenti esperti): una palette di colori, consigli su luce, colore, macchina e ritmo, e immagini di riferimento. Vale per tutto il film e può avere una parte per singole scene.
> - Lo si genera con l'app oppure si caricano le proprie immagini: quelle caricate vengono descritte e analizzate da un modello che legge le immagini, e i colori dominanti si calcolano. Le immagini con persone entrano solo per l'analisi (descrizione, atmosfera, colori) e non servono mai a generare; quelle con marchi, personaggi noti o minori sospetti si rifiutano.
> - Palette, consigli e descrizioni guidano le istruzioni di chi scrive e genera le immagini; se cambiano dopo i take, i take già girati ricevono un avviso leggero. Un'immagine del moodboard si può scegliere come immagine di un'inquadratura.

### Nuova sezione: Scelta del servizio per ogni generazione (D36)

> - Per ogni generazione di immagini, video, musica ed effetti l'utente può cambiare servizio (cioè il modello che la esegue), perché uno può funzionare meglio di un altro. Accanto a «Genera» c'è «Cambia servizio»: l'elenco mostra, per ogni servizio, un nome semplice, il costo stimato in dollari e il voto che ha preso nelle prove.
> - Di default lavora il servizio predefinito di quel lavoro. La scelta dell'utente è un requisito: se il servizio non è adatto alla richiesta (per esempio non accetta quella durata o quella combinazione di immagini) il sistema lo dice con un messaggio semplice e non ne usa un altro in silenzio. Un altro servizio entra solo se il primo ha un guasto tecnico e non costa più di quanto l'utente ha confermato; altrimenti il lavoro si ferma e decide l'utente. Il take dice sempre con quale servizio è stato fatto.
> - L'utente attiva i servizi che vuole usare e sceglie il predefinito di ogni ruolo dalle Impostazioni: questa scelta vale subito, senza passare dalla pubblicazione delle impostazioni avanzate.
> - I take fatti con servizi diversi si possono confrontare e si può rigirare un'inquadratura con un altro servizio.

### Cast personale, consenso e privacy: aggiornare l'ultimo punto

> - **Nell'MVP solo personaggi generati da Filmzy** (D4, D19). Per impostazione predefinita un'immagine con persone viene rifiutata con un messaggio semplice; l'utente può cambiare l'impostazione, con un'avvertenza. Il cast personale si accende dopo un test dedicato sui volti reali. Le tabelle dei consensi sono già previste, la funzione è spenta.

## 6. Scheda inquadratura: aggiungere

> La scheda ha un campo per le immagini scelte dall'utente: a ogni immagine corrisponde un uso (ispirazione, primo o ultimo fotogramma) e un'origine (caricata, generata o presa da un fotogramma di un take). Il movimento di macchina si sceglie da una lista. Il risultato scelto per i fotogrammi generati è un take di tipo «fotogramma chiave». La versione resta la 0.2 perché non è mai stata usata nel codice. Ogni take registra il servizio con cui è stato fatto (D36).

## 7. Componenti e deploy: sostituire

> - **Cambiato il 20/10 (D29):** monorepo TypeScript con NestJS come server locale (lavori in coda interni), React + Vite per l'interfaccia, schemi Zod condivisi, **SQLite + Drizzle** al posto di PostgreSQL, file in una cartella locale al posto di S3/R2, ffmpeg per il montaggio. Nessun Redis, Docker o Caddy.
> - **Distribuzione:** app per Windows, macOS e Linux impacchettata con **Electron**, con installatore e aggiornamenti da GitHub Releases. I fornitori si interrogano con il polling.
> - Adapter verso i fornitori, mai chiamate dirette: AI SDK per gli LLM, fal per immagini e video. Python più avanti, solo come servizio separato.

## 8. Roadmap: sostituire la voce MVP e la Fase 2

> - **MVP:** corto da 60 secondi, max 2 personaggi, uno stile, niente voci generate. Include le impostazioni avanzate con la pagina Connessioni, la rigenerazione della singola inquadratura, la bozza con riepilogo, i luoghi, il controllo dei fotogrammi, le tracce di musica ed effetti, i tetti di spesa e l'app installabile. **Stima: 47–69 giornate di lavoro pieno, circa 9½–14 settimane** (cambiato il 20/10, D32: prima erano 32–45). Tre opzioni fuori dalla stima: caricamento di luoghi e oggetti (+2–3 giornate), ritocco col pennello (+3–4) e moodboard (+3–4). Con tutte e tre 55–80.
> - **Fase 2:** generazione delle voci per personaggio (nella traccia Dialoghi) e labiale. I pagamenti non servono più (D28).
> - **Dopo l'MVP:** marcatura C2PA (D31), modifica vera del video.

## 9. Rischi e note: aggiungere e correggere

> - **Fotogrammi molto diversi:** quando il primo e l'ultimo fotogramma differiscono molto, i modelli tendono a «sciogliere» un'immagine nell'altra. Uno zoom con differenze piccole è il caso facile. Va misurato nel bench.
> - **Strumenti di ritocco:** sono il modo più semplice di alterare una persona reale. Per questo, per impostazione predefinita, il ritocco opera solo su immagini generate da Filmzy o già controllate, e i testi passano dal moderatore.
> - **Adozione e costi per l'utente:** ognuno apre 2–4 account presso i servizi AI e paga di tasca sua un film da 60 s (11–66 $). È il rischio principale del modello locale: lo riducono la procedura guidata, le stime e i tetti di spesa, e una modalità economica con anteprime.
> - **Obblighi già in vigore (da correggere):** l'esenzione dell'AI Act per il software libero (art. 2, par. 12) non copre l'art. 50. L'obbligo principale di marcare i contenuti sintetici ricade sui servizi che li generano; resta incerto il ruolo di Filmzy, quindi la dicitura nei titoli resta e la marcatura C2PA è un'opzione dopo l'MVP, da verificare con un legale prima di una versione 1.0 pubblica (D31).
> - **Volti reali e URL pubbliche:** la regola delle persone generate e la copia immediata dei file restano come impostazioni prudenti. Con il modello locale non ci sono più obblighi da ospitante (rimozione, segnalazioni).

## 10. Domande aperte: sostituire

> Togliere: libreria di autenticazione, chiavi dei fornitori (solo variabili d'ambiente o anche nel database), modello di business e prezzo dei crediti, primo pubblico legato ai crediti.
> Aggiungere:
> - Formati (spot, trailer, videoclip) che decidono quali campi del personaggio sono obbligatori; elenco definitivo dei tag.
> - Id e capacità dei modelli con primo e ultimo fotogramma: da verificare con i fornitori e con il bench.
> - Traduzione in inglese del testo di ritocco e dei suoni scritto dall'utente: per ora va al modello così com'è.
> - Quando provare la modifica vera del video (dopo l'MVP, su 3–4 clip).
> - Fornitore degli effetti sonori: la ricerca del 13/10 copre solo la musica (ElevenLabs Music ha un'API, Suno è da evitare).
> - Firma del codice degli installatori (Windows e macOS) e driver di SQLite: da scegliere in M2 e in M6.
> - Come si traduce il voto delle prove in un giudizio semplice nell'elenco «Cambia servizio» (scala, parole, servizi mai provati): da decidere con i dati del test di coerenza.
> - Parere legale prima di una versione 1.0 pubblica (art. 50 dell'AI Act, uso responsabile).
> - Quando rendere pubblico il repository (dopo `LICENSE`, avviso di uso responsabile e link alle donazioni).

## 11. Registro modifiche: aggiungere

> - **20/10/2026 (nome, flusso, immagini, suono e svolta in locale):** il prodotto si chiama Filmzy. Nuovo ordine dei passi (bozza, personaggi, luoghi, riepilogo, stesura ufficiale); scheda personaggio con tag e dettagli facoltativi; passo Luoghi con immagini del set; ritocco col pennello; immagini dell'inquadratura (ispirazione, primo e ultimo fotogramma); tracce audio separate dal video con «Suggerisci i suoni» e caricamento di file audio propri; pagina Connessioni con le chiavi nel portachiavi. **Svolta:** software libero (AGPL-3.0) che gira in locale con Electron, SQLite e coda interna, senza account né crediti; costi reali in dollari con tetti di spesa; dicitura AI sì, marcatura C2PA dopo l'MVP; stima dell'MVP a 47–69 giornate. Aggiornati Visione, Principi, Flusso utente, Feature decise, Scheda inquadratura, Componenti, Roadmap, Rischi e Domande aperte; D17–D32 in `docs/decisioni.md`.
> - **20/10/2026 (scelta del servizio, D36):** per ogni generazione di immagini, video, musica ed effetti l'utente può cambiare servizio con «Cambia servizio» accanto a «Genera». L'elenco mostra nome semplice, costo stimato e voto delle prove; la scelta è un requisito (nessun cambio in silenzio) e il take registra il servizio usato. Servizi attivati e predefiniti si cambiano dalle Impostazioni senza pubblicare. Aggiornati Flusso utente, Feature decise (nuova sezione), Scheda inquadratura e Domande aperte.
> - **20/10/2026 (moodboard, D37):** ogni film può avere un moodboard facoltativo ma consigliato, con palette, consigli e immagini di riferimento per il film e per singole scene; generato dall'app o caricato (le immagini caricate si analizzano). Passo facoltativo dopo «La storia». Opzione dell'MVP: +3–4 giornate, con tutte le opzioni 55–80. Aggiornati Flusso utente, Feature decise (nuova sezione) e Roadmap.
> - **20/10/2026 (ruoli e istruzioni, D38):** ogni ruolo si può regolare da «Chi fa cosa» (fornitore, modello, creatività, versione delle istruzioni); le istruzioni hanno versioni che un aggiornamento non cambia da sé, e l'utente può caricarne di proprie; gruppo «Lettura immagini»; nessun tetto per chiamata; nel moodboard le immagini con persone servono solo per l'analisi.
