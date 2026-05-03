import { api } from "@app-catolico/backend/convex/_generated/api";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation } from "convex/react";

import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import { Text, TextInput } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentUser } from "@/hooks/use-current-user";

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
});

export default function SettingsScreen() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState(clerkUser?.firstName ?? "");
  const [lastName, setLastName] = useState(clerkUser?.lastName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { isPremium } = useCurrentUser();
  const deleteMyAccount = useMutation(api.users.deleteMyAccount);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const nameChanged =
    firstName !== (clerkUser?.firstName ?? "") ||
    lastName !== (clerkUser?.lastName ?? "");

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Erro", "Não foi possível processar a imagem.");
      return;
    }

    setSavingPhoto(true);
    try {
      const mimeType = asset.mimeType ?? "image/jpeg";
      const dataUri = `data:${mimeType};base64,${asset.base64}`;
      await clerkUser?.setProfileImage({ file: dataUri });
      Alert.alert("Sucesso", "Foto atualizada!");
    } catch (err) {
      console.error("Error updating photo:", err);
      Alert.alert("Erro", "Não foi possível atualizar a foto.");
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleSaveName = async () => {
    if (!clerkUser || !nameChanged) return;
    setSavingName(true);
    try {
      await clerkUser.update({ firstName, lastName });
      Alert.alert("Sucesso", "Nome atualizado!");
    } catch (err) {
      console.error("Error updating name:", err);
      Alert.alert("Erro", "Não foi possível atualizar o nome.");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!clerkUser || !currentPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      await clerkUser.updatePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Sucesso", "Senha alterada!");
    } catch (err: unknown) {
      console.error("Error updating password:", err);
      const clerkErr = err as {
        errors?: Array<{ longMessage?: string; message?: string }>;
      };
      const message =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        "Não foi possível alterar a senha. Verifique a senha atual.";
      Alert.alert("Erro", String(message));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancelSubscription = useCallback(() => {
    Alert.alert(
      "Cancelar assinatura",
      "Deseja cancelar sua assinatura? Você perderá o acesso Premium ao final do período atual.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar assinatura",
          style: "destructive",
          onPress: () => {
            Purchases.showManageSubscriptions().catch((e) => {
              if (__DEV__) console.error("[Settings] manage subs error:", e);
            });
          },
        },
      ],
    );
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "Tem certeza? Todos os seus dados serão apagados permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, excluir",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirmação final",
              "Esta ação é irreversível. Deseja realmente excluir sua conta?",
              [
                { text: "Voltar", style: "cancel" },
                {
                  text: "Excluir definitivamente",
                  style: "destructive",
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      await deleteMyAccount();
                      await clerkUser?.delete();
                      router.replace("/(auth)/sign-in");
                    } catch (err) {
                      console.error("Error deleting account:", err);
                      Alert.alert("Erro", "Não foi possível excluir sua conta. Tente novamente.");
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
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
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
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
                source={require("../assets/images/logo.png")}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
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
            Configurações
          </Text>
        </View>

        {/* Gradient with avatar */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 28, paddingBottom: 60, alignItems: "center" }}
        >
          <Pressable onPress={handlePickImage} disabled={savingPhoto}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {savingPhoto ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : clerkUser?.imageUrl ? (
                <Image
                  source={{ uri: clerkUser.imageUrl }}
                  style={{ width: 100, height: 100 }}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={52} color="#fff" />
              )}
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#8B1A1A",
                borderWidth: 3,
                borderColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </Pressable>
          <Text style={{ color: "#fff", fontSize: 14, marginTop: 12, fontWeight: "600" }}>
            Alterar foto
          </Text>
        </LinearGradient>

        {/* Name card */}
        <View style={{ paddingHorizontal: 20, marginTop: -36 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, ...cardShadow }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="person-outline" size={18} color="#8B1A1A" />
              <Text
                style={{
                  color: "#8B1A1A",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Dados Pessoais
              </Text>
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
              Nome
            </Text>
            <TextInput
              style={{
                backgroundColor: "#f5f0eb",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "#1a1a1a",
                marginBottom: 12,
              }}
              value={firstName}
              placeholder="Nome"
              placeholderTextColor="#aaa"
              onChangeText={setFirstName}
              editable={!savingName}
            />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
              Sobrenome
            </Text>
            <TextInput
              style={{
                backgroundColor: "#f5f0eb",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "#1a1a1a",
                marginBottom: 20,
              }}
              value={lastName}
              placeholder="Sobrenome"
              placeholderTextColor="#aaa"
              onChangeText={setLastName}
              editable={!savingName}
            />

            <Pressable
              onPress={handleSaveName}
              disabled={!nameChanged || savingName}
              style={({ pressed }) => ({
                backgroundColor:
                  !nameChanged || savingName
                    ? "#c4948b"
                    : pressed
                      ? "#7B1616"
                      : "#8B1A1A",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
              })}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {savingName ? "Salvando..." : "Salvar"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Password card */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, ...cardShadow }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="lock-closed-outline" size={18} color="#8B1A1A" />
              <Text
                style={{
                  color: "#8B1A1A",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Alterar Senha
              </Text>
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
              Senha atual
            </Text>
            <TextInput
              style={{
                backgroundColor: "#f5f0eb",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "#1a1a1a",
                marginBottom: 12,
              }}
              value={currentPassword}
              placeholder="Digite sua senha atual"
              placeholderTextColor="#aaa"
              secureTextEntry
              onChangeText={setCurrentPassword}
              editable={!savingPassword}
            />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
              Nova senha
            </Text>
            <TextInput
              style={{
                backgroundColor: "#f5f0eb",
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: "#1a1a1a",
                marginBottom: 20,
              }}
              value={newPassword}
              placeholder="Digite a nova senha"
              placeholderTextColor="#aaa"
              secureTextEntry
              onChangeText={setNewPassword}
              editable={!savingPassword}
            />

            <Pressable
              onPress={handleChangePassword}
              disabled={!currentPassword || !newPassword || savingPassword}
              style={({ pressed }) => ({
                backgroundColor:
                  !currentPassword || !newPassword || savingPassword
                    ? "#c4948b"
                    : pressed
                      ? "#7B1616"
                      : "#8B1A1A",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
              })}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {savingPassword ? "Alterando..." : "Alterar Senha"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Cancel subscription card */}
        {isPremium && (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, ...cardShadow }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Ionicons name="card-outline" size={18} color="#8B1A1A" />
                <Text
                  style={{
                    color: "#8B1A1A",
                    fontSize: 12,
                    fontWeight: "700",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Assinatura
                </Text>
              </View>

              <Text style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 18 }}>
                Você possui o plano Premium ativo. Caso deseje cancelar, você manterá o acesso até o final do período vigente.
              </Text>

              <Pressable
                onPress={handleCancelSubscription}
                style={({ pressed }) => ({
                  borderWidth: 1.5,
                  borderColor: "#D32F2F",
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="close-circle-outline" size={18} color="#D32F2F" />
                <Text style={{ color: "#D32F2F", fontSize: 15, fontWeight: "700" }}>
                  Cancelar Assinatura
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Delete account card */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, ...cardShadow }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="warning-outline" size={18} color="#D32F2F" />
              <Text
                style={{
                  color: "#D32F2F",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Zona de Perigo
              </Text>
            </View>

            <Text style={{ fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 18 }}>
              Ao excluir sua conta, todos os seus dados serão removidos permanentemente e não poderão ser recuperados.
            </Text>

            <Pressable
              onPress={handleDeleteAccount}
              disabled={deleting}
              style={({ pressed }) => ({
                backgroundColor: deleting
                  ? "#e0a0a0"
                  : pressed
                    ? "#B71C1C"
                    : "#D32F2F",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              })}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                    Excluir Conta
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
