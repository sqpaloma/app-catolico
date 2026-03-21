import { useCurrentUser } from "./use-current-user";

export type UserRole = "user" | "director" | "admin";

/**
 * Backward-compatible hook. Prefers Convex `users` table as source of truth.
 */
export function useUserRole(): UserRole {
  const { isDirector } = useCurrentUser();

  if (isDirector) return "director";
  return "user";
}
