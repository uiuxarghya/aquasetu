import client from "@/appWriteConfig";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  let account: Account = new Account(client);

  async function RegisterUser(email: string, password: string, name: string) {
    try {
      await account.create({
        userId: ID.unique(),
        email,
        password,
        name,
      });
      Alert.alert("Registration Successful", "You can now log in!");
      setLoading(false);
      router.replace("/(auth)/login");
    } catch (e) {
      setLoading(false);
      console.error("error: " + e);
      Alert.alert("error: " + e);
    }
  }

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    await RegisterUser(email, password, name);
  };

  const handleGoogleSignup = async () => {
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

        //console.log(userId)
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
      <Text className="text-3xl font-bold mb-8">Register</Text>
      <TextInput
        className="w-full max-w-[350px] h-12 border border-gray-300 rounded-lg px-3 mb-4 text-base"
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholderTextColor="#888"
      />
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
          onPress={() => {
            try {
              handleGoogleSignup();
            } catch (e) {
              alert("Google Auth Error: " + e);
            }
          }}
        />
      </View>
    </View>
  );
};

export default RegisterScreen;
