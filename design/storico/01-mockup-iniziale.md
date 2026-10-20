# 01 · Mockup iniziale

- **Stato:** inviato
- **Registrato il:** 20/10/2026
- **Cosa chiede:** i 6 schermi base (Home, La tua idea, Casting, Sceneggiatura, Le scene, Montaggio ed esporta), lo stile visivo e una scheda di componenti (stato vuoto, caricamento, errore).
- **Note:** il testo è identico a quello dato a Figma; sono stati aggiunti solo gli a capo, per leggerlo meglio. Alcune scelte sono state superate dopo l'invio (ordine dei passi con la sceneggiatura prima del cast, crediti, interruttore della musica): le corregge il prompt successivo, in `../prossimo-prompt.md`.

## Prompt

```
Design a high-fidelity mockup for "Filmzy", a web app (desktop first, responsive) that lets people with no technical skills create short films with AI. Tone: friendly, cinematic, simple. Never show technical terms like "prompt", "model", "token" or "temperature". All UI text in Italian.

Visual style: dark theme like a cinema (near-black background, warm off-white text), one accent color (warm amber, like a projector light), rounded cards, generous spacing, a playful but clean sans-serif font. Logo: the word "Filmzy" with a small film-frame or clapperboard mark.

Create these screens:

1. Home / I miei film: grid of project cards (poster thumbnail, title, status "In lavorazione" / "Pronto"), a big button "Nuovo film", and the credit balance in the top bar.

2. Wizard "La tua idea" (step 1 of 4, progress bar on top): one large text area "Racconta la tua idea in poche righe", then visual choice chips for Genere (Commedia, Thriller, Fantasy...), Tono (Leggero, Cupo...), Stile visivo (illustrated cards: Realistico, Animazione 3D, Illustrato, Anime) and Fotografia (cards with a sample frame: Camera a mano, Classica, Noir, Sognante). Button "Avanti".

3. Casting: cards of suggested characters, each with a 3-angle portrait strip (front, profile, three-quarter), name, role in the story, a one-line description, and three buttons: Aggiungi / Cambia / Scarta. A banner: "Ti suggeriamo questi personaggi per la tua storia". A locked character shows a small lock icon "Volto bloccato".

4. Sceneggiatura: a readable, document-like page divided into scenes (Scena 1, Scena 2...), each editable inline, with a side panel listing characters and locations.

5. Le scene (the core screen): a horizontal comic-strip of shot cards grouped by scene. Each card shows a thumbnail, a short description, duration ("6 s") and a state: "Storyboard" (sketch image + 3 variants to choose), "In lavorazione" (animated progress), "Pronto" (video thumbnail with play), and one card highlighted with a YELLOW border and a warning note: "Attenzione: qui Marco ha ancora la giacca blu" with buttons "Rigenera" and "Ignora". A clear primary button on each card: "Genera". Show the credit cost on the button in a friendly way ("Genera · 12 crediti").

6. Montaggio ed esporta: a simple timeline of the chosen takes, music on/off toggle, title and end credits preview including the line "Contiene contenuti generati con intelligenza artificiale", and a big button "Esporta il film".

Also include an empty state, a loading state and a friendly error message ("Questa scena non si può generare così, prova a descriverla in un altro modo") as a small components sheet.
```
