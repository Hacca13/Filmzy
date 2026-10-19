# Film Gen Ai — Registro delle decisioni

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

**Cambia il contesto**, che diceva 4–6 settimane: ora il piano è dettagliato e include il pannello (5–7 giornate) e il test di coerenza.
