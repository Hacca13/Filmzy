# 08 · Il programma per computer: chiusura, copia del film, registro

- **Stato:** inviato
- **Registrato il:** 06/11/2026
- **Cosa chiede:** la finestra «Sto ancora lavorando» quando si chiude Filmzy con lavori in corso (D63), con lo stato «mi chiudo appena ho finito»; il menu «Questo film» con «Salva una copia del film» e il suo avviso; gli stati di «Apri un film salvato» nella home (D92); in «I tuoi dati» il registro al posto di «Cambia la cartella dei film» (D93).
- **Da controllare nella risposta (via MCP):** i testi sono quelli indicati, parola per parola; «Aspetta che finisca» è il pulsante in evidenza e «Chiudi lo stesso» non sembra un pulsante di pericolo ma resta ben visibile; la finestra si legge senza scorrere; gli avvisi della home sono nello stile degli altri; nessuna parola tecnica («log», «database», «file JSON»); nessuna versione mobile.
- **Note:** circa 3.300 caratteri. Nel menu «Questo film» solo quello che il programma fa già. Il pulsante «Chiudi» delle schermate dell'avvio c'è già nel mockup: il programma ora usa lo stesso testo. Oggi la finestra di chiusura è quella del sistema: con questo disegno diventa una finestra del programma.
- **Esito:** fatto il 06/11/2026, riletto via MCP: c'è tutto, con i testi indicati. Le piccole differenze sono in `riferimenti/05-chiusura-copia-e-registro.md`. Dopo questo prompt i crediti di Figma sono finiti fino al 01/12/2026.

## Prompt

```
Update the existing Filmzy mockup. Same visual style, same components (see the "Componenti" frame: buttons, chips, notices, modal), all UI text in Italian, desktop only (no mobile or responsive versions). Add the new frames and boards described below, each next to the frame it refers to. Do not change any other screen.

NEW FRAME "Chiudere mentre lavora" (place it after "Servizi e lavori")
The "Le scene" frame, dimmed and blurred behind a modal, exactly like the update modal over "I miei film".
Modal: small amber eyebrow "PRIMA DI CHIUDERE"; title "Sto ancora lavorando a 2 cose"; a short list of what is running, one row each with a small spinner, the name and a grey detail aligned right:
- "Video · Scena 2, inquadratura 1" / "Kling · circa 0,42 $"
- "Storyboard · Scena 3, inquadratura 2" / "in coda"
Then the text: "Se chiudi adesso, questi lavori si fermano. Il servizio può averli già fatti e addebitati, e quando riapri Filmzy non ripartono da soli."
Three buttons in a row: primary "Aspetta che finisca", secondary "Torna al film", secondary "Chiudi lo stesso". Under them, grey: "Aspetta che finisca: Filmzy si chiude da solo appena ha finito. Chiudi lo stesso: la scelta è tua."

NEW BOARD "Chiudere mentre lavora · Stati"
Two small states, each showing only the part that changes:
1. Waiting to close: a slim bar under the window title, full width, amber-tinted like an info notice: "Mi chiudo appena ho finito · ancora 1 cosa" and a small secondary button "Non chiudere".
2. A single job: title "Sto ancora lavorando a una cosa", one row in the list.

FRAME "Le scene" · the "Questo film ⌄" menu, open
Add a board next to "Le scene" showing the header button "Questo film ⌄" with its menu open. Menu items: "Salva una copia del film" and "Quanto ho speso". Under the menu, one state of the notice that appears when the copy cannot be saved yet: error notice "Il film sta ancora lavorando: aspetta che finisca, poi salva la copia."
Helper inside the menu, under "Salva una copia del film", in small grey text: "Un file da conservare o da aprire su un altro computer. Le chiavi non ci sono."

NEW BOARD "Apri un film salvato · Stati" (next to "I miei film")
Four small states of the area under the "Apri un film salvato" button, each showing only the part that changes:
1. Opening: the button disabled, reading "Sto aprendo il film…".
2. Already here: neutral info notice "Questo film è già su questo computer: lo trovi fra i tuoi film."
3. Not a Filmzy film: error notice "Questo file non è una copia di un film di Filmzy, oppure è rovinato."
4. Made with a newer version: info notice "Questa copia è stata fatta con una versione più nuova di Filmzy. Aggiorna Filmzy per aprirla." with a small secondary button "Controlla gli aggiornamenti".

FRAME "I tuoi dati" · replace "Cambia la cartella dei film"
Remove the button "Cambia la cartella dei film". Keep the path field and "Apri la cartella".
Add a new block "Il registro" under it, same layout as the others: title "Il registro"; grey text "Se qualcosa si rompe, Filmzy lo scrive qui: un file al giorno, tenuto per 14 giorni. Non contiene le tue chiavi, e il tuo nome non compare. Se chiedi aiuto, allega il file del giorno in cui è successo."; secondary button "Apri la cartella del registro".
```
