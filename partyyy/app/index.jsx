// Imports.
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { isLoggedIn } from "../services/auth";
import { homeStyles } from "../styles/home";

// Frontend.
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  // Check auth.
  const checkAuth = async () => {
    try {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        router.replace("/(tabs)/events");
      } else {
        router.replace("/login");
      }
    } catch (error) {
      router.replace("/login");
    }
  };

  return (
    <View style={homeStyles.container}>
      <ActivityIndicator size="large" color="#704a93ff" />
    </View>
  );
}