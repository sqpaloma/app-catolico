import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    SplashScreen.hideAsync().catch(() => {
      // No-op: splash may already be hidden.
    });
    if (__DEV__) {
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#8B1A1A",
            paddingHorizontal: 24,
            paddingVertical: 48,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 12,
            }}
          >
            Algo deu errado
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            Não foi possível abrir o aplicativo. Tente fechar e abrir novamente.
            Se o problema persistir, entre em contato com o suporte.
          </Text>

          <Pressable
            onPress={this.reset}
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? "rgba(255,255,255,0.25)"
                : "rgba(255,255,255,0.15)",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            })}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Tentar novamente
            </Text>
          </Pressable>

          {__DEV__ ? (
            <ScrollView
              style={{
                maxHeight: 240,
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 11,
                  fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                }}
              >
                {String(error.stack ?? error.message ?? error)}
              </Text>
            </ScrollView>
          ) : null}
        </View>
      );
    }
    return this.props.children;
  }
}
