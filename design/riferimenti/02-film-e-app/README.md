# 02 · Il film e l'app — riferimenti

Il codice delle 42 schermate del mockup di Figma, com'erano il **22/10/2026 dopo il prompt 05** (le correzioni). Un file `.tsx` per schermata (React con classi Tailwind, come lo dà l'MCP di Figma con `get_design_context`): serve a leggere testi, colori, misure e struttura esatti, **non** è codice dell'app.

- I file sono numerati nell'ordine delle tavole in Figma, cioè nell'ordine in cui l'utente incontra le schermate.
- La versione di prima delle correzioni (40 schermate, prompt 02–04) resta nella storia di git: `git diff 8db14f7 -- design/riferimenti/02-film-e-app/` mostra cosa è cambiato.
- In cima a ogni file ci sono i componenti condivisi (finestra, intestazione, pulsanti); la schermata è l'`export default`. Le etichette dei pulsanti arrivano spesso come proprietà (`etichetta="…"`).
- Le immagini dentro il codice (foto, icone) puntano a indirizzi temporanei di Figma, che scadono dopo 7 giorni: non sono scaricate.
- Ogni elemento ha `data-node-id`, il numero del nodo in Figma.

File Figma: <https://www.figma.com/design/XzJpIysmqCVXCbBSQlY4Jm/Filmzy>.

| File | Schermata in Figma | Nodo |
|---|---|---|
| `00-componenti` | Componenti (pulsanti, stati, finestra, passi, «Cambia servizio») | `49:2273` |
| **1 · Avvio** | | |
| `01-avvio-caricamento` | Avvio · Caricamento | `36:27` |
| `02-avvio-fallito` | Avvio · Avvio fallito | `49:2248` |
| `03-avvio-serve-versione-nuova` | Avvio · Serve una versione nuova | `27:73209` |
| `04-avvio-ripristino-dei-dati` | Avvio · Ripristino dei dati | `27:73235` |
| **2 · Primo avvio** | | |
| `05-benvenuto-1-fornitori` | Benvenuto in Filmzy · Fornitori | `27:72149` |
| `06-benvenuto-2-chiave` | Benvenuto in Filmzy · Chiave | `27:72236` |
| `07-benvenuto-3-servizi` | Benvenuto in Filmzy · Servizi | `27:72284` |
| `08-benvenuto-4-spese` | Benvenuto in Filmzy · Spese | `27:72347` |
| **3 · Home** | | |
| `09-home-i-miei-film` | I miei film, con la finestra di aggiornamento | `2:21975` |
| `10-home-aggiornamenti-stati` | Aggiornamenti · Stati | `27:74185` |
| **4 · Creazione** | | |
| `11-la-tua-idea` | La tua idea | `2:22095` |
| `12-la-storia` | La storia | `27:71264` |
| `13-moodboard` | Moodboard | `27:71730` |
| `14-moodboard-stati` | Moodboard · Stati | `27:73326` |
| `15-personaggi` | Personaggi | `2:22261` |
| `16-luoghi` | Luoghi | `27:71404` |
| `17-ritocca` | Ritocca | `27:71565` |
| `18-riepilogo-differenze` | Riepilogo · Differenze da risolvere | `27:71634` |
| `19-riepilogo-stati` | Riepilogo · Stati | `27:73263` |
| `20-sceneggiatura` | Sceneggiatura | `2:22415` |
| **5 · Scene e montaggio** | | |
| `21-le-scene` | Le scene | `2:22641` |
| `22-le-scene-imposta-le-immagini` | Le scene · Imposta le immagini | `27:71877` |
| `23-servizi-e-lavori` | Servizi e lavori | `27:73457` |
| `24-generazione-errori` | Generazione · Errori | `27:73596` |
| `25-quanto-ho-speso` | Quanto ho speso | `27:72000` |
| `26-montaggio-ed-esporta` | Montaggio ed esporta | `2:22937` |
| `27-suono-ed-esportazione-stati` | Suono ed esportazione · Stati | `27:73662` |
| `28-stati-di-base` | Stati di base | `2:23296` |
| **6 · Impostazioni** | | |
| `29-impostazioni-connessioni` | Connessioni | `27:72394` |
| `30-impostazioni-connessioni-gestione` | Connessioni · Gestione | `27:73799` |
| `31-impostazioni-fornitore-servizi` | Fornitore · Servizi | `27:72648` |
| `32-impostazioni-chi-fa-cosa` | Chi fa cosa | `27:72743` |
| `33-impostazioni-ruoli-istruzioni-e-prove` | Ruoli · Istruzioni e prove | `27:73944` |
| `34-impostazioni-spese-e-tetti` | Spese e tetti | `27:72836` |
| `35-impostazioni-generazione` | Generazione | `27:72889` |
| `36-impostazioni-prudenza` | Prudenza, con la conferma dello spegnimento | `27:72935` |
| `37-impostazioni-aggiornamenti` | Aggiornamenti | `27:72979` |
| `38-impostazioni-i-tuoi-dati` | I tuoi dati | `27:73023` |
| `39-impostazioni-avanzate` | Avanzate | `27:73064` |
| `40-impostazioni-avanzate-prova-pubblicazione-storico` | Avanzate · Prova, pubblicazione e storico | `27:74050` |
| `41-impostazioni-informazioni` | Informazioni | `27:73166` |

La landing page (messa da parte col prompt 04) sta in Figma su un'altra pagina, «Da parte · Landing page» (nodo `31:3262`), e non è scaricata qui.
