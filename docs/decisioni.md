# Filmzy — Registro delle decisioni

Ogni voce: data, decisione, perché, alternative scartate, conseguenze. Una decisione si cambia aggiungendone una nuova che la sostituisce, non riscrivendo la vecchia.

## D1 · Stack: TypeScript unico con NestJS — 19/10/2026

**Decisione:** monorepo TypeScript: NestJS per API e worker (BullMQ), React con Vite per l'interfaccia, schemi Zod condivisi. Python arriverà come servizio separato quando servirà (controllo dei volti, modelli locali), collegato alla troupe come una connessione.
**Perché:** il prodotto orchestra chiamate ad API, non esegue modelli. Per questo lavoro TypeScript e Python si equivalgono, mentre due linguaggi costano ogni giorno: schemi duplicati, una chiamata di rete interna, due deploy.
**Scartate:** NestJS + FastAPI (il piano iniziale del contesto); Python unico.
**Conseguenze:** le analisi dei dati si fanno con notebook esterni che leggono gli scontrini; nessuna libreria "solo Python" nel prodotto finché non serve davvero.

## D2 · Configurazione della troupe nel database, con pannello admin da subito — 19/10/2026

**Decisione:** in esercizio la configurazione vive nel database e si modifica dal pannello: bozza → prova → pubblicazione → storico. I file YAML servono come seme, come copia in git e per test e bench.
**Perché:** cambiare modelli, parametri e istruzioni senza fare un deploy.
**Scartate:** solo file nel repository (più semplice, ma ogni cambio richiede un deploy).
**Conseguenze:** circa 5–7 giornate prima delle funzioni per l'utente. Il pannello arriva subito dopo il test di coerenza (M2), così il test non aspetta.

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
**Rischio:** dipendenza da un aggregatore, con prezzi a volte più alti dell'accesso diretto. È mitigato dagli adapter: l'accesso diretto a un fornitore è un adapter in più.

## D8 · Bibbia in tabelle + JSONB, assemblata come oggetto unico — 19/10/2026

**Cambia il contesto**, che diceva "un unico oggetto strutturato (Postgres + JSONB)".
**Perché:** personaggi e luoghi devono essere riusabili tra film (cast personale) e citabili dalle inquadrature. Per i ruoli la Bibbia resta un oggetto unico, assemblato dal modulo `bible`.

## D9 · Riserve solo per errori tecnici — 19/10/2026

Un rifiuto per contenuto non passa ad altri modelli: ci si ferma e si rilascia la caparra.

## D10 · LiquidJS per le istruzioni — 19/10/2026

Sintassi semplice, sicura per template modificati dal pannello, e una modalità rigorosa per scoprire variabili inesistenti.

## D11 · Drizzle ORM (da confermare in M0) — 19/10/2026

SQL leggibile e JSONB tipizzato con Zod. Alternativa: Prisma.

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
**Conseguenze:** non si importano personaggi fatti con altri strumenti. Servono un controllo delle immagini caricate e un controllo del testo di ritocco (architettura §10). Funzione `image_upload`, spenta finché il controllo non esiste.

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
**Conseguenze:** cambia la regola 7 di `CLAUDE.md`. Nuova tabella `secrets`. Il controllo dei segreti (§4.6, punto 5) verifica anche i `secret:`. Serve una procedura per cambiare la chiave principale. I backup contengono solo testo cifrato e la chiave principale si conserva a parte.

## D26 · Stima dell'MVP: 47–68 giornate — 20/10/2026

**Sostituisce D23**, che diceva 40–57.
**Decisione:** per D24 e D25 il piano sale a 47–68 giornate (circa 9½–13½ settimane): le tracce audio con i suggerimenti (+5–8, in M5) e le connessioni guidate con le chiavi cifrate (+2–3, in M2). Le due opzioni di D23 restano fuori dalla stima base; con entrambe sono 52–75 giornate.
**Conseguenze:** stime grossolane, da rivedere dopo il test reale di M1. _Aggiornata da D27._

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
**Conseguenze:** nuova origine `uploaded` per le clip audio; la traccia Dialoghi funziona per le registrazioni caricate; il pannello del blocco ha «Carica un file»; funzione `audio_upload`, che l'amministratore può spegnere. Circa +1–2 giornate: l'MVP sale a 48–70 giornate (53–77 con le due opzioni). `CLAUDE.md`: tolto il divieto di file audio, aggiunto quello di inviarli ai fornitori.
