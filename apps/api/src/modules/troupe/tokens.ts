/**
 * I nomi con cui si iniettano le cose della troupe. Stanno in un file loro perché li usano sia il
 * modulo che li crea sia i servizi che li ricevono, e un import circolare non serve a nessuno.
 */
export const TROUPE_STORE = Symbol('TROUPE_STORE');
export const CONFIG_DIR = Symbol('CONFIG_DIR');
export const TROUPE_ENVIRONMENT = Symbol('TROUPE_ENVIRONMENT');
export const CONFIG_SOURCE = Symbol('CONFIG_SOURCE');
export const TROUPE = Symbol('TROUPE');
