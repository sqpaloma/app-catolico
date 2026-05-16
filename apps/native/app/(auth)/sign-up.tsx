import { useSignUp, useSSO } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { TERMS_OF_USE_PT } from "@/constants/legal/terms-pt";
import { Text, TextInput } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "convex/react";
import { api } from "@app-catolico/backend/convex/_generated/api";

WebBrowser.maybeCompleteAuthSession();

type ClerkErrorLike = {
  errors?: Array<{ longMessage?: string; message?: string }>;
  longMessage?: string;
  message?: string;
};

const getClerkErrorMessage = (err: unknown, fallback: string) => {
  const clerkErr = err as ClerkErrorLike;
  return String(
    clerkErr?.errors?.[0]?.longMessage ??
      clerkErr?.errors?.[0]?.message ??
      clerkErr?.longMessage ??
      clerkErr?.message ??
      fallback,
  );
};

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    gender?: string;
    ageGroup?: string;
    hasDepression?: string;
    goesToChurch?: string;
  }>();

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const otpInputRef = useRef<RNTextInput>(null);

  const ensureUser = useMutation(api.users.ensureUser);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const allChecksPassed = Object.values(passwordChecks).every(Boolean);

  const openPrivacyPolicy = useCallback(() => {
    void Linking.openURL("https://www.safecatholic.app/privacidade");
  }, []);

  const callEnsureUser = useCallback(async () => {
    try {
      await ensureUser({
        gender: (params.gender as "masculino" | "feminino" | "prefiro_nao_identificar") || undefined,
        ageGroup: (params.ageGroup as "-18" | "18-25" | "25-35" | "35-45" | "45-55" | "55+") || undefined,
        hasDepression: params.hasDepression === "true" ? true : params.hasDepression === "false" ? false : undefined,
        goesToChurch: params.goesToChurch === "true" ? true : params.goesToChurch === "false" ? false : undefined,
      });
    } catch (e) {
      console.warn("ensureUser failed, will retry on layout", e);
    }
  }, [ensureUser, params]);

  const onSSOPress = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      setErrorMessage("");
      setOauthLoading(strategy === "oauth_google" ? "google" : "apple");

      try {
        const { createdSessionId, setActive: ssoSetActive, signIn: ssoSignIn, signUp: ssoSignUp } =
          await startSSOFlow({
            strategy,
            redirectUrl: Linking.createURL("/(auth)/sign-up"),
          });

        if (createdSessionId && ssoSetActive) {
          await ssoSetActive({ session: createdSessionId });
          await callEnsureUser();
          router.replace("/");
          return;
        }

        if (ssoSignUp?.verifications?.externalAccount?.status === "transferable" && ssoSignIn) {
          const response = await ssoSignIn.create({ transfer: true });
          if (response.status === "complete" && ssoSetActive) {
            await ssoSetActive({ session: response.createdSessionId });
            await callEnsureUser();
            router.replace("/");
            return;
          }
        }

        if (ssoSignIn?.firstFactorVerification?.status === "transferable" && ssoSignUp) {
          const response = await ssoSignUp.create({ transfer: true });
          if (response.status === "complete" && ssoSetActive) {
            await ssoSetActive({ session: response.createdSessionId });
            await callEnsureUser();
            router.replace("/");
            return;
          }
        }

        if (
          ssoSignUp?.verifications?.externalAccount?.status === "unverified" &&
          ssoSignUp?.status === "missing_requirements"
        ) {
          setErrorMessage(
            "Não foi possível verificar sua conta externa. Tente novamente ou use email/senha.",
          );
          return;
        }

        console.warn("SSO flow did not complete. signIn:", JSON.stringify(ssoSignIn?.status), "signUp:", JSON.stringify(ssoSignUp?.status));
        setErrorMessage("Não foi possível completar o login. Tente novamente.");
      } catch (err: unknown) {
        console.error("SSO error:", err);
        setErrorMessage(getClerkErrorMessage(err, "Não foi possível continuar. Tente novamente."));
      } finally {
        setOauthLoading(null);
      }
    },
    [startSSOFlow, router, callEnsureUser],
  );

  const onSignUpPress = async () => {
    setErrorMessage("");

    if (!acceptedLegal) {
      setErrorMessage(
        "Aceite os Termos de Uso e a Política de Privacidade para continuar.",
      );
      return;
    }

    if (!allChecksPassed) {
      setErrorMessage("A senha não atende todos os requisitos abaixo.");
      return;
    }

    if (!firstName.trim()) {
      setErrorMessage("Preencha seu nome.");
      return;
    }

    if (!lastName.trim()) {
      setErrorMessage("Preencha seu sobrenome.");
      return;
    }

    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (signUp.status === "complete") {
        await signUp.finalize();
        await callEnsureUser();
        router.replace("/");
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
        setCode("");
        setTimeout(() => otpInputRef.current?.focus(), 300);
      }
    } catch (err: unknown) {
      const message = getClerkErrorMessage(
        err,
        "Não foi possível criar a conta. Verifique os dados.",
      );
      console.error("Clerk sign-up error:", err);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!code.trim()) {
      setErrorMessage("Digite o código de verificação.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });

      if (result.status === "complete") {
        await result.finalize();
        await callEnsureUser();
        router.replace("/");
      } else {
        setErrorMessage("Não foi possível verificar. Tente novamente.");
      }
    } catch (err: unknown) {
      const message = getClerkErrorMessage(err, "Código inválido. Tente novamente.");
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onResendCode = async () => {
    setErrorMessage("");
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
    } catch (err: unknown) {
      setErrorMessage(getClerkErrorMessage(err, "Não foi possível reenviar o código."));
    }
  };

  const cardShadow = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View
          style={{
            backgroundColor: "#8B1A1A",
            paddingTop: insets.top + 8,
            paddingBottom: 12,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
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
        </View>

        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 40, paddingBottom: 56, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 44, height: 44, marginBottom: 8 }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Criar Conta
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
              textAlign: "center",
              lineHeight: 20,
              maxWidth: 280,
            }}
          >
            Comece sua jornada de direção espiritual no SAFE
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              ...cardShadow,
            }}
          >
            {pendingVerification ? (
              <>
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: "#FEF2F2",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons name="mail-outline" size={28} color="#8B1A1A" />
                  </View>
                  <Text style={{ fontSize: 17, fontWeight: "700", color: "#1a1a1a", marginBottom: 6, textAlign: "center" }}>
                    Verifique seu e-mail
                  </Text>
                  <Text style={{ fontSize: 13, color: "#666", textAlign: "center", lineHeight: 20 }}>
                    Enviamos um código de verificação para{"\n"}
                    <Text style={{ fontWeight: "700", color: "#333" }}>{emailAddress}</Text>
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
                    Código de verificação
                  </Text>
                  <TextInput
                    ref={otpInputRef}
                    style={{
                      backgroundColor: "#f5f0eb",
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 22,
                      color: "#1a1a1a",
                      textAlign: "center",
                      letterSpacing: 8,
                    }}
                    value={code}
                    placeholder="000000"
                    placeholderTextColor="#ccc"
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={(text) => {
                      setCode(text);
                      if (errorMessage) setErrorMessage("");
                    }}
                    editable={!isLoading}
                  />
                </View>

                {errorMessage ? (
                  <View
                    style={{
                      backgroundColor: "#FEF2F2",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ionicons name="alert-circle" size={18} color="#B91C1C" />
                    <Text style={{ flex: 1, fontSize: 13, color: "#B91C1C", lineHeight: 18 }}>
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={onVerifyPress}
                  disabled={!code.trim() || isLoading}
                  style={({ pressed }) => ({
                    backgroundColor:
                      !code.trim() || isLoading
                        ? "#c4948b"
                        : pressed
                          ? "#7B1616"
                          : "#8B1A1A",
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  })}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                        Verificar
                      </Text>
                      <Ionicons name="checkmark-circle-outline" size={18} color="rgba(255,255,255,0.8)" />
                    </>
                  )}
                </Pressable>

                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16, gap: 4 }}>
                  <Text style={{ fontSize: 13, color: "#888" }}>Não recebeu?</Text>
                  <Pressable onPress={onResendCode} disabled={isLoading}>
                    <Text style={{ fontSize: 13, color: "#8B1A1A", fontWeight: "700" }}>
                      Reenviar código
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => {
                    setPendingVerification(false);
                    setCode("");
                    setErrorMessage("");
                  }}
                  style={{ marginTop: 12, alignItems: "center" }}
                >
                  <Text style={{ fontSize: 13, color: "#888" }}>
                    ← Voltar ao formulário
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1a1a1a",
                    marginBottom: 12,
                    textAlign: "center",
                  }}
                >
                  Cadastro rápido
                </Text>
                <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
                  <Pressable
                    onPress={() => onSSOPress("oauth_google")}
                    disabled={isLoading || !!oauthLoading}
                    style={({ pressed }) => ({
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      backgroundColor: pressed ? "#f0ebe5" : "#f5f0eb",
                      borderRadius: 12,
                      paddingVertical: 14,
                      borderWidth: 1,
                      borderColor: "#e0d8d0",
                      opacity: oauthLoading === "apple" ? 0.5 : 1,
                    })}
                  >
                    {oauthLoading === "google" ? (
                      <ActivityIndicator size="small" color="#8B1A1A" />
                    ) : (
                      <>
                        <Ionicons name="logo-google" size={20} color="#4285F4" />
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#333" }}>
                          Google
                        </Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => onSSOPress("oauth_apple")}
                    disabled={isLoading || !!oauthLoading}
                    style={({ pressed }) => ({
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      backgroundColor: pressed ? "#2a2a2a" : "#1a1a1a",
                      borderRadius: 12,
                      paddingVertical: 14,
                      opacity: oauthLoading === "google" ? 0.5 : 1,
                    })}
                  >
                    {oauthLoading === "apple" ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="logo-apple" size={20} color="#fff" />
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                          Apple
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
                <Text style={{ fontSize: 12, color: "#666", lineHeight: 18, textAlign: "center", marginBottom: 18 }}>
                  Ao continuar com Google ou Apple, você concorda com os{" "}
                  <Text
                    onPress={() => setShowTermsModal(true)}
                    style={{ color: "#8B1A1A", fontWeight: "700" }}
                  >
                    Termos de Uso
                  </Text>{" "}
                  e a{" "}
                  <Text onPress={openPrivacyPolicy} style={{ color: "#8B1A1A", fontWeight: "700" }}>
                    Política de Privacidade
                  </Text>
                  .
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1, height: 1, backgroundColor: "#e0d8d0" }} />
                  <Text style={{ marginHorizontal: 12, fontSize: 13, color: "#999" }}>
                    ou com e-mail
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#e0d8d0" }} />
                </View>

                <View style={{ marginBottom: 12 }}>
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
                    }}
                    autoCapitalize="words"
                    value={firstName}
                    placeholder="Seu nome"
                    placeholderTextColor="#aaa"
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (errorMessage) setErrorMessage("");
                    }}
                    editable={!isLoading}
                  />
                </View>

                <View style={{ marginBottom: 12 }}>
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
                    }}
                    autoCapitalize="words"
                    value={lastName}
                    placeholder="Seu sobrenome"
                    placeholderTextColor="#aaa"
                    onChangeText={(text) => {
                      setLastName(text);
                      if (errorMessage) setErrorMessage("");
                    }}
                    editable={!isLoading}
                  />
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
                    Email
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#f5f0eb",
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: "#1a1a1a",
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={emailAddress}
                    placeholder="seu@email.com"
                    placeholderTextColor="#aaa"
                    onChangeText={(text) => {
                      setEmailAddress(text);
                      if (errorMessage) setErrorMessage("");
                    }}
                    editable={!isLoading}
                  />
                </View>

                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
                    Senha
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#f5f0eb",
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        padding: 16,
                        fontSize: 16,
                        color: "#1a1a1a",
                      }}
                      value={password}
                      placeholder="Crie uma senha"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showPassword}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errorMessage) setErrorMessage("");
                      }}
                      editable={!isLoading}
                    />
                    <Pressable
                      onPress={() => setShowPassword((prev) => !prev)}
                      hitSlop={8}
                      style={{ paddingRight: 14, paddingLeft: 4 }}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#999"
                      />
                    </Pressable>
                  </View>
                </View>

                {password.length > 0 ? (
                  <View style={{ marginBottom: 12, gap: 4 }}>
                    {([
                      { key: "length" as const, label: "Mínimo de 8 caracteres" },
                      { key: "uppercase" as const, label: "Uma letra maiúscula" },
                      { key: "lowercase" as const, label: "Uma letra minúscula" },
                      { key: "number" as const, label: "Um número" },
                    ]).map((item) => (
                      <View key={item.key} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons
                          name={passwordChecks[item.key] ? "checkmark-circle" : "close-circle"}
                          size={16}
                          color={passwordChecks[item.key] ? "#16A34A" : "#DC2626"}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: passwordChecks[item.key] ? "#16A34A" : "#DC2626",
                          }}
                        >
                          {item.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={{ height: 12 }} />
                )}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      setAcceptedLegal((v) => !v);
                      if (errorMessage) setErrorMessage("");
                    }}
                    hitSlop={8}
                    style={{ paddingTop: 2 }}
                  >
                    <Ionicons
                      name={acceptedLegal ? "checkbox" : "square-outline"}
                      size={22}
                      color={acceptedLegal ? "#8B1A1A" : "#999"}
                    />
                  </Pressable>
                  <Text style={{ flex: 1, fontSize: 13, color: "#444", lineHeight: 20 }}>
                    Li e aceito os{" "}
                    <Text
                      onPress={() => setShowTermsModal(true)}
                      style={{ color: "#8B1A1A", fontWeight: "700" }}
                    >
                      Termos de Uso
                    </Text>{" "}
                    e a{" "}
                    <Text
                      onPress={openPrivacyPolicy}
                      style={{ color: "#8B1A1A", fontWeight: "700" }}
                    >
                      Política de Privacidade
                    </Text>
                    .
                  </Text>
                </View>

                {errorMessage ? (
                  <View
                    style={{
                      backgroundColor: "#FEF2F2",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ionicons name="alert-circle" size={18} color="#B91C1C" />
                    <Text style={{ flex: 1, fontSize: 13, color: "#B91C1C", lineHeight: 18 }}>
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={onSignUpPress}
                  disabled={
                    !emailAddress ||
                    !password ||
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !acceptedLegal ||
                    isLoading ||
                    !!oauthLoading
                  }
                  style={({ pressed }) => ({
                    backgroundColor:
                      !emailAddress || !password || !firstName.trim() || !lastName.trim() || !acceptedLegal || isLoading
                      ? "#c4948b"
                      : pressed
                        ? "#7B1616"
                        : "#8B1A1A",
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  })}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                    {isLoading ? "Criando..." : "Criar Conta"}
                  </Text>
                  {!isLoading && (
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 14, color: "#888" }}>Já tem conta?</Text>
          <Link href="/(auth)/sign-in">
            <Text style={{ fontSize: 14, color: "#8B1A1A", fontWeight: "700" }}>Entrar</Text>
          </Link>
        </View>
      </ScrollView>

      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setShowTermsModal(false)}
          />
          <View
            style={{
              maxHeight: "88%",
              backgroundColor: "#fff",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1a1a1a" }}>
              Termos de Uso
            </Text>
            <ScrollView
              style={{ marginTop: 12, marginBottom: 16 }}
              showsVerticalScrollIndicator
            >
              <Text style={{ fontSize: 14, lineHeight: 22, color: "#333" }}>
                {TERMS_OF_USE_PT}
              </Text>
            </ScrollView>
            <Pressable
              onPress={() => setShowTermsModal(false)}
              style={{
                backgroundColor: "#8B1A1A",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                Fechar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
