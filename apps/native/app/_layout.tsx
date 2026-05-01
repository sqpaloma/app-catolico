import "@/global.css";
import { api } from "@app-catolico/backend/convex/_generated/api";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  XanhMono_400Regular,
  XanhMono_400Regular_Italic,
} from "@expo-google-fonts/xanh-mono";
import { ConvexReactClient, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/components/error-boundary";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { Sentry, captureException, initSentry } from "@/lib/sentry";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Best-effort: ignore if already hidden.
});

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

type AppEnv = {
  convex: ConvexReactClient;
  clerkPublishableKey: string;
};

type BootResult =
  | { ok: true; appEnv: AppEnv }
  | { ok: false; error: Error };

// Loads env, initializes Sentry, and instantiates the Convex client.
// Runs synchronously at module import time so any failure is caught here
// rather than propagated as an async error in the JS event loop, which is
// what crashed Hermes during App Store review.
function bootApp(): BootResult {
  try {
    const env = {
      EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL!,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!,
      EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    };

    if (!env.EXPO_PUBLIC_CONVEX_URL) {
      throw new Error("Missing EXPO_PUBLIC_CONVEX_URL");
    }
    if (!env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
    }

    initSentry(env.EXPO_PUBLIC_SENTRY_DSN);

    const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
      unsavedChangesWarning: false,
    });

    return {
      ok: true,
      appEnv: {
        convex,
        clerkPublishableKey: env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      },
    };
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    SplashScreen.hideAsync().catch(() => {});
    captureException(error, { source: "bootApp" });
    if (__DEV__) console.error("[bootApp]", error);
    (error as unknown as Record<string, unknown>).__bootDiag = {
      name: error.name,
      message: error.message,
      envCheck: {
        convexUrl: typeof process.env.EXPO_PUBLIC_CONVEX_URL,
        clerkKey: typeof process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
        sentryDsn: typeof process.env.EXPO_PUBLIC_SENTRY_DSN,
      },
    };
    return { ok: false, error };
  }
}

const bootResult = bootApp();

function EnsureUser() {
  const { isSignedIn } = useAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const didEnsure = useRef(false);

  useEffect(() => {
    if (isSignedIn && !didEnsure.current) {
      didEnsure.current = true;
      ensureUser().catch((e) => {
        captureException(e, { source: "EnsureUser.ensureUser" });
        if (__DEV__) console.error(e);
      });
    }
    if (!isSignedIn) {
      didEnsure.current = false;
    }
  }, [isSignedIn, ensureUser]);

  return null;
}

function StackLayout() {
  return (
    <>
      <EnsureUser />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="my-questions"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="question/[id]"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="pricing"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="invoices"
          options={{
            headerShown: true,
            headerTitle: "Faturas",
            headerBackTitle: "Voltar",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="directee-feed/[userId]"
          options={{
            headerShown: true,
            headerTitle: "Diário do Dirigido",
            headerBackTitle: "Voltar",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
      </Stack>
    </>
  );
}

function InnerLayout({ appEnv }: { appEnv: AppEnv }) {
  const [fontsLoaded, fontError] = useFonts({
    XanhMono: XanhMono_400Regular,
    "XanhMono-Italic": XanhMono_400Regular_Italic,
  });

  useEffect(() => {
    if (fontError) {
      captureException(fontError, { source: "useFonts" });
    }
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={appEnv.clerkPublishableKey}
    >
      <ConvexProviderWithClerk client={appEnv.convex} useAuth={useAuth}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#8B1A1A" }}>
          <StatusBar style="light" />
          <KeyboardProvider>
            <AppThemeProvider>
              <HeroUINativeProvider>
                <StackLayout />
              </HeroUINativeProvider>
            </AppThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default Sentry.wrap(function Layout() {
  if (!bootResult.ok) {
    // Throwing inside render lets ErrorBoundary catch and render a real
    // error screen, instead of letting the failure escape into a microtask
    // where Hermes can't reliably build a JSError (which is what crashed on
    // the App Store reviewer's iPad).
    return (
      <ErrorBoundary>
        <BootErrorThrower error={bootResult.error} />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <InnerLayout appEnv={bootResult.appEnv} />
    </ErrorBoundary>
  );
});

function BootErrorThrower({ error }: { error: Error }): never {
  throw error;
}
