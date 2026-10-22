# 05 · Correzioni del mockup

- **Stato:** inviato
- **Registrato il:** 22/10/2026
- **Cosa chiede:** le correzioni del mockup dopo la prima lettura via MCP delle 40 schermate: parole (niente «modello» fuori da «Chi fa cosa» e «Avanzate», niente crediti, niente nome dell'utente), una sola intestazione e un solo indicatore dei passi, la finestra di aggiornamento con i tre pulsanti giusti, l'avvio (caricamento e il suo stato d'errore), «Le scene», gli errori, il suono, le impostazioni, i consigli di UX (quattro livelli di pulsanti, testi leggibili, una tavola «Componenti») e l'ordine delle tavole.
- **Note:** circa 10.000 caratteri, la metà del prompt 02. Il codice delle schermate dopo questo prompt è in `riferimenti/02-film-e-app/`; la versione di prima resta nella storia di git.

## Prompt

```
Update the existing Filmzy mockup. Same visual style, all UI text in Italian, desktop only (no mobile or responsive versions). This is a correction pass: change only what is listed, add no new screens except the loading failure state and the "Componenti" frame, leave everything else as it is.

WORDS
- "modello/modelli" must not appear outside "Chi fa cosa" and "Avanzate". A "fornitore" is the company (fal.ai, OpenAI), a "servizio" is what the user picks (Kling · Standard). First-run steps become "1 Fornitori · 2 Chiave · 3 Servizi · 4 Spese", titles "Collega i tuoi fornitori" and "Scegli i servizi da usare". Also: "Modello predefinito" → "Servizio predefinito"; provider tab "Modelli" → "Servizi"; "I modelli di fal.ai" → "I servizi di fal.ai"; "Scegli i modelli" → "Scegli i servizi"; in the "Cambia servizio" popover "Servizio predefinito: fal.ai" → "Fornitore predefinito: fal.ai"; in "Chi fa cosa" "Scarica un modello" → "Scarica un file di esempio". Every other "modello/modelli" outside those two pages follows the same rule (e.g. "✓ Modelli scelti" → "✓ Servizi scelti", "I modelli attivi compaiono subito nel selettore" → "I servizi attivi compaiono subito in «Cambia servizio»").
- No credits: "Il credito presso il fornitore è finito" → "I fondi presso il fornitore sono finiti · Ricarica il conto o cambia servizio"; delete the sentence "Il credito citato nei messaggi è quello del fornitore…".
- No user name, no gendered words (Filmzy has no accounts): remove "Bentornata, Alessia." (use "I tuoi film"); "Resti sempre libera di scegliere per ogni ripresa" → "Puoi sempre scegliere per ogni ripresa"; drop the author from the version history in "Avanzate" (date and note only).

ONE HEADER, ONE STEPPER
- Every film screen has the same header: breadcrumb on the left; on the right, in this order, the chip "2 lavori in corso" (only while something runs), the chip "Questo film: 12,40 $", a menu button "Questo film ⌄" (items "Moodboard", "Quanto ho speso") and "Impostazioni". Fix "La tua idea" and "Le scene" (chips squeezed next to the title, a stray "Moodboard" label). Rebuild "Sceneggiatura" and "Montaggio ed esporta": they still have the old web header with a big logo and their own window buttons ("Montaggio" even has a second macOS-style title bar). They go inside the same desktop window frame as every other screen.
- One stepper on all creation screens (La tua idea, La storia, Moodboard, Personaggi, Luoghi, Riepilogo, Sceneggiatura): the style of "Personaggi" (circle + label, check when done), with "Moodboard" as a dashed circle without a number.

UPDATE WINDOW ("I miei film", "Aggiornamenti · Stati")
- Three buttons only: "Aggiorna ora" (primary), "Ricordamelo più tardi", "Salta questa versione". Remove "Non ora" and "Ricorda più tardi". Under them: "Ricordamelo più tardi: te lo ripropongo al prossimo avvio." and "Salta questa versione: non te lo ripropongo finché non ne esce una più nuova."
- One title, "C'è una versione nuova di Filmzy: 0.4.0" (remove "Una novità, senza interromperti" and the filler subtitle). "Cosa cambia" lists film features ("Moodboard per ogni scena", "Scelta delle immagini iniziali e finali", "Spese più chiare per ogni servizio"), then "I tuoi film restano dove sono."
- In "Aggiornamenti · Stati" draw the window over the real home, not the placeholder. The confirmation reads "Va bene, te lo ricordo al prossimo avvio." (no word "modale", no "Torna al film").

STARTUP
- "Avvio · Caricamento": "Sto preparando Filmzy…" (not "Stiamo"), same window controls as the other screens. Add its failure state, same layout, calm icon: "Filmzy non riesce a partire", "Chiudi il programma e riaprilo.", button "Chiudi".
- The two blocking screens keep one "Chiudi" (remove the footer "← Chiudi").

LE SCENE
- "Cambia servizio" on the same row, right next to "Genera"/"Rigenera" (secondary button with chevron), not as a full-width row under "Imposta le immagini".
- "Genera anche l'audio" becomes a real switch (now a circle with "Spento"), with the extra cost in the label ("+ circa 0,14 $"). Draw the ON state: the button reads "Genera · circa 0,56 $".
- "Genera le mancanti" shows its total estimate ("circa 3,60 $"). While a clip is generating its main button becomes "Annulla" (clip 02 still says "Genera").

ERRORS ("Generazione · Errori")
- "Il servizio ha rifiutato il contenuto": only "Cambia la richiesta" and "Annulla". No "Riprova", no "Cambia servizio": we never help to get around a refusal.
- In the other four, remove the stray "Riprova" link under the buttons; "Riprova" and "Cambia servizio" stay next to the main action.

SOUND ("Montaggio ed esporta")
- Four horizontal lanes (Video, Dialoghi, Musica, Effetti) under one shared time ruler, blocks placed along time (now four vertical lists). Each video clip has a small speaker icon, muted by default, tooltip "Audio originale spento" (disabled on clips made without audio).
- "Dialoghi": one empty lane, one "Carica una registrazione" button, and the note "Per ora i personaggi non parlano: puoi aggiungere una voce fuori campo, e le labbra non la seguono. Le voci dei personaggi arrivano più avanti." (now six repeated buttons, no note).
- "Suggerisci i suoni" is a real button at the top right of the section.
- The block panel opens on the right and uses the same "Cambia servizio" popover as the film screens (provider chips, friendly names, cost, "Voto delle prove" as dots). Replace the invented "Filmzy Audio / Moodboard Sound / Studio Voice" with "ElevenLabs · Sound Effects" and "Stability AI · Stable Audio", and numeric ratings with dots.
- Remove "Salva bozza" and the "Bozza" tag in the header: Filmzy saves by itself.

SETTINGS
- "Chi fa cosa": add the missing roles "Character designer" and "Immagini del moodboard".
- "Connessioni": provider status is a chip with an icon ("✓ Collegato", key icon "Chiave mancante", "⚠ Non funziona"), as on the provider page. At 100% of a limit "Limite raggiunto" must look stronger than "Manca poco al limite" (warning icon, filled chip). Same in "Quanto ho speso": draw the ElevenLabs case as a full card, not a tiny pill.
- Provider page: remove the duplicated "Attivo · Attivo" column (Veo 3 says "Attivo · Spento" next to an off switch).
- "Prova la connessione" is a real secondary button (first-run, "Aggiungi un fornitore"); a chosen provider reads "✓ Scelto". In the first-run steps the active one sits lower than the others: align and tighten them.
- "Generazione": keep only "Audio nelle clip video" and "Proposte per ogni luogo"; remove "Durata iniziale", "Formato iniziale" and "Avvisami quando i lavori sono pronti" (not planned).
- Move "Prudenza · Conferma lo spegnimento" next to the Prudenza page; remove the "Quanti personaggi?" block from "Riepilogo · Stati".

SMALL
- "Moodboard": the last swatch (#1A1B19) is invisible on the dark background: give every swatch a thin light outline.
- "Luoghi" and the places panel of "Sceneggiatura": place images show Marco and Giulia. Places are empty sets, without people.

UX
- Shot cards in "Le scene" are crowded. Keep one primary action per card ("Genera"/"Rigenera" with "Cambia servizio" and the audio switch); the audio helper line becomes an info tooltip; "Imposta le immagini" and "Usa un fotogramma come punto di partenza" move into the card's "…" menu or a collapsed row.
- One primary (amber) button per screen: in "Personaggi" the per-card "Aggiungi" becomes secondary, "Ai luoghi" stays primary.
- Fewer amber tip banners ("✦"): keep them only where they prevent a mistake or explain a cost; the rest become plain helper text.
- Confirmations (spending limit, publish, restore, turning off a "Prudenza" switch) are real dialogs over the screen, not cards.
- Four button levels, used the same way everywhere: primary (amber), secondary (outlined), text link, destructive (red, always followed by a confirmation dialog: "Elimina", "Rimuovi", "Butta via le modifiche"). Today many actions are bold white text that does not look clickable ("Controlla adesso", "Apri la cartella", "Pubblica", "Cambia la mia scelta"), and "Elimina" in the sound panel is amber.
- Readability: information text is at least 13 px with AA contrast on the dark background. The grey 11–12 px lines (helper texts, "Salvato sul tuo computer", costs under buttons) are hard to read now.
- "Riepilogo": show the next step even while it is blocked: "Scrivi la sceneggiatura finale" disabled with "Ancora 2 differenze da risolvere"; a resolved difference folds into one line with a check.
- "Le scene": "1 dettaglio da controllare" in the summary is a link that scrolls to the yellow card.
- First run: say what is needed to start ("Per cominciare servono un fornitore per il testo e uno per immagini e video"), keep "Continua" disabled until then, and when several providers are chosen repeat steps 2–3 for each one ("Fornitore 1 di 3").
- Add a frame "Componenti" with the shared parts and their states (default, hover, focus, disabled): the four buttons, status chips (ok, warning, error, info), switch, text field with error, the "Cambia servizio" popover, the app header and the stepper. Screens use these, so they stop drifting apart.

CANVAS ORDER
Arrange the frames of "Page 1" in rows, in the order the user meets them, each row with a small section label:
1 "Avvio": Caricamento (first frame of the file), its failure state, Serve una versione nuova, Ripristino dei dati.
2 "Primo avvio": the four "Benvenuto in Filmzy" steps.
3 "Home": I miei film with the update window, Aggiornamenti · Stati.
4 "Creazione": La tua idea, La storia, Moodboard, Moodboard · Stati, Personaggi, Luoghi, Ritocca, Riepilogo, Riepilogo · Stati, Sceneggiatura.
5 "Scene e montaggio": Le scene, Imposta le immagini, Servizi e lavori, Generazione · Errori, Quanto ho speso, Montaggio ed esporta, Suono ed esportazione · Stati, Stati di base.
0 "Componenti" first, above everything.
6 "Impostazioni": Connessioni, Connessioni · Gestione, Fornitore, Chi fa cosa, Ruoli · Istruzioni e prove, Spese e tetti, Generazione, Prudenza, Aggiornamenti, I tuoi dati, Avanzate, Avanzate · Prova, pubblicazione e storico, Informazioni.
Same spacing everywhere, no overlapping frames.
```
