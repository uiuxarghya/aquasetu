import { useAuth } from "@/lib/utils/auth";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Databases, Query } from "react-native-appwrite";
import client from "@/lib/appwrite.config";

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? "";
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID ?? "users";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;

      try {
        setLoading(true);

        // Use user data from useAuth hook
        setEmail(user.email);

        // Parse name from useAuth hook
        const parts = user.name.split(" ").filter(Boolean);
        setFirstName(parts[0] ?? "");
        setLastName(parts.length > 1 ? parts.slice(1).join(" ") : "");

        // Load additional profile data from database
        if (DATABASE_ID) {
          try {
            const list = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
              Query.equal("UserId", user.id),
            ] as any);

            const doc = (list.documents || [])[0];
            if (doc && mounted) {
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
        if (mounted) setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user, firstName, lastName]);

  const handleLogout = async () => {
    try {
      await logout();
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
        <Text className="border rounded-lg px-3 py-2 mt-2 bg-gray-50">
          {phone || "Not provided"}
        </Text>

        <Text className="text-sm text-gray-600 mt-4">Account Status</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-sm mr-2">Email Verified:</Text>
          <Text className={`text-sm font-medium ${verified ? 'text-green-600' : 'text-red-600'}`}>
            {verified ? "✅ Verified" : "❌ Not Verified"}
          </Text>
        </View>

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
