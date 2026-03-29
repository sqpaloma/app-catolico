import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Spinner, Surface } from "heroui-native";
import { FlatList, Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";

export default function DirecteesScreen() {
  const directees = useQuery(api.directorships.listMyDirectees);
  const router = useRouter();

  if (directees === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <Container isScrollable={false} className="px-4 pb-4">
      <FlatList
        data={directees}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/directee-feed/${item.directeeId}`)}
          >
            <Surface variant="secondary" className="p-4 rounded-xl">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <Ionicons name="person" size={20} color="#888" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground text-base font-semibold">
                    {item.directeeName}
                  </Text>
                  <Text className="text-muted text-xs">Dirigido ativo</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </View>
            </Surface>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <View className="py-6">
            <Text className="text-3xl font-bold text-foreground tracking-tight">
              Meus Dirigidos
            </Text>
            <Text className="text-muted text-sm mt-2">
              Veja o diário dos fiéis que você acompanha.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Nenhum dirigido"
            description="Você ainda não possui dirigidos vinculados."
          />
        }
      />
    </Container>
  );
}
