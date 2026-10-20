# Filmzy — Proposta di modifiche al contesto del progetto

_20 ottobre 2026._ `docs/contesto-progetto.md` è una copia: l'originale vive nel progetto Claude, dove si prendono le decisioni di prodotto. Questo documento raccoglie il testo da incollare lì; quando l'originale è aggiornato si sostituisce la copia e si cancella questo file. Le decisioni sono D17–D27 in `docs/decisioni.md`.

## 1. Titolo e nome

Titolo: **Filmzy — Contesto del progetto**. In tutto il documento «Film Gen Ai» diventa «Filmzy» (D17). Togliere dalle «Domande aperte» il nome del prodotto, se c'è.

## 2. Principi: aggiungere il sesto

> 6. **Il controllo sta nelle immagini:** l'utente può guidare il risultato (da dove parte un'inquadratura, dove finisce, cosa togliere da un'immagine) sulle immagini, dove un tentativo costa centesimi. Il video si spende per ultimo.

## 3. Flusso utente: sostituire l'elenco

> 1. **Idea:** tema, genere, stile visivo, fotografia.
> 2. **La storia:** una bozza breve della sceneggiatura (titolo, trama in una riga, scene riassunte). Se non convince, l'utente chiede una modifica allo sceneggiatore con una frase.
> 3. **Personaggi:** l'utente sceglie quanti personaggi vuole; il suggeritore li propone partendo dalla bozza, con un tag (protagonista, antagonista…) e dettagli facoltativi (carattere, comportamento, obiettivo). L'utente approva e il volto viene «bloccato».
> 4. **Luoghi:** per ogni luogo della storia, 3–4 immagini del set tra cui scegliere (e, se la funzione è attiva, il ritocco col pennello).
> 5. **Riepilogo:** il sistema confronta la bozza con cast e luoghi scelti. Per ogni differenza l'utente sceglie «Adatta la storia», «Cambia la mia scelta» o «Va bene così». Se non ci sono differenze il passo non compare. Poi la stesura ufficiale, modificabile come testo normale.
> 6. **Scene:** una fila di card, come una striscia a fumetti. Per ognuna: storyboard → 2–3 varianti → scelta → (facoltativo) «Imposta le immagini» → video → scena successiva.
> 7. **Film:** voci, musica, montaggio, esportazione, eventuale doppiaggio in altre lingue.

## 4. Feature decise

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
> - L'utente può caricare file audio propri (musica, effetti, registrazioni di voce) su qualunque traccia, dichiarando di averne i diritti, come in un programma di montaggio. I file restano privati nel progetto e non vanno mai a un fornitore AI. Chi gestisce il servizio resta tenuto a rimuovere un contenuto segnalato.
> - La timeline libera resta in Fase 3.

### Pannello admin della troupe: aggiungere

> - **Connessioni:** una pagina guidata, riservata all'amministratore, per collegare i fornitori (testo, immagini, video, musica ed effetti, voci): si sceglie il fornitore, si incolla la chiave, si prova la connessione, si scelgono i modelli da aggiungere e si assegnano ai ruoli in «Chi fa cosa». Le chiavi sono cifrate nel database e non si rivedono più dopo l'inserimento.

### Cast personale, consenso e privacy: aggiornare l'ultimo punto

> - **Nell'MVP solo personaggi generati da Filmzy** (D4, D19). L'utente può caricare luoghi e oggetti; un'immagine con persone viene rifiutata con un messaggio semplice. Il cast personale si accende dopo un test dedicato sui volti reali e la consulenza legale. Le tabelle dei consensi sono già previste, la funzione è spenta.

## 5. Scheda inquadratura: aggiungere

> La scheda ha un campo per le immagini scelte dall'utente: a ogni immagine corrisponde un uso (ispirazione, primo o ultimo fotogramma) e un'origine (caricata, generata o presa da un fotogramma di un take). Il movimento di macchina si sceglie da una lista. Il risultato scelto per i fotogrammi generati è un take di tipo «fotogramma chiave». La versione resta la 0.2 perché non è mai stata usata nel codice.

## 6. Roadmap: sostituire la voce MVP

> - **MVP:** corto da 60 secondi, max 2 personaggi, uno stile, niente dialoghi. Include il pannello admin con la pagina Connessioni, la rigenerazione della singola inquadratura, la bozza con riepilogo, i luoghi, il controllo dei fotogrammi e le tracce di musica ed effetti. **Stima: 48–70 giornate di lavoro pieno, circa 9½–14 settimane** (cambiato il 20/10, D27: prima erano 32–45). Due opzioni fuori dalla stima: caricamento di luoghi e oggetti (+2–3 giornate) e ritocco col pennello (+3–4). Con entrambe 53–77.

## 7. Rischi e note: aggiungere

> - **Fotogrammi molto diversi:** quando il primo e l'ultimo fotogramma differiscono molto, i modelli tendono a «sciogliere» un'immagine nell'altra. Uno zoom con differenze piccole è il caso facile. Va misurato nel bench.
> - **Strumenti di ritocco:** sono il modo più semplice di alterare una persona reale. Per questo il ritocco opera solo su immagini generate da noi o già controllate, e i testi passano dal moderatore.

## 8. Domande aperte: aggiungere

> - Formati (spot, trailer, videoclip) che decidono quali campi del personaggio sono obbligatori; elenco definitivo dei tag.
> - Id e capacità dei modelli con primo e ultimo fotogramma: da verificare con i fornitori e con il bench.
> - Traduzione in inglese del testo di ritocco scritto dall'utente: per ora va al modello così com'è.
> - Quando provare la modifica vera del video (dopo l'MVP, su 3–4 clip).
> - Fornitore degli effetti sonori: la ricerca del 13/10 copre solo la musica (ElevenLabs Music ha un'API, Suno è da evitare).
> - **Modello di guadagno e licenza:** crediti a pagamento, oppure servizio aperto con donazioni? Un film da 60 s costa 11–66 $ di API, quindi un servizio gratuito per tutti non si regge sulle donazioni. Le strade sono crediti, codice aperto da installare in proprio con servizio a pagamento a parte, o un periodo di prova con crediti regalati. La licenza si sceglie prima di rendere pubblico il repository.
> - Chiavi per utente («porta la tua chiave»): rimandate, dipendono dal modello di guadagno.
> - Condizioni d'uso e dichiarazione dei diritti sui file caricati: da far rivedere a un legale prima di aprire il servizio al pubblico.
> - Per chi non è tecnico basta il percorso con i crediti, oppure serve anche una modalità per chi vuole usare i propri account presso i fornitori?

## 9. Registro modifiche: aggiungere

> - **20/10/2026 (nome, flusso e immagini):** il prodotto si chiama Filmzy. Nuovo ordine dei passi (bozza, personaggi, luoghi, riepilogo, stesura ufficiale); scheda personaggio con tag e dettagli facoltativi; passo Luoghi con immagini del set; ritocco col pennello; immagini dell'inquadratura (ispirazione, primo e ultimo fotogramma); solo personaggi generati da Filmzy, con caricamento di luoghi e oggetti; tracce audio separate dal video (musica, effetti, dialoghi in Fase 2) con «Suggerisci i suoni» e caricamento di file audio propri; pagina Connessioni con chiavi cifrate nel database; stima dell'MVP a 48–70 giornate. Principi, Flusso utente, Feature decise, Scheda inquadratura, Roadmap, Rischi e Domande aperte aggiornati; D17–D27 in `docs/decisioni.md`.
