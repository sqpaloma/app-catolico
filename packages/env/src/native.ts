import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/** Validates and returns native env. Call from boot so failures stay inside try/catch. */
export function getNativeEnv() {
  return createEnv({
    clientPrefix: "EXPO_PUBLIC_",
    client: {
      EXPO_PUBLIC_CONVEX_URL: z.url(),
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
      EXPO_PUBLIC_SENTRY_DSN: z.url().optional(),
      EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().min(1).optional(),
      EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: z.string().min(1).optional(),
    },
    runtimeEnv: {
      EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
      EXPO_PUBLIC_REVENUECAT_API_KEY_IOS:
        process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
      EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID:
        process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
    },
    emptyStringAsUndefined: true,
  });
}
