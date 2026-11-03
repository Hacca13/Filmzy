# 03 · Le inquadrature, storyboard e immagini — riferimenti

Cosa ha disegnato l'agente di Figma col **prompt 06**, riletto via MCP il 02/11/2026 (sola lettura). È un riassunto di testi, misure e colori, **non** il codice delle tavole (a differenza di `02-film-e-app/`): le tre tavole nuove sono grandi, e per l'interfaccia bastano queste cose. Per il codice esatto: file Figma `XzJpIysmqCVXCbBSQlY4Jm`, pagina «Page 1», riga «5 · Scene e montaggio», a sinistra di «Le scene».

| Tavola | Nodo | Misure |
|---|---|---|
| Le inquadrature | `82:7538` | 1440 × 1429 |
| Le inquadrature · Storyboard e immagini (due varianti affiancate: riferimento scelto, generazione in corso; più «Alternativa in coda») | `82:7704` | 3024 × 4566 |
| Le inquadrature · Stati (sei stati) | `82:8455` | 1440 × 2252 |

Colori (già nell'interfaccia): sfondo `#111211`, pannello `#1a1b19`, riga `#22231f`, bordo `#34362e`, bordo forte `#77796f`, testo `#f5f1e8`, grigio `#aaa99e`, ambra `#f5b544`. Chip: confermato `#233328`/`#b0d6b6`, avviso `#352b19`/`#f5b544`, informazione `#233142`/`#b1cff4`, errore `#392321`/`#f7a49e`. Titoli Manrope, testo Inter; pulsanti alti 48 px con raggio 12 px, testo a 13 px.

## Le inquadrature (`82:7538`)

- In cima, sopra il titolo: «DALLA SCENEGGIATURA AL SET» (ambra, 13 px, spaziato). Titolo «Le inquadrature» a 36 px. Poi l'aiuto: «Ogni scena si gira in poche inquadrature. Lo spazio fra una e l'altra lo tiene l'aiuto regista: dove entra e dove esce ciascuna deve combaciare con la vicina. Il movimento di macchina lo puoi cambiare tu.»
- Ogni scena: titolo a 20 px «Scena 1 · EST. PIAZZA - SERA» e, **a destra sulla stessa riga**, un chip: confermato «3 inquadrature», avviso con triangolo «Da pensare».
- Striscia di card da 256 px, raggio 18 px, bordo, sfondo pannello. Dall'alto: immagine 256 × 144 (solo se c'è lo storyboard scelto), poi con margine di 16: «Inquadratura 1» (13 px grigio), l'azione (16 px grassetto), «Close up · 5 s · ansiosa», «Luce: …», «Movimento» con il menu, «Entra  La piazza · sera · con Anna, Marco» e «Esce  …», e in fondo, a tutta larghezza, il pulsante «Cambia lo storyboard» (con immagine) o «Storyboard».
- Sotto la striscia, a sinistra (303 px): «Rifai le inquadrature · circa 0,03 $» (secondario). Una scena non pensata ha, sotto il titolo, «La scena è pronta. L'aiuto regista deve ancora pensare come girarla.» e il primario «Pensa le inquadrature · circa 0,03 $».
- Piede: «‹ Sceneggiatura», «✓ Salvato sul tuo computer», «Le scene ›».

## Storyboard e immagini (`82:7704`)

- Sotto la striscia, un riquadro largo come la pagina con l'intestazione **«Inquadratura 1 · storyboard e immagini»** (22 px) e una **«×»** a destra per chiuderlo.
- «Storyboard»: aiuto, poi sulla stessa riga «Crea lo storyboard · circa 0,27 $» (primario, 281 px) e «Cambia servizio ⌄» (165 px). Ogni tentativo ha una riga di intestazione con **«Tentativo 2» a sinistra e «Seedream · Standard · 0,27 $» a destra** (servizio e costo, 13 px grigio), poi tre immagini 16:9 affiancate (418 px ciascuna, raggio 8). La scelta ha il bordo ambra di 2 px e, sotto, il chip confermato **«Scelta come riferimento»**; le altre hanno il pulsante «Scegli questa» (135 px).
- Tentativo in corso: un riquadro grigio 16:9 con un cerchio che gira e il messaggio, al posto delle immagini.
- «Imposta le immagini»: aiuto, poi una fila di miniature 200 × 112 con il chip confermato sopra quella assegnata («Primo fotogramma») e sotto ognuna «Come usarla» con il menu (aperto nel disegno: «Non la uso», «Primo fotogramma», «Ultimo fotogramma», «Ispirazione»).
- «Ultimo fotogramma»: come «Storyboard», con «Crea l'ultimo fotogramma · circa 0,27 $», il chip «Scelta come ultimo fotogramma» e la sua riga «Tentativo 1 … Seedream · Standard · 0,27 $».
- Le sezioni sono separate da una linea sottile.

## Stati (`82:8455`)

Sei riquadri numerati (numero in un quadratino ambra + titolo in maiuscolo + linea):

1. **SCENA DA RIFARE** — chip avviso «Da rifare: è cambiato qualcosa»; riquadro blu con il chip «Informazione» e «Dopo aver pensato le inquadrature è cambiato qualcosa: la scena, oppure un personaggio o un luogo che citano. Rifalle per tenerle allineate.»; le card **senza** il pulsante dello storyboard.
2. **PIANIFICAZIONE** — chip informazione «L'aiuto regista sta pensando» e il primario spento «Sto pensando…».
3. **STORYBOARD NON RIUSCITO** — «Tentativo 1» e un riquadro **rosso** (sfondo `#392321`, bordo `#f7a49e`, icona di errore, testo centrato) con «Il servizio ha rifiutato il testo. Cambia le istruzioni: non si prova con un altro servizio per aggirarlo.»
4. **LIMITE DI SPESA** — riquadro blu con il chip «Prima di continuare», «Questa generazione costa circa 0,27 $ e supera il limite per questo film: ne hai già spesi 9,80 $ su 10,00 $.» e «Continua» (primario), «Cambia il tetto», «Annulla».
5. **COMBINAZIONE NON SUPPORTATA** — due miniature (primo e ultimo fotogramma) con i loro chip; riquadro rosso con il chip **«Non compatibile»** e «Nessun servizio video attivato accetta questa combinazione di immagini. Cambia le immagini, oppure attiva un altro servizio nelle impostazioni: non passo da solo a un altro modo.»; sotto, in grigio: **«Nessuna ripresa generata · Nessuna spesa»**.
6. **SENZA PRIMO FOTOGRAMMA** — il riquadro mostra solo «Storyboard» e «Imposta le immagini» («Prima crea lo storyboard: le immagini da usare sono le sue varianti.»), senza «Ultimo fotogramma».

## Cosa si è preso nell'interfaccia (02/11/2026)

Chip di stato (nuovo componente `Chip`, con icona e parole) e avvisi con titolo (`Notice title=`); titolo della scena col suo chip e il testo «La scena è pronta…»; chip «L'aiuto regista sta pensando»; intestazione del riquadro con «×»; intestazione di ogni tentativo con servizio e costo vero (nuovi dati: `modelLabel` e `costUsd` nei tentativi); chip «Scelta come riferimento» e contorno ambra; riquadro rosso per un tentativo fallito; miniature di «Imposta le immagini» con il chip sopra e «Come usarla» sotto; «Non compatibile» con «Nessuna ripresa generata · Nessuna spesa»; «Prima di continuare» in ogni conferma del limite di spesa.

**Non preso (per ora):** la riga «DALLA SCENEGGIATURA AL SET» sopra il titolo (le altre schermate dell'interfaccia non ce l'hanno ancora); il piede «‹ Sceneggiatura / Salvato / Le scene ›» (navigazione fra le fasi: arriva con il resto del percorso); il cerchio che gira nel tentativo in corso; l'immagine della card a tutta larghezza; il popover «Cambia servizio» ridisegnato (resta quello di `ChangeService`); i testi da 13 px sulle schermate vecchie (le 17 schermate del prompt 05 non sono state riscaricate: si fa con la verifica complessiva).
