import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text, TextInput } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type InstallmentType = "DEBIT" | "CREDIT";

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CardDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data: string }>();
  const insets = useSafeAreaInsets();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [holderName, setHolderName] = useState("");
  const [installmentType, setInstallmentType] =
    useState<InstallmentType>("DEBIT");

  const validate = (): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 16) {
      Alert.alert("Cartão inválido", "Informe um número de cartão válido.");
      return false;
    }
    const expiryDigits = expiry.replace(/\D/g, "");
    if (expiryDigits.length !== 4) {
      Alert.alert("Validade inválida", "Informe a validade no formato MM/AA.");
      return false;
    }
    const month = parseInt(expiryDigits.slice(0, 2), 10);
    if (month < 1 || month > 12) {
      Alert.alert("Mês inválido", "O mês deve estar entre 01 e 12.");
      return false;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert("CVV inválido", "Informe o CVV do cartão (3 ou 4 dígitos).");
      return false;
    }
    if (!holderName.trim()) {
      Alert.alert("Campo obrigatório", "Informe o nome impresso no cartão.");
      return false;
    }
    return true;
  };

  const handlePay = () => {
    if (!validate()) return;

    const expiryDigits = expiry.replace(/\D/g, "");
    const expiryMonth = expiryDigits.slice(0, 2);
    const expiryYear = `20${expiryDigits.slice(2, 4)}`;

    const cardData = {
      holderName: holderName.trim(),
      number: cardNumber.replace(/\D/g, ""),
      expiryMonth,
      expiryYear,
      ccv: cvv,
    };

    const payload = {
      customerData: JSON.parse(decodeURIComponent(params.data ?? "{}")),
      creditCard: cardData,
      installmentType,
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    router.push(`/checkout/processing?data=${encoded}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 32, paddingBottom: 48, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Ionicons name="card" size={44} color="#fff" style={{ marginBottom: 8 }} />
          <Text
            style={{
              color: "#fff",
              fontSize: 30,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Dados do Cartão
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Preencha os dados para pagamento
          </Text>
        </LinearGradient>

        {/* Card form */}
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
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 }}>
                Número do cartão
              </Text>
              <View
                style={{
                  backgroundColor: "#f5f0eb",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e0d8d0",
                }}
              >
                <TextInput
                  style={{ fontSize: 15, color: "#1a1a1a", padding: 14 }}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#999"
                  value={cardNumber}
                  onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, marginBottom: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 }}>
                  Validade
                </Text>
                <View
                  style={{
                    backgroundColor: "#f5f0eb",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#e0d8d0",
                  }}
                >
                  <TextInput
                    style={{ fontSize: 15, color: "#1a1a1a", padding: 14 }}
                    placeholder="MM/AA"
                    placeholderTextColor="#999"
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>
              <View style={{ flex: 1, marginBottom: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 }}>
                  CVV
                </Text>
                <View
                  style={{
                    backgroundColor: "#f5f0eb",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#e0d8d0",
                  }}
                >
                  <TextInput
                    style={{ fontSize: 15, color: "#1a1a1a", padding: 14 }}
                    placeholder="000"
                    placeholderTextColor="#999"
                    value={cvv}
                    onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 }}>
                Nome no cartão
              </Text>
              <View
                style={{
                  backgroundColor: "#f5f0eb",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e0d8d0",
                }}
              >
                <TextInput
                  style={{ fontSize: 15, color: "#1a1a1a", padding: 14 }}
                  placeholder="Como impresso no cartão"
                  placeholderTextColor="#999"
                  value={holderName}
                  onChangeText={setHolderName}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Payment type */}
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
            Tipo de pagamento
          </Text>

          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => setInstallmentType("DEBIT")}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#f0e8e0" : "#fff",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 2,
                borderColor: installmentType === "DEBIT" ? "#8B1A1A" : "rgba(139,26,26,0.12)",
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
                  backgroundColor: installmentType === "DEBIT" ? "rgba(139,26,26,0.1)" : "#f5f0eb",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="wallet-outline"
                  size={22}
                  color={installmentType === "DEBIT" ? "#8B1A1A" : "#888"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: installmentType === "DEBIT" ? "700" : "500",
                    color: installmentType === "DEBIT" ? "#1a1a1a" : "#666",
                  }}
                >
                  À vista
                </Text>
                <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  Débito ou crédito à vista
                </Text>
              </View>
              {installmentType === "DEBIT" && (
                <Ionicons name="checkmark-circle" size={22} color="#8B1A1A" />
              )}
            </Pressable>

            <Pressable
              onPress={() => setInstallmentType("CREDIT")}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#f0e8e0" : "#fff",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 2,
                borderColor: installmentType === "CREDIT" ? "#8B1A1A" : "rgba(139,26,26,0.12)",
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
                  backgroundColor: installmentType === "CREDIT" ? "rgba(139,26,26,0.1)" : "#f5f0eb",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={installmentType === "CREDIT" ? "#8B1A1A" : "#888"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: installmentType === "CREDIT" ? "700" : "500",
                    color: installmentType === "CREDIT" ? "#1a1a1a" : "#666",
                  }}
                >
                  Crédito
                </Text>
                <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  Parcelamento no cartão
                </Text>
              </View>
              {installmentType === "CREDIT" && (
                <Ionicons name="checkmark-circle" size={22} color="#8B1A1A" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Total */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: "rgba(139,26,26,0.12)",
            }}
          >
            <Text style={{ fontSize: 15, color: "#666" }}>Total</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={{ fontSize: 14, color: "#1a1a1a" }}>R$ </Text>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#1a1a1a" }}>9,90</Text>
              <Text style={{ fontSize: 12, color: "#888" }}>/mês</Text>
            </View>
          </View>
        </View>

        {/* Pay button */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Pressable
            onPress={handlePay}
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
            <Ionicons name="lock-closed" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Pagar R$ 9,90
            </Text>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 12,
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={14} color="#888" />
            <Text style={{ fontSize: 13, color: "#888" }}>
              Pagamento seguro processado pelo Asaas
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
