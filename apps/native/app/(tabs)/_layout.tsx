import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router";
import { Spinner, useThemeColor } from "heroui-native";
import { useAuth } from "@clerk/clerk-expo";
import { View } from "react-native";

import { useUserRole } from "@/hooks/use-user-role";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useUserRole();
  const foreground = useThemeColor("foreground");
  const background = useThemeColor("background");

  if (!isLoaded) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: background }}
      >
        <Spinner size="lg" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const isDirector = role === "director" || role === "admin";

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: background },
        headerTintColor: foreground,
        headerTitleStyle: { fontWeight: "600", color: foreground },
        tabBarStyle: { backgroundColor: background, borderTopColor: background },
        tabBarActiveTintColor: foreground,
        headerRight: () => <ThemeToggle />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isDirector ? "Perguntas" : "Escrever",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isDirector ? "list-outline" : "create-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: isDirector ? "Respondidas" : "Minhas Perguntas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isDirector ? "checkmark-done-outline" : "document-text-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
