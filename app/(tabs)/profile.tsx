import client from "@/appWriteConfig";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { logout } from "@/utils/authUtils";

import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Account, Databases, Query } from "react-native-appwrite";

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? "";
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID ?? "users";

const router = useRouter();

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const acc = await account.get();
        if (!mounted) return;
        setUserId(acc.$id || "");
        setEmail((acc.email as string) ?? "");

        const acctName = (acc.name as string) ?? "";
        const parts = acctName.split(" ").filter(Boolean);
        setFirstName(parts[0] ?? "");
        setLastName(parts.length > 1 ? parts.slice(1).join(" ") : "");

        if (DATABASE_ID) {
          try {
            const list = await databases.listDocuments(DATABASE_ID, "users", [
              Query.equal("UserId", acc.$id as string),
            ] as any);

            const doc = (list.documents || [])[0];
            if (doc) {
              setFirstName(doc.first_name ?? firstName);
              setLastName(doc.last_name ?? lastName);
              setPhone(doc.phone ?? "");
              setVerified(Boolean(doc.verified));
            }
          } catch (dberr) {
            console.warn("Failed to load profile document:", dberr);
          }
        }
        setError(null);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!userId) return Alert.alert("Not authenticated", "Please login first.");
    setSaving(true);
    try {
      if (DATABASE_ID) {
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          { first_name: firstName, last_name: lastName, phone }
        );
        Alert.alert("Saved", "Profile updated.");
      } else {
        Alert.alert("Missing DB", "Database ID is not configured.");
      }
    } catch (e) {
      console.error("Failed to save profile:", e);
      Alert.alert("Save failed", String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(account);
      Alert.alert("Logged out", "You have been logged out.");
      router.replace("/");
    } catch (e) {
      console.error("Logout failed:", e);
      Alert.alert("Logout failed", String(e));
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );

  return (
    <View className="flex p-6 bg-gray-50 w-[100%] h-[100%] items-center justify-center">
      <View className="max-w-[700px] w-full mx-auto bg-white rounded-lg p-6 shadow">
        <View className="flex-row items-center space-x-4 mb-4">
          <View className="w-16 h-16 rounded-full bg-blue-600 justify-center items-center mr-3">
            <Text className="text-white text-xl font-bold">
              {(firstName[0] || "").toUpperCase()}
              {(lastName[0] || "").toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="text-lg font-semibold">
              {firstName} {lastName}
            </Text>
            <Text className="text-sm text-gray-500">{email}</Text>
          </View>
        </View>

        {error ? <Text className="text-red-600 mb-2">{error}</Text> : null}

        <Text className="text-sm text-gray-600 mt-2">Name</Text>
        <View className="w-full flex-row space-x-2 mt-2">
          <Text className="flex-1 border-gray-50 rounded-lg py-1">
            {firstName}
          </Text>
          <Text className="flex-1 border-gray-50 rounded-lg py-1">
            {lastName}
          </Text>
        </View>

        <Text className="text-sm text-gray-600 mt-4">Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          className="border rounded-lg px-3 py-2 mt-2"
          keyboardType="phone-pad"
        />

        <Text className="mt-3 text-sm">Verified: {verified ? "✅" : "❌"}</Text>

        <View className="flex-row space-x-3 mt-6">
          <TouchableOpacity
            className="flex-1 border rounded-lg py-3 items-center"
            onPress={handleLogout}
          >
            <Text className="text-gray-700 font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
