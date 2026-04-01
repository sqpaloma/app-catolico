import { api } from "@app-catolico/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export function useCurrentUser() {
  const user = useQuery(api.users.getMe);

  return {
    user,
    isLoading: user === undefined,
    isPremium: user?.isPremium ?? false,
  };
}
