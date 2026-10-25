/**
 * I nomi dei campi nelle impostazioni avanzate. Sono la pagina tecnica (D38): il nome vero del
 * campo resta visibile accanto, così chi legge la documentazione lo ritrova. I campi che non sono
 * qui si mostrano col loro nome.
 */
const FIELD_LABELS: Record<string, string> = {
  adapter: 'Tipo di collegamento',
  base_url: 'Indirizzo del servizio',
  api_key: 'Chiave',
  http_proxy: 'Proxy',
  timeout_s: 'Tempo massimo (secondi)',
  max_concurrency: 'Richieste insieme',
  delivery: 'Consegna',
  media_retention: 'Conservazione dei file',
  data_region: 'Regione dei dati',
  monthly_cap_usd: 'Limite di spesa mensile ($)',
  enabled: 'Attivo',
  fixtures: 'Risposte registrate (prove)',
  label: 'Nome',
  kind: 'Tipo',
  connection: 'Fornitore',
  provider_model: 'Id presso il fornitore',
  family: 'Famiglia',
  capabilities: 'Cosa sa fare',
  params: 'Parametri',
  request_fields: 'Nomi dei campi nella richiesta',
  pricing: 'Prezzo',
  quality: 'Voti delle prove',
  status: 'Stato',
  unit: 'Unità',
  value: 'Valore',
  checked: 'Verificato il',
  note: 'Nota',
  model: 'Servizio',
  routing: 'Scelta fra più servizi',
  policy: 'Politica',
  candidates: 'Servizi possibili',
  prompt_from: 'Istruzioni prese da',
  instructions: 'Istruzioni',
  output_strategy: 'Come si legge la risposta',
  retries: 'Nuovi tentativi',
  invalid_output: 'Risposta non valida',
  technical_error: 'Errore tecnico',
  description: 'Descrizione',
  hint: 'Frase per il modello',
  endFrameHint: 'Frase per l’ultimo fotogramma',
  id: 'Id',
  max_characters: 'Personaggi principali per film',
  film_budget_usd: 'Tetto di spesa per film ($)',
  confirm_above_usd: 'Chiedi conferma sopra ($)',
  real_people: 'Persone reali',
  dialogue: 'Dialoghi',
  dubbing: 'Doppiaggio',
  music: 'Musica',
  sound_effects: 'Effetti sonori',
  preview_gate: 'Anteprima prima di spendere',
  keyframes: 'Primo e ultimo fotogramma',
  image_upload: 'Caricamento di immagini',
  retouch: 'Ritocco',
  moodboard: 'Moodboard',
  c2pa_marking: 'Marcatura C2PA',
  camera: 'Camera',
  lighting: 'Luce',
  lens: 'Obiettivo',
  grade: 'Colori',
};

const VALUE_LABELS: Record<string, string> = {
  llm: 'Testo',
  image: 'Immagine',
  video: 'Video',
  music: 'Musica',
  sfx: 'Effetti',
  voice: 'Voce',
  active: 'Attivo',
  testing: 'In prova',
  retired: 'Ritirato',
  cheap: 'Il più economico',
  balanced: 'Equilibrata',
  quality: 'La migliore qualità',
};

export function fieldLabel(name: string): string {
  return FIELD_LABELS[name] ?? name;
}

export function valueLabel(value: string | number | boolean): string {
  return typeof value === 'string' ? (VALUE_LABELS[value] ?? value) : String(value);
}
