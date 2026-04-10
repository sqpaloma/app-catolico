import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { Button, Spinner, Surface } from "heroui-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  Switch,
  View,
} from "react-native";
import { Text, TextInput } from "@/components/ui/themed-text";

import { useCurrentUser } from "@/hooks/use-current-user";

const MAX_CHARS = 244;

interface PostComposerProps {
  onPostCreated?: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const { isPremium } = useCurrentUser();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [visibleToDirector, setVisibleToDirector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

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

  const removeImage = () => setImageUri(null);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Atenção", "Escreva algo antes de publicar.");
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
        visibleToDirector,
      });

      setText("");
      setImageUri(null);
      setVisibleToDirector(false);
      onPostCreated?.();
    } catch {
      Alert.alert("Erro", "Não foi possível publicar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty = text.trim().length === 0;

  return (
    <Surface variant="secondary" className="rounded-xl p-4">
      <TextInput
        className="text-foreground text-base min-h-[100px]"
        placeholder="O que está no seu coração hoje?"
        placeholderTextColor="#888"
        multiline
        textAlignVertical="top"
        maxLength={MAX_CHARS}
        value={text}
        onChangeText={setText}
        editable={!isSubmitting}
      />

      {imageUri && (
        <View className="mt-3 relative">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
          <Pressable
            onPress={removeImage}
            className="absolute top-2 right-2 bg-black/60 rounded-full w-7 h-7 items-center justify-center"
          >
            <Ionicons name="close" size={18} color="white" />
          </Pressable>
        </View>
      )}

      <View className="flex-row items-center justify-between mt-3">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={pickImage} disabled={isSubmitting}>
            <Ionicons
              name="image-outline"
              size={24}
              color={imageUri ? "#4caf50" : "#888"}
            />
          </Pressable>
          <Text
            className={`text-xs ${isOverLimit ? "text-danger" : "text-muted"}`}
          >
            {charCount}/{MAX_CHARS}
          </Text>
        </View>

        <Button
          size="sm"
          color="primary"
          isDisabled={isEmpty || isOverLimit || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <Spinner size="sm" color="white" />
          ) : (
            <Button.Label>Publicar</Button.Label>
          )}
        </Button>
      </View>

      {isPremium && (
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-default-200">
          <View className="flex-row items-center gap-2 flex-1">
            <Ionicons name="eye-outline" size={18} color="#888" />
            <Text className="text-muted text-xs flex-1">
              Visível para Diretor Espiritual
            </Text>
          </View>
          <Switch
            value={visibleToDirector}
            onValueChange={setVisibleToDirector}
            disabled={isSubmitting}
          />
        </View>
      )}
    </Surface>
  );
}
