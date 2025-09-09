import client from "@/appWriteConfig";
import { getLoginStatus, logout } from "@/utils/authUtils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { Account } from "react-native-appwrite";
let account = new Account(client);

// init router
const router = useRouter();

export default function Index() {
  const [loginStatus, setLoginStatus] = useState(false);
  
  //check if logged in >.<
  useEffect(() => {
    const loginstatusfun = async () => {
      const loginstat = await getLoginStatus(account);
      setLoginStatus(loginstat);
    };

    loginstatusfun();
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-5xl leading-[50px] font-bold font-space-mono text-blue-700">
        AquaSetu
      </Text>
      {loginStatus ? (
        <View className="mt-5">
          <Button
            title="Logout"
            onPress={async () => {
              const res = await logout(account);
              if (res) {
                setLoginStatus(false);
              }
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
