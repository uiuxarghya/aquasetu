import { Text } from "@/components/ui/text";
import { addBookmark } from "@/lib/utils/db";
import { Button } from "@react-navigation/elements";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account } from "react-native-appwrite";
import client from "@/lib/appwrite.config";
export default function StationDetailsScreen() {
  const account =new  Account(client);
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView>
      <Text>Station Details: {id}</Text>
      <Button onPressIn={()=>{
        addBookmark(account , String(id));
      }}>add</Button>
    </SafeAreaView>
  );
}
