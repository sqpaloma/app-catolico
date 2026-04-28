import * as Sentry from "@sentry/react-native";

let initialized = false;

export function initSentry(dsn: string | undefined) {
  if (initialized) return;
  if (!dsn) {
    if (__DEV__) {
      console.log("[sentry] EXPO_PUBLIC_SENTRY_DSN not set; skipping init.");
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      enabled: !__DEV__,
      tracesSampleRate: 0.1,
      enableNativeCrashHandling: true,
      enableAutoSessionTracking: true,
      attachStacktrace: true,
    });
    initialized = true;
  } catch (e) {
    if (__DEV__) console.warn("[sentry] init failed", e);
  }
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>
) {
  if (!initialized) {
    if (__DEV__) console.error("[sentry-fallback]", error, context);
    return;
  }
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Never let Sentry's own failures bubble.
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (!initialized) {
    if (__DEV__) console.log("[sentry-fallback]", level, message);
    return;
  }
  try {
    Sentry.captureMessage(message, level);
  } catch {
    // ignore
  }
}

export { Sentry };
