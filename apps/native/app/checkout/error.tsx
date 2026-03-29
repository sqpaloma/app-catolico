import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Cross } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ErrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ message: string }>();
  const insets = useSafeAreaInsets();

  const errorMessage = params.message
    ? decodeURIComponent(params.message)
    : "Não foi possível processar o pagamento. Verifique os dados e tente novamente.";

  const handleRetry = () => {
    router.back();
    router.back();
  };

  const handleGoHome = () => {
    router.dismissAll();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#8B1A1A",
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Cross size={20} color="#fff" strokeWidth={2.5} />
        </View>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>
          SAFE
        </Text>
      </View>

      {/* Hero gradient */}
      <LinearGradient
        colors={["#8B1A1A", "#A52422", "#c4948b", "#f5f0eb"]}
        locations={[0, 0.3, 0.7, 1]}
        style={{ paddingTop: 48, paddingBottom: 64, alignItems: "center", paddingHorizontal: 24 }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="close-circle" size={60} color="#fff" />
        </View>
        <Text
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Pagamento não aprovado
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Houve um problema com o pagamento
        </Text>
      </LinearGradient>

      {/* Content card */}
      <View style={{ paddingHorizontal: 20, marginTop: -36 }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              },
              android: { elevation: 6 },
            }),
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(244,67,54,0.08)",
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
              width: "100%",
            }}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#c62828" />
            <Text style={{ color: "#c62828", fontSize: 14, fontWeight: "500", flex: 1, lineHeight: 20 }}>
              {errorMessage}
            </Text>
          </View>

          <View style={{ width: "100%", gap: 10 }}>
            <Pressable
              onPress={handleRetry}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
                borderRadius: 14,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              })}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                Tentar novamente
              </Text>
            </Pressable>

            <Pressable
              onPress={handleGoHome}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#f0e8e0" : "#fff",
                borderRadius: 14,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                borderWidth: 1,
                borderColor: "rgba(139,26,26,0.2)",
              })}
            >
              <Ionicons name="home-outline" size={18} color="#8B1A1A" />
              <Text style={{ color: "#8B1A1A", fontSize: 16, fontWeight: "700" }}>
                Voltar ao início
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
