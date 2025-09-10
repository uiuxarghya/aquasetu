import client from "@/lib/appwrite.config";
import { getLoginStatus, getAppScheme } from "@/lib/utils/auth";
import { ensureUserInDB } from "@/lib/utils/db";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Account, OAuthProvider } from "react-native-appwrite";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const account = new Account(client);
  const router = useRouter();

  async function LoginUser(email: string, password: string) {
    const loginstatus = await getLoginStatus(account);
    if (!loginstatus) {
      try {
        await account.createEmailPasswordSession({
          email,
          password,
        });
        Alert.alert("Login Successful", "Welcome!");
        setLoading(false);
        router.replace("/");
      } catch {
        setLoading(false);
        Alert.alert(
          "Login Error",
          "Invalid email or password. Please try again."
        );
      }
    } else {
      setLoading(false);
      router.replace("/");
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    await LoginUser(email, password);
  };

  const handleGoogleLogin = async () => {
    if (loading) return; // Prevent multiple clicks

    try {
      setLoading(true);

      // Add a small delay to prevent rapid successive calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      const redirectUri = makeRedirectUri({
        scheme: getAppScheme(),
        path: 'auth'
      });

      const loginUrl = await account.createOAuth2Token({
        provider: OAuthProvider.Google,
        success: redirectUri,
        failure: redirectUri,
      });

      const result = await WebBrowser.openAuthSessionAsync(
        `${loginUrl}`,
        redirectUri
      );

      if (result.type !== "success" || !result.url) {
        Alert.alert("Error", "Google login cancelled or failed.");
        setLoading(false);
        return;
      }

      const url = new URL(result.url);
      const secret = url.searchParams.get("secret");
      const userId = url.searchParams.get("userId");

      if (!secret || !userId) {
        Alert.alert("Error", "Failed to retrieve Google login credentials.");
        setLoading(false);
        return;
      }

      await account.createSession({
        userId,
        secret,
      });
      Alert.alert("Success", "Google login successful!");

      try {
        const useracc = await account.get();
        const username = (useracc.name as string) ?? "";
        const email = (useracc.email as string) ?? "";
        const phone = (useracc.phone as string) ?? "";
        const verified: boolean =
          (useracc.emailVerification as boolean) ?? false;

        const parts = username.split(" ").filter(Boolean);
        const first_name = parts.length > 0 ? parts[0] : "";
        const last_name = parts.length > 1 ? parts.slice(1).join(" ") : "";
        await ensureUserInDB(userId, {
          first_name,
          last_name,
          email,
          phone,
          verified,
        });
      } catch {
        // Silently handle database errors to avoid interrupting user flow
        console.warn("Database operation failed, but login succeeded");
      }
      router.replace("/");
    } catch (e) {
      const errorMessage = String(e);

      // Handle specific update-related errors
      if (
        errorMessage.includes("Failed to download remote update") ||
        errorMessage.includes("java.io.IOException")
      ) {
        Alert.alert(
          "Connection Error",
          "Please check your internet connection and try again. If the problem persists, try restarting the app."
        );
      } else if (errorMessage.includes("Rate limit") || errorMessage.includes("rate limit")) {
        Alert.alert(
          "Too Many Requests",
          "Please wait a moment before trying again."
        );
      } else {
        Alert.alert("Google Login Error", errorMessage);
      }
      setLoading(false);
    }
  };
  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-3xl font-bold mb-8">Login</Text>
      <TextInput
        className="w-full max-w-[350px] h-12 border border-gray-300 rounded-lg px-3 mb-4 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <TextInput
        className="w-full max-w-[350px] h-12 border border-gray-300 rounded-lg px-3 mb-4 text-base"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        className="w-full max-w-[350px] h-12 bg-blue-600 rounded-lg justify-center items-center mt-2"
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-lg font-bold">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full max-w-[350px] h-12 bg-red-600 rounded-lg justify-center items-center mt-4"
        onPress={handleGoogleLogin}
        disabled={loading}
      >
        <Text className="text-white text-lg font-bold">
          Continue with Google
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
