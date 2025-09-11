import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/utils/auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, ScrollView, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-50 px-6">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        />
        <Text className="text-4xl leading-[40px] font-bold font-space-mono text-blue-700 text-center">
          AquaSetu
        </Text>
        <Text className="mt-3 text-lg text-gray-600 text-center">
          Checking authentication...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center h-screen-safe justify-center">
      <ScrollView
        className="bg-white p-8 w-full"
        contentContainerClassName="items-center"
      >
        <Text className="text-4xl leading-[40px] font-bold font-space-mono text-blue-700 text-center">
          AquaSetu
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500 max-w-xs">
          Your companion for groundwater quality monitoring and management.
        </Text>
        {isAuthenticated ? (
          <View className="mt-6 w-full">
            <Text className="text-xl font-bold text-center mb-6 text-blue-800">
              Welcome to AquaSetu Dashboard
            </Text>
            <View className="bg-blue-100 p-6 rounded-2xl mb-4 border border-blue-200 shadow-lg">
              <Text className="text-lg font-semibold text-blue-900 mb-2">
                Monitoring Points
              </Text>
              <Text className="text-4xl font-bold text-blue-700">5</Text>
              <Text className="text-sm text-blue-600 mt-1">
                Active locations tracking water quality
              </Text>
            </View>
            <View className="bg-green-100 p-6 rounded-2xl mb-4 border border-green-200 shadow-lg">
              <Text className="text-lg font-semibold text-green-900 mb-2">
                Recent Readings
              </Text>
              <Text className="text-4xl font-bold text-green-700">12</Text>
              <Text className="text-sm text-green-600 mt-1">
                Data points collected in last 24 hours
              </Text>
            </View>
            <View className="bg-yellow-100 p-6 rounded-2xl mb-6 border border-yellow-200 shadow-lg">
              <Text className="text-lg font-semibold text-yellow-900 mb-2">
                Alerts
              </Text>
              <Text className="text-4xl font-bold text-yellow-700">2</Text>
              <Text className="text-sm text-yellow-600 mt-1">
                Issues requiring immediate attention
              </Text>
            </View>
            <Button
              onPress={() => router.push("/(tabs)/profile")}
              className="mb-3 bg-blue-600 rounded-xl shadow-md w-full"
              size="lg"
            >
              <Text className="text-white font-semibold">View Profile</Text>
            </Button>
            <Button
              onPress={async () => {
                await logout();
              }}
              className="bg-red-600 rounded-xl shadow-md w-full"
              size="lg"
            >
              <Text className="text-white font-semibold">Logout</Text>
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
