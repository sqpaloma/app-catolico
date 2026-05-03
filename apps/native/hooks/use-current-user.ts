import { api } from "@app-catolico/backend/convex/_generated/api";
import { useQuery } from "convex/react";

import { useRevenueCat } from "@/contexts/revenuecat-context";

export function useCurrentUser() {
  const user = useQuery(api.users.getMe);
  const { isPremium } = useRevenueCat();

  return {
    user,
    isLoading: user === undefined,
    isPremium,
  };
}
