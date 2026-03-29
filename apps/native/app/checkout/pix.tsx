import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAction } from "convex/react";
import { Cross } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentUser } from "@/hooks/use-current-user";

type CustomerData = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  street: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
};

type PixPayload = {
  pixQrCode: string | null;
  pixCopiaECola: string | null;
  asaasPaymentId: string | null;
  pixFetchFailed: boolean;
};

function pixImageUri(base64: string): string {
  if (base64.startsWith("data:")) return base64;
  return `data:image/png;base64,${base64}`;
}

function actionErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    if (e.message && e.message !== "Server Error") return e.message;
  }
  if (typeof e === "object" && e !== null) {
    const o = e as Record<string, unknown>;
    if (typeof o.message === "string" && o.message !== "Server Error")
      return o.message;
    if (typeof o.data === "string") return o.data;
  }
  return "Falha ao processar o pagamento. Tente novamente.";
}

export default function PixScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data: string }>();
  const insets = useSafeAreaInsets();
  const createSubscription = useAction(api.asaas.createSubscription);
  const refreshPaymentInstructions = useAction(
    api.asaas.refreshPaymentInstructions,
  );
  const { isPremium } = useCurrentUser();
  const didNavigate = useRef(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pixData, setPixData] = useState<PixPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPremium && !didNavigate.current) {
      didNavigate.current = true;
      router.replace("/checkout/success" as any);
    }
  }, [isPremium]);

  useEffect(() => {
    let cancelled = false;

    async function initPix() {
      try {
        const customer: CustomerData = JSON.parse(
          decodeURIComponent(params.data ?? "{}"),
        );

        const result = await createSubscription({
          email: customer.email,
          name: customer.name,
          billingType: "PIX",
          cpfCnpj: customer.cpf,
        });

        if (cancelled) return;

        setPixData({
          pixQrCode: result.pixQrCode,
          pixCopiaECola: result.pixCopiaECola,
          asaasPaymentId: result.asaasPaymentId,
          pixFetchFailed: result.pixFetchFailed ?? false,
        });
      } catch (e) {
        if (!cancelled) setError(actionErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initPix();
    return () => {
      cancelled = true;
    };
  }, []);

  const copyText = async (label: string, text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copiado", `${label} copiado para a área de transferência.`);
  };

  const handleRefresh = async () => {
    if (!pixData?.asaasPaymentId) return;
    setRefreshing(true);
    try {
      const r = await refreshPaymentInstructions({
        asaasPaymentId: pixData.asaasPaymentId,
      });
      setPixData((prev) =>
        prev
          ? {
              ...prev,
              pixQrCode: r.pixQrCode ?? prev.pixQrCode,
              pixCopiaECola: r.pixCopiaECola ?? prev.pixCopiaECola,
              pixFetchFailed: !r.pixQrCode && !r.pixCopiaECola,
            }
          : null,
      );
    } catch (e) {
      Alert.alert("Erro", actionErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  };

  const handleDone = () => {
    router.dismissAll();
    router.replace("/");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
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
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
          <ActivityIndicator size="large" color="#8B1A1A" />
          <Text style={{ fontSize: 16, color: "#888" }}>Gerando PIX...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
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
            <Cross size={20} color="#fff" strokeWidth={2.5} />
          </View>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>
            SAFE
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "rgba(244,67,54,0.12)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="close-circle" size={40} color="#f44336" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1a1a1a", textAlign: "center", marginBottom: 8 }}>
            Erro ao gerar PIX
          </Text>
          <Text style={{ fontSize: 14, color: "#666", textAlign: "center", lineHeight: 21, marginBottom: 24 }}>
            {error}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 32,
            })}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Voltar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
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
              <Cross size={20} color="#fff" strokeWidth={2.5} />
            </View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>
              SAFE
            </Text>
          </View>
        </View>

        {/* Hero gradient */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#c4948b", "#f5f0eb"]}
          locations={[0, 0.3, 0.7, 1]}
          style={{ paddingTop: 32, paddingBottom: 48, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Ionicons name="qr-code" size={44} color="#fff" style={{ marginBottom: 8 }} />
          <Text
            style={{
              color: "#fff",
              fontSize: 30,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Pague com PIX
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Escaneie o QR Code ou copie o código abaixo
          </Text>
        </LinearGradient>

        {/* QR Code card */}
        <View style={{ paddingHorizontal: 20, marginTop: -28 }}>
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
            {pixData?.pixQrCode ? (
              <View style={{ paddingVertical: 8 }}>
                <Image
                  source={{ uri: pixImageUri(pixData.pixQrCode) }}
                  style={{ width: 220, height: 220 }}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            {pixData?.pixCopiaECola ? (
              <Pressable
                onPress={() => copyText("Código PIX", pixData.pixCopiaECola!)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 16,
                  width: "100%",
                })}
              >
                <Ionicons name="copy-outline" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                  Copiar código PIX
                </Text>
              </Pressable>
            ) : null}

            {pixData?.pixFetchFailed || !pixData?.pixQrCode ? (
              <Text
                style={{
                  fontSize: 13,
                  color: "#888",
                  textAlign: "center",
                  marginTop: 16,
                  lineHeight: 19,
                }}
              >
                Se o QR não aparecer, cadastre uma chave Pix na conta Asaas
                (sandbox) ou toque em Atualizar.
              </Text>
            ) : null}
          </View>
        </View>

        {/* Refresh button */}
        {pixData?.asaasPaymentId ? (
          <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
            <Pressable
              onPress={handleRefresh}
              disabled={refreshing}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#f0e8e0" : "#fff",
                borderRadius: 14,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: "rgba(139,26,26,0.12)",
              })}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#8B1A1A" />
              ) : (
                <>
                  <Ionicons name="refresh" size={18} color="#8B1A1A" />
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#8B1A1A" }}>
                    Atualizar QR / código PIX
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}

        {/* Waiting confirmation */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderWidth: 1,
              borderColor: "rgba(139,26,26,0.12)",
            }}
          >
            <ActivityIndicator size="small" color="#8B1A1A" />
            <Text style={{ fontSize: 14, color: "#666" }}>
              Aguardando confirmação do pagamento...
            </Text>
          </View>
        </View>

        {/* Done button */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Concluir
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
            Ao confirmar o pagamento, você será redirecionado automaticamente.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
