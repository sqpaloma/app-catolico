import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "heroui-native";
import React from "react";
import { Text, View } from "react-native";

export default function ErrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ message: string }>();

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
    <View className="flex-1 bg-background items-center justify-center px-6">
      <View className="w-24 h-24 rounded-full bg-danger/20 items-center justify-center mb-6">
        <Ionicons name="close-circle" size={56} color="#f44336" />
      </View>

      <Text className="text-foreground text-2xl font-bold text-center">
        Pagamento não aprovado
      </Text>

      <Text className="text-muted text-sm text-center mt-3 mb-8">
        {errorMessage}
      </Text>

      <View className="w-full gap-3">
        <Button size="lg" color="warning" onPress={handleRetry}>
          <Button.Label>Tentar novamente</Button.Label>
        </Button>

        <Button size="lg" variant="flat" color="default" onPress={handleGoHome}>
          <Button.Label>Voltar ao início</Button.Label>
        </Button>
      </View>
    </View>
  );
}
