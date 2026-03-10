import { useUser } from "@clerk/clerk-expo";

export type UserRole = "user" | "director" | "admin";

export function useUserRole(): UserRole {
  const { user } = useUser();
  const role = (user?.publicMetadata as { role?: string })?.role;

  if (role === "director" || role === "admin") return role;
  return "user";
}
