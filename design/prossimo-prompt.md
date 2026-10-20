# Prossimo prompt per Figma

- **Stato:** da lanciare
- **Scritto il:** 20/10/2026
- **Cosa chiede:** aggiornare il mockup del prompt 01 con il nuovo flusso (La tua idea → La storia → Personaggi → Luoghi → Riepilogo), il ritocco col pennello, le immagini dell'inquadratura, le tracce audio, i costi in dollari, la scelta del servizio per ogni generazione («Cambia servizio»), il primo avvio, le Impostazioni per tutti e la finestra da programma per il desktop.
- **Dopo averlo lanciato:** dì a Claude «lanciato». Il file passa in `storico/` con il numero e la data, e quando serve un altro prompt ne scrive uno nuovo qui.
- **Decisioni dietro questo prompt:** `docs/decisioni.md`, D17–D32 e D36 (nome, flusso con bozza, solo persone generate, immagini dell'inquadratura, luoghi e ritocco, scheda personaggio, tracce audio e connessioni, app libera e locale, costi in dollari con tetti di spesa, scelta del servizio per ogni generazione).
- **Da controllare nella risposta di Figma:** l'ambra di accento e il giallo dell'avviso di continuità devono distinguersi (icona e testo, non solo il colore); la musica non è un interruttore, è una traccia; nessun punto parla di crediti, accesso o amministratore; «Cambia servizio» compare accanto a ogni «Genera» di immagini, video e suoni, e mostra solo nome, costo e voto (mai sigle tecniche).
- **Se Figma lo rifiuta perché troppo lungo:** dillo a Claude. Lo spezza in due prompt (flusso e schermate di creazione; suono, costi e impostazioni) e li lanci uno alla volta.

## Prompt

```
Update the existing Filmzy mockup (same visual style, all UI text in Italian). Where this prompt contradicts the first mockup, this prompt wins.

CONTEXT
Filmzy is now a free desktop app that runs on the user's own computer with the user's own API keys: no accounts, no login, no credits, no payments. Show the app inside a desktop window frame (a title bar with the small Filmzy logo and the minimize, maximize and close buttons, no browser address bar) and a discreet status line at the bottom, "Salvato sul tuo computer". Add an update banner, "È disponibile una nuova versione", with the button "Aggiorna". Remove the credit balance from the top bar and every credit price on buttons.

1. NEW CREATION FLOW
The creation wizard has 5 steps with a progress bar: 1 "La tua idea" → 2 "La storia" → 3 "Personaggi" → 4 "Luoghi" → 5 "Riepilogo". After step 5 the user goes on to "Le scene", then "Montaggio ed esporta". The old "Casting" and "Sceneggiatura" screens are replaced by the screens below. Step 1 stays as it is.

- Step 2 "La storia" (draft screenplay): a short, readable page with the title, a one-line summary and 4-6 scenes, each with a two-line summary. A small tag "Bozza" next to the title and a soft note "È solo una bozza: la rifiniamo dopo aver scelto personaggi e luoghi". Below it a text field "Parla con lo sceneggiatore" with example chips ("Rendi il finale più triste", "Aggiungi un cattivo", "Più breve") and a button "Modifica la storia". A version selector at the top right ("Versione 1", "Versione 2"...). Primary button "Mi piace, avanti".
- Step 3 "Personaggi": a small stepper "Quanti personaggi?" (1 or 2). Character cards as in the first mockup (3-angle portrait strip, name, role in the story, one-line description, Aggiungi / Cambia / Scarta, the lock icon "Volto bloccato"), plus a role tag chip on each card (Protagonista, Antagonista, Alleato, Mentore, Comprimario) and a collapsed section "Aggiungi dettagli" with three optional fields: "Carattere", "Come si comporta", "Cosa vuole". Helper text: "Servono a tenere il personaggio coerente in tutto il film. Puoi saltarli."
- Step 4 "Luoghi": for each place in the story, a row with 3-4 generated set images to choose from, a "Scegli" button and a "Ritocca" button.
- Component "Ritocca" (image editor): large image, round brush with a size slider, painted area in translucent amber, undo/redo, three options "Togli" / "Sostituisci con…" (small text field) / "Cambia colore", a before/after toggle, and the primary button "Applica · circa 0,05 $".
- Step 5 "Riepilogo": compares the story with the choices made. A list of differences, each a small card with an icon, a plain sentence (for example "Nella bozza c'è un oste, ma non l'hai scelto tra i personaggi") and three buttons: "Adatta la storia", "Cambia la mia scelta", "Va bene così". Same look as the yellow continuity warning (icon + text, not color alone). A second state when nothing differs: a friendly check mark, "Tutto torna: la storia è pronta" and a button "Scrivi la sceneggiatura finale". A loading state: "Stiamo scrivendo la sceneggiatura finale…".
- Final "Sceneggiatura" screen (after step 5): the document-like page without the "Bozza" tag, with a small label "Versione finale", each scene editable inline, and the side panel with characters and locations.
- Upload error state (for images with people): "Per ora puoi caricare solo luoghi e oggetti: i personaggi li crea Filmzy."

2. "LE SCENE" (shot cards)
- Each card gets an optional panel "Imposta le immagini": two slots "Da qui parte" and "Qui finisce", each with "Genera" / "Carica", a third option "Usa come ispirazione", and a "Movimento" selector (Resta fermo, Avvicinati, Allontanati, Panoramica).
- On a ready clip, a small action "Usa un fotogramma come punto di partenza".
- Costs in dollars: the primary button shows an estimate, "Genera · circa 1,20 $". When an action costs more than a threshold, show a confirmation dialog: "Questa generazione costa circa 3,40 $. Il film è a 41 $ su 50 $. Vuoi continuare?" with the buttons "Continua" and "Annulla" and a link "Cambia il tetto".
- Choosing the service for each generation: next to every primary "Genera" button put a secondary button "Cambia servizio" (small chevron). It opens a popover with the services the user can pick for this generation, because one can work better than another. Each row shows a friendly name (for example "Kling · Standard" or "Seedance · Veloce": a product name, never a technical id or a parameter), the estimated cost ("circa 1,20 $"), the result of our tests as a small rating of 1 to 5 filled dots with the label "Voto delle prove" (or "Non ancora provato" and no dots), and a small tag "Predefinito" on the usual one. The selected row is highlighted and the main button updates its estimate, "Genera · circa 0,90 $". Under every ready take show a small line, "Fatto con Kling · Standard", so takes made with different services can be compared. Empty state when nothing fits the request: "Nessun servizio disponibile per questa combinazione: prova a usare l'immagine come ispirazione", with a link "Gestisci i servizi" that opens Settings. The same button sits next to "Genera" and "Rigenera" in the character portrait strip (step 3), the set images (step 4), the shot cards and the sound block panel.

3. SOUND in "Montaggio ed esporta"
Under the video timeline add a sound section with four lanes, like a simple multitrack editor:
- "Video": the chosen clips as thumbnails. Each clip has a small speaker icon that turns the clip's original sound on or off. It is OFF by default, with the tooltip "Audio originale spento". The old music on/off toggle is removed: music is a lane now.
- "Dialoghi": a lane for voice recordings that the user uploads (a voice-over), empty at first, with a button "Carica una registrazione" and a soft note "La voce generata arriva presto".
- "Musica": one block per scene, each with a name (for example "Musica tesa") and a mood label.
- "Effetti": small blocks attached to a shot and placed along the shot, each with a short label and the second where it starts (for example "Abbaio di un cane · 2 s").
Every lane has a mute toggle and a volume slider. Clicking a block opens a side panel with: a text field "Com'è questo suono?", a primary button "Genera · circa 0,10 $" with its "Cambia servizio" button, a button "Cambia" that shows 3 variants to listen to (each with a play button, a small waveform and a "Scegli" button), a button "Carica un file" and a button "Elimina". "Carica un file" opens a small dialog with the note "Il file resta sul tuo computer e non viene inviato a nessun servizio AI. I diritti sul file sono tuoi." and the buttons "Carica" and "Annulla". At the top of the section add a button "Suggerisci i suoni" that fills the lanes with proposed blocks that the user can accept or discard one by one. Also design an empty lane state ("Nessun effetto: aggiungi il primo"), a loading state for a sound being generated, and a friendly error ("Questo suono non si può generare così, prova a descriverlo in un altro modo").
The result of exporting is a message "Salvato in Documenti/Filmzy/…" with a button "Apri la cartella".

4. COSTS
- Top bar: a small spend indicator instead of credits, "Questo film: 12,40 $ di 50 $", with a thin progress bar. Clicking it opens a new screen "Quanto ho speso" with: spend per film, per role and per service as simple bars; the spend this month for each connected service against its monthly cap; and a note "Imposta un limite di spesa anche nel pannello di ogni servizio".

5. FIRST-RUN WIZARD "Benvenuto in Filmzy" (4 steps)
1 "Collega i tuoi servizi": a short explanation that the user needs their own keys, and a list of services grouped by Testo, Immagini e video, Musica, each with a link "Come ottengo la chiave?". 2 Paste the key in a masked field with "Prova la connessione" and a result line ("Funziona" or "Chiave non valida"). 3 Choose the models to add, as a checklist with name, type, price per use and an optional field "Tetto di spesa mensile (facoltativo)". 4 "Quanto vuoi spendere per ogni film?" with a field that defaults to "50 $" and the line "Puoi cambiarlo quando vuoi". The last button is "Inizia il tuo primo film".

6. SETTINGS (for everyone, with a left menu)
- "Connessioni": provider cards grouped by "Testo", "Immagini", "Video", "Musica ed effetti", "Voci", each with a logo placeholder, the name, a status chip ("Collegato", "Chiave mancante", "Non funziona"), the time of the last check and a "Gestisci" button; a "Collega un fornitore" button that opens the same 3-step flow as the first-run wizard; a provider detail page with three tabs: "Modelli" (table with name, type, price, an on/off toggle and a "Prova" button; the toggle decides which ones appear in "Cambia servizio" and takes effect at once), "Chiave" ("Chiave collegata ••••1a2b" with "Sostituisci" and "Rimuovi"; the key is never shown again) and "Chi lo usa"; and a page "Chi fa cosa" with one row per role (Sceneggiatore, Casting, Aiuto regista, Direttore della fotografia, Storyboard, Operatore di ripresa, Scenografo, Ritocco, Compositore, Rumorista), each with a dropdown for the main model (it is the one tagged "Predefinito" in "Cambia servizio"), a dropdown for the backup model and a "Prova" button; changing the main model takes effect at once, with no publishing step.
- "Spese e tetti": film budget, the confirmation threshold, and a monthly cap for each service.
- "Avanzate": models, roles, instructions and presets, with a draft → test → publish → history flow.
- "Prudenza": three toggles, all on by default: "Controlla i testi prima di ogni spesa", "Accetta solo personaggi generati da Filmzy" and "Aggiungi nei titoli la dicitura «Contiene contenuti generati con intelligenza artificiale»". Turning one off shows a small warning: "Se lo spegni te ne assumi la responsabilità e il tuo account presso il servizio potrebbe essere bloccato."
- "Informazioni": the version, "Software libero (AGPL-3.0)", a button "Sostieni il progetto" (placeholder) and a short "Uso responsabile" text.

7. HOME ("I miei film")
Next to "Nuovo film" add "Apri un film salvato". Each film card has a menu with "Salva una copia del film" and "Elimina".
```
