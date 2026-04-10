import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, View } from "react-native";
import { Text } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </View>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>
          SAFE
        </Text>
      </View>

      {/* Hero gradient */}
      <LinearGradient
        colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
        locations={[0, 0.45, 0.85, 1]}
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
          <Ionicons name="checkmark-circle" size={60} color="#fff" />
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
          Pagamento confirmado!
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Sua assinatura Premium foi ativada com sucesso.
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
              backgroundColor: "#e8f5e9",
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              width: "100%",
            }}
          >
            <Ionicons name="star" size={20} color="#2e7d32" />
            <Text style={{ color: "#2e7d32", fontSize: 14, fontWeight: "600", flex: 1, lineHeight: 20 }}>
              Agora você tem acesso a todas as funcionalidades exclusivas do plano Premium.
            </Text>
          </View>

          <Pressable
            onPress={handleGoHome}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
            })}
          >
            <Ionicons name="home" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Voltar ao início
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
