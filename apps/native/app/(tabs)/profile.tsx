import { api } from "@app-catolico/backend/convex/_generated/api";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { Button, Chip, Spinner, Surface } from "heroui-native";
import React, { useState } from "react";
import { Alert, Linking, Text, View } from "react-native";

import { Container } from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser } from "@/hooks/use-current-user";

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Aguardando pagamento", color: "#f5a623" },
  active: { label: "Ativo", color: "#4caf50" },
  overdue: { label: "Vencido", color: "#f44336" },
  cancelled: { label: "Cancelado", color: "#9e9e9e" },
};

export default function ProfileScreen() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { user, isDirector, isPremium, isLoading } = useCurrentUser();
  const activeOrder = useQuery(api.orders.getMyActiveOrder);

  const [becomingDirector, setBecomingDirector] = useState(false);
  const becomeDirector = useMutation(api.users.becomeDirector);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBecomeDirector = async () => {
    setBecomingDirector(true);
    try {
      await becomeDirector();
      Alert.alert(
        "Parabéns!",
        "Você agora é um Diretor Espiritual. Uma nova aba estará disponível para responder perguntas.",
      );
    } catch {
      Alert.alert("Erro", "Não foi possível ativar. Tente novamente.");
    } finally {
      setBecomingDirector(false);
    }
  };

  const renderSubscriptionSection = () => {
    if (isLoading) return null;

    if (isPremium) {
      const premiumUntilStr = user?.premiumUntil
        ? new Date(user.premiumUntil).toLocaleDateString("pt-BR")
        : null;

      return (
        <Surface variant="secondary" className="rounded-xl overflow-hidden mt-4 p-4">
          <View className="flex-row items-center gap-3 mb-2">
            <Ionicons name="star" size={20} color="#f5a623" />
            <Text className="text-foreground text-base font-semibold">
              Premium Ativo
            </Text>
          </View>
          {premiumUntilStr && (
            <Text className="text-muted text-sm mb-3">
              Válido até {premiumUntilStr}
            </Text>
          )}
          <Button
            size="md"
            color="default"
            variant="flat"
            onPress={() => router.push("/invoices")}
          >
            <Button.Label>Ver Faturas</Button.Label>
          </Button>
        </Surface>
      );
    }

    if (activeOrder && activeOrder.status === "pending_payment") {
      const cfg = ORDER_STATUS_LABELS[activeOrder.status];
      return (
        <Surface variant="secondary" className="rounded-xl overflow-hidden mt-4 p-4">
          <View className="flex-row items-center gap-3 mb-2">
            <Ionicons name="time-outline" size={20} color={cfg.color} />
            <Text className="text-foreground text-base font-semibold">
              {cfg.label}
            </Text>
          </View>
          <Text className="text-muted text-sm mb-3">
            Sua assinatura Premium está aguardando confirmação de pagamento.
          </Text>
          <View className="gap-2">
            {activeOrder.paymentLink && (
              <Button
                size="md"
                color="warning"
                variant="flat"
                onPress={() => Linking.openURL(activeOrder.paymentLink!)}
              >
                <Button.Label>Realizar Pagamento</Button.Label>
              </Button>
            )}
            <Button
              size="md"
              color="default"
              variant="flat"
              onPress={() => router.push("/invoices")}
            >
              <Button.Label>Ver Faturas</Button.Label>
            </Button>
          </View>
        </Surface>
      );
    }

    if (activeOrder && activeOrder.status === "overdue") {
      return (
        <Surface variant="secondary" className="rounded-xl overflow-hidden mt-4 p-4">
          <View className="flex-row items-center gap-3 mb-2">
            <Ionicons name="alert-circle-outline" size={20} color="#f44336" />
            <Text className="text-foreground text-base font-semibold">
              Pagamento Vencido
            </Text>
          </View>
          <Text className="text-muted text-sm mb-3">
            Seu pagamento está vencido. Regularize para continuar com o Premium.
          </Text>
          <View className="gap-2">
            {activeOrder.paymentLink && (
              <Button
                size="md"
                color="danger"
                variant="flat"
                onPress={() => Linking.openURL(activeOrder.paymentLink!)}
              >
                <Button.Label>Regularizar Pagamento</Button.Label>
              </Button>
            )}
            <Button
              size="md"
              color="default"
              variant="flat"
              onPress={() => router.push("/invoices")}
            >
              <Button.Label>Ver Faturas</Button.Label>
            </Button>
          </View>
        </Surface>
      );
    }

    return (
      <Surface variant="secondary" className="rounded-xl overflow-hidden mt-4 p-4">
        <View className="flex-row items-center gap-3 mb-2">
          <Ionicons name="star-outline" size={20} color="#888" />
          <Text className="text-foreground text-base font-semibold">
            Assinatura Premium
          </Text>
        </View>
        <Text className="text-muted text-sm mb-3">
          Com o Premium, os diretores espirituais terão acesso ao seu histórico
          de perguntas anteriores (de forma anônima), permitindo orientações mais
          personalizadas e profundas.
        </Text>
        <Button
          size="md"
          color="warning"
          variant="flat"
          onPress={() => router.push("/pricing")}
        >
          <Button.Label>Ver Planos</Button.Label>
        </Button>
      </Surface>
    );
  };

  return (
    <Container className="px-4 pb-4">
      <View className="py-8 items-center">
        <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
          <Ionicons name="person" size={36} color="#888" />
        </View>
        <Text className="text-foreground text-xl font-semibold">
          {clerkUser?.fullName ?? clerkUser?.firstName ?? "Usuário"}
        </Text>
        <Text className="text-muted text-sm mt-1">
          {clerkUser?.primaryEmailAddress?.emailAddress}
        </Text>
        <View className="flex-row gap-2 mt-3">
          {isDirector && (
            <Chip variant="flat" color="primary" size="sm">
              <Chip.Label>Diretor Espiritual</Chip.Label>
            </Chip>
          )}
          {isPremium && (
            <Chip variant="flat" color="warning" size="sm">
              <Chip.Label>Premium</Chip.Label>
            </Chip>
          )}
          {!isDirector && !isPremium && (
            <Chip variant="flat" color="default" size="sm">
              <Chip.Label>Usuário</Chip.Label>
            </Chip>
          )}
        </View>
      </View>

      <Surface variant="secondary" className="rounded-xl overflow-hidden">
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="moon-outline" size={20} color="#888" />
            <Text className="text-foreground text-base">Tema</Text>
          </View>
          <ThemeToggle />
        </View>
      </Surface>

      {!isDirector && !isLoading && (
        <Surface variant="secondary" className="rounded-xl overflow-hidden mt-4 p-4">
          <View className="flex-row items-center gap-3 mb-2">
            <Ionicons name="book-outline" size={20} color="#888" />
            <Text className="text-foreground text-base font-semibold">
              Diretor Espiritual
            </Text>
          </View>
          <Text className="text-muted text-sm mb-3">
            Torne-se um diretor espiritual para ajudar outros fiéis com suas
            dúvidas e angústias. Você continuará tendo acesso a todas as
            funcionalidades de usuário.
          </Text>
          <Button
            size="md"
            color="primary"
            variant="flat"
            isDisabled={becomingDirector}
            onPress={handleBecomeDirector}
          >
            {becomingDirector ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label>Tornar-se Diretor Espiritual</Button.Label>
            )}
          </Button>
        </Surface>
      )}

      {renderSubscriptionSection()}

      <Button
        className="mt-6"
        variant="flat"
        color="danger"
        size="lg"
        onPress={handleSignOut}
      >
        <Button.Label>Sair da Conta</Button.Label>
      </Button>
    </Container>
  );
}
