import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VERSE = {
  text: "Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
  reference: "Mateus 11:28",
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

        {/* Hero section with gradient */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 20, paddingBottom: 48, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 44, height: 44, marginBottom: 8 }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "#fff",
              fontSize: 32,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Bem-vindo ao Safe
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
              maxWidth: 320,
            }}
          >
            Um espaço sagrado e anônimo para partilhar o peso da sua alma e encontrar orientação
            espiritual.
          </Text>
        </LinearGradient>

        {/* Versículo do Dia */}
        <View style={{ paddingHorizontal: 20, marginTop: -28 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="book-outline" size={18} color="#B71C1C" />
              <Text
                style={{
                  color: "#B71C1C",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Versículo do Dia
              </Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#1a1a1a",
                lineHeight: 30,
                fontStyle: "italic",
                marginBottom: 12,
              }}
            >
              "{VERSE.text}"
            </Text>
            <Text style={{ fontSize: 14, color: "#666", fontWeight: "500" }}>
              — {VERSE.reference}
            </Text>
          </View>
        </View>

        {/* Compartilhe o que te aflige */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Pressable
            onPress={() => router.push("/(tabs)/questions")}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
            })}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", marginBottom: 4 }}>
                Compartilhe o que te aflige
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                Anônimo • Seguro • Com orientação espiritual
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>

        {/* Minhas Perguntas */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Pressable
            onPress={() => router.push("/my-questions")}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#f0e8e0" : "#fff",
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(139,26,26,0.12)",
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
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(139,26,26,0.08)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="help-circle-outline" size={26} color="#8B1A1A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#1a1a1a", marginBottom: 4 }}>
                Minhas Perguntas
              </Text>
              <Text style={{ color: "#888", fontSize: 13 }}>
                Veja respostas e acompanhe o status
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="rgba(139,26,26,0.4)" />
          </Pressable>
        </View>

        {/* Quick access cards */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            marginTop: 20,
            gap: 12,
          }}
        >
          <Pressable
            onPress={() => router.push("/(tabs)/feed")}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? "#f0e8e0" : "#fff",
              borderRadius: 16,
              paddingVertical: 24,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(139,26,26,0.12)",
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
            <Ionicons name="newspaper-outline" size={32} color="#8B1A1A" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginTop: 10 }}>
              Feed
            </Text>
            <Text style={{ fontSize: 12, color: "#888", marginTop: 4, textAlign: "center" }}>
              Reflexões e pensamentos
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/available")}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? "#f0e8e0" : "#fff",
              borderRadius: 16,
              paddingVertical: 24,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(139,26,26,0.12)",
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
            <Ionicons name="shield-outline" size={32} color="#8B1A1A" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginTop: 10 }}>
              Diretor Espiritual
            </Text>
            <Text style={{ fontSize: 12, color: "#888", marginTop: 4, textAlign: "center" }}>
              Responder almas
            </Text>
          </Pressable>
        </View>

        {/* Como funciona o SAFE? */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(139,26,26,0.12)",
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Ionicons name="heart-outline" size={22} color="#8B1A1A" />
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#1a1a1a" }}>
                Como funciona o SAFE?
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: "#555", lineHeight: 22 }}>
              Você escreve o que está no seu coração de forma completamente anônima. Um diretor
              espiritual lê e responde com orientação baseada na fé católica.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
