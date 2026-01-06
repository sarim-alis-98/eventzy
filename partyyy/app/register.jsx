// Imports.
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { register } from "../services/auth";
import { registerStyles } from "../styles/register";

// Frontend.
export default function RegisterScreen() {
  // States.
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle register.
  const handleRegister = async () => {
    if (!username || !email || !password) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in all fields" });
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      Toast.show({ type: "success", text1: "Success", text2: "Account created successfully!" });
      router.replace("/(tabs)/events");
    } catch (error) {
      Toast.show({ type: "error", text1: "Registration Failed", text2: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={registerStyles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={registerStyles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ImageBackground source={require("../assets/images/login.png")} style={registerStyles.backgroundImage} resizeMode="cover" imageStyle={registerStyles.imageStyle}>
          <ScrollView contentContainerStyle={registerStyles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={registerStyles.overlay}>
              {/* Welcome Text */}
              <View style={registerStyles.header}>
                <Text style={registerStyles.welcomeText}>Create Account!</Text>
                <Text style={registerStyles.subtitleText}>join us and start your journey</Text>
              </View>

              {/* Username */}
              <View style={registerStyles.inputContainer}>
                <Text style={registerStyles.label}>Username</Text>
                <View style={registerStyles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#A0A0A0" style={registerStyles.inputIcon} />
                  <TextInput style={registerStyles.input} placeholder="Username" placeholderTextColor="#A0A0A0" value={username} onChangeText={setUsername} autoCapitalize="none" />
                </View>
              </View>

              {/* Email */}
              <View style={registerStyles.inputContainer}>
                <Text style={registerStyles.label}>Email</Text>
                <View style={registerStyles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#A0A0A0" style={registerStyles.inputIcon} />
                  <TextInput style={registerStyles.input} placeholder="Email" placeholderTextColor="#A0A0A0" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                </View>
              </View>

              {/* Password */}
              <View style={registerStyles.inputContainer}>
                <Text style={registerStyles.label}>Password</Text>
                <View style={registerStyles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#A0A0A0" style={registerStyles.inputIcon} />
                  <TextInput style={registerStyles.input} placeholder="Password" placeholderTextColor="#A0A0A0" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={registerStyles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#A0A0A0" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register */}
              <TouchableOpacity onPress={handleRegister} disabled={loading} style={registerStyles.buttonContainer}>
                <LinearGradient colors={["#9333EA", "#F97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={registerStyles.gradientButton}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={registerStyles.buttonText}>Sign up</Text>}
                </LinearGradient>
              </TouchableOpacity>

              {/* Link */}
              <View style={registerStyles.loginContainer}>
                <Text style={registerStyles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={registerStyles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

