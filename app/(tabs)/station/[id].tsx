import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StationDetailsScreen() {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView>
      <Text>Station Details: {id}</Text>
    </SafeAreaView>
  );
}
