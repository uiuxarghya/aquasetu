import client from "@/lib/appwrite.config";
import { useAuth } from "@/lib/utils/auth";
import { ensureUserInDB } from "@/lib/utils/db";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";
import { Account } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // If we have OAuth parameters, handle them
        if (params.secret && params.userId) {
          const account = new Account(client);

          // Check if user is already logged in to prevent duplicate sessions
          try {
            await account.get();
            // User is already logged in, just redirect to home
            router.replace("/");
            return;
          } catch {
            // User is not logged in, proceed with session creation
          }

          await account.createSession({
            userId: params.userId as string,
            secret: params.secret as string,
          });

          // Wait a moment for the session to be fully established
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Handle database operations after successful session creation
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
            await ensureUserInDB(params.userId as string, {
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

          // Show success message and redirect
          Alert.alert("Success", "Google login successful!");
          await refreshAuth(); // Refresh auth state to update all components
          router.replace("/");
        } else {
          // No OAuth params, redirect to login
          router.replace("/(auth)/login");
        }
      } catch {
        // Silently handle errors and redirect to login
        router.replace("/(auth)/login");
      }
    };

    handleAuthCallback();
  }, [params, router, refreshAuth]);

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
        </View>

        {/* Loading Indicator */}
        <View className="items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-lg text-foreground">
            Processing authentication...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
