# 02 · Nuovo ordine dei passi, Luoghi, ritocco e immagini dell'inquadratura

- **Stato:** pronto da inviare
- **Scritto il:** 20/10/2026
- **Cosa chiede:** cambiare l'ordine dei passi (la sceneggiatura prima del cast), aggiungere lo schermo Luoghi, l'editor di ritocco col pennello e il pannello "Imposta le immagini" sulle card delle inquadrature.
- **Non include ancora:** la bozza della sceneggiatura, il confronto con cast e luoghi e la scheda personaggio più ricca (carattere, obiettivo, tag). Saranno il prompt 03, quando il flusso è deciso.
- **Decisioni dietro questo prompt:** ordine Idea → Sceneggiatura → Personaggi → Luoghi → Le scene → Montaggio; le persone sono solo quelle generate da Filmzy (si caricano luoghi e oggetti, non persone); il pennello vale per le immagini; per un video si parte da un suo fotogramma.
- **Note:** dopo la risposta di Figma controllare la barra di avanzamento del wizard (il numero di passi dipende dal prompt 03) e il colore dell'avviso di continuità, che deve distinguersi dall'ambra di accento (icona e testo oltre al colore).

## Prompt

```
Update the Filmzy mockup (same style, all UI text in Italian):

- Reorder the flow: 1 "La tua idea" → 2 "Sceneggiatura" → 3 "Personaggi" (casting) → 4 "Luoghi" → "Le scene" → "Montaggio ed esporta". Update the wizard progress bar accordingly.

- New screen "Luoghi": for each place in the script, a row with 3-4 generated set images to choose from, a "Scegli" button and a "Ritocca" button.

- New component "Ritocca" (image editor): large image, round brush with size slider, painted area in translucent amber, undo/redo, three options "Togli" / "Sostituisci con…" (small text field) / "Cambia colore", before/after toggle, primary button "Applica · 1 credito".

- On each shot card, an optional panel "Imposta le immagini": two slots "Da qui parte" and "Qui finisce", each with "Genera" / "Carica", a third option "Usa come ispirazione", and a "Movimento" selector (Resta fermo, Avvicinati, Allontanati, Panoramica).

- On a ready clip, a small action "Usa un fotogramma come punto di partenza".

- Upload error state: "Per ora puoi caricare solo luoghi e oggetti: i personaggi li crea Filmzy."
```
