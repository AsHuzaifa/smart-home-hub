const lastFiredAt = new Map<string, number>();

export function canFire(ruleId: string, debounceMs: number): boolean {
  const last = lastFiredAt.get(ruleId);
  const now = Date.now();
  if (last !== undefined && now - last < debounceMs) return false;
  lastFiredAt.set(ruleId, now);
  return true;
}

export function resetDebounce() {
  lastFiredAt.clear();
}
