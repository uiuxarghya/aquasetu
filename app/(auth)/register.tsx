import client from "@/appWriteConfig";
import { ensureUserInDB } from "@/utils/dbUtils";
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
import { Account, ID, OAuthProvider } from "react-native-appwrite";

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  let account: Account = new Account(client);

  async function RegisterUser(
    email: string,
    password: string,
    fullName: string
  ) {
    try {
      const userId = ID.unique();

      await account.create({
        userId,
        email,
        password,
        name: fullName,
      });

      try {
        const [f, ...rest] = fullName.split(" ");
        const l = rest.join(" ") || "";
        await ensureUserInDB(userId, { first_name: f, last_name: l, email });
      } catch (dbErr) {
        console.error("Failed to ensure user in DB:", dbErr);
      }
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
    await RegisterUser(email, password, fullName);
  };

  const handleGoogleSignup = async () => {
    try {
      const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
      const scheme = `${deepLink.protocol}//`;

      const loginUrl = await account.createOAuth2Token(
        OAuthProvider.Google,
        `${deepLink}`,
        `${deepLink}`
      );

      const result = await WebBrowser.openAuthSessionAsync(
        `${loginUrl}`,
        scheme
      );

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

      await account.createSession(userId, secret);
      Alert.alert("Success", "Google login successful!");

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
        await ensureUserInDB(userId, {
          first_name,
          last_name,
          email,
          phone,
          verified,
        });
      } catch (dbErr) {
        console.error("Failed to ensure Google user in DB:", dbErr);
      }
      router.replace("/");
    } catch (e) {
      console.error("Google Signup Error:", e);
      Alert.alert("Google Signup Error", String(e));
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
