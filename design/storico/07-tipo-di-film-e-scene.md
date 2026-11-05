# 07 · Il tipo di film e le scene del film

- **Stato:** inviato
- **Registrato il:** 05/11/2026
- **Cosa chiede:** in «La tua idea» la scelta del tipo di film con durata e costo indicativi, e in «Montaggio ed esporta» la scelta delle scene da montare (D85). Mediometraggio e Lungometraggio si vedono spenti: arrivano con la seconda versione.
- **Da controllare nella risposta (via MCP):** i testi sono quelli indicati, parola per parola; le due schede spente non sembrano un errore e non si possono scegliere; il costo si legge accanto al cursore senza scorrere; nel montaggio la differenza di durata è un'informazione e non un avviso; le tracce e il righello seguono le scene spuntate; nessuna parola «prompt», «modello» o «token»; nessuna versione mobile.
- **Note:** circa 6.000 caratteri. I prezzi nel disegno sono solo esempi: nel programma li calcola il server dal catalogo.
- **Esito:** fatto il 05/11/2026, riletto via MCP. C'è tutto; le piccole differenze sono in `riferimenti/04-tipo-di-film-e-scene.md`.

## Prompt

```
Update the existing Filmzy mockup. Same visual style, same components (see the "Componenti" frame: buttons, chips, notices), all UI text in Italian, desktop only (no mobile or responsive versions). Change the two frames described below and add one new board of states right after each of them. Do not change any other screen.

FRAME "La tua idea" · new section "Che film vuoi fare?"
Insert it right under the idea text field, before "Genere". Heading row like "Stile visivo": title "Che film vuoi fare?" on the left, grey helper on the right "Serve allo sceneggiatore per capire quanta storia scrivere."
A row of four equal cards, same border and radius as the "Stile visivo" cards but without the picture. Each card has the name (semibold) and two grey lines:
1. "Spot" / "Un'idea sola, in pochi secondi" / "Fino a 1 minuto"
2. "Corto" / "Una storia breve e completa" / "Da 1 a 10 minuti". Selected: amber border and check, like the selected style card.
3. "Mediometraggio" / "Una storia con più respiro" / "Da 10 a 60 minuti". Disabled.
4. "Lungometraggio" / "Un film vero e proprio" / "Oltre 60 minuti". Disabled.
Disabled cards: muted text, no selection circle, not clickable, a small neutral chip "Nella prossima versione" at the top right. They must read as "coming later", not as an error. Under the row, one grey line: "I film lunghi vanno scritti a parti: arrivano nella prossima versione di Filmzy."
Under it, one panel with two columns.
Left column: label "Quanto dura, più o meno?" with the value "circa 5 minuti" on the same row, aligned right; a slider with an amber track and the end labels "1 minuto" and "10 minuti"; helper "È solo un'indicazione: puoi cambiarla quando vuoi, e alla fine il film durerà quello che monti."
Right column: small label "Costo indicativo"; a large "circa 35–70 $"; then the grey text "Per video e storyboard. Il numero più basso vale se tieni il primo video di ogni inquadratura, il più alto se li rifai tutti una volta. Personaggi, luoghi e suoni sono a parte."; then, slightly brighter, "Non spendi niente adesso: prima di ogni generazione vedi quanto costa."
Also add the chip "Corto · circa 5 minuti" to the chips in the side card "IL TUO FILM PRENDE FORMA".

NEW BOARD "La tua idea · Durata e costo · Stati"
Two small states, each showing only the part that changes:
1. Spot selected: slider from "15 secondi" to "1 minuto", value "circa 30 secondi", cost "circa 4–7 $".
2. No estimate available: the slider works as usual; the right column shows, in place of the number, "Non riesco a fare la stima: non hai ancora attivato un servizio video." and a secondary button "Vai alle impostazioni". The film can still be created.

FRAME "Montaggio ed esporta" · new section "Le scene del film"
Insert it between the top area (the preview and "Il tuo film è pronto.") and "Montaggio multitraccia". Title "Le scene del film", helper "Scegli quali scene entrano nel film. Una scena tolta non si cancella: la rimetti quando vuoi, con i suoi video e i suoi suoni."
One row per scene, in story order (the order cannot be changed). Each row: a checkbox, a small 16:9 thumbnail, the scene name, the length aligned right.
- "Scena 1 · L'ultima fermata", 18 s, ticked.
- "Scena 2 · Una luce ancora accesa", 16 s, ticked.
- "Scena 3 · La promessa ritrovata", 14 s, not ticked: the row is dimmed and shows the small chip "Tolta da te".
- "Scena 4 · Il primo fotogramma", 12 s, ticked.
- "Scena 5 · Una sala mille ricordi", 16 s, ticked.
- "Scena 6 · La prima corsa", no video yet: disabled empty checkbox, a grey placeholder instead of the thumbnail, the text "2 inquadrature senza video" and a small secondary button "Vai alla scena".
Under the list, one grey line: "4 scene su 6 · il film dura 1 min 2 s · all'inizio avevi indicato circa 1 min 30 s". This is plain information, never a warning: a film can end up longer or shorter than planned.
Then a secondary button "Monta di nuovo" with the grey text next to it: "Lavora sul tuo computer: non costa niente e non rifà i video."
Make the rest of the frame agree with this choice: the status chip at the top reads "4 scene su 6"; the "Montaggio multitraccia" heading reads "4 scene · 1 min 2 s"; the Video, Musica and Effetti tracks show only scenes 1, 2, 4 and 5; the ruler ends at 01:02; the preview time reads "00:00 / 01:02". "Esporta il film" stays the primary button.

NEW BOARD "Le scene del film · Stati"
Five small states, each showing only the part that changes:
1. Never assembled: primary button "Monta il film"; "Esporta il film" is disabled.
2. Choice changed after the last assembly: an info notice "Dopo questo montaggio hai cambiato qualcosa: monta di nuovo per vederlo nel film." and the primary button "Monta di nuovo".
3. No scene ticked: "Monta il film" is disabled, with the helper "Scegli almeno una scena."
4. Other scenes that cannot be ticked: two rows with a disabled checkbox and "Vai alla scena", reading "Le inquadrature sono ancora da pensare" and "È cambiata: rifai le inquadrature".
5. Assembling: "Sto montando il film… Può volerci qualche minuto.", with the button and all checkboxes disabled.
```
