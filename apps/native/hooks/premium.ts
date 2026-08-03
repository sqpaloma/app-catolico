export function isPremiumActive(
  user: { isPremium: boolean; premiumUntil?: number | null },
  now: number,
): boolean {
  if (!user.isPremium) return false;
  if (user.premiumUntil != null && user.premiumUntil <= now) return false;
  return true;
}
