# Copie di prova delle versioni pubblicate

Una copia di un film (le righe dell'indice di un file `.filmzy`, senza i file) per ogni versione di Filmzy pubblicata. Il test `le copie salvate con le versioni pubblicate` (`src/film-copy.test.ts`) le apre tutte con la versione di adesso: se un aggiornamento dei dati rompe le copie vecchie, se ne accorge (D94).

- **Quando esce una versione** si aggiunge la sua copia, col numero della versione come nome (`0.1.0.json`).
- **Una copia aggiunta non si cambia più:** è quello che hanno in mano gli utenti.
- Le righe vengono da un film fatto col fornitore finto: niente dati veri.
