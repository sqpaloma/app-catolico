import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import React from "react";
import { Text, View } from "react-native";

export default function SuccessScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.dismissAll();
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <View className="w-24 h-24 rounded-full bg-success/20 items-center justify-center mb-6">
        <Ionicons name="checkmark-circle" size={56} color="#4caf50" />
      </View>

      <Text className="text-foreground text-2xl font-bold text-center">
        Pagamento confirmado!
      </Text>

      <Text className="text-muted text-base text-center mt-3 mb-2">
        Sua assinatura Premium foi ativada com sucesso.
      </Text>

      <Text className="text-muted text-sm text-center mb-8">
        Agora você tem acesso a todas as funcionalidades exclusivas do plano
        Premium.
      </Text>

      <Button size="lg" color="warning" onPress={handleGoHome} className="w-full">
        <Button.Label>Voltar ao início</Button.Label>
      </Button>
    </View>
  );
}
