import type { Character } from '@filmzy/contracts';
import type { SheetStore } from '@filmzy/db';

/**
 * Il personaggio con la sua scheda (T3.6): i riferimenti sono le tre immagini del volto
 * **bloccato**; senza volto bloccato la scheda è vuota. Lo usano la schermata del cast e la
 * Bibbia che si passa ai ruoli, così il significato di «scheda» sta in un posto solo.
 */
export function characterWithSheet(
  character: Character,
  sheets: Pick<SheetStore, 'lockedAssetIds'>,
): Character {
  return {
    ...character,
    sheet: sheets.lockedAssetIds(character.id).map((assetId) => ({ assetId })),
  };
}
