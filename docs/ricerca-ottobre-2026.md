# Film Gen Ai — Ricerca e valutazioni

> **Copia del documento di ricerca del 13/10/2026.** È una fotografia di quella data: modelli, prezzi e regole dei fornitori vanno ricontrollati prima di usarli.
>
> **Aggiornamento:** il 21/10/2026 (T1.7) id, prezzi, durate e parametri dei modelli che l'MVP usa sono stati riverificati sulle pagine dei fornitori e scritti in `config/ai/models.yaml`, che da qui in avanti è la fonte di verità. Qualche numero di questo documento è già vecchio: Seedance 2 costa 0,3034 $/s a 720p (qui era stimato 0,15) e nessuno dei tre modelli video accetta un prompt negativo.

_Ricerca del 13 ottobre 2026. Modelli e prezzi verificati online in questa data: cambiano spesso, vanno ricontrollati prima di ogni decisione di spesa. Le note legali non sono una consulenza legale._

## In breve: le 8 cose che contano

1. **L'indipendenza dai modelli è stata confermata dai fatti.** OpenAI ha chiuso Sora: app spenta il 26 aprile 2026, API spenta il 24 settembre 2026. Chi ci aveva costruito sopra ha dovuto migrare in poche settimane. Intanto sono arrivati Gemini Omni Flash e Seedance 2.5, e Kling 4.0 è annunciato per ottobre. Registro modelli + traduttori è la scelta giusta.
2. **Il rischio più grosso è di policy, non tecnico: i volti reali.** Seedance rifiuta le foto con volti reali (serve una verifica dal vivo fatta dalla persona stessa), Google blocca i volti di persone reali perfino su filmati propri, Kling offre funzioni per usare il proprio volto. Il "cast personale" è il differenziatore più forte e anche il più fragile.
3. **La coerenza si ottiene ancorando ogni inquadratura alla scheda del personaggio**, non incatenando l'ultimo fotogramma della scena precedente: l'errore si accumula come una fotocopia di una fotocopia.
4. **La voce deve essere nostra, non del modello video.** Se usiamo l'audio nativo di ogni modello, quando il router cambia modello cambia anche la voce del personaggio.
5. **Costi calcolati:** un corto MVP da 60 secondi costa circa 11–66 $ di API (stima realistica, secondo la fascia di modelli). Il video pesa per il 72–91% del totale. Un corto di 3 minuti con dialoghi costa circa 40–200 $.
6. **Etichetta e marcatura AI sono già obbligatorie:** l'articolo 50 dell'AI Act si applica dal 2 agosto 2026 e non è stato rinviato. In Italia diffondere senza consenso deepfake che causano un danno è reato (art. 612-quater c.p., da 1 a 5 anni).
7. **Il mercato è affollato** (LTX Studio, Google Flow, Higgsfield, OpenArt, LongStories, Melies). Google include Flow nei suoi abbonamenti: competere sul prezzo è perdente, serve un posizionamento netto.
8. **Il test della settimana 1 va fatto con un personaggio inventato**, perché la maggior parte dei modelli rifiuta i volti reali. Il percorso "volto reale" si testa a parte. Budget stimato: circa 45 $.

---

## 1. I modelli video oggi

| Modello | Durata | Riferimenti e coerenza | Audio | Prezzo indicativo | Volti reali |
|---|---|---|---|---|---|
| **Seedance 2.0** (ByteDance) | fino a 15 s | fino a 12 riferimenti | nativo | Mini 0,056 $/s; 720p con video di riferimento 0,125–0,18 $/s secondo il rivenditore | Bloccati, salvo verifica dal vivo del soggetto |
| **Seedance 2.5** (ByteDance) | fino a 30 s in una sola generazione | fino a 50 riferimenti (immagini, video, audio) | parlato nativo in 10+ lingue | ~0,134 $/s (Atlas Cloud); API ufficiale ancora in apertura | Da verificare |
| **Gemini Omni Flash** (Google) | 10 s; la 1.1 estende fino a 40 s | immagini di riferimento, personaggi riutilizzabili | sì | 0,10 $/s a 720p; la 1.1 da 0,034 $/s (360p) a 0,30 $/s (4K) | Bloccati |
| **Veo 3.1** (Google) | 4, 6 o 8 s | immagini di riferimento | nativo | 0,40 $/s (standard con audio); Fast 0,10 $/s | Da immagine solo adulti; restrizioni aggiuntive in UE |
| **Kling 3.0 / O3 Omni** (Kuaishou) | fino a 15 s | "Elements", 3+ personaggi, riferimento video, voce legata al personaggio | nativo | su fal 0,168–0,392 $/s; API ufficiale da ~0,084 $/s | Più permissivo: ha funzioni per usare il proprio volto |
| **Kling 4.0** | 3–30 s, fino a 10 keyframe | fino a 10 immagini + 5 video | stereo con lip sync | non pubblicato | Lancio annunciato per ottobre 2026, non ancora disponibile |
| **Sora 2** (OpenAI) | — | — | — | — | **Chiuso** |

**Tre lezioni per l'architettura**

- **Lo stesso modello costa diverso a seconda di chi lo rivende.** Kling su fal costa circa il doppio dell'API ufficiale; Seedance 2.0 a 720p va da 0,125 a 0,18 $/s secondo il fornitore. È come la stessa auto venduta da concessionari diversi: il registro deve avere due livelli, il **modello** (cosa sa fare) e la **via d'accesso** (fornitore, prezzo, limiti, regole sui volti, dove finiscono i dati).
- **Le clip si allungano** (da 15 a 30 secondi) e alcuni modelli girano più inquadrature in una sola chiamata. La scheda non deve dare per scontato "una clip = una inquadratura": meglio descrivere la scena come una sequenza di inquadrature e lasciare al traduttore la scelta tra una chiamata o molte.
- **L'audio nativo sta diventando normale.** I dialoghi potrebbero entrare prima della Fase 2, con l'avvertenza della sezione 4 sulla voce.

---

## 2. Coerenza dei personaggi: cosa funziona davvero

**Il problema della catena.** Se ogni clip parte dall'ultimo fotogramma della precedente, eredita anche i suoi piccoli errori: alla terza o quarta clip il personaggio non somiglia più alla prima. È la fotocopia di una fotocopia. La soluzione documentata è riancorare ogni clip alla scheda originale bloccata, non alla clip precedente. Anche il reference-to-video, che dà al modello più contesto, non è perfetto e va riancorato.

**Cosa cambia nel nostro design.** Lo stato di continuità ha due canali separati:
- **chi è** (identità): sempre dalla scheda bloccata del personaggio;
- **dove eravamo** (posizioni, luce, oggetti): dall'ultimo fotogramma, solo quando l'azione continua davvero.

**Costo per "bloccare" un personaggio.** Una produzione documentata ha speso in media 5 generazioni (circa 9,8 $) per personaggio. Con un modello immagine per le schede si spende molto meno: Nano Banana 2 è indicato come il migliore per personaggi ricorrenti (0,08 $ a immagine a 1K); Seedream 5.0 Lite costa 0,032 $ con un riferimento ed è adatto ai volumi.

**Idea: controllo automatico del volto per il giallo.** Si calcola una "impronta numerica" del volto in ogni clip e la si confronta con quella della scheda: se la distanza supera una soglia, la card diventa gialla con il motivo ("il volto di Marco è cambiato"). Tre avvertenze:
- **Licenze:** il codice di InsightFace (la libreria più usata) è MIT, ma i modelli pre-addestrati sono solo per ricerca non commerciale; per un prodotto serve una licenza, un'API commerciale o un modello proprio.
- **Stili non realistici:** questi modelli sono addestrati su volti veri e funzionano male su cartoni e anime; lì serve un controllo diverso (per esempio un modello visivo che giudica "è lo stesso personaggio?"), meno preciso.
- **GDPR:** con personaggi inventati non c'è nessuna persona reale. Con il cast personale le impronte del volto sono dati biometrici e devono rientrare nel consenso.

---

## 3. Volti reali: il nodo più delicato

**Cosa fanno oggi i provider**
- **Seedance 2.0:** rifiuta le foto con volti reali. Per una persona reale serve una verifica dal vivo fatta *dal soggetto stesso*; poi il volto viene salvato come "asset" con un identificativo permanente. Caricare una foto non vale come autorizzazione.
- **Google (Gemini Omni Flash):** blocca i volti di persone reali anche quando il filmato è dello sviluppatore stesso, e un filtro sulle persone famose ha bloccato perfino una celebrità con licenza firmata. Intanto Google permette agli utenti di prestare il proprio volto *dentro* YouTube.
- **Veo:** quando parte da un'immagine permette solo persone adulte; le regole cambiano per regione e modalità, e in UE ci sono state restrizioni aggiuntive.
- **Kling:** offre funzioni per mettere il proprio volto su un personaggio AI; le regole precise vanno lette nei termini d'uso.
- **Voci:** ElevenLabs richiede una verifica per la clonazione professionale (leggi delle frasi dal vivo); MiniMax clona da pochi secondi di audio per 1,50 $ senza una verifica del consenso documentata.

**La lettura strategica.** I grandi offrono il "volto consenziente" dentro i propri prodotti, non ai prodotti degli altri via API. Il cast personale è proprio la cosa che i grandi non ti lasciano fare facilmente: per questo è un differenziatore, ma dipende da regole altrui che possono stringersi da un giorno all'altro.

**Cosa cambia nel design (proposte, non decisioni)**
1. **Il consenso lo dà la persona, non chi carica la foto.** L'amico riceve un link, fa il selfie dal vivo dal suo telefono e legge una frase per la voce. È più forte della semplice dichiarazione ed è lo stesso schema che chiedono Seedance ed ElevenLabs.
2. **Il router deve conoscere le regole di ogni modello:** accetta volti reali (no / solo asset verificati / sì) e genera minori (sì / no). Con un cast reale il router può usare solo una parte dei modelli: meno scelta, a volte più costo o meno qualità.
3. **La revoca deve arrivare anche al provider.** Se il volto è salvato come asset da Seedance, alla revoca va cancellato anche lì: l'adapter ha bisogno di un'operazione "elimina asset".
4. **Attenzione alle URL pubbliche.** Gli output di fal sono URL pubbliche e restano disponibili almeno 7 giorni. Con volti reali: retention breve e accesso privato sul CDN del provider, copia immediata nel nostro storage privato.
5. **Minori:** niente volti reali di minori, punto. Anche i personaggi bambini inventati possono essere rifiutati da alcuni modelli.
6. **Piano B se i provider chiudono:** versione stilizzata (cartoon, illustrata) della persona, ma solo sui provider i cui termini lo consentono e sempre con consenso. Usare lo stile per aggirare un filtro anti-volti violerebbe lo spirito delle regole e metterebbe a rischio l'account.

---

## 4. Voci, doppiaggio, lip sync e musica

**La voce deve essere nostra.** È lo stesso principio della coerenza: i modelli sono smemorati e ognuno ha la sua voce. Se il router passa da Kling a Seedance, il personaggio cambierebbe voce a metà film. Quindi:
- salviamo per ogni personaggio una voce nostra (campione, identificativo presso il provider voce, consenso);
- generiamo le battute con il TTS;
- poi le passiamo ai modelli che accettano audio come riferimento (Seedance 2.5 accetta audio; Kling O3 lega una voce al personaggio) oppure applichiamo il lip sync dopo.

Compromesso: l'audio nativo del modello costa meno (è incluso) e spesso è sincronizzato meglio. Per l'MVP senza dialoghi la questione non si pone; diventa una scelta della Fase 2.

**Prezzi verificati**
- **TTS:** ElevenLabs Multilingual v2 / v3 circa 0,12 $ al minuto via API.
- **Lip sync:** Sync lipsync-2 0,04–0,05 $/s; lipsync-2-pro 0,067–0,083 $/s.
- **Doppiaggio ElevenLabs (solo audio):** 0,33 $/min con watermark, 0,50 $/min senza. Il labiale va rifatto a parte.

**Musica:** Suno non ha un'API pubblica self-service e a luglio 2026 aveva ancora cause aperte con Sony e Universal: da evitare in un prodotto. ElevenLabs Music ha un'API, diritti commerciali sui piani a pagamento e dichiara dati di addestramento con licenza; costa circa 0,18 $ al minuto.

---

## 5. Costi: modello calcolato

**Ipotesi:** inquadrature da 5 s; scheda personaggio = 3 angolazioni × 5 tentativi; storyboard = 3 varianti per inquadratura; voce con TTS + lip sync separato; 1 traccia musicale; 0,30 $ di LLM per sceneggiatura e suggeritore. I tentativi medi per tenere un'inquadratura sono il dato più incerto: per Kling una fonte stima da 1 a 3 generazioni per clip finale. Calcolo eseguito con lo script `claude/modello_costi.py` di questo progetto: quando cambiano i prezzi o arrivano i dati del test, basta aggiornare i numeri in cima e rilanciarlo.

**Fasce di modelli**
- **Economico:** Seedance 2.0 Mini (0,056 $/s) + Seedream 5.0 Lite
- **Medio:** Gemini Omni Flash 720p (0,10 $/s) + Nano Banana 2
- **Medio-alto:** Kling O3 Standard con audio su fal (0,224 $/s) + Nano Banana 2
- **Premium:** Veo 3.1 o Kling 3.0 Pro (0,40 $/s) + Nano Banana 2

**MVP: corto da 60 s, 2 personaggi, senza dialoghi (totale in $)**

| Fascia | 1,5 tentativi | 2,5 tentativi | 4 tentativi |
|---|---|---|---|
| Economico | 7,63 | 10,99 | 16,03 |
| Medio | 14,76 | 20,76 | 29,76 |
| Medio-alto | 25,92 | 39,36 | 59,52 |
| Premium | 41,76 | 65,76 | 101,76 |

**Scenari con 2,5 tentativi**

| Scenario | Economico | Medio | Medio-alto | Premium |
|---|---|---|---|---|
| MVP 60 s, senza dialoghi | 10,99 | 20,76 | 39,36 | 65,76 |
| 3 min, 3 personaggi, metà parlato | 39,98 | 67,13 | 122,92 | 202,13 |
| come sopra + doppiaggio in 2 lingue | 58,27 | 85,42 | 141,22 | 220,42 |

**Cosa ci dicono i numeri**
1. **Il video è quasi tutto il costo** (72–91% nell'MVP). Le leve vere sono due: la fascia del modello (il premium costa 6 volte l'economico) e il numero di tentativi (nel premium si passa da 42 a 102 $). Ogni tentativo evitato grazie allo storyboard sono soldi veri.
2. **Un tentativo video da 5 s costa 6–25 volte un'immagine di storyboard.** Il principio "si approva sulle immagini" regge, ma va precisato: con i modelli economici un video costa decine di centesimi, non dollari.
3. **Con i dialoghi il costo audio principale è il lip sync** (circa 9 $ su 3 minuti con metà parlato). Ogni lingua di doppiaggio in più costa circa 9 $, quasi tutto per rifare il labiale.
4. **Il prezzo all'utente è il nodo commerciale.** Con un ricarico di 3 volte, un corto da 60 s costerebbe all'utente circa 33–197 $. LTX Studio ha piani da 12 a 100 $ al mese e Google include Flow nei suoi abbonamenti: chi compra "un film" a quei prezzi deve ottenere qualcosa che altrove non trova.
5. **Non incluso:** server, storage, banda, commissioni di pagamento, generazioni rifiutate dal provider.

**Idea per abbassare i costi: tre cancelli invece di due.** Immagine → anteprima video economica (Gemini Omni 1.1 a 360p costa 0,034 $/s) → versione finale. Attenzione: rigenerare a 1080p non riproduce l'anteprima approvata, perché ogni generazione è diversa. Le strade sono due: ingrandire (upscaling) l'anteprima approvata, oppure accettare un nuovo take.

---

## 6. Legale (da verificare con un avvocato)

**AI Act, articolo 50**
- Gli obblighi di trasparenza si applicano dal 2 agosto 2026. Il Digital Omnibus (Regolamento UE 2026/1744, in vigore dal 27 luglio 2026) ha rinviato le regole sui sistemi ad alto rischio, non l'articolo 50.
- Il periodo di grazia fino al 2 dicembre 2026 per la marcatura leggibile dalle macchine vale solo per i sistemi già sul mercato prima del 2 agosto 2026: una piattaforma lanciata adesso non ne beneficia.
- **Deepfake** = immagine, audio o video generato con AI che somiglia a persone, luoghi o eventi esistenti e sembrerebbe falsamente autentico. Il cast personale rientra in pieno.
- Il 20 luglio 2026 la Commissione ha adottato le linee guida sull'articolo 50 e ha giudicato adeguato il Codice di condotta sulla trasparenza dei contenuti AI.
- **Il nostro ruolo, probabilmente:** fornitore di un sistema che genera contenuti (marcatura leggibile dalle macchine su ogni output) e piattaforma usata da utenti che pubblicano deepfake (etichetta visibile). La conformità va resa automatica: etichetta e marcatura a ogni esportazione, indipendenti dal modello usato.
- Per le opere evidentemente artistiche o di finzione il regolamento prevede un obbligo più leggero: dichiarare la presenza di contenuti generati in modo da non rovinare la visione (per esempio nei titoli). Da confermare con un legale.

**Italia: legge 132/2025**
- L'art. 612-quater c.p. punisce con la reclusione da 1 a 5 anni chi causa un danno ingiusto diffondendo senza consenso immagini, video o voci falsificati con l'AI e capaci di ingannare sulla loro autenticità. In vigore dal 10 ottobre 2025, si procede su querela della persona offesa.
- È prevista anche un'aggravante comune per i reati commessi con l'AI.
- Registro dei consensi ed etichetta proteggono sia gli utenti sia la piattaforma: un contenuto dichiarato come generato è molto meno "idoneo a ingannare".

**GDPR**
- Le foto dei volti, quando vengono trattate con tecniche che permettono di riconoscere la persona (selfie dal vivo, confronto dei volti, impronte per il giallo), diventano dati biometrici, cioè una categoria particolare: serve un consenso esplicito e probabilmente una valutazione d'impatto (DPIA).
- Le foto di volti reali inviate a provider fuori dall'UE (Stati Uniti, Cina) sono il punto più delicato: vanno verificati accordi sul trattamento dei dati, trasferimenti e uso per l'addestramento.

**Altro:** niente volti di minori; musica solo da fornitori con licenza chiara; i termini dei provider sui volti reali vanno rispettati, non aggirati.

---

## 7. Concorrenti

| Prodotto | Cosa fa | Punto forte | Debolezza rispetto al tuo target |
|---|---|---|---|
| **LTX Studio** | sceneggiatura → scene → storyboard → video, "Elements" per personaggi e luoghi coerenti | pipeline completa, più modelli | curva di apprendimento; piani 12–100 $/mese (feb. 2026) |
| **Google Flow** | film con Veo e Gemini Omni, Scenebuilder, ingredienti, agente, app mobile | possiede i modelli, incluso negli abbonamenti Google | blocca i volti reali; legato all'ecosistema Google |
| **Higgsfield** | storyboard automatico dal testo (Popcorn), Cinema Studio, app mobile | resa cinematografica | orientato a creator e marketing |
| **OpenArt** | personaggi coerenti, storie con un clic | facile per principianti | più immagini che film |
| **LongStories.ai** | serie e formati lunghi; personaggi con aspetto, voce e personalità definiti prima | continuità narrativa | meno controllo sulla singola inquadratura |
| **Melies** | dall'idea alla sceneggiatura alla produzione | percorso narrativo completo | qualità ancora in crescita |
| **Sora** | — | — | chiuso |

**Dove puoi vincere (valutazione)**
1. **Semplicità vera:** zero prompt e zero scelta del modello. Molti concorrenti mostrano ancora entrambi.
2. **Continuità visibile:** il giallo con il motivo dell'incoerenza. Non l'ho trovato come funzione esplicita nei concorrenti analizzati (non significa che non esista da nessuna parte).
3. **Europeo e italiano:** consenso a norma GDPR, interfaccia e doppiaggio in italiano, AI Act già integrato.
4. **Cast personale con consenso vero:** forte ma fragile (sezione 3).

**Il primo pubblico cambia tutto.**
- *Scuole e laboratori:* ci sono minori, quindi solo personaggi inventati. Il tuo canale dei workshop per non tecnici è un accesso concreto.
- *Eventi personali (compleanni, anniversari, film con gli amici):* serve il cast reale, quindi dipendi dalle policy dei provider.
- *Piccole attività (spot locali):* pagano più volentieri, ma vogliono qualità alta, cioè fasce costose.
- *Hobbisti e creator:* sono i più sensibili al prezzo, e lì Google è fortissimo.

---

## 8. Architettura: valutazioni

1. **Un solo capocantiere.** Oggi il piano prevede NestJS + FastAPI + coda. Ma quasi tutte le chiamate AI sono HTTP verso i provider, e fal ha già una coda persistente con webhook e retry automatici. L'orchestrazione può stare tutta in NestJS con BullMQ, con un worker Python solo per ffmpeg, controlli sui volti e audio. Per uno sviluppatore solo, un componente in meno da coordinare conta. (Proposta, non decisione.)
2. **Webhook invece del polling, e idempotenza:** ogni job ha un identificativo, e un webhook che arriva due volte non deve addebitare due volte.
3. **Crediti come la caparra dell'hotel:** si blocca la stima prima del job, si addebita il costo reale alla fine, si restituisce se il job fallisce o il provider lo rifiuta.
4. **Copia immediata degli output** nel nostro storage privato (R2/S3), con retention breve sul CDN del provider.
5. **Registro modelli più ricco:** accetta volti reali, genera minori, audio nativo, accetta audio di riferimento, massimo dei riferimenti, durata massima, multi-inquadratura, prezzo per risoluzione, dove risiedono i dati; e il livello separato "via d'accesso".
6. **Rifiuti dei provider come esito normale:** messaggio semplice ("questa scena non si può generare così, prova a…"), nessun credito addebitato.

**Scheda inquadratura: proposta di versione 0.2**

```json
{
  "schema": "scheda-inquadratura/0.2",
  "id": "sc12-sh03",
  "scena": 12,
  "ordine": 3,
  "intenzione": {
    "azione": "Marco entra e si siede, Vincenzo alza lo sguardo",
    "emozione": "imbarazzo",
    "piano": "primo piano",
    "movimento_camera": "camera a mano, leggera",
    "luce": "calda, sera",
    "durata_secondi": 6
  },
  "personaggi": [
    { "id": "marco", "riferimenti": ["marco/fronte", "marco/profilo", "marco/34"], "costume": "giacca_blu" }
  ],
  "luogo": { "id": "bar_del_paese", "riferimenti": ["bar/interno_sera"] },
  "dialoghi": [
    { "chi": "marco", "testo": "Scusa il ritardo.", "voce": "voce_marco_v1", "lingua": "it" }
  ],
  "fotografia": "ereditata_dal_film",
  "continuita": {
    "entrata": { "ora": "sera", "presenti": ["vincenzo"], "vestiti": { "marco": "giacca_blu" } },
    "uscita": { "presenti": ["vincenzo", "marco"] }
  },
  "risultati": [
    { "take": 1, "modello": "kling-o3", "via": "fal", "versione": "3.0",
      "costo_usd": 1.34, "scelto": true, "controlli": { "volto_marco": 0.82 } }
  ]
}
```

Cosa cambia rispetto alla versione nel contesto:
- **versione dello schema**, per poterlo far evolvere senza rompere i film vecchi;
- **intenzione separata dai risultati**: l'intenzione è la comanda, i risultati sono i piatti usciti dalla cucina (più take, ognuno con modello, fornitore, costo e controlli);
- **riferimenti per identificativo**, che puntano ai file nel nostro storage;
- **voce per battuta**, che punta alla voce del personaggio;
- **continuità in entrata e in uscita**: il giallo diventa una regola semplice, come i bordi dei pezzi di un puzzle. Se l'uscita della scena 11 non combacia con l'entrata della 12, la 12 si accende di giallo.

---

## 9. Protocollo del test della settimana 1

- **Personaggi:** due inventati, generati con Nano Banana 2, ognuno con scheda a 3 angolazioni. Nessun volto reale.
- **6 inquadrature:** primo piano frontale; profilo; campo lungo (volto piccolo); azione (corsa); luce diversa (notte, neon); i due personaggi insieme.
- **3 modelli:** Kling O3 (fal), Seedance 2.0 reference-to-video, Gemini Omni Flash. Eventualmente Kling 4.0 se l'API esce in tempo.
- **3 take per combinazione:** 54 clip da 5 s, cioè 90 secondi di video per modello.
- **Budget stimato:** Kling ~20 $, Seedance ~13,5 $, Omni Flash 9 $, immagini ~2,4 $. Totale circa **45 $**.
- **Misure:**
  - voto da 1 a 5 su volto, vestiti e stile, dato da 3 persone alla cieca, senza sapere quale modello ha generato la clip;
  - quota di take usabili (voto ≥ 4), da cui si ricava il numero reale di tentativi da mettere nel modello di costo;
  - costo per secondo usabile;
  - tempo di generazione;
  - rifiuti e blocchi.
- **Criterio di successo:** almeno un modello con 2 take usabili su 3 per ogni tipo di inquadratura, con volto riconoscibile anche nel campo lungo e nella scena a due.
- **Test separato "volto reale":** solo con il tuo volto e il tuo consenso, sui modelli che lo permettono (Kling; Seedance tramite verifica dal vivo, se accessibile).

---

## 10. Idee nuove da valutare

1. Controllo automatico del volto (impronta numerica) che alimenta il giallo, con licenze da verificare.
2. Consenso dato dalla persona stessa tramite link d'invito: selfie dal vivo e frase letta per la voce.
3. Registro a due livelli: modello e via d'accesso, con le regole su volti reali, minori e audio.
4. Scheda inquadratura 0.2: intenzione separata dai risultati, continuità in entrata e uscita, voce per battuta, versione dello schema.
5. Voce di proprietà della piattaforma (TTS + lip sync o audio come riferimento), non la voce nativa del modello.
6. Tre cancelli di spesa: immagine → anteprima video economica → finale.
7. Un solo orchestratore (NestJS + BullMQ) e un worker Python solo per media e controlli.
8. Copia immediata degli output nello storage privato; retention breve e accesso privato sul CDN del provider.
9. Rifiuti dei provider gestiti come esito normale, senza addebito di crediti.
10. Scena descritta come sequenza di inquadrature; il traduttore decide se fare una o più chiamate.

## 11. Domande aperte nuove

1. Chi è il primo pubblico: scuole, eventi personali, piccole attività o hobbisti?
2. Il cast personale entra nel prodotto iniziale, sapendo che molti provider lo bloccano, o lo rimandiamo?
3. Dialoghi: audio nativo del modello (economico, voce variabile) o voce nostra + lip sync (coerente, più caro)? E quando introdurli?
4. Qualità visibile all'utente ("bozza / finale") o scelta automatica?
5. Quali provider hanno accordi sui dati adeguati per i volti reali di cittadini europei?
6. Per un film di finzione basta l'etichetta nei titoli o serve un watermark sempre visibile?

---

## Fonti

**Modelli e prezzi**
- [Gemini Omni Flash: prezzi](https://www.eesel.ai/blog/gemini-omni-flash-pricing)
- [Gemini Omni 1.1 Flash: prezzi per risoluzione](https://opper.ai/google/gemini-omni-1-1-flash)
- [Google lancia Gemini Omni Flash e Nano Banana 2 Lite](https://aiweekly.co/node/4786)
- [Seedance 2.5: prezzi e fornitori (Atlas Cloud)](https://www.atlascloud.ai/blog/tips/seedance-2-5-api-transparent-pricing-no-enterprise-contract)
- [Seedance 2.5 API: stato e prezzi (CometAPI)](https://www.cometapi.com/de/seedance-2-5-api-pricing/)
- [Seedance 2.0 Mini e confronto prezzi tra fornitori](https://www.atlascloud.ai/it/blog/guides/seedance-2-5-api-pricing-atlas-cloud-vs-official-providers)
- [Kling 3.0 su fal](https://fal.ai/kling-3)
- [Kling O3: prezzi API ufficiale e alternative](https://t-web.evolink.ai/kling-o3)
- [Kling 3.0 Omni: riferimenti ed elementi](https://budgetpixel.com/models/kling-v3-omni-video)
- [Kling 4.0: specifiche e stato](https://www.gradually.ai/en/ai-models/kling-4-0/)
- [Veo su Vertex AI: parametri e generazione di persone](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation)
- [Prezzi video su fal](https://fal.ai/explore/text-to-video-apis)
- [Kling API vs fal: costi per clip finale](https://costbench.com/compare/fal-vs-kling-api/)
- [Chiusura di Sora: tempistiche](https://zilliz.com/ai-faq/what-is-the-sora-shutdown-timeline)
- [OpenAI chiude Sora (Engadget)](https://engadget.com/ai/openai-is-shutting-down-its-sora-video-generation-app-211023358.html)

**Coerenza e immagini**
- [Deriva nelle clip concatenate](https://invideo.io/faq/how-do-you-fix-character-drift-when-chaining-ai-video/)
- [Reference-to-video vs concatenazione di fotogrammi](https://invideo.io/faq/reference-to-video-vs-startend-frame-chaining-which/)
- [Modelli immagine per la coerenza dei personaggi](https://www.atlascloud.ai/blog/best-ai-image-editing-models-2026)
- [InsightFace: licenze](https://github.com/zengxs/insightface)

**Volti reali e policy**
- [Seedance 2.0: asset e volti reali](https://docs.apiyi.com/en/faq/seedance2-asset-face-reference)
- [Seedance 2.0: regole sui volti reali](https://aividpipeline.com/blog/seedance-real-human-face-rules-2026)
- [Gemini Omni: blocco dei volti reali su filmati propri](https://discuss.ai.google.dev/t/real-peoples-names-or-likenesses-block-on-own-footage-gemini-omni-flash-preview-skyhill-hq/179433)
- [Gemini Omni: blocco di una celebrità con licenza](https://discuss.ai.google.dev/t/licensed-celebrity-likeness-blocked-by-prominent-individuals-filter-gemini-omni-flash-preview-on-vertex-ai-project-soulie-e14d/176719)
- [YouTube e Gemini Omni: il proprio volto negli Shorts](https://www.tubefilter.com/?p=192393)
- [Kling: mettere il proprio volto su un personaggio](https://kling.ai/vi/blog/put-your-face-on-ai-character)
- [fal: conservazione dei file e URL pubbliche](https://fal.ai/docs/documentation/model-apis/faq.md)
- [fal: coda, webhook e retry](https://fal.ai/docs/documentation/model-apis/inference/queue)

**Audio**
- [Prezzi TTS e clonazione a confronto](https://invideo.io/blog/ai-voice-model-pricing/)
- [ElevenLabs: prezzi API e doppiaggio](https://techjacksolutions.com/ai-tools/elevenlabs/elevenlabs-pricing/)
- [ElevenLabs: verifica per la clonazione](https://www.forasoft.com/learn/ai-for-video-engineering/articles-ai/elevenlabs-pricing-voice-cloning-no-fakes-act)
- [ElevenLabs vs OpenAI TTS: prezzi al minuto](https://techjacksolutions.com/ai-tools/elevenlabs/elevenlabs-vs-openai-tts/)
- [Sync: prezzi lip sync](https://sync.so/docs/product/billing)
- [Musica AI: licenze e API](https://sonilo.com/blog/comparisons/pay-as-you-go-ai-music-api-commercial-use-rights)
- [Suno: cause e licenze](https://app.cinevva.com/guides/ai-music-generators-games)

**Legale**
- [Commissione UE: regole di trasparenza](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems)
- [Articolo 50 e Digital Omnibus](https://complylayer.com/guides/eu-ai-act-article-50-transparency)
- [Cosa si applica dal 2 agosto 2026](https://www.legalithm.com/en/blog/eu-ai-act-what-applies-2-august-2026)
- [Definizione di deepfake e date](https://hellogrowth.ai/en/blog/eu-ai-act-2026-omnibus-labelling-ai-content)
- [Art. 612-quater c.p.: testo e pena](https://iusletter.com/?p=250320)
- [Legge 132/2025: profili penali](https://www.agendadigitale.eu/documenti/giustizia-digitale/legge-italiana-sullai-tutti-i-profili-penali-ecco-cosa-cambia/)

**Concorrenti**
- [LTX Studio: piani](https://toolradar.com/tools/ltx-studio/pricing)
- [LTX Studio: funzioni](https://vidmuse.ai/blog/ltx-studio-review)
- [Google Flow con Gemini Omni, agente e app mobile](https://www.gigazine.net/gsc_news/en/20260520-flow-by-google)
- [Gemini Omni negli abbonamenti Google](https://www.taxheal.com/?p=131145)
- [Higgsfield: storyboard dal testo](https://geo.higgsfield.ai/blog/who-offers-app-turns-text-stories-into-animated-reels)
- [OpenArt vs Higgsfield](https://moda.app/blog/openart-vs-higgsfield)
- [LongStories e Melies](https://longstories.ai/blog/best-ai-filmmaking-tools)
