import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Spinner, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { useCurrentUser } from "@/hooks/use-current-user";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isDirector } = useCurrentUser();
  const foreground = useThemeColor("foreground");
  const background = useThemeColor("background");

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: background }}>
        <Spinner size="lg" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: background },
        headerTintColor: foreground,
        headerTitleStyle: { fontWeight: "600", color: foreground },
        tabBarStyle: { backgroundColor: background, borderTopColor: background },
        tabBarActiveTintColor: "#8B1A1A",
        tabBarInactiveTintColor: "#999",
        headerRight: () => <ThemeToggle />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: "Minhas Perguntas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="available"
        options={{
          title: "Disponíveis",
          href: isDirector ? "/available" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
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
