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
import React, { useEffect, useMemo, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/components/error-boundary";
import { AppThemeProvider } from "@/contexts/app-theme-context";

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

// Reads env vars and instantiates the Convex client. Throws on missing/invalid
// env so the ErrorBoundary above can render a real error screen instead of a
// blank white screen (which is what would happen if this threw at module
// import time, before React even mounts).
function loadAppEnv(): AppEnv {
  // Lazy require so a failure in env validation doesn't crash module import.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { env } = require("@app-catolico/env/native") as typeof import("@app-catolico/env/native");

  const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
    unsavedChangesWarning: false,
  });

  return {
    convex,
    clerkPublishableKey: env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };
}

function EnsureUser() {
  const { isSignedIn } = useAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const didEnsure = useRef(false);

  useEffect(() => {
    if (isSignedIn && !didEnsure.current) {
      didEnsure.current = true;
      ensureUser().catch(console.error);
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

function InnerLayout() {
  const [fontsLoaded, fontError] = useFonts({
    XanhMono: XanhMono_400Regular,
    "XanhMono-Italic": XanhMono_400Regular_Italic,
  });

  const appEnv = useMemo<AppEnv>(() => loadAppEnv(), []);

  useEffect(() => {
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

export default function Layout() {
  return (
    <ErrorBoundary>
      <InnerLayout />
    </ErrorBoundary>
  );
}
