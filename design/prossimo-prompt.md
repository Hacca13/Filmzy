# Prossimo prompt per Figma

- **Stato:** da lanciare (scritto il 22/10/2026).
- **Cosa chiede:** le correzioni del mockup, dopo che Claude ha letto le 40 schermate via MCP (le immagini sono in `riferimenti/02-film-e-app/`). È un solo prompt, breve: cambia solo quello che elenca.
- **Cosa non chiede:** niente di nuovo oltre allo stato d'errore della schermata di caricamento. La landing page resta da parte.
- **Dopo il lancio, da ricontrollare:** finestra di aggiornamento con i tre pulsanti giusti; nessun «modello» fuori da «Chi fa cosa» e «Avanzate»; «Cambia servizio» accanto a ogni «Genera» (anche in «Le scene»); l'interruttore dell'audio con il costo e lo stato acceso; il rifiuto del contenuto senza «Cambia servizio»; tracce del suono in orizzontale; stessa intestazione e stessi passi in tutte le schermate del film.
- **Chi fa il design:** l'agente di Figma. Claude scrive i prompt e legge i mockup, non li crea e non li modifica da sé (vedi `README.md`).

## Prompt

```
Update the existing Filmzy mockup. Same visual style, all UI text in Italian, desktop only (no mobile or responsive versions). This is a correction pass: change only what is listed, add no new screens except the loading failure state, leave everything else as it is.

WORDS
- "modello/modelli" must not appear outside "Chi fa cosa" and "Avanzate". A "fornitore" is the company (fal.ai, OpenAI), a "servizio" is what the user picks (Kling · Standard). First-run steps become "1 Fornitori · 2 Chiave · 3 Servizi · 4 Spese", titles "Collega i tuoi fornitori" and "Scegli i servizi da usare". Also: "Modello predefinito" → "Servizio predefinito"; provider tab "Modelli" → "Servizi"; "I modelli di fal.ai" → "I servizi di fal.ai"; "Scegli i modelli" → "Scegli i servizi"; in the "Cambia servizio" popover "Servizio predefinito: fal.ai" → "Fornitore predefinito: fal.ai"; in "Chi fa cosa" "Scarica un modello" → "Scarica un file di esempio".
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
```
