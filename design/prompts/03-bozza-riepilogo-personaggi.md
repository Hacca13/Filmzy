# 03 · Bozza della storia, riepilogo e scheda personaggio

- **Stato:** pronto da inviare
- **Scritto il:** 20/10/2026
- **Cosa chiede:** il passo "La storia" (bozza della sceneggiatura con "Parla con lo sceneggiatore"), il numero di personaggi, la scheda personaggio con tag e dettagli facoltativi, il passo "Riepilogo" (confronto tra la bozza e le scelte) e lo schermo "Sceneggiatura" finale.
- **Da dare dopo il 02.** Se i crediti di Figma scarseggiano si possono incollare 02 e 03 in un solo invio: dove si contraddicono, prevale il 03 (rinomina il passo 2 in "La storia" e aggiunge il passo 5).
- **Decisioni dietro questo prompt (20/10/2026):** la sceneggiatura nasce come bozza breve, si scelgono cast e luoghi, poi un riepilogo mostra le differenze e l'utente decide come agire; la stesura ufficiale viene dopo. Il riepilogo compare con le differenze solo quando ce ne sono. Carattere, comportamento e obiettivo del personaggio sono facoltativi; i tag (protagonista, antagonista, …) sono una lista che potrà crescere.
- **Note:** il riepilogo deve usare lo stesso aspetto dell'avviso di continuità (icona e testo, non solo colore).

## Prompt

```
Update the Filmzy mockup again (same style, all UI text in Italian). This changes the creation flow and replaces the "Sceneggiatura" and "Casting" screens from the earlier prompts.

- The wizard progress bar now has 5 steps: 1 "La tua idea" → 2 "La storia" → 3 "Personaggi" → 4 "Luoghi" → 5 "Riepilogo". After step 5 the user goes on to "Le scene".

- Step 2 "La storia" (draft screenplay): a short, readable page with the title, a one-line summary and 4-6 scenes, each with a two-line summary. A small tag "Bozza" next to the title and a soft note "È solo una bozza: la rifiniamo dopo aver scelto personaggi e luoghi". Below it, a text field "Parla con lo sceneggiatore" with example chips ("Rendi il finale più triste", "Aggiungi un cattivo", "Più breve") and a button "Modifica la storia". A version selector at the top right ("Versione 1", "Versione 2"...). Primary button "Mi piace, avanti".

- Step 3 "Personaggi": at the top a small stepper "Quanti personaggi?" (1 or 2). Character cards as in the first prompt, plus a role tag chip on each card (Protagonista, Antagonista, Alleato, Mentore...) and a collapsed section "Aggiungi dettagli" with three optional fields: "Carattere", "Come si comporta", "Cosa vuole". Helper text: "Servono a tenere il personaggio coerente in tutto il film. Puoi saltarli." The locked-face state stays as before.

- Step 4 "Luoghi": as in the previous prompt.

- Step 5 "Riepilogo": compares the story with the choices made. A list of differences, each a small card with an icon, a plain sentence (for example "Nella bozza c'è un oste, ma non l'hai scelto tra i personaggi") and three buttons: "Adatta la storia", "Cambia la mia scelta", "Va bene così". Use the same look as the yellow continuity warning (icon + text, not color alone). A second state when nothing differs: a friendly check mark, "Tutto torna: la storia è pronta" and a button "Scrivi la sceneggiatura finale". A loading state: "Stiamo scrivendo la sceneggiatura finale…".

- The "Sceneggiatura" screen that opens after step 5 is the final version: the same document-like page without the "Bozza" tag, with a small label "Versione finale", each scene editable inline, and the side panel with characters and locations.
```
