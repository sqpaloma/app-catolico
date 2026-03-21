import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAction } from "convex/react";
import { Spinner } from "heroui-native";
import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";

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
    <View className="flex-1 bg-background items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-warning/20 items-center justify-center mb-6">
        <Ionicons name="card" size={36} color="#f5a623" />
      </View>
      <Spinner size="lg" />
      <Text className="text-foreground text-xl font-bold text-center mt-6">
        Processando pagamento...
      </Text>
      <Text className="text-muted text-sm text-center mt-2">
        Aguarde enquanto processamos seu pagamento com segurança.
      </Text>
    </View>
  );
}
