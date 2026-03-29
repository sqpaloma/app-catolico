import { api } from "@app-catolico/backend/convex/_generated/api";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { Cross } from "lucide-react-native";
import { Spinner } from "heroui-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentUser } from "@/hooks/use-current-user";

export default function ProfileScreen() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isDirector, isPremium, isLoading } = useCurrentUser();
  const posts = useQuery(api.posts.listMine);

  const [becomingDirector, setBecomingDirector] = useState(false);
  const becomeDirector = useMutation(api.users.becomeDirector);
  const leaveDirector = useMutation(api.users.leaveDirector);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBecomeDirector = async () => {
    setBecomingDirector(true);
    try {
      await becomeDirector();
      Alert.alert(
        "Parabéns!",
        "Você agora é um Diretor Espiritual. Uma nova aba estará disponível para responder perguntas.",
      );
    } catch {
      Alert.alert("Erro", "Não foi possível ativar. Tente novamente.");
    } finally {
      setBecomingDirector(false);
    }
  };

  const handleLeaveDirector = () => {
    Alert.alert(
      "Sair como Diretor",
      "Você deixará de ser Diretor Espiritual. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveDirector();
            } catch {
              Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
            }
          },
        },
      ],
    );
  };

  const postCount = posts?.length ?? 0;
  const displayName =
    clerkUser?.fullName ?? clerkUser?.firstName ?? "Usuário";
  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
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
              <Cross size={20} color="#fff" strokeWidth={2.5} />
            </View>
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

        {/* Profile hero section */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#c4948b", "#f5f0eb"]}
          locations={[0, 0.35, 0.75, 1]}
          style={{ paddingTop: 24, paddingBottom: 60, paddingHorizontal: 20 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Avatar */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="person" size={36} color="#fff" />
            </View>

            {/* Name, email, badge */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
                {displayName}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 }}>
                {displayEmail}
              </Text>
              {isDirector && (
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 12,
                    alignSelf: "flex-start",
                    marginTop: 6,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                    🤝 Diretor Espiritual
                  </Text>
                </View>
              )}
            </View>

            {/* Settings + Logout */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => router.push("/settings" as any)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="settings-outline" size={20} color="#fff" />
              </Pressable>
              <Pressable
                onPress={handleSignOut}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        {/* Cards */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            marginTop: -40,
            gap: 12,
          }}
        >
          {/* Premium Card */}
          <Pressable
            onPress={() => {
              if (isPremium) {
                router.push("/invoices");
              } else {
                router.push("/pricing");
              }
            }}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? "#f0e8e0" : "#fff",
              borderRadius: 16,
              padding: 16,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                },
                android: { elevation: 4 },
              }),
            })}
          >
            <Ionicons
              name={isPremium ? "star" : "trophy-outline"}
              size={28}
              color={isPremium ? "#f5a623" : "#888"}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#1a1a1a",
                marginTop: 8,
              }}
            >
              {isPremium ? "Premium Ativo" : "Tornar Premium"}
            </Text>
            <Text style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {isPremium ? "Gerencie sua assinatura" : "Acesse vantagens exclusivas"}
            </Text>
          </Pressable>

          {/* Director Card */}
          {isDirector ? (
            <Pressable
              onPress={handleLeaveDirector}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? "#f5d5d5" : "#FDEAEB",
                borderRadius: 16,
                padding: 16,
              })}
            >
              <Ionicons name="notifications-off-outline" size={28} color="#B22222" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#B22222",
                  marginTop: 8,
                }}
              >
                Diretor Ativo
              </Text>
              <Text style={{ fontSize: 12, color: "#C75050", marginTop: 4 }}>
                Clique para sair
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleBecomeDirector}
              disabled={becomingDirector}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: pressed ? "#f0e8e0" : "#fff",
                borderRadius: 16,
                padding: 16,
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                  },
                  android: { elevation: 4 },
                }),
              })}
            >
              {becomingDirector ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Ionicons name="shield-outline" size={28} color="#888" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1a1a1a",
                      marginTop: 8,
                    }}
                  >
                    Ser Diretor
                  </Text>
                  <Text style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    Ajude outros fiéis
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* MINHAS PARTILHAS */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
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
            Minhas Partilhas ({postCount})
          </Text>

          {isLoading || posts === undefined ? (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 40,
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
              <Spinner size="sm" />
            </View>
          ) : postCount === 0 ? (
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
              <Text style={{ fontSize: 14, color: "#888", textAlign: "center" }}>
                Você ainda não partilhou nada no diário.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {posts.map((post) => (
                <View
                  key={post._id}
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
                    style={{ fontSize: 14, color: "#333", lineHeight: 20 }}
                    numberOfLines={3}
                  >
                    {post.text}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>
                    {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
