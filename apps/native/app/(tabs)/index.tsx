import { api } from "@app-catolico/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button, Spinner, Surface } from "heroui-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";

import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { QuestionCard } from "@/components/question-card";
import { useUserRole } from "@/hooks/use-user-role";

function UserHomeScreen() {
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
          O que está{"\n"}aflindo você?
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
        color="primary"
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

function DirectorHomeScreen() {
  const questions = useQuery(api.questions.getAvailableQuestions);

  if (questions === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <Container isScrollable={false} className="px-4 pb-4">
      <View className="py-6">
        <Text className="text-3xl font-bold text-foreground tracking-tight">
          Perguntas{"\n"}Disponíveis
        </Text>
        <Text className="text-muted text-sm mt-2">
          Escolha uma pergunta para oferecer orientação espiritual.
        </Text>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <QuestionCard
            id={item._id}
            text={item.normalizedText}
            status={item.status}
            answerCount={item.answerCount}
            showStatus={false}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="Nenhuma pergunta disponível"
            description="Todas as perguntas já foram respondidas. Volte mais tarde."
          />
        }
      />
    </Container>
  );
}

export default function HomeScreen() {
  const role = useUserRole();
  const isDirector = role === "director" || role === "admin";

  return isDirector ? <DirectorHomeScreen /> : <UserHomeScreen />;
}
