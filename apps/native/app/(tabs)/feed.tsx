import { api } from "@app-catolico/backend/convex/_generated/api";
import type { Id } from "@app-catolico/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  View,
} from "react-native";
import { Text, TextInput } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CHARS = 250;

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

function PostItem({
  id,
  text,
  imageUrl,
  createdAt,
}: {
  id: Id<"posts">;
  text: string;
  imageUrl: string | null;
  createdAt: number;
}) {
  const removePost = useMutation(api.posts.remove);

  const handleDelete = () => {
    Alert.alert("Excluir partilha", "Deseja realmente excluir esta partilha?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => removePost({ postId: id }),
      },
    ]);
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        marginHorizontal: 20,
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          android: { elevation: 3 },
        }),
      }}
    >
      <Text style={{ fontSize: 15, color: "#1a1a1a", lineHeight: 22 }}>
        {text}
      </Text>

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            marginTop: 12,
          }}
          resizeMode="cover"
        />
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#f0ebe6",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="time-outline" size={14} color="#999" />
          <Text style={{ fontSize: 12, color: "#999" }}>
            {formatRelativeTime(createdAt)}
          </Text>
        </View>
        <Pressable onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color="#bbb" />
        </Pressable>
      </View>
    </View>
  );
}

export default function DiarioScreen() {
  const insets = useSafeAreaInsets();
  const posts = useQuery(api.posts.listMine);

  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const remaining = MAX_CHARS - text.length;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Atenção", "Escreva algo antes de partilhar.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageStorageId: string | undefined;

      if (imageUri) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type || "image/jpeg" },
          body: blob,
        });
        const { storageId } = await uploadResult.json();
        imageStorageId = storageId;
      }

      await createPost({
        text: trimmed,
        imageStorageId: imageStorageId as any,
        visibleToDirector: false,
      });

      setText("");
      setImageUri(null);
    } catch {
      Alert.alert("Erro", "Não foi possível partilhar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View>
      {/* Header bar */}
      <View
        style={{
          backgroundColor: "#8B1A1A",
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "800",
              letterSpacing: 1,
            }}
          >
            SAFE
          </Text>
        </View>
        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 12,
            fontStyle: "italic",
            flexShrink: 1,
            textAlign: "right",
            maxWidth: "55%",
          }}
        >
          Um espaço seguro para sua alma
        </Text>
      </View>

      {/* Hero gradient */}
      <LinearGradient
        colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
        locations={[0, 0.45, 0.85, 1]}
        style={{
          paddingTop: 20,
          paddingBottom: 48,
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Diário da Comunidade
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Partilhe o que está no seu coração
        </Text>
      </LinearGradient>

      {/* Composer card */}
      <View style={{ paddingHorizontal: 20, marginTop: -28 }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 20,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              },
              android: { elevation: 6 },
            }),
          }}
        >
          <TextInput
            style={{
              fontSize: 15,
              color: "#1a1a1a",
              minHeight: 100,
              textAlignVertical: "top",
            }}
            placeholder="O que está no seu coração hoje? (máximo 250 caracteres)"
            placeholderTextColor="#999"
            multiline
            maxLength={MAX_CHARS}
            value={text}
            onChangeText={setText}
            editable={!isSubmitting}
          />

          {imageUri && (
            <View style={{ marginTop: 12, position: "relative" }}>
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 12,
                }}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => setImageUri(null)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 14,
                  width: 28,
                  height: 28,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </Pressable>
            </View>
          )}

          {/* Bottom row: image + counter + share button */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Pressable onPress={pickImage} disabled={isSubmitting}>
                <Ionicons
                  name="image-outline"
                  size={22}
                  color={imageUri ? "#4caf50" : "#888"}
                />
              </Pressable>
              <Text style={{ fontSize: 12, color: "#999" }}>Imagem</Text>
              <Text style={{ fontSize: 13, color: "#999", marginLeft: 4 }}>
                {remaining} restantes
              </Text>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !text.trim()}
              style={({ pressed }) => ({
                backgroundColor:
                  isSubmitting || !text.trim()
                    ? "rgba(139,26,26,0.4)"
                    : pressed
                      ? "#7B1616"
                      : "#8B1A1A",
                borderRadius: 20,
                paddingHorizontal: 20,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              })}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    Partilhar
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Spacer before posts */}
      <View style={{ height: 20 }} />
    </View>
  );

  const renderEmpty = () => (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 20,
        paddingVertical: 40,
        paddingHorizontal: 24,
        alignItems: "center",
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          android: { elevation: 3 },
        }),
      }}
    >
      <Text style={{ fontSize: 15, color: "#999", textAlign: "center" }}>
        Nenhuma partilha ainda. Seja o primeiro!
      </Text>
    </View>
  );

  if (posts === undefined) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f0eb",
        }}
      >
        <ActivityIndicator size="large" color="#8B1A1A" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostItem
            id={item._id}
            text={item.text}
            imageUrl={item.imageUrl}
            createdAt={item.createdAt}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      />
    </View>
  );
}
