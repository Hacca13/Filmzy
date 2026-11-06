# 05 · Chiusura, copia del film e registro — riferimenti

Il risultato del prompt 08 (06/11/2026), riletto via MCP con le schermate. File Figma: <https://www.figma.com/design/XzJpIysmqCVXCbBSQlY4Jm/Filmzy>.

| Tavola | Nodo | Cosa c'è |
|---|---|---|
| Chiudere mentre lavora | `99:5197` | «Le scene» scurita e sfocata, con la finestra: «PRIMA DI CHIUDERE», «Sto ancora lavorando a 2 cose», le due righe con lo spinner («Video · Scena 2, inquadratura 1» / «Kling · circa 0,42 $», «Storyboard · Scena 3, inquadratura 2» / «in coda»), il testo, «Aspetta che finisca» (ambra), «Torna al film», «Chiudi lo stesso», la riga grigia sotto |
| Chiudere mentre lavora · Stati | `99:5643` | «In attesa di chiudere»: barra ambra sotto il titolo della finestra, «Mi chiudo appena ho finito · ancora 1 cosa» e «Non chiudere»; «Un solo lavoro in corso»: «Sto ancora lavorando a una cosa» con una riga |
| Le scene · Questo film · Stati | `99:5680` | il menu «Questo film» aperto: «Salva una copia del film» (con la riga grigia «Un file da conservare o da aprire su un altro computer. Le chiavi non ci sono.») e «Quanto ho speso», con le icone; sotto, l'avviso rosso «Il film sta ancora lavorando: aspetta che finisca, poi salva la copia.» |
| Apri un film salvato · Stati | `99:5719` | quattro riquadri: «Sto aprendo il film…» (pulsante spento), film già presente (avviso neutro), file non valido (avviso rosso), versione più nuova (avviso neutro e «Controlla gli aggiornamenti») |
| I tuoi dati | `27:73023` | via «Cambia la cartella dei film»; nuovo riquadro «Il registro» col testo chiesto e «Apri la cartella del registro», fra «La cartella dei tuoi film» e «Una copia in più» |

## Differenze dal prompt, e cose da portare nel programma

- **In più:** nell'intestazione del film c'è il chip «2 lavori in corso», accanto a «Questo film: 12,40 $» (in «Chiudere mentre lavora» e nel menu). Il programma non l'ha ancora.
- **La finestra di chiusura** nel programma oggi è quella del sistema, con le stesse parole ma senza l'elenco dei lavori: per farla come nel disegno serve che la finestra di Electron chieda all'interfaccia di mostrarla (D93.5).
- **«Salva una copia del film»** nel programma è un pulsante nella pagina del film, non una voce del menu «Questo film» (il menu non c'è ancora).
- **«Il registro»** in «I tuoi dati» non c'è ancora nel programma: serve la rotta che apre la cartella del registro.
- **«Controlla gli aggiornamenti»** accanto all'avviso «versione più nuova» arriva con gli aggiornamenti (T6.4, seconda parte).
