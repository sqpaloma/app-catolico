import { useAuth } from "@clerk/expo";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Spinner } from "heroui-native";

import { LoginRequiredScreen } from "@/components/login-required-screen";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f0eb",
        }}
      >
        <Spinner size="lg" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <LoginRequiredScreen />;
  }

  return <>{children}</>;
}
