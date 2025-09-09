import client from "@/appWriteConfig";
import { getLoginStatus } from "@/utils/authUtils";
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
  let account: Account = new Account(client);
  const router = useRouter();
  
  async function LoginUser(email: string, password: string) {
    const loginstatus = await getLoginStatus(account);
    if(!loginstatus){
        try {
        await account.createEmailPasswordSession(email, password);
        Alert.alert("Login Successful", "Welcome!");
        setLoading(false);
        router.replace("/")
        } catch (e) {
        setLoading(false);
        console.error("error: " + e);
        Alert.alert("error: " + e);
        }
    }
    else{
        setLoading(false);
        console.error("already logged in")
        router.replace("/")
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
      try {
          const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
          const scheme = `${deepLink.protocol}//`;
  
          const loginUrl = await account.createOAuth2Token(
              OAuthProvider.Google,
              `${deepLink}`,
              `${deepLink}`,
          );
         
          const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);
          
          if (result.type !== "success" || !result.url) {
              Alert.alert("Error", "Google login cancelled or failed.");
              return;
          }
  
          const url = new URL(result.url);
          const secret = url.searchParams.get("secret");
          const userId = url.searchParams.get("userId");
  
          if (!secret || !userId) {
          Alert.alert("Error", "Failed to retrieve Google login credentials.");
          return;
          }
  
          console.log(userId)
          await account.createSession(userId, secret);
          Alert.alert("Success", "Google login successful!");
          router.replace("/");
      } catch (e) {
          console.error("Google Signup Error:", e);
          Alert.alert("Google Signup Error", String(e));
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
        <Text className="text-white text-lg font-bold">Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
