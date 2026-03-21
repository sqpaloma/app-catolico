import { Stack } from "expo-router";
import React from "react";

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Voltar",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Checkout" }}
      />
      <Stack.Screen
        name="pix"
        options={{ headerTitle: "Pagamento PIX" }}
      />
      <Stack.Screen
        name="card-details"
        options={{ headerTitle: "Dados do Cartão" }}
      />
      <Stack.Screen
        name="processing"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="success"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="error"
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack>
  );
}
