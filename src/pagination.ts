export interface PaginationButton { index: number; text: string; visible: boolean; belowResults: boolean; }
export interface PaginationSnapshot {
  buttons: PaginationButton[];
  endOfResults: boolean;
  // True when the page has no result label spans at all. Without an anchor
  // there is no safe way to tell a real "Ver más" from an advertiser card button,
  // so selectMoreButton() refuses to act.
  noResultLabels: boolean;
}

export function selectMoreButton(snapshot: PaginationSnapshot): number | null {
  if (snapshot.noResultLabels) return null;
  const matches = snapshot.buttons.filter(button => button.visible && button.belowResults &&
    /^(ver más|ver mas|see more|load more|mostrar más|mostrar mas)$/i.test(button.text.trim()));
  return matches.length === 1 ? matches[0]!.index : null;
}

export function stopReason(input: {newAds:number; moreButton:number|null; endOfResults:boolean;
  restricted:boolean; cancelled:boolean; elapsedMs:number; waitLimitMs:number}):
  'restricted'|'cancelled'|'new_ads'|'pagination_pending'|'end_of_results'|'loading'|'no_progress' {
  if(input.cancelled) return 'cancelled';
  if(input.restricted) return 'restricted';
  if(input.newAds>0) return 'new_ads';
  if(input.moreButton!==null) return 'pagination_pending';
  if(input.endOfResults) return 'end_of_results';
  if(input.elapsedMs<input.waitLimitMs) return 'loading';
  return 'no_progress';
}