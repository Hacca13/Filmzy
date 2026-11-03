import { useEffect, useRef } from 'react';

import { subscribeEvents, type LiveEvent } from '../api/events';

/** Quali lavori interessano a chi ascolta: il tipo di lavoro e, se serve, il film o l'oggetto a cui si riferisce. */
export interface LiveFilter {
  kinds: readonly string[];
  projectId?: string;
  subjectId?: string;
}

/** Un evento interessa se è una riconnessione (può essere cambiato qualsiasi cosa) o un lavoro del tipo giusto, del film e dell'oggetto giusti. */
export function matchesFilter(event: LiveEvent, filter: LiveFilter): boolean {
  if (event.type === 'reconnected') return true;
  return (
    filter.kinds.includes(event.kind) &&
    (filter.projectId === undefined || event.projectId === filter.projectId) &&
    (filter.subjectId === undefined || event.subjectId === filter.subjectId)
  );
}

/**
 * Chiama `onChange` quando un lavoro che interessa cambia stato (o dopo una riconnessione): chi la
 * riceve rilegge la sua risorsa. Senza `filter` non ascolta niente. `onChange` può cambiare a ogni
 * disegno: si usa l'ultimo, e l'ascolto non si ricrea.
 */
export function useLiveJobs(filter: LiveFilter | undefined, onChange: () => void): void {
  const latest = useRef(onChange);
  useEffect(() => {
    latest.current = onChange;
  });

  const kinds = filter?.kinds.join(',');
  const projectId = filter?.projectId;
  const subjectId = filter?.subjectId;

  useEffect(() => {
    if (kinds === undefined) return undefined;
    const wanted: LiveFilter = {
      kinds: kinds === '' ? [] : kinds.split(','),
      ...(projectId === undefined ? {} : { projectId }),
      ...(subjectId === undefined ? {} : { subjectId }),
    };
    return subscribeEvents((event) => {
      if (matchesFilter(event, wanted)) latest.current();
    });
  }, [kinds, projectId, subjectId]);
}
