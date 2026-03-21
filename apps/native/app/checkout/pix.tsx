import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAction } from "convex/react";
import { Button, Spinner, Surface } from "heroui-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Text, View } from "react-native";

import { Container } from "@/components/container";
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
      <Container className="px-4 pb-4">
        <View className="flex-1 items-center justify-center gap-4">
          <Spinner size="lg" />
          <Text className="text-muted text-base">Gerando PIX...</Text>
        </View>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="px-4 pb-4">
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View className="w-16 h-16 rounded-full bg-danger/20 items-center justify-center">
            <Ionicons name="close-circle" size={36} color="#f44336" />
          </View>
          <Text className="text-foreground text-lg font-bold text-center">
            Erro ao gerar PIX
          </Text>
          <Text className="text-muted text-sm text-center">{error}</Text>
          <Button color="default" onPress={() => router.back()} className="mt-4">
            <Button.Label>Voltar</Button.Label>
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container className="px-4 pb-4">
      <View className="items-center py-6">
        <View className="w-14 h-14 rounded-full bg-warning/20 items-center justify-center mb-3">
          <Ionicons name="qr-code" size={28} color="#f5a623" />
        </View>
        <Text className="text-foreground text-xl font-bold text-center">
          Pague com PIX
        </Text>
        <Text className="text-muted text-sm text-center mt-1">
          Escaneie o QR Code ou copie o código abaixo
        </Text>
      </View>

      <Surface variant="secondary" className="rounded-xl p-5 mb-4">
        <View className="gap-4">
          {pixData?.pixQrCode ? (
            <View className="items-center py-2">
              <Image
                source={{ uri: pixImageUri(pixData.pixQrCode) }}
                style={{ width: 220, height: 220 }}
                resizeMode="contain"
              />
            </View>
          ) : null}

          {pixData?.pixCopiaECola ? (
            <Button
              variant="flat"
              color="warning"
              onPress={() =>
                copyText("Código PIX", pixData.pixCopiaECola!)
              }
            >
              <Button.Label>Copiar código PIX</Button.Label>
            </Button>
          ) : null}

          {pixData?.pixFetchFailed || !pixData?.pixQrCode ? (
            <Text className="text-muted text-sm text-center">
              Se o QR não aparecer, cadastre uma chave Pix na conta Asaas
              (sandbox) ou toque em Atualizar.
            </Text>
          ) : null}
        </View>
      </Surface>

      {pixData?.asaasPaymentId ? (
        <Button
          variant="flat"
          isDisabled={refreshing}
          onPress={handleRefresh}
          className="mb-3"
        >
          {refreshing ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Atualizar QR / código PIX</Button.Label>
          )}
        </Button>
      ) : null}

      <Surface variant="secondary" className="rounded-xl p-3 mb-4">
        <View className="flex-row items-center justify-center gap-2">
          <Spinner size="sm" />
          <Text className="text-muted text-sm">
            Aguardando confirmação do pagamento...
          </Text>
        </View>
      </Surface>

      <Button color="warning" size="lg" onPress={handleDone}>
        <Button.Label>Concluir</Button.Label>
      </Button>

      <Text className="text-muted text-xs text-center mt-3">
        Ao confirmar o pagamento, você será redirecionado automaticamente.
      </Text>
    </Container>
  );
}
