import { api } from "@app-catolico/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { isPremiumActive } from "./premium";

export function useCurrentUser() {
  const user = useQuery(api.users.getMe);
  const isPremium =
    user !== undefined && user !== null
      ? isPremiumActive(user, Date.now())
      : false;

  return {
    user,
    isLoading: user === undefined,
    isPremium,
  };
}
