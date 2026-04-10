import { api } from "@app-catolico/backend/convex/_generated/api";
import type { Id } from "@app-catolico/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { Chip, Surface } from "heroui-native";
import React from "react";
import { Alert, Image, Pressable, View } from "react-native";
import { Text } from "@/components/ui/themed-text";

interface PostCardProps {
  id: Id<"posts">;
  text: string;
  imageUrl: string | null;
  visibleToDirector: boolean;
  createdAt: number;
  showDelete?: boolean;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function PostCard({
  id,
  text,
  imageUrl,
  visibleToDirector,
  createdAt,
  showDelete = true,
}: PostCardProps) {
  const removePost = useMutation(api.posts.remove);

  const handleDelete = () => {
    Alert.alert("Excluir post", "Deseja realmente excluir este post?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => removePost({ postId: id }),
      },
    ]);
  };

  return (
    <Surface variant="secondary" className="p-4 rounded-xl">
      <Text className="text-foreground text-base leading-6">{text}</Text>

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-52 rounded-lg mt-3"
          resizeMode="cover"
        />
      )}

      <View className="flex-row items-center justify-between mt-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={14} color="#888" />
          <Text className="text-muted text-xs">
            {formatRelativeTime(createdAt)}
          </Text>
          {visibleToDirector && (
            <Chip variant="flat" color="primary" size="sm">
              <Chip.Label>Diretor</Chip.Label>
            </Chip>
          )}
        </View>

        {showDelete && (
          <Pressable onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color="#888" />
          </Pressable>
        )}
      </View>
    </Surface>
  );
}
