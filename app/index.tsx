import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-5xl leading-[50px] font-bold font-space-mono text-blue-700">
        AquaSetu
      </Text>
      <Text className="mt-3 text-center text-lg max-w-sm font-space-mono text-gray-700">
        Your companion for groundwater quality monitoring and management.
      </Text>
    </View>
  );
}
