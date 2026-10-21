# Filmzy — Registro delle decisioni

Ogni voce: data, decisione, perché, alternative scartate, conseguenze. Una decisione si cambia aggiungendone una nuova che la sostituisce, non riscrivendo la vecchia.

## D1 · Stack: TypeScript unico con NestJS — 19/10/2026

**Decisione:** monorepo TypeScript: NestJS per API e worker (BullMQ), React con Vite per l'interfaccia, schemi Zod condivisi. Python arriverà come servizio separato quando servirà (controllo dei volti, modelli locali), collegato alla troupe come una connessione.
**Perché:** il prodotto orchestra chiamate ad API, non esegue modelli. Per questo lavoro TypeScript e Python si equivalgono, mentre due linguaggi costano ogni giorno: schemi duplicati, una chiamata di rete interna, due deploy.
**Scartate:** NestJS + FastAPI (il piano iniziale del contesto); Python unico.
**Conseguenze:** le analisi dei dati si fanno con notebook esterni che leggono gli scontrini; nessuna libreria "solo Python" nel prodotto finché non serve davvero. _Per il database, la coda e la distribuzione vale D29: SQLite, coda interna, app locale._

## D2 · Configurazione della troupe nel database, con pannello admin da subito — 19/10/2026

**Decisione:** in esercizio la configurazione vive nel database e si modifica dal pannello: bozza → prova → pubblicazione → storico. I file YAML servono come seme, come copia in git e per test e bench.
**Perché:** cambiare modelli, parametri e istruzioni senza fare un deploy.
**Scartate:** solo file nel repository (più semplice, ma ogni cambio richiede un deploy).
**Conseguenze:** circa 5–7 giornate prima delle funzioni per l'utente. Il pannello arriva subito dopo il test di coerenza (M2), così il test non aspetta. _Dal 20/10 la configurazione sta in SQLite e il pannello è per chiunque usi l'app, in «Impostazioni avanzate» (D29)._

## D3 · Codice in inglese — 19/10/2026

**Decisione:** codice, chiavi di configurazione e schemi in inglese; interfaccia, istruzioni e documenti in italiano, con un glossario in `CLAUDE.md`. Configurazione in snake_case; oggetti del dominio e variabili delle istruzioni in camelCase.

## D4 · Cast personale dopo il test — 19/10/2026

**Decisione:** MVP con personaggi inventati. Le tabelle dei consensi esistono, la funzione `real_people` è spenta.
**Perché:** prima va verificato quale modello accetta volti reali verificati; altrimenti si costruisce un flusso di consenso che nessun modello può usare.
**Conseguenze:** prima di accenderla servono un test dedicato, un servizio di verifica dal vivo e la consulenza legale.

## D5 · La troupe — 19/10/2026

**Decisione:** il codice chiama ruoli; connessioni, catalogo, ruoli, istruzioni, preset e funzioni sono configurazione. Nel codice restano solo gli schemi di input e output dei ruoli. I parametri usano un vocabolario normalizzato, che adapter e traduttori convertono per ciascun fornitore.
**Conseguenze:** un LLM nuovo è solo configurazione; un modello video di una famiglia nota di solito anche; una famiglia nuova richiede un traduttore isolato.

## D6 · AI SDK per il trasporto LLM, niente framework agentici — 19/10/2026

**Decisione:** AI SDK (Vercel) dentro gli adapter LLM; il resto della troupe è codice nostro.
**Perché:** supporta molti fornitori, gli output strutturati con Zod, e `baseURL`, `headers` e `fetch` personalizzabili per gateway e proxy.
**Scartate:** LangChain e simili, perché l'astrazione è pesante e cambia spesso. Anche un gateway come LiteLLM obbligatorio in mezzo: sarebbe un servizio in più da tenere sicuro, e nel 2026 LiteLLM ha avuto una vulnerabilità grave sfruttata attivamente (CVE-2026-42271). Un gateway resta possibile come semplice `base_url` di una connessione.
**Fonti:** [AI SDK, provider compatibili con OpenAI](https://ai-sdk.dev/providers/openai-compatible-providers) · [AI SDK, provider Anthropic](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) · [Gateway LLM nel 2026](https://dev.to/moksh/llm-gateways-in-2026-openrouter-litellm-portkey-and-cloudflare-compared-4le)

## D7 · fal come primo fornitore di immagini e video — 19/10/2026

**Perché:** un'API per molti modelli, coda con webhook firmati.
**Rischio:** dipendenza da un aggregatore, con prezzi a volte più alti dell'accesso diretto. È mitigato dagli adapter: l'accesso diretto a un fornitore è un adapter in più. _In locale si usa solo il polling, perché fal non consegna webhook a indirizzi locali (D29)._

## D8 · Bibbia in tabelle + JSONB, assemblata come oggetto unico — 19/10/2026

**Cambia il contesto**, che diceva "un unico oggetto strutturato (Postgres + JSONB)".
**Perché:** personaggi e luoghi devono essere riusabili tra film (cast personale) e citabili dalle inquadrature. Per i ruoli la Bibbia resta un oggetto unico, assemblato dal modulo `bible`.

## D9 · Riserve solo per errori tecnici — 19/10/2026

Un rifiuto per contenuto non passa ad altri modelli: ci si ferma e si rilascia la caparra.  _La parte sulle riserve per errori tecnici è sostituita da D36: nessuna riserva automatica._

## D10 · LiquidJS per le istruzioni — 19/10/2026

Sintassi semplice, sicura per template modificati dal pannello, e una modalità rigorosa per scoprire variabili inesistenti.

## D11 · Drizzle ORM (da confermare in M0) — 19/10/2026

SQL leggibile e JSONB tipizzato con Zod. Alternativa: Prisma. _Dal 20/10 il database è SQLite e i campi JSON sono testo validato con Zod (D29); si conferma all'inizio di M2._

## D12 · Server-Sent Events per gli aggiornamenti live — 19/10/2026

Bastano notifiche dal server verso l'interfaccia, e SSE è più semplice di WebSocket.

## D13 · Test di coerenza con due personaggi inventati — 19/10/2026

**Cambia il contesto**, che diceva "un personaggio": serve un secondo personaggio per provare l'inquadratura a due.

## D14 · Rigenerazione della singola inquadratura nell'MVP — 19/10/2026

**Cambia il contesto**, che la metteva in Fase 2: senza di lei non funzionano né le varianti né il giallo.

## D15 · Prompt visivi in inglese — 19/10/2026

Interfaccia e istruzioni sono in italiano. I prompt per immagini e video li scrivono in inglese il direttore della fotografia e il casting, perché di solito i modelli li seguono meglio. Si può cambiare dalle istruzioni, e il bench può misurare la differenza.

## D16 · Stima dell'MVP: 32–45 giornate — 19/10/2026

**Cambia il contesto**, che diceva 4–6 settimane: ora il piano è dettagliato e include il pannello (5–7 giornate) e il test di coerenza. _Sostituita da D23._

## D17 · Il prodotto si chiama Filmzy — 20/10/2026

**Decisione:** il prodotto si chiama Filmzy; il repository è `Hacca13/Filmzy`, privato per ora. I documenti del repository passano al nuovo nome.
**Conseguenze:** `docs/contesto-progetto.md` e `docs/ricerca-ottobre-2026.md` sono copie di documenti che vivono nel progetto Claude e dicono ancora «Film Gen Ai»; le modifiche al contesto sono proposte in `docs/proposta-modifiche-contesto.md`. I nomi dei package (`@filmzy/*`) si fissano in T0.1.

## D18 · Ordine dei passi: bozza, personaggi, luoghi, riepilogo, stesura — 20/10/2026

**Cambia il contesto**, che diceva Idea → Personaggi → Sceneggiatura.
**Decisione:** Idea → bozza della sceneggiatura → Personaggi → Luoghi → riepilogo → stesura ufficiale → Scene → Film.
- La bozza è breve (titolo, trama in una riga, scene riassunte) e costa pochi centesimi. L'utente può chiedere modifiche allo sceneggiatore con una frase («Parla con lo sceneggiatore»): è una richiesta a turno singolo, moderata, che crea una nuova versione. Non è una chat libera.
- Per i personaggi l'utente indica quanti ne vuole; il casting parte dalla bozza. Il massimo (2 nell'MVP) sta nella configurazione (`limits.max_characters`) e lo applica il backend.
- Dopo cast e luoghi il codice confronta la bozza con le scelte e mostra le differenze; per ognuna l'utente sceglie «Adatta la storia», «Cambia la mia scelta» o «Va bene così». Se non ci sono differenze il passo non compare. «Va bene così» tiene l'elemento della bozza come comparsa o luogo generico, senza scheda: lo sceneggiatore riceve l'elenco degli elementi accettati. Poi viene la stesura ufficiale.

**Perché:** si decide prima ciò che costa meno (testo), poi le immagini, e il video per ultimo. Cast e luoghi nascono dalla storia vera. Riscrivere una bozza costa meno che rifare un cast.
**Scartate:** il cast prima della sceneggiatura (ordine del contesto), perché si spendono immagini prima di sapere quali personaggi servono; una chat libera con lo sceneggiatore, perché una richiesta a turno singolo è più semplice, più economica e si modera.
**Conseguenze:** lo sceneggiatore ha tre modi (`draft`, `revise`, `final`); la sceneggiatura ha una fase (`stage`: bozza o finale) oltre alle versioni; personaggi e luoghi della bozza hanno un `proposalId` che li collega alle scelte. «Bozza» ha due significati: la bozza della sceneggiatura (utente) e la bozza della troupe (admin, `TroupeDraft`).

## D19 · Le persone sono solo quelle generate da Filmzy — 20/10/2026

**Consolida D4** (`real_people` resta spenta).
**Decisione:** i personaggi del film li crea Filmzy. L'utente può caricare luoghi e oggetti; un'immagine con persone si rifiuta con un messaggio semplice, dopo un controllo con un modello con visione.
**Perché:** non si distingue con certezza una foto vera da un'immagine generata. Con un volto reale servono il consenso della persona e il rispetto delle regole dei fornitori (art. 612-quater c.p.; Seedance e Google rifiutano i volti realistici). Il diritto d'autore dei personaggi generati da noi non è il problema; restano i marchi e i personaggi noti, che il moderatore già blocca, e le somiglianze involontarie.
**Scartate:** accettare immagini con persone «dichiarate inventate» dall'utente: la dichiarazione non si può verificare.
**Conseguenze:** non si importano personaggi fatti con altri strumenti. Servono un controllo delle immagini caricate e un controllo del testo di ritocco (architettura §10). Funzione `image_upload`, spenta finché il controllo non esiste. _Dal 20/10 è un'impostazione prudente di default, non un obbligo: in un programma aperto non si può imporre (D28, D29)._

## D20 · Il ruolo delle immagini nell'inquadratura lo sceglie l'utente — 20/10/2026

**Decisione:** per ogni inquadratura l'utente può impostare immagini, generate o caricate, come `reference` (ispirazione), `first_frame` (da qui parte) o `last_frame` (qui finisce). La scelta è un requisito, non una preferenza: il router considera solo le voci del catalogo che accettano quella combinazione, e le riserve devono rispettarla. Se nessuna la accetta, errore `no_eligible_model` con un messaggio semplice, senza addebiti e senza declassare in silenzio a «solo ispirazione». Se manca l'ultimo fotogramma lo genera `storyboard_artist` in modo `end_frame`, modificando il primo con le schede bloccate come riferimento. Di default decide l'aiuto regista; «Imposta le immagini» è facoltativo. Il movimento di macchina si sceglie da una lista di dati (`camera_movements`).
**Perché:** i modelli non sono affidabili. Dare il punto di partenza e di arrivo riduce i tentativi e dà controllo all'utente, senza termini tecnici.
**Conseguenze:** nel catalogo ogni voce è un punto d'accesso e dichiara `input_modes`; un modello usato in più modi ha più voci. `unknown` vale «no» per il router, ma il bench lo può provare. La ShotSpec 0.2 si modifica sul posto (campo `images`), perché non è mai stata usata nel codice. Nuova regola di continuità R5. Rischio da misurare nel bench: con fotogrammi molto diversi i modelli tendono a «sciogliere» un'immagine nell'altra. Gli id e le capacità dei punti d'accesso con fotogrammi si verificano con la documentazione dei fornitori e con il bench.

## D21 · Luoghi con immagini e ritocco con maschera — 20/10/2026

**Decisione:** passo «Luoghi»: il ruolo `set_designer` genera 3–4 immagini per luogo e l'utente sceglie. Il ritocco col pennello (ruolo `retoucher`: togli, sostituisci, cambia colore) vale per le immagini: luoghi, storyboard, fotogrammi chiave. Per un video si corregge il fotogramma e si rigenera, oppure si usa un fotogramma del video (estratto con ffmpeg) come punto di partenza. La modifica vera del video (`video_edit`) si prova dopo l'MVP su 3–4 clip.
**Perché:** il pennello sposta il controllo sulle immagini, dove un tentativo costa centesimi. La modifica del video costa dollari a tentativo ed è poco affidabile.
**Conseguenze:** i luoghi esistono davvero nell'MVP (prima nessun task li creava). Regola R6: un luogo ritoccato o cambiato fa ingiallire le inquadrature che lo usano. Un ritocco che tocca volto o abiti di un personaggio bloccato conta come cambio di scheda (R3). Il testo scritto dall'utente per il ritocco passa dal moderatore e va al modello così com'è, in italiano; se il bench mostra che l'inglese funziona meglio si aggiunge una traduzione (D15). Funzione `retouch`, spenta finché non è pronta.

## D22 · Scheda personaggio: nucleo obbligatorio, dettagli facoltativi, tag — 20/10/2026

**Decisione:** campi obbligatori: nome, tag, ruolo nella storia, descrizione breve, aspetto. Facoltativi, in `profile`: carattere, comportamento, obiettivo (la «motivazione» di prima, rinominata). Il casting li propone sempre; l'interfaccia mostra «Aggiungi dettagli». I tag (protagonista, antagonista, alleato, mentore, comprimario) sono dati in `config/presets/character_tags.yaml`. I campi finiscono nella Bibbia e li leggono tutti i ruoli, così il personaggio resta coerente lungo il film.
**Perché:** per uno spot o un corto breve bastano pochi dati; per un film più lungo i dettagli tengono il personaggio coerente.
**Conseguenze:** le istruzioni devono tollerare i campi vuoti. Il controllo di coerenza del comportamento da parte della segretaria di edizione resta fuori dall'MVP, per evitare falsi allarmi. I formati (spot, trailer, videoclip) che decidono quali campi sono obbligatori e l'elenco dei tag si approfondiscono dopo.

## D23 · Stima dell'MVP: 40–57 giornate — 20/10/2026

**Sostituisce D16**, che diceva 32–45.
**Decisione:** il piano passa a 40–57 giornate (circa 8–11½ settimane) per D18–D22: il flusso con bozza e riepilogo (+3–4), i luoghi con le immagini del set (+2–3), le immagini dell'inquadratura (+3–5). Due opzioni restano fuori dalla stima base: il caricamento di luoghi e oggetti (`image_upload`, +2–3) e il ritocco col pennello (`retouch`, +3–4). Con entrambe sono 45–64 giornate.
**Conseguenze:** se le due opzioni entrano nell'MVP si decide a metà di M4, dopo i costi e le code (T4.7). Le cifre sono stime grossolane, da rivedere dopo il test reale di M1. _Sostituita da D26._

## D24 · Tracce audio separate dal video — 20/10/2026

**Decisione:** il suono sta su tracce separate dal video: Video (l'audio originale dei take, spento di default), Dialoghi (presente ma spenta fino alla Fase 2), Musica (un blocco per scena) ed Effetti (agganciati a un'inquadratura, con il secondo di partenza). Ogni traccia ha muto e volume.
- Musica ed effetti si generano con modelli a parte (ruoli `composer` e `sfx_artist`). Il ruolo `sound_planner` propone i suoni dal copione («Suggerisci i suoni»): l'utente accetta o scarta ogni proposta.
- L'audio generato dentro i video si silenzia: dove possibile si chiede ai modelli di non produrlo (`audio: false`) e in ogni caso lo toglie ffmpeg all'esportazione, a meno che l'utente lo accenda per un take.
- Il mix si rifà con ffmpeg a ogni esportazione, con livellamento del volume. Musica per scena ed effetti per inquadratura: la timeline libera resta in Fase 3.
- Nell'MVP non si caricano file audio. _Sostituito da D27._

**Perché:** cambiare una musica o un effetto costa pochi centesimi e non tocca il video. È il principio di indipendenza dai modelli applicato al suono.
**Scartate:** l'audio nativo dei modelli video (cambia con il modello e non si può sostituire); una timeline libera già nell'MVP (troppo lavoro); il caricamento di file audio (diritti della musica e voci di persone reali, come D19).
**Conseguenze:** nuove tabelle `audio_tracks`, `audio_clips`, `audio_variants`; nuova fase `sound` del progetto; nuova regola R8; funzioni `music` e `sound_effects`. La ricerca del 13/10 copre la musica (ElevenLabs Music ha un'API, Suno è da evitare) ma non gli effetti: prima di scegliere il fornitore serve una mini-ricerca (T5.4). Le descrizioni scritte dall'utente passano dal moderatore e vanno al modello così come sono, come per il ritocco (D21).

## D25 · Chiavi dei fornitori cifrate nel database, con pagina Connessioni guidata — 20/10/2026

**Chiude una domanda aperta** del contesto e dell'architettura (§13): chiavi solo nelle variabili d'ambiente, o anche nel database.
**Decisione:** solo l'amministratore della piattaforma inserisce le chiavi, da «Impostazioni > Connessioni»: collega un fornitore, incolla la chiave, «Prova la connessione» (una chiamata gratuita), sceglie i modelli da aggiungere e poi li assegna ai ruoli in «Chi fa cosa».
- Le chiavi stanno nel database, cifrate (AES-256-GCM), con una chiave principale che vive solo in una variabile d'ambiente (`SECRETS_MASTER_KEY`).
- Sono in sola scrittura: l'API non le restituisce mai e l'interfaccia mostra solo «Chiave collegata ••••1a2b». Si sostituiscono o si rimuovono, e ogni azione finisce nel registro.
- Nella configurazione una chiave si cita con `env:NOME` (come prima: seme, test, sviluppo) o con `secret:NOME` (dal database). I file nel repository e `pnpm troupe export` contengono solo i riferimenti.

**Perché:** chi amministra non è per forza tecnico: deve poter collegare un fornitore senza toccare file e server.
**Scartate:** solo variabili d'ambiente (ogni cambio richiede accesso al server); chiavi per utente («porta la tua chiave»): dipende dal modello di guadagno, ancora da decidere, e per chi non è tecnico significa aprire account presso più fornitori. Si potrà aggiungere dopo, senza rifare nulla.
**Conseguenze:** cambia la regola 7 di `CLAUDE.md`. Nuova tabella `secrets`. Il controllo dei segreti (§4.6, punto 5) verifica anche i `secret:`. Serve una procedura per cambiare la chiave principale. I backup contengono solo testo cifrato e la chiave principale si conserva a parte. _Aggiornata da D29: le chiavi stanno nel portachiavi del sistema operativo, non nel database, e non c'è `SECRETS_MASTER_KEY`. La procedura guidata resta, per chiunque usi l'app e non solo per un amministratore._

## D26 · Stima dell'MVP: 47–68 giornate — 20/10/2026

**Sostituisce D23**, che diceva 40–57.
**Decisione:** per D24 e D25 il piano sale a 47–68 giornate (circa 9½–13½ settimane): le tracce audio con i suggerimenti (+5–8, in M5) e le connessioni guidate con le chiavi cifrate (+2–3, in M2). Le due opzioni di D23 restano fuori dalla stima base; con entrambe sono 52–75 giornate.
**Conseguenze:** stime grossolane, da rivedere dopo il test reale di M1. _Aggiornata da D27 e sostituita da D32._

## D27 · Il caricamento di file audio è ammesso, con condizioni — 20/10/2026

**Sostituisce** la parte di D24 che escludeva i file audio dall'MVP e **aggiorna** la stima di D26.
**Decisione:** l'utente può caricare file audio propri (musica, effetti, registrazioni di voce) su qualunque traccia, compresa Dialoghi: una registrazione caricata funziona da voce fuori campo, senza sincronizzazione del labiale. La generazione delle voci resta Fase 2. La responsabilità di ciò che si carica è dell'utente, come in un programma di montaggio. Condizioni:
- al caricamento l'utente dichiara di avere i diritti sul file e, se c'è la voce di un'altra persona, il suo consenso; la dichiarazione resta nel registro;
- i file restano privati nel progetto: nessuna galleria e nessun link pubblico nell'MVP, solo esportazione e download con URL firmato;
- i file caricati **non vanno mai a un fornitore AI** (niente voce clonata, labiale o riferimento audio): servono solo al mix con ffmpeg;
- c'è un modo per segnalare e rimuovere un contenuto (tabella `reports`, già prevista) e le condizioni d'uso vietano i contenuti che violano diritti altrui o che ingannano;
- l'esportazione tiene la dicitura «Contiene contenuti generati con intelligenza artificiale» e la marcatura.

**Perché:** un programma di montaggio non verifica i diritti dei file dell'utente, e riconoscere l'audio uno per uno è sproporzionato per l'MVP. Bastano gli strumenti di sempre: dichiarazione, condizioni d'uso, segnalazione e rimozione. Inviare i file ai fornitori sarebbe invece un rischio per l'account API (come D19 per i volti).
**Differenza dai programmi di montaggio:** un editor gira sul computer dell'utente; Filmzy, se lo gestisce l'autore, ospita i file sui suoi server. Chi ospita risponde dei contenuti che conosce o che gli vengono segnalati, e deve rimuoverli. Il codice aperto non cambia questo obbligo per il servizio gestito dall'autore; cambia per chi lo installa per conto proprio. Prima di aprire il servizio al pubblico serve una consulenza legale, come già per i volti reali (questa non è consulenza legale).
**Scartate:** controllare i file con un riconoscimento dell'audio (costo e falsi positivi); escludere i file audio (D24).
**Conseguenze:** nuova origine `uploaded` per le clip audio; la traccia Dialoghi funziona per le registrazioni caricate; il pannello del blocco ha «Carica un file»; funzione `audio_upload`, che l'amministratore può spegnere. Circa +1–2 giornate: l'MVP sale a 48–70 giornate (53–77 con le due opzioni). `CLAUDE.md`: tolto il divieto di file audio, aggiunto quello di inviarli ai fornitori. _Dal 20/10 le condizioni su dichiarazione dei diritti, segnalazione e rimozione, `audio_upload` e hosting sono superate (D28, D29): resta che i file caricati non vanno mai ai fornitori AI._

## D28 · Software libero con licenza AGPL-3.0, sostenuto da donazioni — 20/10/2026

**Decisione:** Filmzy è software libero con licenza **AGPL-3.0**. Non c'è un servizio gestito dall'autore, non ci sono account né pagamenti: ognuno usa il programma sul proprio computer con le proprie chiavi. Il progetto si sostiene con donazioni (un link nel repository e nel README). Il programma è fornito «così com'è»: chi lo usa risponde dei file che carica e dei contenuti che crea e pubblica, e il README contiene un avviso di uso responsabile.
**Perché:** nessun costo di gestione né rischio economico per l'autore; nessun obbligo di ospitare, moderare o rimuovere i contenuti degli altri; un buon progetto da portfolio e da comunità. La AGPL impedisce di chiudere una copia modificata per rivenderla: chi la pubblica, anche solo come servizio online, deve mettere a disposizione il codice.
**Scartate:** un servizio a crediti gestito dall'autore (costi, pagamenti, IVA, obblighi da ospitante); un servizio gratuito per tutti sostenuto da donazioni (un film da 60 s costa 11–66 $ di API: le donazioni non bastano); la licenza MIT (più diffusione, ma nessuna protezione dalle copie chiuse).
**Conseguenze:** `LICENSE` nella radice. Il repository può diventare pubblico quando l'autore vuole, dopo `LICENSE`, avviso nel README e link alle donazioni (nella cronologia non ci sono segreti). I costi dei fornitori sono dell'utente (D30). Le impostazioni prudenti (moderatore, solo persone generate, dicitura AI) restano di default ma non sono imposte: proteggono l'account dell'utente. Non è consulenza legale.

## D29 · Filmzy gira in locale, come app per il desktop con Electron — 20/10/2026

**Aggiorna** parti di D1 (database, coda e distribuzione), D2 (configurazione e pannello admin), D7 (webhook di fal), D11 (Drizzle, ora con SQLite), D19 (la regola sulle persone) e D25 (le chiavi).
**Decisione:** il programma è un'app per Windows, macOS e Linux, impacchettata con Electron e installabile con un doppio clic, con aggiornamenti da GitHub Releases. Prima dell'installatore si lavora con un'app locale che parte da riga di comando.
- **Dati:** SQLite (con Drizzle) nella cartella dell'app; i file dei progetti in cartelle locali, un film una cartella; un progetto si esporta e si importa come copia di sicurezza.
- **Lavori:** un solo processo. La coda è interna e salvata in SQLite, così i lavori ripartono dopo un riavvio. Niente Redis, BullMQ, MinIO, R2, Docker né Caddy.
- **Fornitori:** solo polling. La verifica dei webhook non si implementa.
- **Chiavi:** nel portachiavi del sistema operativo (Electron `safeStorage`), inserite dall'utente da Impostazioni > Connessioni.
- **Eliminati:** account, ruoli, crediti, pagamenti, segnalazioni e rimozioni. La configurazione avanzata della troupe diventa «Impostazioni avanzate».
- **Nessuna telemetria** parte da sola.

**Perché:** coerente con D28. Chi non programma non installa Node e pnpm: serve un installatore. Un solo processo e un solo file di database sono più semplici da impacchettare e da far funzionare ovunque.
**Scartate:** una modalità server accanto a quella locale (doppio lavoro da mantenere): le interfacce `ConfigSource`, `AssetStore`, `ReceiptSink` e la coda restano pulite, così potrebbe tornare un giorno; Tauri (più leggero, ma richiederebbe un Node incluso a parte).
**Conseguenze:** cambiano T0.2, M2, T3.1, T4.3 e T6.4 (vedi il piano). Servono la firma del codice e gli aggiornamenti automatici (M6). Drizzle con SQLite si conferma all'inizio di M2. `apps/worker` sparisce e nasce `apps/desktop`.

## D30 · Costi reali in dollari, con tetti di spesa regolabili — 20/10/2026

**Sostituisce** i crediti e la caparra (`hold`, `capture`, `void`) del contesto e di D26.
**Decisione:** l'utente paga i fornitori con le proprie chiavi. Prima di ogni generazione la troupe stima il costo (`troupe.estimate`) e l'interfaccia lo mostra in dollari («circa 1,20 $»). I tetti sono su tre livelli, tutti regolabili o eliminabili dall'utente:
1. **per chiamata**, nel ruolo (`budget.max_usd_per_call`): un freno tecnico contro gli errori;
2. **per film** (`limits.film_budget_usd`, predefinito 50 $), con conferma sopra `limits.confirm_above_usd`;
3. **mensile**, facoltativo, impostabile quando si collega un fornitore o si configura un modello (`monthly_cap_usd`).

Superato il tetto del film o del mese, il programma lo dice e l'utente decide se alzarlo o proseguire: sono impostazioni, non muri. _(Il tetto per chiamata è stato tolto da D38.)_ La spesa si calcola dagli scontrini. Il programma ricorda anche di impostare un limite di spesa nel pannello del fornitore.
**Perché:** i costi sono veri (11–66 $ per un film da 60 s) e chi li paga deve vederli prima, ma deve poter decidere: sono i suoi soldi e il suo account.
**Conseguenze:** nuovo errore `spend_cap_reached`. Il modulo `credits` diventa `spend`. Il prompt per Figma 01 cita crediti e saldo: lo corregge il prossimo prompt (`design/prossimo-prompt.md`, D33).

## D31 · Dicitura sì, marcatura C2PA opzionale dopo l'MVP — 20/10/2026

**Cambia** il piano: la marcatura C2PA esce dall'MVP.
**Decisione:** la dicitura «Contiene contenuti generati con intelligenza artificiale» resta nei titoli, attiva di default. La marcatura leggibile dalle macchine (C2PA) diventa un'opzione dopo l'MVP (`c2pa_marking`). I metadati e le filigrane dei fornitori non si rimuovono, ma l'esportazione ricodifica i video, quindi non è garantito che sopravvivano.
**Perché:** l'obbligo principale di marcare i contenuti sintetici (AI Act, art. 50, par. 2) ricade sui fornitori dei sistemi che li generano, cioè i servizi di AI generativa. Resta incerto se Filmzy, che assembla contenuti di più servizi e li ricodifica, conti anch'esso come fornitore: l'esenzione per il software libero (art. 2, par. 12) esclude proprio l'art. 50. L'etichetta nei titoli non costa nulla e copre il caso più semplice.
**Conseguenze:** da far verificare a un legale prima di una versione 1.0 pubblica (non è consulenza legale). Chi pubblica contenuti realistici ha comunque propri obblighi di trasparenza.

## D32 · Stima dell'MVP in locale: 47–69 giornate — 20/10/2026

**Sostituisce D26** (e con esso D23 e la cifra di D27).
**Decisione:** il piano in locale vale 47–69 giornate (circa 9½–14 settimane); con le due opzioni (caricamento di immagini e ritocco col pennello) 52–76. Si risparmia su accesso, crediti, deploy, webhook e C2PA; si aggiungono impacchettamento e aggiornamenti, tetti di spesa e procedura guidata, SQLite e coda interna, esportazione dei progetti e prove su tre sistemi operativi.
**Conseguenze:** stime grossolane, da rivedere dopo M1 e dopo il primo installatore.

## D33 · Un solo prompt per Figma da lanciare alla volta — 20/10/2026

**Decisione:** in `design/` c'è un solo prompt in attesa (`prossimo-prompt.md`); quando l'autore lo lancia in Figma passa in `design/storico/` con numero e data. Nello storico restano solo i prompt davvero lanciati. Finora è stato lanciato solo il primo; i prompt 02–05, scritti in anticipo e mai lanciati, sono stati fusi in un unico prompt (senza crediti, accesso e amministratore, superati da D28–D30).
**Perché:** i prompt in coda si contraddicevano man mano che le decisioni cambiavano, e Figma ha crediti limitati: meglio un prompt solo, sempre aggiornato.
**Scartate:** tenere in `design/` tutti i prompt scritti con un registro dello stato.

## D34 · Strumenti del monorepo e comando unico di verifica — 20/10/2026

**Decisione (T0.1):**
- **Strumenti** (versioni fissate, tutte uscite da oltre due settimane): pnpm 12.9.1 (Node 24, `packageManager` nel `package.json`), Turborepo 2.11.7, TypeScript **6.0.3**, ESLint 10.12.0 con typescript-eslint 8.71.1 (`strictTypeChecked`), Prettier 3.9.9, Vitest 5.0.3. Scope dei package: `@filmzy/*`.
- **TypeScript 6 e non 7:** la 7.0 è uscita, ma typescript-eslint dichiara di funzionare solo con TypeScript inferiore alla 6.1. Si passa alla 7 quando typescript-eslint la supporta.
- **Tutti i package sono moduli ES** (`"type": "module"`, `NodeNext`); compilati con `tsc` in `dist/`. Se in T0.2 `apps/api` (NestJS) non riesce a caricarli, si compilano anche in CommonJS.
- **`pnpm check`** lancia lint, typecheck, test e build con Turborepo, poi il controllo dello stile. È il comando di «fatto» (CLAUDE.md, piano). La forma `pnpm lint typecheck test build` dei documenti non faceva quello che diceva: pnpm lancia solo `lint` e passa le altre parole come argomenti.
- **Prettier controlla solo il codice** (non `docs/`, `config/`, `design/`, né i file `.md`/`.yaml`).
- **`any` e `eslint-disable` richiedono un motivo scritto** (`-- motivo`): lo impone ESLint, come chiede CLAUDE.md.
- **Fine riga sempre LF** (`.gitattributes`, `.editorconfig`, Prettier), anche su Windows, dove `core.autocrlf` li convertiva.
- **CI** (GitHub Actions) su Ubuntu e su Windows, con le action fissate al riferimento esatto (SHA), non all'etichetta.
- **Turborepo non scrive `AGENTS.md`** (`agentGuidance: false`): le regole per gli assistenti stanno in `CLAUDE.md`.

**Perché:** un solo comando che non si dimentica nessun controllo; versioni fissate e non appena uscite, per ridurre i rischi della catena di fornitura; Windows in CI perché lo sviluppo avviene anche lì.
**Conseguenze:** D11 (Drizzle) si conferma all'inizio di M2, come già detto in D29. I pacchetti dei prossimi task si aggiungono in `packages/` e `apps/` senza toccare la radice.

## D35 · Server locale NestJS 12 e interfaccia React + Vite (T0.2) — 20/10/2026

**Decisione:**
- **NestJS 12.1.2**, scritto in moduli ES come i nostri package: la domanda di D34 («ESM o CommonJS?») si chiude, i package restano solo ES e non serve compilarli in CommonJS. Decoratori con `experimentalDecorators` e `emitDecoratorMetadata`, che funzionano anche nei test con Vitest 5.
- **Interfaccia:** React 19.3.0, Vite 8.3.2, `@vitejs/plugin-react` 6.1.1. Un solo `getJson` per tutte le chiamate al server, che controlla la risposta con lo schema Zod del contratto e distingue tre errori (rete, HTTP, formato).
- **Contratto condiviso** (`@filmzy/contracts`, ora con Zod 4.6.5): risposta di `GET /api/health`, prefisso `api`, indirizzo e porta del server. Il nome della variabile `FILMZY_API_PORT` e il suo controllo stanno in un posto solo (`readApiPort`), usato da server e proxy.
- **`.env` facoltativo**, nella radice del repository, caricato da **Node** con `--env-file-if-exists` (`pnpm dev` e `pnpm --filter @filmzy/api start`): un solo meccanismo per server e interfaccia, nessun lettore fatto in casa. Le variabili già nell'ambiente battono il file. Turborepo filtra le variabili d'ambiente che non conosce: l'elenco di quelle da lasciar passare sta in `globalPassThroughEnv` (`turbo.json`) e una nuova variabile usata dal codice va aggiunta lì (altrimenti `FILMZY_API_PORT=… pnpm dev` e le chiavi dei servizi AI di M1 verrebbero ignorate: difetto trovato dalla revisione).
- **Sicurezza del server locale:** solo `127.0.0.1`; rifiuto dell'header `Host` non locale (DNS rebinding) e delle richieste che modificano dati da un'`Origin` non locale (altri siti); nessun CORS, nessun `x-powered-by` (architettura §10). I rifiuti hanno un corpo con codice (`forbidden_host`, `forbidden_origin`), definito dallo schema `apiErrorSchema` del contratto; il client lo legge e lo mette in `ApiError.serverCode`.
- **Avvio:** Nest parte con `abortOnError: false`, così un errore di avvio arriva al messaggio di `main.ts` invece di interrompere il processo. L'interfaccia, all'apertura, riprova fino a 30 volte (una al secondo) prima di dire che Filmzy non parte: può aprirsi qualche secondo prima del server.
- **Controllo della porta rigoroso:** solo cifre decimali, niente `0x50`, `1e3` o spazi.
- **Browser senza Node:** ESLint vieta `node:*`, `process` e `Buffer` in `apps/web/src` (i tipi di Node restano visibili a TypeScript per `vite.config.ts`). Il proxy di Vite inoltra `^/api/` e non `/apiary`, ed esiste solo per il server di sviluppo.
- **`pnpm dev`** lancia con Turborepo il server (`nest start --watch`), l'interfaccia (`vite`) e la compilazione continua di `contracts`. Un cambio ai contratti ricompila ma non riavvia il server: va riavviato `pnpm dev`.
- **Un'unica `createApp()`** configura il server, usata sia da `main.ts` sia dai test: si prova la configurazione vera.

**Perché:** il criterio di T0.2 è che da un clone pulito `pnpm install && pnpm dev` avvii tutto, senza Docker: provato su un clone pulito, con le due pagine e il proxy interrogati.
**Conseguenze:** nessuna prova automatica del rendering dell'interfaccia (serve un DOM di test: si aggiunge con le prime schermate vere). Le versioni sono tutte uscite da oltre due settimane; `pnpm audit` non segnala vulnerabilità. Gli errori che Nest produce da solo (per esempio il 404) hanno ancora la forma di Nest, non `{ code }`: un filtro globale che li uniformi si aggiunge con il primo errore di dominio (M2). La rilettura del codice, fatta da me e da una revisione indipendente, ha portato a 15 correzioni prima della pull request.

## D36 · Scelta del servizio per ogni generazione — 20/10/2026

**Estende** D20 (le scelte dell'utente sono requisiti per il router); **sostituisce** D9 (niente più riserve automatiche) e **aggiorna** D30 (nessun tetto è preimpostato dall'autore).
**Decisione:** per ogni generazione di immagini, video, musica ed effetti sonori l'utente può cambiare servizio, cioè il modello che la esegue, perché uno può funzionare meglio di un altro su quel soggetto. Di default lavora il predefinito; «Cambia servizio», accanto a «Genera», mostra gli altri.
- **Come si gestiscono i servizi.** Sono in liste divise per gruppo (testo, immagini, video, musica ed effetti, voci). Per ogni gruppo l'utente aggiunge un fornitore da una finestra (fornitore, chiave, limite di spesa facoltativo, modelli da usare) e sceglie il modello predefinito di quel fornitore e il fornitore predefinito del gruppo. Ogni uso dell'AI parte dal predefinito del suo gruppo; con «Cambia servizio» si sceglie un altro fornitore (parte dal suo modello predefinito) oppure un altro modello.
- **Configurazione tecnica e scelte dell'utente restano separate.** Catalogo, connessioni e ruoli restano JSON validato e versionato nelle release (bozza → prova → pubblicazione): non c'è una tabella per tipo di servizio, perché i modelli sono una sola lista con il campo `kind` e le Impostazioni li raggruppano. Le scelte di ogni giorno stanno nella tabella `settings` e non richiedono una pubblicazione: servizi attivati, predefiniti, limiti di spesa. Ordine al momento dell'uso: la release, poi le scelte dell'utente, poi l'adattamento d'ambiente (che in test e in `offline` deve restare più forte, per usare il fornitore finto).
- **Predefinito e scelta non pesano uguale.** Il predefinito è una preferenza: se per una richiesta non è adatto (per esempio una durata che non accetta), il router propone il primo che lo è e l'utente lo vede, con il costo, prima di generare. Il `modelId` scelto per una singola generazione è invece un **requisito**, come D20: deve essere un servizio attivato dall'utente, con connessione e chiave a posto, del tipo giusto e adatto alla richiesta (durata, riferimenti, modo d'ingresso, parametri del ruolo, traduttore per la sua famiglia, capacità richieste dal ruolo). Altrimenti `no_eligible_model` con un messaggio semplice, senza addebiti, mai un altro servizio in silenzio.
- **Niente riserve automatiche.** Se un servizio fallisce, il lavoro si ferma e dice perché; l'utente decide se riprovare o cambiare servizio. Il programma non spende i soldi dell'utente su un servizio che forse non va bene per quel lavoro senza che lui lo sappia. Restano solo pochi nuovi tentativi sullo stesso servizio per errori passeggeri (per esempio troppe richieste), senza costi doppi (idempotenza, regola 10). Vale per ogni ruolo, anche di testo: il campo `fallbacks` sparisce dalla configurazione. Il rifiuto di un contenuto resta come in D9: ci si ferma e non si aggira.
- **Il servizio si fissa quando si stima:** `troupe.estimate` dice quale servizio lavorerà e quanto costerà, e il lavoro in coda usa quello anche se nel frattempo le impostazioni cambiano.
- **Il servizio usato si scrive** nello scontrino (con il nome che aveva in quel momento); il take, le immagini e le varianti audio rimandano al loro scontrino. Così si confrontano i take fatti con servizi diversi e si può rigirare con un altro.
- **La scelta mostra** il nome amichevole (campo `label` del catalogo), il costo stimato in dollari e il voto delle prove (`quality`, dal bench). L'elenco lo costruisce il backend (`troupe.options`) e l'interfaccia lo mostra, senza decidere nulla (regola 8).
- **Nessun tetto preimpostato.** I limiti li sceglie l'utente. Il limite mensile di un fornitore si imposta (facoltativo) quando lo si aggiunge; il limite per film e «chiedi conferma sopra una cifra» sono facoltativi e spenti finché l'utente non li accende. Il programma mostra quanto si è speso e quanto manca al limite, e avvisa quando ci si avvicina (all'80%) e quando lo si raggiunge; superato un limite, l'utente decide se alzarlo o proseguire. Anche il tetto per chiamata dei ruoli è tolto (D38): ogni limite lo decide l'utente.
- **Errori comprensibili.** Un fallimento arriva all'interfaccia con un codice, l'indicazione se ha senso riprovare e i dettagli utili (ruolo, servizio, campo), così l'interfaccia spiega perché è fallito e cosa si può fare (architettura §4.10).
- **Il router sceglie prima del direttore della fotografia:** il prompt visivo è scritto per la famiglia del servizio scelto.

**Perché:** i servizi di immagini e video cambiano in fretta e nessuno è il migliore su tutto; chi paga ogni tentativo deve poter provare un altro servizio subito, senza aspettare una pubblicazione e senza passare dalle impostazioni avanzate. Le release danno già validazione, storico e ripristino: una tabella per tipo li avrebbe duplicati. Senza riserve automatiche il controllo della spesa resta all'utente.
**Scartate:** una tabella per tipo di servizio (immagini, video, musica); lasciare la scelta alle sole impostazioni avanzate (ogni cambio richiederebbe una pubblicazione); passare a un altro servizio quando quello scelto non va, anche dicendolo (decide l'utente); limiti di spesa preimpostati dall'autore.
**Conseguenze:** nei contratti (T0.3) il `modelId` facoltativo nel `ctx` della richiesta, `ModelOption` (id, nome, costo stimato, voto, se è il predefinito), `UserSettings`, il campo `label` nel catalogo (già nel seme `config/ai/models.yaml`) e l'errore con codice, `retryable` e dettagli; `troupe.options(role, input, ctx)` si aggiunge alla troupe e `troupe.estimate` restituisce anche il servizio fissato; `model_id` e il nome nello scontrino. La `ConfigSource` consegna alla troupe anche le scelte dell'utente (la troupe non legge il database). L'utente vede solo il nome amichevole, mai l'id tecnico presso il fornitore né i parametri: in `CLAUDE.md` la riga «Da non fare» sui nomi dei modelli è precisata di conseguenza. Il seme perde i `fallbacks` e i valori `film_budget_usd` e `confirm_above_usd`. Il lavoro in più è piccolo ma sparso (T0.3, T0.4, T1.5, T2.2, T2.7, T3.1, T4.3): sta dentro le forchette dei suoi milestone, quindi la stima del piano non cambia; da rivedere dopo M1.

## D37 · Moodboard di progetto, facoltativo ma consigliato — 20/10/2026

**Decisione:** ogni film può avere un moodboard: palette dei colori, consigli (luce, colore, macchina, ritmo) e immagini di riferimento. Vale per tutto il film e può avere una parte per singole scene (palette, consigli e riferimenti propri; se manca vale quella del film). È facoltativo, ma consigliato, e lo possono usare anche gli utenti esperti.
- **Due modi per averlo.** L'app lo genera (ruolo `moodboard_designer` per palette, consigli e descrizioni; ruolo `moodboard_artist` per le immagini), oppure l'utente carica le sue immagini. Un'immagine caricata viene analizzata e strutturata dal ruolo `image_analyst` (un modello che legge le immagini): descrizione, atmosfera, luce, composizione. I colori dominanti li calcola il codice, perché è esatto e non costa.
- **A cosa serve.** Palette, consigli e descrizioni entrano come testo negli ingressi dei ruoli che scrivono o generano immagini (aiuto regista, direttore della fotografia, character designer, scenografo, storyboard): `moodboard` è facoltativo, nullo se non c'è. Le immagini del moodboard non vanno da sole ai modelli di generazione: l'utente può sceglierne una come immagine di un'inquadratura da «Imposta le immagini» (`from: 'moodboard'`). Se il moodboard cambia dopo i take, i take già girati ricevono un avviso leggero (regola R9).
- **Dove sta nel flusso.** Passo facoltativo «Moodboard» dopo «La storia» (servono le scene per parlare di scene specifiche) e sempre raggiungibile dal menu del film.
- **Prudenza.** Le immagini caricate passano dallo stesso controllo di D19: un'immagine con marchi, personaggi noti o minori sospetti si rifiuta (`image_rejected`); con persone entra solo per l'analisi (D38). L'immagine caricata viene inviata una volta al servizio di testo scelto dall'utente per descriverla, e l'interfaccia lo dice.
- **Le istruzioni** dei tre ruoli sono file come tutte le altre (`config/ai/instructions/<ruolo>/v1.md`), modificabili dalle impostazioni avanzate: il testo si scrive insieme all'autore nel task che le introduce.
- **Perché:** lo consiglia un esperto di cinema consultato dall'autore: un riferimento comune per colore e atmosfera tiene coerente il film, e le immagini si correggono a centesimi prima di spendere sul video. Non è obbligatorio, per non appesantire chi vuole partire subito.
- **Scartate:** renderlo obbligatorio; farlo solo per l'intero film (le scene hanno spesso un'atmosfera propria); estrarre la palette con il modello di visione (meno esatto e a pagamento).
- **Conseguenze:** nuova funzione `moodboard` (spenta finché non è pronta), tre ruoli, un'estensione della Bibbia, tre tabelle (`moodboards`, `moodboard_scenes`, `moodboard_references`), regola R9, task T4.10 come opzione dell'MVP (+3–4 giornate): con tutte le opzioni la stima sale a 55–80 giornate (circa 11–16 settimane). Le immagini con persone sono ammesse solo per l'analisi (D38).

## D38 · Impostazioni per ruolo, istruzioni a versioni e gruppo «Lettura immagini» — 20/10/2026

**Aggiorna** D36 e D37; **sostituisce** il tetto per chiamata di D30 (nessun limite lo decide l'autore).
**Decisione:**
- **Ogni ruolo si può regolare** dalla pagina «Chi fa cosa», aperta a tutti: fornitore, modello, creatività (la temperatura, dentro i limiti del modello) e versione delle istruzioni. Partono dai predefiniti del gruppo e si cambiano subito, senza pubblicare. È il minimo di controllo che l'autore vuole dare anche a chi non è tecnico; nelle schermate la temperatura si chiama «Creatività». Se si cambia modello, le regolazioni che il nuovo modello non accetta si scartano e l'utente ne è avvisato.
- **Istruzioni a versioni.** Ogni ruolo ha una cartella con un piccolo file `manifest.json` (le versioni disponibili e quale è la consigliata) e un file di testo per ogni versione (`v1.md`, `v2.md`…, più le varianti per famiglia). Una versione pubblicata non si modifica più. Un aggiornamento del programma aggiunge versioni nuove ma non cambia la scelta dell'utente: chi usa la v1 resta sulla v1, vede che ne esiste una nuova con il suo registro dei cambiamenti e decide se provarla; chi non ha mai scelto segue la consigliata. Le versioni vecchie non si cancellano.
- **Istruzioni proprie.** L'utente può caricare un file di istruzioni nel nostro formato (con un modello da scaricare). Il programma lo controlla come gli altri (variabili che esistono, prova di rendering) e lo salva come versione sua, che si può scegliere per un ruolo e modificare. Cambiare le istruzioni del moderatore indebolisce un'impostazione prudente (D28): c'è un'avvertenza.
- **Gruppo «Lettura immagini».** I ruoli di testo che devono leggere immagini (`image_analyst`, anche per il controllo delle immagini caricate) formano un gruppo a sé, con il proprio fornitore e modello predefiniti, scelti tra i modelli che leggono le immagini (capacità `vision`). La chiave è la stessa del gruppo testo: un fornitore già collegato non si reinserisce.
- **Moodboard: immagini con persone solo per l'analisi** (aggiorna D37). Un'immagine caricata con persone entra nel moodboard solo per l'analisi (descrizione, atmosfera, colori): l'interfaccia la segna «Solo per l'analisi» e non può essere scelta per un'inquadratura né andare a un modello di generazione. Marchi, personaggi noti e minori sospetti si rifiutano come prima (`image_rejected`). Il passo «Moodboard» resta dopo «La storia».
- **Nessun tetto per chiamata.** Resta la stima prima di ogni generazione e i limiti scelti dall'utente (D36).

**Perché:** i modelli e le istruzioni cambiano, e chi ha un risultato che gli piace non deve perderlo per un aggiornamento. Il JSON dà un indice leggibile dalle macchine (versioni, consigliata); i testi restano file di testo perché un prompt lungo scritto in JSON, con gli a capo come `\n`, è illeggibile e facile da rompere.
**Scartate:** istruzioni e versioni tutte dentro un unico JSON; aggiornare le istruzioni in automatico per tutti; regolazioni dei ruoli solo nelle impostazioni avanzate con pubblicazione.
**Conseguenze:** nei contratti (T0.3) `RoleSettings`, `ModelGroup` (i ruoli dichiarano `requires: [vision]`), lo schema del `manifest.json`, `analysisOnly` nei riferimenti del moodboard; il seme avrà un `manifest.json` per ruolo. T1.2, T2.4, T2.7 e T4.10 cambiano di poco. In `CLAUDE.md` la regola 12 e la riga «Da non fare» sui prompt e sui parametri valgono per le schermate normali, non per «Chi fa cosa» e le impostazioni avanzate.

## D39 · Input di esempio fissi per provare le istruzioni — 20/10/2026

**Precisa** il punto 4 di architettura §4.6.
**Decisione:** il rendering di prova delle istruzioni (modalità rigorosa, che è ciò che impedisce di pubblicare un prompt con una variabile che non esiste) usa **un input di esempio fisso per ogni ruolo**, pubblicato dai contratti (`ROLE_INPUT_EXAMPLES` in `packages/contracts/src/examples.ts`), invece di un input generato automaticamente dallo schema. Un test valida ogni esempio con lo schema di input del suo ruolo: se uno schema cambia e l'esempio non combacia più, la CI lo dice subito.

**Perché:** generare un input valido da uno schema Zod qualunque è codice fragile — con unioni discriminate, `refine` e campi che devono essere coerenti fra loro (una scena citata da un'inquadratura, un personaggio citato dalla continuità) un generatore produce dati che passano lo schema ma non assomigliano a un film, e il rendering di prova diventa una formalità. Un esempio scritto a mano è anche leggibile: dice *che cosa* riceve un ruolo. Gli stessi esempi servono già a `pnpm eval` (T1.6) e alla «Prova» delle impostazioni avanzate (T2.5), quindi non sono lavoro in più.
**Scartate:** generare l'input dallo schema (fragile e poco realistico); provare il rendering con un oggetto vuoto (segnalerebbe come mancanti tutte le variabili); non provare affatto il rendering (è il controllo che serve di più).
**Conseguenze:** `ROLE_INPUT_EXAMPLES` entra nei contratti e copre tutti i ruoli dell'MVP; un ruolo nuovo porta con sé il suo esempio, altrimenti `pnpm troupe check` dice che non si può provare il rendering delle sue istruzioni. Nessun effetto sul prodotto.

## D40 · Il bench dei modelli si sposta a M4 — 21/10/2026

**Aggiorna** il piano di lavoro (T1.7 diventa T4.0).
**Decisione:** il test a pagamento sui modelli video (circa 45 $) si fa **all'inizio di M4**, subito prima di generare i primi video veri, non in M1. In M1 resta la parte gratuita: verificare sul sito dei fornitori id dei punti d'accesso, prezzi, durate e combinazioni di ingressi, e scriverli nel seme. Se al momento del bench il budget è stretto si parte da una matrice ridotta (2 inquadrature, 2 take) e si allarga solo se i risultati non sono chiari.

**Perché:** i 45 $ servono a dare un voto di qualità ai modelli, e il voto serve solo al router per mettere in fila i candidati quando si generano i video, cioè in M4. Fino a lì non cambia niente: senza voti il programma funziona e ordina per costo (`quality` è facoltativo nel catalogo e in `ModelOption`). Spendere in M1 vuol dire pagare settimane prima di usare il risultato, e i prezzi dei modelli cambiano in fretta: un voto preso troppo presto andrebbe comunque rifatto. L'autore ha un budget stretto adesso.
**Scartate:** lasciare il bench in M1 (si paga troppo presto); farlo subito in versione ridotta (10–15 $: meno utile e comunque anticipato); rinunciare al bench (senza voti il router non sa distinguere i modelli e il «Cambia servizio» non ha il voto delle prove, D36).
**Conseguenze:** M1 costa pochi dollari invece di 45 (T1.3 prova un'immagine e un video veri, che restano necessari per dimostrare che la catena funziona). Gli id segnaposto nel seme restano `testing` finché T1.7 non li verifica, e `status: testing` blocca già le chiamate reali (§4.6 punto 7), quindi il controllo è automatico. La scala dei voti (§13) si decide con i dati del bench, ora in T4.0. Le giornate dei milestone non cambiano.

## D41 · Il bench si ferma al budget e chiede conferma — 21/10/2026

**Aggiunge** ad architettura §4.13.
**Decisione:** `pnpm bench run` calcola la **stima** di tutta la matrice (schede a immagine, take a secondo, dai prezzi del catalogo) **prima di mandare la prima richiesta**. Se supera il `budget_usd` del piano si ferma e dice quanto costerebbe, senza aver speso niente. Se sta nel budget ma i fornitori sono veri, chiede conferma sulla riga di comando mostrando la cifra; con `--env offline` non chiede nulla, perché il fornitore finto non costa.

**Perché:** una matrice è una moltiplicazione — personaggi × angolazioni × tentativi, inquadrature × modelli × take — e un numero cambiato per sbaglio moltiplica anche la spesa. Il `budget_usd` esisteva già nel piano ma nessuno lo guardava: un campo che non blocca niente è un'illusione di sicurezza. Il controllo prima della prima chiamata è l'unico momento in cui fermarsi è gratis.
**Scartate:** controllare il budget mano a mano e fermarsi a metà (lascia file e scontrini a metà, e i soldi già spesi sono spesi); fidarsi del tetto di spesa del fornitore (arriva troppo tardi e non distingue il bench dal resto); chiedere conferma sempre, anche in offline (abitua a dire sì).
**Conseguenze:** `BenchRunOptions` ha un `confirm` facoltativo, che la riga di comando passa solo fuori da `offline`; i test non lo passano. La stima vale solo per i prezzi che il catalogo conosce: un prezzo che non si sa vale zero e non blocca il piano, e lo scontrino di ogni chiamata dirà poi il costo vero (§4.11). Quando in T4.0 si useranno i prezzi veri, la stima del piano `week1.yaml` sarà il numero da confrontare con i circa 45 $ di D40.
