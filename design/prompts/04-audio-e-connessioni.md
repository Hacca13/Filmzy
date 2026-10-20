# 04 · Tracce audio nel montaggio e area Connessioni

- **Stato:** bozza, da confermare (le domande aperte sono in fondo)
- **Scritto il:** 20/10/2026
- **Cosa chiede:** nello schermo "Montaggio ed esporta" una sezione audio con quattro tracce (video, dialoghi, musica, effetti), con l'audio originale dei video spento di default, e un'area di impostazioni riservata all'amministratore per collegare fornitori e modelli con la chiave API.
- **Da dare dopo il 03.** Se i crediti di Figma scarseggiano si può incollare insieme a 02 e 03: dove si contraddicono prevale il più recente.
- **Idea dietro questo prompt:** la musica, gli effetti e i dialoghi si generano con modelli a parte e stanno su tracce separate, così si può cambiare un suono (la musica, il verso di un animale) senza rigenerare il video. L'audio generato dentro i video si silenzia.
- **Note:** i dialoghi non ci sono nell'MVP (funzione `dialogue` spenta): la traccia compare spenta, con "In arrivo". L'area Connessioni è solo per l'amministratore: lì si possono usare parole tecniche come "modello" e "chiave API". Il resto dell'app no.
- **Domande aperte:** (1) le chiavi le inserisce solo l'amministratore della piattaforma o ogni utente porta le proprie? Il prompt assume solo l'amministratore. (2) "Suggerisci i suoni" entra nell'MVP? Se no, si toglie il pulsante.

## Prompt

```
Update the Filmzy mockup again (same style, all UI text in Italian).

PART 1 - Sound in "Montaggio ed esporta"
Under the video timeline add a sound section with four lanes, like a simple multitrack editor:
- "Video": the chosen clips as thumbnails. Each clip has a small speaker icon that turns the clip's original sound on or off. It is OFF by default, with the tooltip "Audio originale spento".
- "Dialoghi": an empty, disabled lane with a soft "In arrivo" label.
- "Musica": one block per scene, each with a name (for example "Musica tesa") and a mood label.
- "Effetti": small blocks attached to a shot and placed along the shot, each with a short label and the second where it starts (for example "Abbaio di un cane · 2 s").
Every lane has a mute toggle and a volume slider. Clicking a block opens a side panel with: a text field "Com'è questo suono?", a primary button "Genera" with the friendly credit cost ("Genera · 2 crediti"), a button "Cambia" that shows 3 variants to listen to (each with a play button and a small waveform and a "Scegli" button), a button "Carica un file" and a button "Elimina". At the top of the section add a button "Suggerisci i suoni" that fills the lanes with proposed blocks that the user can accept or discard one by one.
Also design: an empty lane state ("Nessun effetto: aggiungi il primo"), a loading state for a sound being generated, and a friendly error ("Questo suono non si può generare così, prova a descriverlo in un altro modo").

PART 2 - Admin area "Impostazioni" > "Connessioni" (only for the administrator; technical words like "chiave API" and "modello" are allowed here)
- A list of provider cards grouped by what they do: "Testo", "Immagini", "Video", "Musica ed effetti", "Voci". Each card has a logo placeholder, the name, a status chip ("Collegato", "Chiave mancante", "Non funziona"), the time of the last check and a button "Gestisci".
- A button "Collega un fornitore" that opens a 3-step modal: 1 choose the provider (or "Altro fornitore compatibile", which asks for a web address); 2 paste the API key in a masked field, with a button "Prova la connessione" and a result line ("Funziona" or "Chiave non valida"); 3 choose which models to add, as a checklist with name, type (Testo, Immagini, Video, Musica, Effetti), price per use and status ("In prova" or "Attivo").
- A provider detail page with three tabs: "Modelli" (table with name, type, price, an on/off toggle and a "Prova" button), "Chiave" (shows "Chiave collegata ••••1a2b" with buttons "Sostituisci" and "Rimuovi"; the key is never shown again) and "Chi lo usa" (the roles that use it).
- A page "Chi fa cosa": one row per role (Sceneggiatore, Casting, Aiuto regista, Direttore della fotografia, Storyboard, Operatore di ripresa, Scenografo, Ritocco, Compositore, Rumorista), each with a dropdown for the main model, a dropdown for the backup model, and a "Prova" button.
```
