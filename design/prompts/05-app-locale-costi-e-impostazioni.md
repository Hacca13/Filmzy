# 05 · App locale: costi in dollari, primo avvio, impostazioni per tutti

- **Stato:** pronto da inviare
- **Scritto il:** 20/10/2026
- **Cosa chiede:** togliere accesso, crediti e ruolo di amministratore; mostrare i costi in dollari con tetti di spesa; la procedura guidata al primo avvio; le Impostazioni per tutti (Connessioni, Spese e tetti, Avanzate, Prudenza, Informazioni); salvare e aprire un film; la finestra da programma per il desktop.
- **Da dare dopo il 04.** Annulla le parti di 01, 02 e 04 che parlano di crediti, accesso, amministratore o "Dichiaro di avere i diritti". Se i crediti di Figma scarseggiano si può incollare insieme agli altri: il più recente prevale.
- **Decisioni dietro questo prompt (20/10/2026):** Filmzy è software libero (AGPL-3.0) che gira sul computer dell'utente, con le sue chiavi (D28, D29); nessun account né pagamento; costi reali in dollari con tre tetti regolabili (D30); la dicitura "generato con AI" nei titoli resta attiva di default (D31). Le impostazioni prudenti si possono spegnere, con un'avvertenza.
- **Note:** il link alle donazioni non c'è ancora: nell'area "Informazioni" il pulsante "Sostieni il progetto" è un segnaposto.

## Prompt

```
Update the Filmzy mockup again (same style, all UI text in Italian). Filmzy is now a free desktop app that runs on the user's own computer with the user's own API keys: there are no accounts, no login, no credits and no payments. Apply these changes everywhere in the mockup.

1. Remove: any login, sign-up or account screen, the credit balance in the top bar, and every credit price on buttons ("Genera · 12 crediti", "Applica · 1 credito", "Genera · 2 crediti"). Also remove the "Dichiaro di avere i diritti" checkbox in the audio upload dialog: replace it with a plain note "Il file resta sul tuo computer e non viene inviato a nessun servizio AI. I diritti sul file sono tuoi." and the buttons "Carica" and "Annulla". The admin-only wording goes away: Settings are for everyone.

2. Costs in dollars. On every action button show the estimated cost in a friendly way ("Genera · circa 1,20 $", "Applica · circa 0,05 $"). When an action costs more than a threshold, show a confirmation dialog: "Questa generazione costa circa 3,40 $. Il film è a 41 $ su 50 $. Vuoi continuare?" with the buttons "Continua" and "Annulla" and a link "Cambia il tetto".

3. Top bar: a small spend indicator instead of credits, "Questo film: 12,40 $ di 50 $", with a thin progress bar. Clicking it opens a new screen "Quanto ho speso" with: spend per film, per role and per service as simple bars; the spend this month for each connected service against its monthly cap; and a note "Imposta un limite di spesa anche nel pannello di ogni servizio".

4. First-run wizard "Benvenuto in Filmzy" in 4 steps: 1 "Collega i tuoi servizi" (a short explanation that the user needs their own keys, a list of services grouped by Testo, Immagini e video, Musica, each with a link "Come ottengo la chiave?"); 2 paste the key in a masked field with "Prova la connessione" and a result line; 3 choose the models to add, with an optional field "Tetto di spesa mensile (facoltativo)"; 4 "Quanto vuoi spendere per ogni film?" with a field that defaults to "50 $" and the line "Puoi cambiarlo quando vuoi". The last button is "Inizia il tuo primo film".

5. Settings, for everyone, with a left menu: "Connessioni" (the provider cards, the 3-step "Collega un fornitore" modal, the provider detail page and the "Chi fa cosa" page, as in the previous prompt), "Spese e tetti" (film budget, the confirmation threshold, monthly caps per service), "Avanzate" (models, roles, instructions, presets, with the draft / test / publish / history flow), "Prudenza" and "Informazioni".
   - "Prudenza" has three toggles, all on by default: "Controlla i testi prima di ogni spesa", "Accetta solo personaggi generati da Filmzy" and "Aggiungi nei titoli la dicitura «Contiene contenuti generati con intelligenza artificiale»". Turning one off shows a small warning: "Se lo spegni te ne assumi la responsabilità e il tuo account presso il servizio potrebbe essere bloccato."
   - "Informazioni" shows the version, "Software libero (AGPL-3.0)", a button "Sostieni il progetto" (placeholder for a donation link) and a short "Uso responsabile" text.

6. Home ("I miei film"): next to "Nuovo film" add "Apri un film salvato". Each film card has a menu with "Salva una copia del film" and "Elimina". In "Montaggio ed esporta" the result of exporting is a message "Salvato in Documenti/Filmzy/…" with a button "Apri la cartella".

7. Desktop feel: show the app inside a desktop window frame (a title bar with the small Filmzy logo and the minimize, maximize and close buttons, no browser address bar) and a discreet status line at the bottom, "Salvato sul tuo computer". Add a banner for updates, "È disponibile una nuova versione", with the button "Aggiorna".
```
