import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Spinner } from "heroui-native";
import React from "react";
import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_CONFIG = {
  pending: { label: "Aguardando", bg: "#FFF3E0", color: "#E65100", icon: "time-outline" as const },
  answering: { label: "Em resposta", bg: "#E3F2FD", color: "#1565C0", icon: "chatbubbles-outline" as const },
  consensus_ready: { label: "Respondida", bg: "#E8F5E9", color: "#2E7D32", icon: "checkmark-circle-outline" as const },
};

export default function MyQuestionsScreen() {
  const questions = useQuery(api.questions.getMyQuestions);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (questions === undefined) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f0eb" }}>
        <Spinner size="lg" />
      </View>
    );
  }

  const pendingCount = questions.filter((q) => q.status === "pending" || q.status === "answering").length;
  const answeredCount = questions.filter((q) => q.status === "consensus_ready").length;

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
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
              source={require("../assets/images/logo.png")}
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
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 20, paddingBottom: 70, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Minhas Perguntas
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Acompanhe suas perguntas e respostas
          </Text>
        </LinearGradient>

        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            marginTop: -46,
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
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
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#B71C1C" }}>
              {pendingCount}
            </Text>
            <Text style={{ fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" }}>
              Aguardando
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
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
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#2E7D32" }}>
              {answeredCount}
            </Text>
            <Text style={{ fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" }}>
              Respondidas
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
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
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#1a1a1a" }}>
              {questions.length}
            </Text>
            <Text style={{ fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" }}>
              Total
            </Text>
          </View>
        </View>

        {/* Questions list */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          {questions.length === 0 ? (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
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
              <Ionicons name="chatbubbles-outline" size={44} color="#bbb" style={{ marginBottom: 12 }} />
              <Text style={{ fontSize: 15, color: "#888", textAlign: "center" }}>
                Você ainda não fez nenhuma pergunta.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {questions.map((question) => {
                const config = STATUS_CONFIG[question.status];
                return (
                  <Pressable
                    key={question._id}
                    onPress={() => router.push(`/question/${question._id}`)}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? "#f0e8e0" : "#fff",
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
                    })}
                  >
                    <Text
                      style={{ fontSize: 15, color: "#333", lineHeight: 22 }}
                      numberOfLines={3}
                    >
                      {question.normalizedText}
                    </Text>

                    {question.category && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
                        <Ionicons name="pricetag-outline" size={12} color="#888" />
                        <Text style={{ fontSize: 12, color: "#888" }}>
                          {question.category}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: question.category ? 8 : 12,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="chatbubbles-outline" size={14} color="#888" />
                        <Text style={{ fontSize: 12, color: "#888" }}>
                          {question.answerCount} {question.answerCount === 1 ? "resposta" : "respostas"}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          backgroundColor: config.bg,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 12,
                        }}
                      >
                        <Ionicons name={config.icon} size={13} color={config.color} />
                        <Text style={{ fontSize: 11, fontWeight: "600", color: config.color }}>
                          {config.label}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
