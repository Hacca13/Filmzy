# 06 · Le inquadrature, lo storyboard e le immagini

- **Stato:** inviato
- **Registrato il:** 02/11/2026
- **Cosa chiede:** tre schermate nuove che oggi esistono solo nel programma e non nel mockup: «Le inquadrature» (la striscia di card di ogni scena, T3.9), il pannello sotto la striscia con lo «Storyboard» (T4.1), «Imposta le immagini» e l'«Ultimo fotogramma» (T4.2), e i loro stati. In coda, la piccola correzione rimasta dal prompt 05 (testi a 11 px).
- **Perché:** il mockup ha «Le scene» (la generazione dei video, con le tre varianti dentro la card), ma il programma divide il lavoro in due passi: prima le inquadrature (l'aiuto regista) e lo storyboard, poi i video. Le schermate vere sono già fatte con i componenti esistenti; serve il disegno per confrontarle e rifinirle.
- **Da controllare nella risposta (via MCP, quando c'è):** le tre sezioni del pannello sono impilate e l'ultima compare solo con il primo fotogramma; i testi sono quelli indicati qui sotto, parola per parola; nessuna parola «prompt», «modello» o «token»; i pulsanti sono quelli del frame «Componenti» (un solo pulsante primario per zona); le immagini dello storyboard sono 16:9; nessuna versione mobile.
- **Note:** circa 7.000 caratteri.

## Prompt

```
Update the existing Filmzy mockup. Same visual style, same components (see the "Componenti" frame: buttons, chips, notices, the "Cambia servizio" popover), all UI text in Italian, desktop only (no mobile or responsive versions). Add three new frames after "Sceneggiatura" and before "Le scene", with the same window frame, header and stepper as the other film screens. Do not change any existing screen except the small fix at the end.

FRAME 1 · "Le inquadrature"
Title "Le inquadrature". Helper text under it: "Ogni scena si gira in poche inquadrature. Lo spazio fra una e l'altra lo tiene l'aiuto regista: dove entra e dove esce ciascuna deve combaciare con la vicina. Il movimento di macchina lo puoi cambiare tu."
One section per scene, stacked. Section title "Scena 1 · EST. PIAZZA - SERA", a status line under it ("3 inquadrature" or "Da pensare"), then a horizontal strip of shot cards (about 256 px wide each, the strip scrolls sideways), then a button on the left: "Rifai le inquadrature · circa 0,03 $" (secondary) for a planned scene, "Pensa le inquadrature · circa 0,03 $" (primary) for a scene not yet planned. Draw scene 1 planned (3 cards) and scene 2 not planned (no cards).
Shot card, top to bottom: optional 16:9 picture (the chosen storyboard frame, see below), "Inquadratura 1" (small, semibold), the action in one bold sentence ("Anna guarda l'orologio della stazione"), a grey line "Close up · 5 s · ansiosa", a grey line "Luce: luce calda del tramonto", the label "Movimento" with a select ("Avvicinati"), then a two-row list "Entra  La piazza · sera · con Anna, Marco" and "Esce  La piazza · sera · con Anna", and at the bottom a secondary button "Storyboard". Card 1 has a chosen picture and its button reads "Cambia lo storyboard"; cards 2 and 3 have no picture and read "Storyboard".

FRAME 2 · "Le inquadrature · Storyboard e immagini"
Same screen with shot 1 open: card 1 is highlighted (pressed state of its button) and under the strip a full-width panel appears, titled "Inquadratura 1 · storyboard e immagini". The panel has three stacked sections, each with a small title, a helper line and its own content.
Section 1, "Storyboard":
- Subtitle "Storyboard" and the helper "Varianti dell'immagine di questa inquadratura, con il volto dei personaggi e il set. Scegline una: sarà il riferimento visivo dell'inquadratura."
- On one row: primary button "Crea lo storyboard · circa 0,27 $" and, right next to it, the secondary "Cambia servizio" with the usual popover (provider chips, friendly names, cost, "Voto delle prove" as dots).
- Then the attempts, newest first. "Tentativo 2": three 16:9 pictures side by side, each with a secondary button "Scegli questa"; the chosen one has a highlighted outline and the caption "Scelta come riferimento" instead of the button. "Tentativo 1": three pictures, none chosen.
Draw a second variant of this frame in which "Tentativo 3" is still running: one 16:9 placeholder with the text "Sto disegnando l'inquadratura…" (the same placeholder reads "In coda…" while waiting), and the main button is disabled.
Section 2, "Imposta le immagini", helper "Facoltativo: se non scegli niente, decide l'aiuto regista. Il primo fotogramma è l'immagine da cui parte il video, l'ultimo quella in cui finisce, l'ispirazione serve solo da esempio." A row of the 16:9 pictures made so far; under each one the label "Come usarla" and a select with "Non la uso" (default), "Primo fotogramma", "Ultimo fotogramma", "Ispirazione". Draw one picture set as "Primo fotogramma" (select shows it, a small chip "Primo fotogramma" on the picture). With no pictures yet the section only says "Prima crea lo storyboard: le immagini da usare sono le sue varianti."
Section 3, "Ultimo fotogramma", shown only when a first frame is set: same layout as "Storyboard", helper "L'immagine in cui finisce l'inquadratura, fatta modificando il primo fotogramma secondo il movimento di macchina. Scegline una: sarà l'ultimo fotogramma.", primary button "Crea l'ultimo fotogramma · circa 0,27 $" with "Cambia servizio" next to it, attempts below, the chosen one captioned "Scelta come ultimo fotogramma", the running placeholder "Sto disegnando l'ultimo fotogramma…".

FRAME 3 · "Le inquadrature · Stati"
Six small states on one board, each showing only the part of the screen that changes:
1. Scene to redo: a calm info notice above the strip, "Dopo aver pensato le inquadrature è cambiato qualcosa: la scena, oppure un personaggio o un luogo che citano. Rifalle per tenerle allineate." The status line reads "Da rifare: è cambiato qualcosa", the cards have no "Storyboard" button (a chosen picture, if any, stays visible).
2. Planning: the scene button reads "Sto pensando…" and is disabled.
3. Storyboard failed: inside "Tentativo 1", one 16:9 placeholder with the error text "Il servizio ha rifiutato il testo. Cambia le istruzioni: non si prova con un altro servizio per aggirarlo." (no "Riprova" and no "Cambia servizio" next to the message: the user starts a new attempt with the main button).
4. Spending limit: the same confirmation box used elsewhere (info notice with the text "Questa generazione costa circa 0,27 $ e supera il limite per questo film: ne hai già spesi 9,80 $ su 10,00 $." and three buttons, "Continua" primary, "Cambia il tetto", "Annulla"), shown under the "Crea lo storyboard" row.
5. No video service accepts the chosen images: an error-tone notice under the "Imposta le immagini" pictures, "Nessun servizio video attivato accetta questa combinazione di immagini. Cambia le immagini, oppure attiva un altro servizio nelle impostazioni: non passo da solo a un altro modo." The images stay as chosen; nothing is generated and nothing is spent.
6. No first frame yet: the panel shows only "Storyboard" and "Imposta le immagini" (no "Ultimo fotogramma" section).

SMALL FIX
About 75 labels are still 11 px in 17 screens (field labels such as "Limite di spesa mensile (facoltativo)", "· Attivo", the services in "Chi fa cosa"). Raise them to at least 13 px without changing the layout. Do not touch anything else.
```
