import { api } from "@app-catolico/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Spinner } from "heroui-native";
import { FlatList, Text, View } from "react-native";

import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";

export default function FeedScreen() {
  const posts = useQuery(api.posts.listMine);

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
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <View className="pb-4">
            <View className="py-6">
              <Text className="text-3xl font-bold text-foreground tracking-tight">
                Diário
              </Text>
              <Text className="text-muted text-sm mt-2">
                Registre seus pensamentos e reflexões do dia.
              </Text>
            </View>
            <PostComposer />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="newspaper-outline"
            title="Nenhuma publicação ainda"
            description="Compartilhe o que está no seu coração hoje."
          />
        }
      />
    </Container>
  );
}
