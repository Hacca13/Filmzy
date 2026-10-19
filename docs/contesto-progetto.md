# Film Gen Ai — Contesto del progetto

> **Copia del 19/10/2026.** L'originale vive nel progetto Claude «Film Gen Ai», dove si prendono le decisioni di prodotto. Non modificare questa copia: se serve cambiarla, proponilo.

_Ultimo aggiornamento: 19 ottobre 2026_

_Documenti collegati: architettura in `docs/architettura.md`; piano di lavoro in `docs/piano-di-lavoro.md`; registro delle decisioni in `docs/decisioni.md`; regole per Claude Code in `CLAUDE.md`; ricerca in `docs/ricerca-ottobre-2026.md`; modello di costo in `modello_costi.py` (nel progetto Claude)._

## Visione

Piattaforma per creare film con la gen AI, pensata per chi non sa programmare. Aiuta a scrivere la sceneggiatura, a gestire personaggi coerenti (volti e voci), a costruire il film scena per scena e a scegliere tema, genere, stile e fotografia.

**Principio guida:** non è un'AI che fa film, è un *direttore di produzione*. I modelli generano, la piattaforma ricorda. La coerenza vive nei nostri dati, non nei modelli: ogni modello è un freelance bravissimo ma smemorato, e siamo noi a ripetergli ogni volta cosa è successo prima.

## Principi

1. **Interfaccia semplice:** nessun prompt visibile all'utente, il meno tecnico possibile.
2. **Scena per scena:** si genera, si sceglie, si va avanti.
3. **Si approva sulle immagini, si spende sul video:** lo storyboard viene prima del video (un'immagine costa centesimi, un video dollari).
4. **Indipendenza dai modelli:** salviamo l'intenzione, non il prompt. I modelli video cambieranno e miglioreranno.
5. **Consenso esplicito** per ogni volto e voce reale.

## Flusso utente

1. **Idea:** tema, genere, stile visivo, fotografia.
2. **Personaggi:** il suggeritore propone il cast, l'utente approva e il volto viene "bloccato".
3. **Sceneggiatura:** generata e modificabile come testo normale.
4. **Scene:** una fila di card, come una striscia a fumetti. Per ognuna: storyboard → 2-3 varianti → scelta → scena successiva.
5. **Film:** voci, musica, montaggio, esportazione, eventuale doppiaggio in altre lingue.

## Feature decise

### Personaggi e suggeritore
- Il suggeritore lavora in due momenti:
  - **all'inizio:** dalla trama propone il cast con ruolo, motivazione, rapporto col protagonista e aspetto coerente con lo stile visivo;
  - **durante:** leggendo la scena successiva suggerisce un nuovo personaggio o propone di riusarne uno esistente.
- Riceve sempre il cast attuale, per non proporre doppioni.
- L'utente vede solo card con **Aggiungi / Cambia / Scarta**.
- Ogni personaggio ha una scheda multi-angolo (fronte, profilo, 3/4), una descrizione fissa e una voce.

### Scene e continuità
- Ogni scena eredita uno **stato di continuità** dalla precedente: chi è presente, vestiti, luogo, ora del giorno, ultimo fotogramma ("nelle puntate precedenti").
- Se una modifica rende incoerenti le scene successive, queste **si illuminano di giallo** con il motivo (es. "qui Marco ha ancora la giacca blu").
- Nessuna rigenerazione automatica: decide l'utente, perché ogni generazione costa.

### Stile e fotografia
- Scelta di tema, genere e stile visivo.
- Scelta della **fotografia del film**, cioè lo stile di ripresa, a livello di film con possibilità di modificarla per singola scena.
- Stili, generi, toni e preset di fotografia sono dati configurabili: un nuovo stile si aggiunge senza scrivere codice.

### Lingue e doppiaggio
- Cambio lingua con voce tradotta e doppiata, **coerente con la voce originale** del personaggio (clonazione della voce).
- Traduzione dell'intera sceneggiatura, non riga per riga, adattata alla durata delle battute come nel doppiaggio professionale.
- Le scene con dialoghi vanno ri-sincronizzate col labiale nella nuova lingua (costo da considerare).

### Cast personale, consenso e privacy
- Chi carica una foto dichiara di avere i diritti sul volto.
- **Consenso salvato per singola persona e riutilizzabile in più film** (es. più film con me e i miei amici).
- Il consenso copre **volto e voce** ed è **revocabile**: dopo la revoca, nessuna nuova generazione con quella persona.
- Due percorsi: "il mio volto" (verifica con selfie dal vivo) e "volto di un'altra persona" (consenso della persona).
- **Blocco dei volti noti.**
- Registro dei consensi: chi, quando, quale foto/voce.
- Etichetta "generato con AI" e watermark sui video esportati.
- Sistema rapido di segnalazione e rimozione.
- **Nell'MVP solo personaggi inventati** (deciso il 19/10, D4): il cast personale si accende dopo un test dedicato sui volti reali e la consulenza legale. Le tabelle dei consensi sono già previste, la funzione è spenta.

### Pannello admin della troupe (deciso il 19/10, D2)
- Modelli, connessioni (anche proxy e gateway), parametri come la temperatura, istruzioni, preset e funzioni si cambiano dal pannello, senza toccare il codice.
- Bozza → prova su un input di esempio → pubblicazione → storico e ripristino.
- Arriva subito dopo il test di coerenza (M2), così il test non aspetta.

## Architettura

Dettagli completi in `docs/architettura.md`.

### La troupe
- Il codice chiama **ruoli**, mai modelli: sceneggiatore, casting, aiuto regista, direttore della fotografia, character designer, storyboard, operatore di ripresa, segretaria di edizione, moderatore, compositore; più avanti doppiatore, sincronizzatore e adattatore dialoghista.
- Tre livelli di configurazione: **connessioni** (come raggiungere un fornitore, anche via proxy o gateway), **catalogo dei modelli** (capacità, parametri accettati, prezzi, voti delle prove), **ruoli** (modello e riserve, parametri, istruzioni versionate, budget).
- Nel codice restano solo gli schemi di input e output dei ruoli, perché è il codice a usarne le risposte.

### Bibbia del progetto
Per i ruoli resta un unico oggetto che ogni step legge: personaggi, luoghi, stile, fotografia, sceneggiatura → scene → inquadrature. **Cambiato il 19/10 (D8):** nel database è fatta di tabelle + JSONB invece che di un solo documento, perché personaggi e luoghi devono essere riusabili tra film e citabili dalle inquadrature.

### Scheda inquadratura (contratto base)
Descrive **cosa** vogliamo in una scena, senza dire **quale modello** la genera. Come una comanda al ristorante: qualsiasi cuoco la legge, e se cambi cuoco la comanda resta identica. **Adottata la versione 0.2 (ShotSpec)** il 19/10: intenzione separata dai take, continuità in entrata e in uscita, voce per battuta, versione dello schema; nel codice le chiavi sono in inglese (architettura §5.2).

### Componenti
- **Cambiato il 19/10 (D1):** monorepo TypeScript: NestJS per API e worker (coda BullMQ su Redis), React + Vite per l'interfaccia, schemi Zod condivisi. Python più avanti, solo come servizio separato (per esempio per il controllo dei volti), collegato alla troupe come una connessione.
- PostgreSQL + Drizzle, storage S3/R2, ffmpeg per il montaggio.
- Adapter verso i fornitori, mai chiamate dirette: AI SDK per gli LLM, fal per immagini e video.
- **Deploy:** Docker + Caddy.
- Codice in inglese; interfaccia, istruzioni e documenti in italiano (D3).

### Modelli intercambiabili
- **Cambiato il 19/10 (D2):** la configurazione vive nel database ed è modificabile dal pannello admin. I file YAML fanno da seme, da copia in git e da base per test e bench.
- Catalogo con capacità (durata massima, riferimenti accettati, audio nativo, volti reali), parametri accettati, costo, stato (attivo / in test / dismesso), voti delle prove.
- **Traduttore per famiglia di modelli**, non per modello: una nuova versione della stessa famiglia di solito è solo configurazione, una famiglia nuova richiede un traduttore isolato.
- **Router:** sceglie il modello in base a cosa serve (numero di personaggi, durata, budget). Le riserve entrano solo per errori tecnici, mai per un rifiuto sul contenuto.
- **Bench fisso** prima di adottare un modello (il primo è il test della settimana 1); i voti entrano nel catalogo e il router li usa.
- Ogni generazione lascia uno **scontrino** (modello, versione delle istruzioni, parametri, costo), così un vecchio film si può rigirare con un modello migliore.

## Costi
- Prezzi API video verificati a ottobre 2026: da circa 0,03 $/s (anteprime a 360p) a circa 0,40 $/s (Veo 3.1, Kling 3.0 Pro). Lo stesso modello può costare il doppio a seconda del fornitore.
- Stime calcolate con 2,5 tentativi medi per inquadratura: corto da 60 s senza dialoghi **11–66 $**; corto da 3 minuti con metà parlato **40–202 $**; ogni lingua di doppiaggio in più **circa 9 $**, quasi tutto per il lip sync.
- Il video pesa per il 72–91% del costo dell'MVP. Un tentativo video da 5 s costa 6–25 volte un'immagine di storyboard (con i modelli economici decine di centesimi, con i premium circa 2 $).
- Test di coerenza della settimana 1: **circa 45 $** (stima calcolata sul piano `config/bench/week1.yaml`).
- Sistema a crediti dal primo giorno; lo storyboard fa da "cancello" prima della spesa sul video.

## Roadmap
- **Settimana 1 (M1), zero UI:** **due** personaggi inventati, 6 inquadrature diverse, 3 modelli. Verificare la coerenza prima di costruire l'interfaccia. (Cambiato il 19/10, D13: prima era un personaggio; il secondo serve per l'inquadratura a due.)
- **MVP:** corto da 60 secondi, max 2 personaggi, uno stile, niente dialoghi. Include il pannello admin e la rigenerazione della singola inquadratura (spostata dalla Fase 2, D14). **Stima: 32–45 giornate di lavoro pieno, circa 6½–9 settimane** (cambiato il 19/10, D16: prima erano 4-6 settimane). Milestone M0–M6 in `docs/piano-di-lavoro.md`.
- **Fase 2:** voci per personaggio + lip sync, pagamenti.
- **Fase 3:** timeline modificabile, più stili, luoghi ricorrenti.
- **Dopo il test sui volti reali:** cast personale.

## Rischi e note
- **Coerenza dei personaggi:** è il rischio tecnico principale, da validare per primo. Funziona ancorando ogni inquadratura alla scheda bloccata, non all'ultimo fotogramma della clip precedente, perché l'errore si accumula.
- **"Film" è ambizioso per l'MVP:** le clip durano 5-15 secondi (alcuni modelli nuovi arrivano a 30); partire da corti, trailer, videoclip.
- **Concorrenti:** LTX Studio, Google Flow (incluso negli abbonamenti Google, con agente e app mobile), Higgsfield, OpenArt, LongStories, Melies. Differenziarsi sulla semplicità totale e sulla continuità visibile.
- **Volti reali e regole dei provider:** Seedance accetta volti reali solo dopo una verifica dal vivo fatta dal soggetto; Google li blocca anche su filmati propri; Kling è più aperto. Il cast personale funziona solo su una parte dei modelli, le regole possono stringersi e violarle espone al blocco dell'account API.
- **Modelli che spariscono:** OpenAI ha chiuso Sora (API spenta il 24/9/2026). Conferma il principio di indipendenza dai modelli.
- **URL pubbliche dei provider:** su fal gli output sono pubblici e restano almeno 7 giorni; vanno copiati subito nel nostro storage, soprattutto con volti reali.
- **Obblighi già in vigore:** AI Act art. 50 (etichetta e marcatura dei contenuti AI) dal 2/8/2026; in Italia art. 612-quater c.p. sui deepfake diffusi senza consenso (da 1 a 5 anni). I volti trattati per il riconoscimento sono dati biometrici: consenso esplicito e probabile valutazione d'impatto (DPIA). Consulenza legale prima del lancio.

## Domande aperte
- In quale fase collocare il doppiaggio multilingua (il cast personale è deciso: dopo il test sui volti reali).
- Modello di business e prezzo dei crediti: con un ricarico di 3 volte, un corto da 60 s costerebbe all'utente circa 33–197 $.
- Chi è il primo pubblico: scuole (ci sono minori, quindi niente volti reali), eventi personali (serve il cast reale), piccole attività o hobbisti?
- Dialoghi: audio nativo del modello (economico, ma la voce cambia quando cambia il modello) o voce nostra + lip sync (coerente, più caro)?
- Qualità visibile all'utente ("bozza / finale") o scelta automatica?
- Quali provider hanno accordi sui dati adeguati per i volti reali di cittadini europei?
- Etichetta AI per i film di finzione: basta nei titoli o serve un watermark sempre visibile?
- Libreria di autenticazione (da scegliere all'inizio di M2).
- Chiavi dei fornitori: solo variabili d'ambiente, oppure anche cifrate nel database e gestite dal pannello?
- Strumento per la marcatura C2PA e fornitore della musica (M5).

## Idee da valutare
- **Controllo automatico del volto:** un'impronta numerica del volto confrontata con la scheda; se cambia troppo, il giallo si accende da solo. Licenze dei modelli da verificare (InsightFace pre-addestrato non è commerciale). Sarà il primo servizio Python.
- **Consenso dato dalla persona stessa:** l'amico riceve un link, fa il selfie dal vivo dal suo telefono e legge una frase per la voce. Da riprendere quando si accende il cast personale.
- **Voce di proprietà della piattaforma:** TTS + lip sync, o audio come riferimento, invece della voce nativa di ogni modello.
- **Tre cancelli di spesa:** immagine → anteprima video economica → versione finale (l'anteprima non si riproduce identica: serve upscaling o un nuovo take). Funzione `preview_gate` già prevista, spenta.
- **Più inquadrature in una sola chiamata** per i modelli multi-inquadratura e le clip da 30 s: deciderebbe il traduttore.
- **Esperimenti A/B dal pannello:** due configurazioni dello stesso ruolo a confronto su una percentuale di richieste (dopo l'MVP).

## Registro modifiche
- **13/10/2026:** prima versione del contesto.
- **13/10/2026 (ricerca):** ricerca su modelli, coerenza, voci, costi, legale e concorrenti. Costi sostituiti con stime calcolate (coerenti con le precedenti, più precise); Rischi ampliati con volti reali, chiusura di Sora, URL pubbliche e obblighi legali; aggiunte 11 idee da valutare e 5 domande aperte; collegati il documento di ricerca e il modello di costo. Feature decise e roadmap invariate.
- **19/10/2026 (brainstorm e specifica):** decisi stack TypeScript unico con NestJS, configurazione nel database con pannello admin subito dopo il test, codice in inglese, cast personale dopo il test sui volti reali. Aggiunti la troupe e il pannello admin; aggiornati Componenti, Modelli intercambiabili, Bibbia, Scheda inquadratura, Costi e Roadmap (ogni cambio è marcato "Cambiato il 19/10"); 6 idee adottate tolte da "Idee da valutare", 1 riformulata e 1 nuova; domanda sulla scheda inquadratura chiusa e 3 nuove aperte; collegati architettura, piano di lavoro, decisioni e CLAUDE.md.
