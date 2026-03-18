/**
 * Shim for @clerk/clerk-expo/server (not provided by the Expo SDK).
 * In Expo/React Native there is no server-side auth context; this returns
 * unauthenticated so that server-auth helpers degrade gracefully.
 */
export async function auth(): Promise<{
  userId: string | null;
  getToken: (options?: { template?: string }) => Promise<string | null>;
}> {
  return {
    userId: null,
    getToken: async () => null,
  };
}
