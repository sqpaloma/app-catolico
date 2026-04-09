import "@/global.css";
import { api } from "@app-catolico/backend/convex/_generated/api";
import { env } from "@app-catolico/env/native";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
});

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

export default function Layout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <GestureHandlerRootView style={{ flex: 1 }}>
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
