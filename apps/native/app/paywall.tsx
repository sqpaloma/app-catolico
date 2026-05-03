import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Purchases, { PurchasesPackage } from "react-native-purchases";

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
});

const BENEFITS = [
  { icon: "infinite-outline" as const, text: "Perguntas ilimitadas ao padre" },
  { icon: "flash-outline" as const, text: "Respostas prioritárias" },
  { icon: "heart-outline" as const, text: "Apoie a missão do Safe" },
  { icon: "shield-checkmark-outline" as const, text: "Acesso a conteúdos exclusivos" },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    Purchases.getOfferings()
      .then((offerings) => {
        const current = offerings.current;
        if (current && current.availablePackages.length > 0) {
          const monthly = current.availablePackages.find(
            (p) => p.packageType === "MONTHLY",
          ) ?? current.availablePackages[0];
          setMonthlyPkg(monthly);
        }
      })
      .catch((e) => {
        if (__DEV__) console.error("[Paywall] offerings error:", e);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async () => {
    if (!monthlyPkg) return;
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(monthlyPkg);
      const isPremium =
        typeof customerInfo.entitlements.active["Safe Pro"] !== "undefined";
      if (isPremium) {
        router.back();
      }
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        Alert.alert(
          "Erro na compra",
          err.message ?? "Não foi possível concluir a compra. Tente novamente.",
        );
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const info = await Purchases.restorePurchases();
      const isPremium =
        typeof info.entitlements.active["Safe Pro"] !== "undefined";
      if (isPremium) {
        Alert.alert("Compra restaurada!", "Seu acesso Premium foi restaurado.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Nenhuma compra encontrada", "Não encontramos assinaturas anteriores vinculadas à sua conta.");
      }
    } catch (e) {
      if (__DEV__) console.error("[Paywall] restore error:", e);
      Alert.alert("Erro", "Não foi possível restaurar as compras.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 32 }}
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
              <Ionicons name="chevron-back" size={22} color="#fff" />
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
                contentFit="contain"
              />
            </View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>
              SAFE
            </Text>
          </View>
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 12,
              fontStyle: "italic",
              flexShrink: 1,
              textAlign: "right",
              maxWidth: "55%",
            }}
          >
            Premium
          </Text>
        </View>

        {/* Gradient hero */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 32, paddingBottom: 60, alignItems: "center" }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="star" size={42} color="#f5a623" />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "800",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Seja Premium
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 14,
              marginTop: 6,
              textAlign: "center",
              paddingHorizontal: 40,
            }}
          >
            Desbloqueie todos os recursos e apoie a missão
          </Text>
        </LinearGradient>

        {/* Benefits card */}
        <View style={{ paddingHorizontal: 20, marginTop: -36 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, ...cardShadow }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="gift-outline" size={18} color="#8B1A1A" />
              <Text
                style={{
                  color: "#8B1A1A",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Benefícios
              </Text>
            </View>
            {BENEFITS.map((b, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 10,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "#f0ebe5",
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#edf7ed",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={b.icon} size={18} color="#2E7D32" />
                </View>
                <Text style={{ fontSize: 15, color: "#1a1a1a", flex: 1, fontWeight: "500" }}>
                  {b.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plan */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, ...cardShadow }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="pricetag-outline" size={18} color="#8B1A1A" />
              <Text
                style={{
                  color: "#8B1A1A",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Plano Mensal
              </Text>
            </View>

            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#8B1A1A" />
                <Text style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
                  Carregando...
                </Text>
              </View>
            ) : !monthlyPkg ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={{ color: "#888", fontSize: 14, textAlign: "center" }}>
                  Nenhum plano disponível no momento.{"\n"}Tente novamente mais tarde.
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#8B1A1A",
                    borderRadius: 12,
                    padding: 20,
                    backgroundColor: "#faf5f0",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 28, fontWeight: "800", color: "#8B1A1A" }}>
                    {monthlyPkg.product.priceString}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
                    por mês
                  </Text>
                  <Text style={{ fontSize: 13, color: "#666", marginTop: 8, textAlign: "center" }}>
                    {monthlyPkg.product.description || "Acesso completo ao Safe Premium"}
                  </Text>
                </View>

                <Pressable
                  onPress={handlePurchase}
                  disabled={purchasing}
                  style={({ pressed }) => ({
                    backgroundColor: purchasing
                      ? "#c4948b"
                      : pressed
                        ? "#7B1616"
                        : "#8B1A1A",
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                    marginTop: 20,
                  })}
                >
                  {purchasing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                      Assinar Agora
                    </Text>
                  )}
                </Pressable>
              </>
            )}

            {/* Restore */}
            <Pressable
              onPress={handleRestore}
              disabled={restoring}
              style={{ alignItems: "center", marginTop: 16, paddingVertical: 8 }}
            >
              {restoring ? (
                <ActivityIndicator size="small" color="#8B1A1A" />
              ) : (
                <Text style={{ color: "#8B1A1A", fontSize: 13, fontWeight: "600" }}>
                  Restaurar compras
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
