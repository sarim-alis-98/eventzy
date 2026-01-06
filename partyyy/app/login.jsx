// Imports.
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { login } from "../services/auth";
import { loginStyles } from "../styles/login";

// Frontend.
export default function LoginScreen() {
  // States.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle login.
  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in all fields" });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Toast.show({ type: "success", text1: "Success", text2: "Login successful!" });
      router.replace("/(tabs)/events"); 
    } catch (error) {
      Toast.show({ type: "error", text1: "Login Failed", text2: error.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={loginStyles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={loginStyles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ImageBackground source={require("../assets/images/login.png")} style={loginStyles.backgroundImage} resizeMode="cover" imageStyle={loginStyles.imageStyle} >
          <ScrollView contentContainerStyle={loginStyles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={loginStyles.overlay}>
            {/* Welcome Text */}
            <View style={loginStyles.header}>
              <Text style={loginStyles.welcomeText}>Welcome Back!</Text>
              <Text style={loginStyles.subtitleText}>welcome back we missed you</Text>
            </View>

            {/* Email */}
            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.label}>Email</Text>
              <View style={loginStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#A0A0A0" style={loginStyles.inputIcon} />
                <TextInput style={loginStyles.input} placeholder="Email" placeholderTextColor="#A0A0A0" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
            </View>

            {/* Password */}
            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.label}>Password</Text>
              <View style={loginStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#A0A0A0" style={loginStyles.inputIcon} />
                <TextInput style={loginStyles.input} placeholder="Password" placeholderTextColor="#A0A0A0" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={loginStyles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#A0A0A0" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In */}
            <TouchableOpacity onPress={handleLogin} disabled={loading} style={loginStyles.buttonContainer}>
              <LinearGradient colors={["#9333EA", "#F97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={loginStyles.gradientButton}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={loginStyles.buttonText}>Sign in</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Link */}
            <View style={loginStyles.registerContainer}>
              <Text style={loginStyles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={loginStyles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
