import client from "@/lib/appwrite.config";
import { useAuth } from "@/lib/utils/auth";
import { ensureUserInDB } from "@/lib/utils/db";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { Account } from "react-native-appwrite";

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
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0000ff" />
      <Text className="mt-4 text-lg">Processing authentication...</Text>
    </View>
  );
}
