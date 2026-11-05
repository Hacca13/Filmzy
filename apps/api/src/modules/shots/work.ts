/**
 * Dopo quanto un lavoro ancora «in coda» o «in lavorazione» non lavora più: l'attesa di un video dura
 * al più venti minuti, quindi uno più vecchio si è perso (il programma si è chiuso, il lavoro è stato
 * annullato). Un take così si chiude come fallito alla prima lettura (altrimenti blocca per sempre
 * l'inquadratura) e non conta come «in corso» sulla card, che non deve dire «Sto girando…» per sempre.
 */
export const STALE_WORK_MS = 45 * 60 * 1000;

/** Un tentativo che non è ancora chiuso: in coda o in lavorazione. */
export const isOpenStatus = (status: string | undefined): boolean =>
  status === 'queued' || status === 'running';
