import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { Button, Surface } from "heroui-native";

import { Container } from "@/components/container";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkErr = err as {
        errors?: Array<{ longMessage?: string; message?: string }>;
        longMessage?: string;
        message?: string;
      };
      const message =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        clerkErr?.longMessage ??
        clerkErr?.message ??
        "Não foi possível criar a conta. Verifique os dados.";
      console.error("Clerk sign-up error:", err);
      Alert.alert("Erro", String(message));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        Alert.alert("Erro", "Não foi possível verificar. Tente novamente.");
      }
    } catch {
      Alert.alert("Erro", "Código inválido. Verifique e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <Container className="px-6 justify-center">
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
            <Ionicons name="mail" size={28} color="#888" />
          </View>
          <Text className="text-foreground text-2xl font-bold">
            Verificar Email
          </Text>
          <Text className="text-muted text-sm mt-1 text-center">
            Enviamos um código para {emailAddress}
          </Text>
        </View>

        <Surface variant="secondary" className="rounded-xl p-1 mb-4">
          <TextInput
            className="text-foreground text-base p-4 text-center tracking-widest"
            value={code}
            placeholder="000000"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            onChangeText={setCode}
            editable={!isLoading}
          />
        </Surface>

        <Button
          size="lg"
          color="primary"
          isDisabled={!code || isLoading}
          onPress={onVerifyPress}
        >
          <Button.Label>{isLoading ? "Verificando..." : "Verificar"}</Button.Label>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="px-6 justify-center">
      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
          <Ionicons name="heart" size={28} color="#888" />
        </View>
        <Text className="text-foreground text-2xl font-bold">Criar Conta</Text>
        <Text className="text-muted text-sm mt-1">
          Comece sua jornada de direção espiritual
        </Text>
      </View>

      <Surface variant="secondary" className="rounded-xl p-1 mb-3">
        <TextInput
          className="text-foreground text-base p-4"
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          placeholder="Email"
          placeholderTextColor="#888"
          onChangeText={setEmailAddress}
          editable={!isLoading}
        />
      </Surface>

      <Surface variant="secondary" className="rounded-xl p-1 mb-4">
        <TextInput
          className="text-foreground text-base p-4"
          value={password}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry
          onChangeText={setPassword}
          editable={!isLoading}
        />
      </Surface>

      <Button
        size="lg"
        color="primary"
        isDisabled={!emailAddress || !password || isLoading}
        onPress={onSignUpPress}
      >
        <Button.Label>{isLoading ? "Criando..." : "Criar Conta"}</Button.Label>
      </Button>

      <View className="flex-row items-center justify-center mt-6 gap-1">
        <Text className="text-muted text-sm">Já tem conta?</Text>
        <Link href="/(auth)/sign-in">
          <Text className="text-primary text-sm font-semibold">Entrar</Text>
        </Link>
      </View>
    </Container>
  );
}
