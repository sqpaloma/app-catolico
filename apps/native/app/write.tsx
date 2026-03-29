import { api } from "@app-catolico/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button, Spinner } from "heroui-native";
import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  View,
} from "react-native";
import { Surface } from "heroui-native";

import { Container } from "@/components/container";

export default function WriteScreen() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitQuestion = useMutation(api.questions.submit);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Atenção", "Escreva algo antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitQuestion({ text: trimmed });
      setText("");
      Alert.alert(
        "Enviado!",
        "Sua pergunta foi enviada e será revisada por diretores espirituais.",
      );
    } catch {
      Alert.alert("Erro", "Não foi possível enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="px-4 pb-4">
      <View className="py-8">
        <Text className="text-3xl font-bold text-foreground tracking-tight">
          O que está{"\n"}afligindo você?
        </Text>
        <Text className="text-muted text-sm mt-2">
          Escreva livremente. Sua mensagem será tratada com respeito e sigilo.
        </Text>
      </View>

      <Surface variant="secondary" className="rounded-xl p-1">
        <TextInput
          className="text-foreground text-base p-4 min-h-[180px]"
          placeholder="Descreva o que está no seu coração..."
          placeholderTextColor="#888"
          multiline
          textAlignVertical="top"
          value={text}
          onChangeText={setText}
          editable={!isSubmitting}
        />
      </Surface>

      <Button
        className="mt-4"
        size="lg"
        variant="primary"
        isDisabled={!text.trim() || isSubmitting}
        onPress={handleSubmit}
      >
        {isSubmitting ? (
          <Spinner size="sm" color="white" />
        ) : (
          <Button.Label>Enviar</Button.Label>
        )}
      </Button>

      <Text className="text-muted text-xs text-center mt-3">
        Sua mensagem será reescrita pela IA para maior clareza, sem alterar o significado.
      </Text>
    </Container>
  );
}
