import { api } from "@app-catolico/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { FlatList, Text, View } from "react-native";

import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";

export default function DirecteeFeedScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const posts = useQuery(
    api.posts.listByDirectee,
    userId ? { directeeId: userId } : "skip",
  );

  if (posts === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <Container isScrollable={false} className="px-4 pb-4">
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            id={item._id}
            text={item.text}
            imageUrl={item.imageUrl}
            visibleToDirector={item.visibleToDirector}
            createdAt={item.createdAt}
            showDelete={false}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <View className="py-6">
            <Text className="text-3xl font-bold text-foreground tracking-tight">
              Diário do Dirigido
            </Text>
            <Text className="text-muted text-sm mt-2">
              Publicações que este fiel compartilhou com você.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="newspaper-outline"
            title="Nenhuma publicação compartilhada"
            description="Este fiel ainda não compartilhou publicações com você."
          />
        }
      />
    </Container>
  );
}
