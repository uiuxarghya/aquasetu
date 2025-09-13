import { Text } from "@/components/ui/text";
import { useAlerts } from "@/lib/alerts-context";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { View } from "react-native";

const TabIcon = ({
  iconName,
  title,
  focused,
  badgeCount,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  focused: boolean;
  badgeCount?: number;
}) => {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  return (
    <View className="flex-1 items-center justify-center p-1 min-w-[100px] h-full min-h-14">
      <View className="flex-col items-center justify-center h-full px-2 py-2 rounded-xl relative">
        <View className="items-center justify-center w-8 h-8 relative">
          <Ionicons
            name={
              focused
                ? (iconName.replace(
                    "-outline",
                    ""
                  ) as keyof typeof Ionicons.glyphMap)
                : iconName
            }
            size={20}
            color={focused ? theme.primary : theme.mutedForeground}
          />
          {badgeCount && badgeCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              <Text className="text-white text-[10px] font-bold leading-none">
                {badgeCount > 99 ? "99+" : badgeCount}
              </Text>
            </View>
          )}
        </View>

        <Text
          className={cn(
            "text-[8px] font-semibold",
            focused ? "text-primary" : "text-muted-foreground"
          )}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const { alertCount } = useAlerts();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        headerPressOpacity: 0,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0,
          height: 60,
          paddingHorizontal: 10,
          paddingTop: 10,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 10,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
          shadowColor:
            colorScheme === "dark"
              ? "rgba(0, 0, 0, 0.3)"
              : "rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home-outline" title="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="map-outline" title="Map" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconName="search-outline"
              title="Search"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconName="bookmark-outline"
              title="Bookmarks"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconName="notifications-outline"
              title="Alerts"
              focused={focused}
              badgeCount={alertCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarItemStyle: { display: "none" }, // Hide the station tab
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarItemStyle: { display: "none" }, // Hide the station tab
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
