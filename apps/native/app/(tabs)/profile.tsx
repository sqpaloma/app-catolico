import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Chip, Separator, Surface } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUserRole } from "@/hooks/use-user-role";

const roleLabels = {
  user: "Usuário",
  director: "Diretor Espiritual",
  admin: "Administrador",
};

const roleColors = {
  user: "default" as const,
  director: "primary" as const,
  admin: "warning" as const,
};

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const role = useUserRole();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container className="px-4 pb-4">
      <View className="py-8 items-center">
        <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
          <Ionicons name="person" size={36} color="#888" />
        </View>
        <Text className="text-foreground text-xl font-semibold">
          {user?.fullName ?? user?.firstName ?? "Usuário"}
        </Text>
        <Text className="text-muted text-sm mt-1">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
        <Chip variant="flat" color={roleColors[role]} size="sm" className="mt-3">
          <Chip.Label>{roleLabels[role]}</Chip.Label>
        </Chip>
      </View>

      <Surface variant="secondary" className="rounded-xl overflow-hidden">
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="moon-outline" size={20} color="#888" />
            <Text className="text-foreground text-base">Tema</Text>
          </View>
          <ThemeToggle />
        </View>

        <Separator />

        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="shield-checkmark-outline" size={20} color="#888" />
            <Text className="text-foreground text-base">Papel</Text>
          </View>
          <Text className="text-muted text-sm">{roleLabels[role]}</Text>
        </View>
      </Surface>

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
