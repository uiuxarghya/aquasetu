import client from "@/lib/appwrite.config";
import { getAppScheme, useAuth } from "@/lib/utils/auth";
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
import { Account, OAuthProvider } from "react-native-appwrite";

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastGoogleSignupAttempt, setLastGoogleSignupAttempt] = useState(0);
  const { register } = useAuth();
  const router = useRouter();
  const account = new Account(client);

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

    const result = await register(email, password, fullName);

    if (result.success) {
      Alert.alert("Success", "Registration successful! Welcome!");
      router.replace("/");
    } else {
      Alert.alert(
        "Registration Error",
        result.error || "Registration failed. Please try again."
      );
    }

    setLoading(false);
  };

  const handleGoogleSignup = async (retryCount = 0) => {
    if (loading) return; // Prevent multiple clicks

    const now = Date.now();
    const timeSinceLastAttempt = now - lastGoogleSignupAttempt;

    // Prevent requests within 3 seconds of each other
    if (timeSinceLastAttempt < 3000 && retryCount === 0) {
      Alert.alert("Please Wait", "Please wait a moment before trying again.");
      return;
    }

    try {
      setLoading(true);
      setLastGoogleSignupAttempt(now);

      // Add a delay to prevent rapid successive calls (increased from 1000ms to 2000ms)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const redirectUri = makeRedirectUri({
        scheme: getAppScheme(),
        path: "auth",
      });

      // Retry OAuth token creation with exponential backoff
      let loginUrl;
      try {
        loginUrl = await account.createOAuth2Token({
          provider: OAuthProvider.Google,
          success: redirectUri,
          failure: redirectUri,
        });
      } catch (oauthError) {
        const errorMessage = String(oauthError);
        if (
          (errorMessage.includes("Rate limit") ||
            errorMessage.includes("rate limit") ||
            errorMessage.includes("Too Many Requests")) &&
          retryCount < 3
        ) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          Alert.alert(
            "Rate Limited",
            `Retrying OAuth in ${delay / 1000} seconds...`
          );
          setTimeout(() => handleGoogleSignup(retryCount + 1), delay);
          return;
        } else {
          throw oauthError; // Re-throw if not a rate limit or max retries reached
        }
      }

      const result = await WebBrowser.openAuthSessionAsync(
        `${loginUrl}`,
        redirectUri
      );

      if (result.type !== "success" || !result.url) {
        Alert.alert("Error", "Google login cancelled or failed.");
        setLoading(false);
        return;
      }

      // OAuth callback will handle session creation and user feedback
      // Just show a brief message and let the callback handle the rest
      setLoading(false);
      // Don't redirect here - let the OAuth callback handle navigation
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
          onPress={() => handleGoogleSignup()}
        />
      </View>
    </View>
  );
};

export default RegisterScreen;
