import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "EXPO_PUBLIC_",
  client: {
    EXPO_PUBLIC_CONVEX_URL: z.url(),
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    /** Public privacy policy URL (Convex: https://YOUR_DEPLOYMENT.convex.site/privacy). Must match GET /privacy in convex/http.ts. */
    EXPO_PUBLIC_PRIVACY_POLICY_URL: z.url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
