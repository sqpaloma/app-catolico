import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAction } from "convex/react";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type CreditCard = {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
};

type ProcessingPayload = {
  customerData: CustomerData;
  creditCard: CreditCard;
  installmentType: string;
};

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

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data: string }>();
  const insets = useSafeAreaInsets();
  const createCardPayment = useAction(api.asaas.createCardPayment);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    async function processPayment() {
      try {
        const payload: ProcessingPayload = JSON.parse(
          decodeURIComponent(params.data ?? "{}"),
        );

        const result = await createCardPayment({
          email: payload.customerData.email,
          name: payload.customerData.name,
          cpfCnpj: payload.customerData.cpf,
          phone: payload.customerData.phone,
          postalCode: payload.customerData.cep,
          addressNumber: payload.customerData.addressNumber,
          creditCard: payload.creditCard,
          installmentCount:
            payload.installmentType === "CREDIT" ? 1 : undefined,
        });

        const confirmedStatuses = [
          "CONFIRMED",
          "RECEIVED",
          "RECEIVED_IN_CASH",
          "PENDING",
        ];

        if (confirmedStatuses.includes(result.status)) {
          router.replace("/checkout/success" as any);
        } else {
          const msg = encodeURIComponent(
            `Status do pagamento: ${result.status}`,
          );
          router.replace(`/checkout/error?message=${msg}` as any);
        }
      } catch (e) {
        const msg = encodeURIComponent(actionErrorMessage(e));
        router.replace(`/checkout/error?message=${msg}` as any);
      }
    }

    processPayment();
  }, []);

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

      {/* Content */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(139,26,26,0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="card" size={40} color="#8B1A1A" />
        </View>
        <ActivityIndicator size="large" color="#8B1A1A" style={{ marginBottom: 24 }} />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#1a1a1a",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Processando pagamento...
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#666",
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Aguarde enquanto processamos seu pagamento com segurança.
        </Text>
      </View>
    </View>
  );
}
