import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import client from "@/lib/appwrite.config";
import { getAppScheme, useAuth } from "@/lib/utils/auth";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Alert, Image, View } from "react-native";
import { Account, OAuthProvider } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastGoogleLoginAttempt, setLastGoogleLoginAttempt] = useState(0);
  const { login } = useAuth();
  const account = new Account(client);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      Alert.alert("Login Successful", "Welcome!");
      router.replace("/");
    } else {
      Alert.alert(
        "Login Error",
        result.error || "Invalid email or password. Please try again.",
      );
    }

    setLoading(false);
  };

  const handleGoogleLogin = async (retryCount = 0) => {
    if (loading) return; // Prevent multiple clicks

    const now = Date.now();
    const timeSinceLastAttempt = now - lastGoogleLoginAttempt;

    // Prevent requests within 3 seconds of each other
    if (timeSinceLastAttempt < 3000 && retryCount === 0) {
      Alert.alert("Please Wait", "Please wait a moment before trying again.");
      return;
    }

    try {
      setLoading(true);
      setLastGoogleLoginAttempt(now);

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
            `Retrying OAuth in ${delay / 1000} seconds...`,
          );
          setTimeout(() => handleGoogleLogin(retryCount + 1), delay);
          return;
        } else {
          throw oauthError; // Re-throw if not a rate limit or max retries reached
        }
      }

      const result = await WebBrowser.openAuthSessionAsync(
        `${loginUrl}`,
        redirectUri,
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
          "Please check your internet connection and try again. If the problem persists, try restarting the app.",
        );
      } else {
        Alert.alert("Google Login Error", errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-6">
        {/* Header with Logo */}
        <View className="items-center mb-6">
          <View className="rounded-3xl shadow-2xl mb-6">
            <Image
              source={require("../../assets/images/icon.png")}
              className="w-20 h-20 rounded-2xl"
              resizeMode="contain"
            />
          </View>
          <Text className="text-4xl font-bold font-space-mono text-foreground mb-3">
            AquaSetu
          </Text>
          <Text className="text-center text-muted-foreground text-base max-w-sm leading-6">
            Welcome back! Please sign in to continue monitoring groundwater
            quality
          </Text>
        </View>

        {/* Login Form */}
        <Card className="mx-2 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-2xl font-bold">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-0 pb-8">
            <View className="space-y-3">
              <Label nativeID="email" className="font-semibold text-base">
                Email Address
              </Label>
              <Input
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                aria-labelledby="email"
                className="h-14 border-2 rounded-2xl px-4 text-base"
              />
            </View>

            <View className="space-y-3">
              <Label nativeID="password" className="font-semibold text-base">
                Password
              </Label>
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                aria-labelledby="password"
                className="h-14 border-2 rounded-2xl px-4 text-base"
              />
            </View>

            <Button
              onPress={handleLogin}
              disabled={loading}
              className="w-full h-12 rounded-xl mt-3 shadow-lg"
            >
              <Text className="text-primary-foreground font-bold text-lg">
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </Button>

            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px" />
              <Text className="px-4 text-sm font-medium rounded-full py-1 text-muted-foreground">
                or continue with
              </Text>
              <View className="flex-1 h-px" />
            </View>

            <Button
              variant="outline"
              onPress={() => handleGoogleLogin()}
              disabled={loading}
              className="w-full h-14 border-2 rounded-2xl shadow-md"
            >
              <Image
                source={{
                  uri: "https://img.icons8.com/?size=100&id=17949&format=png&color=000000",
                }}
                className="w-6 h-6 mr-1"
                resizeMode="contain"
              />
              <Text className="font-semibold text-lg">
                Continue with Google
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <View className="items-center mt-4">
          <Text className="text-muted-foreground text-base">
            Don&apos;t have an account?{" "}
            <Text
              className="text-primary font-bold text-lg"
              onPress={() => router.navigate("/(auth)/register")}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
