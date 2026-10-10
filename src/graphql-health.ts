/** Counts pagination payload failures until verified new ad IDs arrive. */
export class GraphqlHealth {
  private streak = 0;
  private attemptStart = 0;
  constructor(readonly pauseAfter = 5, readonly warnAfter = 3) {
    if (!Number.isSafeInteger(pauseAfter) || pauseAfter < 1) throw new Error('Umbral GraphQL inválido');
  }
  observe(operation: string, hasErrors: boolean, newAds: number): number {
    if (operation !== 'AdLibrarySearchPaginationQuery') return this.streak;
    if (hasErrors) this.streak++;
    if (newAds > 0) this.reset();
    return this.streak;
  }
  get consecutiveErrors(): number { return this.streak; }
  get errorsThisAttempt(): number { return this.streak-this.attemptStart; }
  get shouldWarn(): boolean { return this.errorsThisAttempt === this.warnAfter; }
  get shouldPause(): boolean { return this.errorsThisAttempt >= this.pauseAfter; }
  progress(): void { this.reset(); }
  manualResume(): void { this.attemptStart=this.streak; }
  reset(): void { this.streak = 0; this.attemptStart=0; }
}
