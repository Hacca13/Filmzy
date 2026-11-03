import {
  IMAGE_PROBLEMS,
  type UPLOAD_CONTENT_TYPES,
  type ImageAnalystOutput,
  type ImageProblem,
} from '@filmzy/contracts';

/**
 * Le piccole decisioni sul controllo delle foto caricate (T4.8, D19), fuori dal servizio così si
 * provano a parte.
 */

type UploadContentType = (typeof UPLOAD_CONTENT_TYPES)[number];

const startsWith = (bytes: Uint8Array, signature: readonly number[], offset = 0): boolean =>
  signature.every((value, index) => bytes[offset + index] === value);

/**
 * Il tipo vero di un'immagine, letto dai primi byte: il tipo che dichiara chi la manda non basta,
 * perché un file con un nome da foto può essere altro (un SVG con del codice, un programma). Solo i
 * formati che accettiamo; tutto il resto è `undefined`.
 */
export function detectImageType(bytes: Uint8Array): UploadContentType | undefined {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  // WebP: «RIFF», quattro byte di lunghezza, «WEBP».
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp';
  }
  return undefined;
}

const KNOWN_PROBLEMS = new Set<string>(IMAGE_PROBLEMS);

/**
 * Cosa non va in una foto, secondo l'analista di immagini. Una persona è un rifiuto (D19); le
 * segnalazioni (`flags`) che conosciamo diventano il loro motivo, e **una che non conosciamo
 * rifiuta lo stesso** (`other`): chi legge le immagini ha visto qualcosa e non si passa oltre. Nessun
 * motivo vuol dire che la foto si può usare. L'ordine è sempre lo stesso, senza ripetizioni.
 */
export function imageProblems(
  verdict: Pick<ImageAnalystOutput, 'containsPeople' | 'flags'>,
): ImageProblem[] {
  const found = new Set<ImageProblem>();
  if (verdict.containsPeople) found.add('people');
  for (const flag of verdict.flags) {
    found.add(KNOWN_PROBLEMS.has(flag) ? (flag as ImageProblem) : 'other');
  }
  return IMAGE_PROBLEMS.filter((problem) => found.has(problem));
}
