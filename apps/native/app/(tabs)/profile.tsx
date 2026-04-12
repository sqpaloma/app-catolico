import { api } from "@app-catolico/backend/convex/_generated/api";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { Spinner } from "heroui-native";
import React, { useCallback } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentUser } from "@/hooks/use-current-user";

export default function ProfileScreen() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, isLoading } = useCurrentUser();
  const posts = useQuery(api.posts.listMine);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error(err);
    }
  };

  const postCount = posts?.length ?? 0;
  const displayName =
    clerkUser?.fullName ?? clerkUser?.firstName ?? "Usuário";
  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? "";

  const openPrivacyPolicy = useCallback(() => {
    void Linking.openURL("https://safe-espiritual.com/privacidade");
  }, []);

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
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
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
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
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
                overflow: "hidden",
              }}
            >
              {clerkUser?.imageUrl ? (
                <Image
                  source={{ uri: clerkUser.imageUrl }}
                  style={{ width: 64, height: 64 }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={36} color="#fff" />
              )}
            </View>

            {/* Name, email, badge */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
                {displayName}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 }}>
                {displayEmail}
              </Text>
            </View>

            {/* Settings + Logout */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => router.push("/settings")}
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
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Ionicons
                name={isPremium ? "star" : "trophy-outline"}
                size={28}
                color={isPremium ? "#f5a623" : "#8B1A1A"}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a" }}>
                  {isPremium ? "Premium Ativo" : "Tornar Premium"}
                </Text>
                <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {isPremium ? "Gerencie sua assinatura" : "Acesse vantagens exclusivas"}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                if (isPremium) {
                  router.push("/invoices");
                } else {
                  router.push("/pricing");
                }
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              })}
            >

              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                {isPremium ? "Ver Faturas" : "Assinar Agora"}
              </Text>
            </Pressable>
          </View>

        </View>

        {/* Legal */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Pressable
            onPress={openPrivacyPolicy}
            style={({ pressed }) => ({
              backgroundColor: "#fff",
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: pressed ? 0.85 : 1,
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Ionicons name="document-text-outline" size={22} color="#8B1A1A" />
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#1a1a1a" }}>
                Política de Privacidade
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#888" />
          </Pressable>
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
