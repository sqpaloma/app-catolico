import { api } from "@app-catolico/backend/convex/_generated/api";
import type { Id } from "@app-catolico/backend/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const statusConfig = {
  pending: { label: "Aguardando diretores", bg: "#FFF3E0", color: "#E65100" },
  answering: { label: "Em resposta", bg: "#E3F2FD", color: "#1565C0" },
  consensus_ready: { label: "Orientação disponível", bg: "#E8F5E9", color: "#2E7D32" },
};

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const questionId = id as Id<"questions">;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const question = useQuery(api.questions.getById, { questionId });
  const answers = useQuery(api.answers.getByQuestion, { questionId });
  const history = useQuery(api.questions.getHistoryByAnonymousId, { questionId });

  if (question === undefined || answers === undefined) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f0eb" }}>
        <Spinner size="lg" />
      </View>
    );
  }

  if (question === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f0eb" }}>
        <Text style={{ fontSize: 17, color: "#666" }}>Pergunta não encontrada</Text>
      </View>
    );
  }

  const config = statusConfig[question.status];

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
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
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </Pressable>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>
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
          colors={["#8B1A1A", "#A52422", "#c4948b", "#f5f0eb"]}
          locations={[0, 0.35, 0.75, 1]}
          style={{ paddingTop: 20, paddingBottom: 60, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Pergunta
          </Text>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              {config.label}
            </Text>
          </View>
        </LinearGradient>

        {/* Question card */}
        <View style={{ paddingHorizontal: 20, marginTop: -36 }}>
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
            {question.isPremium && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <Ionicons name="star" size={14} color="#f5a623" />
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#f5a623" }}>
                  Premium
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 16, color: "#1a1a1a", lineHeight: 26 }}>
              {question.normalizedText}
            </Text>
          </View>
        </View>

        {/* Consensus response */}
        {question.consensusResponse && (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
                borderLeftWidth: 4,
                borderLeftColor: "#8B1A1A",
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                  },
                  android: { elevation: 4 },
                }),
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Ionicons name="sparkles" size={18} color="#8B1A1A" />
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#8B1A1A" }}>
                  Orientação Final
                </Text>
              </View>
              <Text style={{ fontSize: 15, color: "#333", lineHeight: 24 }}>
                {question.consensusResponse}
              </Text>
            </View>
          </View>
        )}

        {/* Premium user history */}
        {question.isPremium && history && history.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#1a1a1a",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Histórico do Usuário
            </Text>
            <Text style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
              Perguntas anteriores deste usuário (anônimo) — visível por ser Premium.
            </Text>
            <View style={{ gap: 10 }}>
              {history.map((q) => {
                const hConfig = statusConfig[q.status];
                return (
                  <View
                    key={q._id}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 14,
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
                    <Text
                      style={{ fontSize: 14, color: "#333", lineHeight: 22 }}
                      numberOfLines={3}
                    >
                      {q.normalizedText}
                    </Text>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: hConfig.bg,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginTop: 8,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: hConfig.color }}>
                        {hConfig.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Director answers */}
        {answers.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#1a1a1a",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Respostas dos Diretores ({answers.length})
            </Text>
            <View style={{ gap: 10 }}>
              {answers.map((answer) => (
                <View
                  key={answer._id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    padding: 16,
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
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Ionicons name="person-circle-outline" size={20} color="#8B1A1A" />
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#555" }}>
                      {answer.directorName}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, color: "#333", lineHeight: 24 }}>
                    {answer.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Director answer form */}
        <DirectorAnswerForm questionId={questionId} answers={answers} />
      </ScrollView>
    </View>
  );
}

function DirectorAnswerForm({
  questionId,
  answers,
}: {
  questionId: Id<"questions">;
  answers: Array<{ directorId: string; _id: string }>;
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAnswer = useMutation(api.answers.submit);
  const { user } = useUser();

  const alreadyAnswered = answers.some((a) => a.directorId === user?.id);

  if (alreadyAnswered) {
    return (
      <View style={{ paddingHorizontal: 20, marginTop: 20, alignItems: "center", paddingVertical: 16 }}>
        <View
          style={{
            backgroundColor: "#E8F5E9",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 16,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#2E7D32" }}>
            Você já respondeu esta pergunta
          </Text>
        </View>
      </View>
    );
  }

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Atenção", "Escreva sua orientação antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAnswer({ questionId, text: trimmed });
      setText("");
      Alert.alert("Enviado!", "Sua orientação foi registrada. Obrigado!");
    } catch {
      Alert.alert("Erro", "Não foi possível enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
      <View
        style={{
          height: 1,
          backgroundColor: "rgba(139,26,26,0.12)",
          marginBottom: 16,
        }}
      />
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: "#1a1a1a",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Sua Orientação
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 4,
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
        <TextInput
          style={{
            fontSize: 15,
            color: "#333",
            padding: 16,
            minHeight: 120,
            textAlignVertical: "top",
          }}
          placeholder="Escreva sua orientação espiritual..."
          placeholderTextColor="#aaa"
          multiline
          value={text}
          onChangeText={setText}
          editable={!isSubmitting}
        />
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={!text.trim() || isSubmitting}
        style={({ pressed }) => ({
          backgroundColor: !text.trim() || isSubmitting
            ? "rgba(139,26,26,0.4)"
            : pressed
              ? "#7B1616"
              : "#8B1A1A",
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 12,
          flexDirection: "row",
          gap: 8,
        })}
      >
        {isSubmitting ? (
          <Spinner size="sm" />
        ) : (
          <>
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Enviar Orientação
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
