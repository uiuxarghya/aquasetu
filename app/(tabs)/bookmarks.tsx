import { Text } from "@/components/ui/text";
import client from "@/lib/appwrite.config";
import { deleteBookmark, getBookmarks } from "@/lib/utils/db";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { Account } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarksScreen() {
  const account: Account = new Account(client);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    const res = await getBookmarks(account);
    if (res.success) setBookmarks(res.bookmarks ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchBookmarks();
    }, [])
  );

  const handleDelete = async (station_code: string) => {
    await deleteBookmark(account, station_code);
    fetchBookmarks();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Text className="text-2xl font-bold text-center my-6 text-blue-700">Bookmarks</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : bookmarks.length === 0 ? (
        <Text className="text-center mt-10 text-gray-500">No bookmarks found.</Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}>
              <View style={{ flexShrink: 1 }}>
                <Text className="font-semibold text-base text-gray-900" numberOfLines={1}>{item.station_name}</Text>
                <Text className="text-xs text-gray-600 mt-1" numberOfLines={1}>
                  {item.district}, {item.state}
                </Text>
                <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
                  Code: {item.station_code}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.station_code)}
                style={{ backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, marginLeft: 12 }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-medium">Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
