import client from "@/lib/appwrite.config";
import { getAppScheme } from "@/lib/utils/auth";
import { ensureUserInDB } from "@/lib/utils/db";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Alert,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Account, ID, OAuthProvider } from "react-native-appwrite";

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const account = new Account(client);

  async function RegisterUser(
    email: string,
    password: string,
    fullName: string
  ) {
    try {
      const userId = ID.unique();

      await account.create({
        userId,
        email,
        password,
        name: fullName,
      });

      try {
        const [f, ...rest] = fullName.split(" ");
        const l = rest.join(" ") || "";
        await ensureUserInDB(userId, { first_name: f, last_name: l, email });
      } catch {
        // Silently handle database errors to avoid interrupting user flow
        console.warn("Database operation failed, but registration succeeded");
      }
      Alert.alert("Registration Successful", "You can now log in!");
      setLoading(false);
      router.replace("/(auth)/login");
    } catch {
      setLoading(false);
      Alert.alert(
        "Registration Error",
        "Failed to create account. Please try again."
      );
    }
  }

  const handleRegister = async () => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    await RegisterUser(email, password, fullName);
  };

  const handleGoogleSignup = async () => {
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
        console.warn("Database operation failed, but registration succeeded");
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
        Alert.alert("Google Registration Error", errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-3xl font-bold mb-8">Register</Text>
      <View className="w-full max-w-[350px] flex-row space-x-5  mb-4">
        <TextInput
          className="flex-1 h-12 border border-gray-300 rounded-lg mr-3 px-3 text-base"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          placeholderTextColor="#888"
        />
        <TextInput
          className="flex-1 h-12 border border-gray-300 rounded-lg px-3 text-base"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          placeholderTextColor="#888"
        />
      </View>
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
      <TextInput
        className="w-full max-w-[350px] h-12 border border-gray-300 rounded-lg px-3 mb-4 text-base"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        className="w-full max-w-[350px] h-12 bg-blue-600 rounded-lg justify-center items-center mt-2"
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-lg font-bold">
          {loading ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>
      <View className="mb-5 mt-5">
        <Button
          title="Continue with Google"
          color="#ea4335"
          onPress={handleGoogleSignup}
        />
      </View>
    </View>
  );
};

export default RegisterScreen;
