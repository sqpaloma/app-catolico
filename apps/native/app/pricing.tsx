import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BENEFITS = [
  {
    icon: "shield-checkmark-outline" as const,
    text: "Diretores acessam seu histórico anônimo para orientações mais profundas",
  },
  {
    icon: "flash-outline" as const,
    text: "Prioridade nas respostas dos diretores espirituais",
  },
  {
    icon: "heart-outline" as const,
    text: "Acompanhamento espiritual contínuo e personalizado",
  },
  {
    icon: "lock-closed-outline" as const,
    text: "Total anonimato preservado em todas as interações",
  },
];

export default function PricingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: "#8B1A1A",
            paddingTop: insets.top + 8,
            paddingBottom: 12,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </Pressable>
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
                source={require("../assets/images/logo.png")}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>
              SAFE
            </Text>
          </View>
        </View>

        {/* Hero gradient */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 36, paddingBottom: 56, alignItems: "center", paddingHorizontal: 24 }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="star" size={38} color="#fff" />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 30,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Plano Premium
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Orientação espiritual mais profunda e personalizada
          </Text>
        </LinearGradient>

        {/* Price + benefits card */}
        <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
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
            {/* Price */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ fontSize: 16, color: "#1a1a1a" }}>R$</Text>
                <Text style={{ fontSize: 44, fontWeight: "800", color: "#1a1a1a", marginHorizontal: 4 }}>
                  9,90
                </Text>
                <Text style={{ fontSize: 15, color: "#888" }}>/mês</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: "#f0ebe6", marginBottom: 20 }} />

            {/* Benefits */}
            <View style={{ gap: 18 }}>
              {BENEFITS.map((b, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "rgba(139,26,26,0.08)",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Ionicons name={b.icon} size={18} color="#8B1A1A" />
                  </View>
                  <Text style={{ fontSize: 14, color: "#444", lineHeight: 21, flex: 1, paddingTop: 7 }}>
                    {b.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* CTA button */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Pressable
            onPress={() => router.push("/checkout" as any)}
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
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Assinar Agora
            </Text>
          </Pressable>

          <Text
            style={{
              fontSize: 13,
              color: "#888",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 19,
            }}
          >
            Você pode cancelar a qualquer momento. Pagamento processado com segurança pelo Asaas.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
