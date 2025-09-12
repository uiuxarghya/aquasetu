import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import client from "@/lib/appwrite.config";
import { deleteBookmark, getBookmarks } from "@/lib/utils/db";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Account } from "react-native-appwrite";

export default function BookmarksScreen() {
  const account = useMemo(() => new Account(client), []);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    const res = await getBookmarks(account);
    if (res.success) setBookmarks(res.bookmarks ?? []);
    setLoading(false);
  }, [account]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useFocusEffect(
    React.useCallback(() => {
      fetchBookmarks();
    }, [fetchBookmarks])
  );

  const handleDelete = async (station_code: string) => {
    // Optimistically remove from UI
    setBookmarks((prev) => prev.filter((b) => b.station_code !== station_code));
    await deleteBookmark(account, station_code);
    fetchBookmarks();
  };

  return (
    <View className="flex-1 bg-background mb-6">
      <View className="p-4">
        <Text className="text-xl text-left text-foreground font-bold mb-4">
          Bookmarks
        </Text>
        {loading ? (
          <View className="flex-1 justify-center items-center mt-10">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : bookmarks.length === 0 ? (
          <Text className="text-center mt-10 text-muted-foreground">
            No bookmarks found.
          </Text>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.station_code}
            contentContainerStyle={{ paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <View
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
                className="bg-card flex flex-row items-center justify-between p-4 border border-muted rounded-xl"
              >
                <View style={{ flexShrink: 1 }}>
                  <Text
                    className="font-semibold text-base text-foreground"
                    numberOfLines={1}
                  >
                    {item.station_name}
                  </Text>
                  <Text
                    className="text-xs text-muted-foreground mt-1"
                    numberOfLines={1}
                  >
                    {item.district}, {item.state}
                  </Text>
                  <Text
                    className="text-xs text-muted-foreground/60 mt-1"
                    numberOfLines={1}
                  >
                    Code: {item.station_code}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Button
                    onPress={() => handleDelete(item.station_code)}
                    variant="ghost"
                    size="icon"
                  >
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </Button>
                  <Button
                    onPress={() => router.push(`/station/${item.station_code}`)}
                    variant="ghost"
                    size="icon"
                  >
                    <Ionicons name="eye-outline" size={20} color="#3b82f6" />
                  </Button>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
