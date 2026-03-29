import { Stack } from "expo-router";
import React from "react";

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="pix" />
      <Stack.Screen name="card-details" />
      <Stack.Screen
        name="processing"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="success"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="error"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}
