import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

type BillingType = "PIX" | "CREDIT_CARD";

const PAYMENT_METHODS: {
  type: BillingType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { type: "PIX", label: "PIX", icon: "qr-code-outline" },
  { type: "CREDIT_CARD", label: "Cartão de Crédito", icon: "card-outline" },
];

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  maxLength?: number;
  autoCapitalize?: "none" | "words" | "characters";
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 }}>
        {label}
      </Text>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#e0d8d0",
        }}
      >
        <TextInput
          style={{
            fontSize: 15,
            color: "#1a1a1a",
            padding: 14,
          }}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
}

export default function CheckoutScreen() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(
    clerkUser?.fullName ?? clerkUser?.firstName ?? "",
  );
  const [email, setEmail] = useState(
    clerkUser?.primaryEmailAddress?.emailAddress ?? "",
  );
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<BillingType>("PIX");

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Campo obrigatório", "Informe seu nome.");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Campo obrigatório", "Informe seu e-mail.");
      return false;
    }
    const cpfDigits = onlyDigits(cpf);
    if (cpfDigits.length !== 11) {
      Alert.alert("CPF inválido", "Informe um CPF com 11 dígitos.");
      return false;
    }
    const phoneDigits = onlyDigits(phone);
    if (phoneDigits.length < 10) {
      Alert.alert("Telefone inválido", "Informe um telefone válido com DDD.");
      return false;
    }
    if (!cep.trim() || onlyDigits(cep).length !== 8) {
      Alert.alert("CEP inválido", "Informe um CEP com 8 dígitos.");
      return false;
    }
    if (!street.trim()) {
      Alert.alert("Campo obrigatório", "Informe a rua.");
      return false;
    }
    if (!addressNumber.trim()) {
      Alert.alert("Campo obrigatório", "Informe o número do endereço.");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validate()) return;

    const customerData = {
      name: name.trim(),
      email: email.trim(),
      cpf: onlyDigits(cpf),
      phone: onlyDigits(phone),
      cep: onlyDigits(cep),
      street: street.trim(),
      addressNumber: addressNumber.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
    };

    const params = encodeURIComponent(JSON.stringify(customerData));

    if (selectedMethod === "PIX") {
      router.push(`/checkout/pix?data=${params}` as any);
    } else {
      router.push(`/checkout/card-details?data=${params}` as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
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

        {/* Hero gradient */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#c4948b", "#f5f0eb"]}
          locations={[0, 0.3, 0.7, 1]}
          style={{ paddingTop: 32, paddingBottom: 48, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Ionicons name="star" size={44} color="#fff" style={{ marginBottom: 8 }} />
          <Text
            style={{
              color: "#fff",
              fontSize: 30,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Plano Premium
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Acesse vantagens exclusivas
          </Text>
        </LinearGradient>

        {/* Price card */}
        <View style={{ paddingHorizontal: 20, marginTop: -28 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(245,166,35,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="star" size={24} color="#f5a623" />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a" }}>
                  Plano Premium
                </Text>
                <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                  Assinatura mensal
                </Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ fontSize: 14, color: "#1a1a1a" }}>R$</Text>
                <Text style={{ fontSize: 26, fontWeight: "800", color: "#1a1a1a", marginHorizontal: 2 }}>
                  9,90
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: "#888" }}>/mês</Text>
            </View>
          </View>
        </View>

        {/* Personal data section */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#1a1a1a",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Dados pessoais
          </Text>

          <InputField
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
            autoCapitalize="words"
          />
          <InputField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            label="CPF"
            value={cpf}
            onChangeText={(v) => setCpf(formatCpf(v))}
            placeholder="000.000.000-00"
            keyboardType="number-pad"
            maxLength={14}
          />
          <InputField
            label="Telefone"
            value={phone}
            onChangeText={(v) => setPhone(formatPhone(v))}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>

        {/* Address section */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#1a1a1a",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Endereço
          </Text>

          <InputField
            label="CEP"
            value={cep}
            onChangeText={(v) => setCep(formatCep(v))}
            placeholder="00000-000"
            keyboardType="number-pad"
            maxLength={9}
          />
          <InputField
            label="Rua"
            value={street}
            onChangeText={setStreet}
            placeholder="Nome da rua"
            autoCapitalize="words"
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Número"
                value={addressNumber}
                onChangeText={setAddressNumber}
                placeholder="Nº"
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 2 }}>
              <InputField
                label="Bairro"
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="Bairro"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 2 }}>
              <InputField
                label="Cidade"
                value={city}
                onChangeText={setCity}
                placeholder="Cidade"
                autoCapitalize="words"
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Estado"
                value={state}
                onChangeText={(v) => setState(v.toUpperCase().slice(0, 2))}
                placeholder="UF"
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>
        </View>

        {/* Payment method section */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#1a1a1a",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Forma de pagamento
          </Text>

          <View style={{ gap: 10, marginBottom: 20 }}>
            {PAYMENT_METHODS.map((m) => (
              <Pressable
                key={m.type}
                onPress={() => setSelectedMethod(m.type)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f0e8e0" : "#fff",
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 2,
                  borderColor: selectedMethod === m.type ? "#8B1A1A" : "rgba(139,26,26,0.12)",
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
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: selectedMethod === m.type ? "rgba(139,26,26,0.1)" : "#f5f0eb",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={m.icon}
                    size={22}
                    color={selectedMethod === m.type ? "#8B1A1A" : "#888"}
                  />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: selectedMethod === m.type ? "700" : "500",
                    color: selectedMethod === m.type ? "#1a1a1a" : "#666",
                  }}
                >
                  {m.label}
                </Text>
                {selectedMethod === m.type && (
                  <Ionicons name="checkmark-circle" size={22} color="#8B1A1A" />
                )}
              </Pressable>
            ))}
          </View>

          {/* Continue button */}
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            })}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Continuar
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
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
            Pagamento processado com segurança pelo Asaas.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
