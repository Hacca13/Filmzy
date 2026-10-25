/** I nomi con cui si iniettano le chiavi: li usano il modulo che le crea e chi le consuma. */
export const SECRET_CIPHER = Symbol('SECRET_CIPHER');
export const SECRET_STORE = Symbol('SECRET_STORE');
/** Dove la troupe cerca le chiavi: variabili d'ambiente (`env:`) e file cifrato (`secret:`). */
export const SECRET_SOURCES = Symbol('SECRET_SOURCES');
