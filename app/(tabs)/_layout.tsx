import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

const TabIcon = ({
  iconName,
  title,
  focused,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  focused: boolean;
}) => {
  return (
    <View className="flex-1 items-center justify-center p-1 min-w-[100px] h-full min-h-12">
      <View
        className={cn(
          "flex-row items-center justify-center h-full px-2 rounded-xl",
          focused
            ? "bg-blue-500 shadow-sm shadow-blue-300/30"
            : "bg-transparent"
        )}
      >
        <View className="items-center justify-center w-8 h-8">
          <Ionicons
            name={iconName}
            size={20}
            color={focused ? "#ffffff" : "#9ca3af"}
          />
        </View>
        {focused && <Text className="text-xs font-semibold">{title}</Text>}
      </View>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderTopWidth: 0,
          height: 53,
          paddingTop: 7,
          paddingBottom: 6,
          paddingHorizontal: 5,
          marginHorizontal: 25,
          marginBottom: 15,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.05,
          shadowRadius: 15,
          elevation: 10,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home" title="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="map" title="Map" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="bookmark" title="Bookmarks" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="person" title="Profile" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="station/[id]"
        options={{
          tabBarItemStyle: { display: "none" }, // Hide the station tab
        }}
      />
    </Tabs>
  );
}
