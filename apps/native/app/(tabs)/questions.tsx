import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { Cross } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "Angústia / Sofrimento",
  "Peso de um pecado",
  "Dúvida na fé",
  "Relacionamento / Família",
  "Luto / Perda",
  "Ansiedade / Medo",
  "Outro",
] as const;

export default function ConfessarScreen() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string>("Outro");
  const [showPicker, setShowPicker] = useState(false);
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
      await submitQuestion({ text: trimmed, category });
      setText("");
      setCategory("Outro");
      Alert.alert(
        "Enviado!",
        "Sua mensagem foi enviada. Um diretor espiritual responderá em breve com orientação e oração.",
      );
    } catch {
      Alert.alert("Erro", "Não foi possível enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* Hero gradient with dove */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#c4948b", "#f5f0eb"]}
          locations={[0, 0.3, 0.7, 1]}
          style={{ paddingTop: 32, paddingBottom: 48, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Text style={{ fontSize: 48, marginBottom: 4 }}>🕊️</Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 30,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Fale com Deus
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Tudo aqui é anônimo e sagrado
          </Text>
        </LinearGradient>

        {/* Main form card */}
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
            {/* Security badge */}
            <View
              style={{
                backgroundColor: "#e8f5e9",
                borderRadius: 12,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#2e7d32" />
              <Text style={{ color: "#2e7d32", fontSize: 13, fontWeight: "600", flex: 1, lineHeight: 19 }}>
                Sua identidade é completamente protegida. Nenhum dado pessoal é coletado.
              </Text>
            </View>

            {/* Category selector */}
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 10 }}>
              O que você está sentindo?
            </Text>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={{
                borderWidth: 1.5,
                borderColor: "#8B1A1A",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 15, color: "#1a1a1a", fontWeight: "500" }}>{category}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </Pressable>

            {/* Text input */}
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 10 }}>
              Escreva o que está no seu coração
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              <TextInput
                style={{
                  fontSize: 15,
                  color: "#1a1a1a",
                  padding: 16,
                  minHeight: 160,
                  textAlignVertical: "top",
                }}
                placeholder="Pode escrever livremente... Este é um espaço seguro para você. Ninguém saberá quem você é."
                placeholderTextColor="#999"
                multiline
                value={text}
                onChangeText={setText}
                editable={!isSubmitting}
              />
            </View>
            <Text style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>
              {text.length} caracteres
            </Text>

            {/* Submit button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !text.trim()}
              style={({ pressed }) => ({
                backgroundColor:
                  isSubmitting || !text.trim()
                    ? "rgba(139,26,26,0.5)"
                    : pressed
                      ? "#7B1616"
                      : "#8B1A1A",
                borderRadius: 14,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              })}
            >
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {isSubmitting ? "Enviando..." : "Enviar para o Diretor Espiritual"}
              </Text>
            </Pressable>

            <Text
              style={{
                fontSize: 13,
                color: "#888",
                textAlign: "center",
                marginTop: 12,
                lineHeight: 19,
              }}
            >
              Um diretor espiritual responderá em breve com orientação e oração.
            </Text>
          </View>
        </View>

        {/* COMO FUNCIONA section */}
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
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#1a1a1a",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Como funciona
            </Text>

            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>✍️</Text>
                <Text style={{ fontSize: 14, color: "#444", lineHeight: 21, flex: 1 }}>
                  Você escreve o que está sentindo — sem revelar seu nome
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>🗣️</Text>
                <Text style={{ fontSize: 14, color: "#444", lineHeight: 21, flex: 1 }}>
                  Um diretor espiritual lê e responde com orientação católica
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>💬</Text>
                <Text style={{ fontSize: 14, color: "#444", lineHeight: 21, flex: 1 }}>
                  Você recebe a resposta de forma anônima e segura
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Category picker modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <Pressable
          onPress={() => setShowPicker(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View
              style={{
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#ccc",
                  marginBottom: 8,
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a" }}>
                O que você está sentindo?
              </Text>
            </View>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setShowPicker(false);
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  backgroundColor: pressed ? "#f5f0eb" : "#fff",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                })}
              >
                <Text style={{ fontSize: 15, color: "#1a1a1a" }}>{cat}</Text>
                {category === cat && <Ionicons name="checkmark" size={20} color="#8B1A1A" />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
