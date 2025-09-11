import { useAuth } from "@/lib/utils/auth";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-5xl leading-[50px] font-bold font-space-mono text-blue-700">
          AquaSetu
        </Text>
        <Text className="mt-5 text-lg text-gray-600">
          Checking authentication...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-5xl leading-[50px] font-bold font-space-mono text-blue-700">
        AquaSetu
      </Text>
      {isAuthenticated ? (
        <View className="mt-5">
          <Button
            title="Logout"
            onPress={async () => {
              await logout();
            }}
          />
          <View className="mb-5 mt-5">
            <Button
              title="Profile"
              onPress={() => {
                router.push("/(tabs)/profile");
              }}
            />
          </View>
        </View>
      ) : (
        <View>
          <View className="mb-5 mt-5">
            <Button
              title="Register"
              onPress={() => {
                router.push("/(auth)/register");
              }}
            />
          </View>
          <View className="mb-5 mt-5">
            <Button
              title="Login"
              onPress={() => {
                router.push("/(auth)/login");
              }}
            />
          </View>
        </View>
      )}
      <Text className="mt-3 text-center text-lg max-w-sm font-space-mono text-gray-700">
        Your companion for groundwater quality monitoring and management.
      </Text>
    </View>
  );
}
