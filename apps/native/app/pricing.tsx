import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Surface } from "heroui-native";
import React from "react";
import { Text, View } from "react-native";

import { Container } from "@/components/container";

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

  return (
    <Container className="px-4 pb-4">
      <View className="py-8 items-center">
        <View className="w-16 h-16 rounded-full bg-warning/20 items-center justify-center mb-4">
          <Ionicons name="star" size={32} color="#f5a623" />
        </View>
        <Text className="text-foreground text-2xl font-bold text-center">
          Plano Premium
        </Text>
        <Text className="text-muted text-sm mt-2 text-center">
          Orientação espiritual mais profunda e personalizada
        </Text>
      </View>

      <Surface variant="secondary" className="rounded-xl p-5 mb-4">
        <View className="items-center mb-4">
          <View className="flex-row items-baseline">
            <Text className="text-foreground text-sm">R$</Text>
            <Text className="text-foreground text-4xl font-bold mx-1">
              9,90
            </Text>
            <Text className="text-muted text-sm">/mês</Text>
          </View>
        </View>

        <View className="gap-3">
          {BENEFITS.map((b, i) => (
            <View key={i} className="flex-row items-start gap-3">
              <Ionicons name={b.icon} size={20} color="#f5a623" />
              <Text className="text-foreground text-sm flex-1">{b.text}</Text>
            </View>
          ))}
        </View>
      </Surface>

      <Button
        size="lg"
        color="warning"
        onPress={() => router.push("/checkout" as any)}
      >
        <Button.Label>Assinar Agora</Button.Label>
      </Button>

      <Text className="text-muted text-xs text-center mt-3">
        Você pode cancelar a qualquer momento. Pagamento processado com segurança
        pelo Asaas.
      </Text>
    </Container>
  );
}
