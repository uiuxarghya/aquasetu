import client from "@/lib/appwrite.config";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Account } from "react-native-appwrite";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // If we have OAuth parameters, handle them
        if (params.secret && params.userId) {
          const account = new Account(client);
          await account.createSession({
            userId: params.userId as string,
            secret: params.secret as string,
          });
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
  }, [params, router]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0000ff" />
      <Text className="mt-4 text-lg">Processing authentication...</Text>
    </View>
  );
}
