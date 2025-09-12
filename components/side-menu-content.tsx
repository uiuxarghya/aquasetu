import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import client from "@/lib/appwrite.config";
import { THEME } from "@/lib/theme";
import { useAuth } from "@/lib/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { Databases, Query } from "react-native-appwrite";

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? "";
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID ?? "users";

export default function SideMenuContent(props: any) {
  const { user, logout } = useAuth();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
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
            const list = await databases.listDocuments(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              [Query.equal("UserId", user.id)] as any
            );

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
      } catch (e) {
        console.error("Failed to load profile:", e);
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
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            Alert.alert("Logged out", "You have been logged out successfully.");
            router.replace("/");
          } catch (e) {
            console.error("Logout failed:", e);
            Alert.alert("Logout failed", String(e));
          }
        },
      },
    ]);
  };

  const menuSections = [
    {
      title: "Main",
      items: [
        { title: "Dashboard", icon: "home-outline", route: "/(drawer)/(tabs)" },
        {
          title: "Map View",
          icon: "map-outline",
          route: "/(drawer)/(tabs)/map",
        },
        {
          title: "Search",
          icon: "search-outline",
          route: "/(drawer)/(tabs)/search",
        },
        {
          title: "Bookmarks",
          icon: "bookmark-outline",
          route: "/(drawer)/(tabs)/bookmarks",
        },
      ],
    },
    {
      title: "Monitoring",
      items: [
        { title: "Stations", icon: "water-outline", route: "/stations" },
        { title: "Analytics", icon: "bar-chart-outline", route: "/analytics" },
        { title: "Alerts", icon: "notifications-outline", route: "/alerts" },
      ],
    },
    {
      title: "Account",
      items: [
        { title: "Settings", icon: "settings-outline", route: "/settings" },
        { title: "Help", icon: "help-circle-outline", route: "/help" },
        { title: "About", icon: "information-circle-outline", route: "/about" },
      ],
    },
  ];

  return (
    <DrawerContentScrollView {...props} className="border border-red-500">
      {/* Profile Section */}
      <View className="px-4 pb-4">
        {loading ? (
          <View className="items-center pb-6">
            <ActivityIndicator size="small" color={theme.primary} />
            <Text className="text-slate-500 mt-2 text-sm">Loading...</Text>
          </View>
        ) : user ? (
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-primary justify-center items-center mr-3 shadow-sm">
              <Text className="text-primary-foreground text-base font-bold">
                {(firstName[0] || "").toUpperCase()}
                {(lastName[0] || "").toUpperCase()}
              </Text>
            </View>

            {/* User Info */}
            <View className="flex-1">
              <Text className="text-lg text-primary font-space-mono font-bold mb-1">
                {firstName} {lastName}
              </Text>
              <Text className="text-sm text-muted-foreground mb-1">
                {email}
              </Text>

              {/* Account Status */}
              <View className="flex-row items-center">
                <Ionicons
                  name={verified ? "checkmark-circle" : "close-circle"}
                  size={14}
                  color={verified ? "#10b981" : "#dc2626"}
                />
                <Text
                  className={`text-xs font-medium ml-1 ${
                    verified ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {verified ? "Verified" : "Unverified"}
                </Text>
              </View>

              {/* Phone if available */}
              {phone && (
                <Text className="text-xs text-slate-500 mt-1">{phone}</Text>
              )}
            </View>
          </View>
        ) : (
          <View className="items-center py-6">
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={theme.mutedForeground}
            />
            <Text className="text-slate-500 mt-2 text-sm">Not logged in</Text>
          </View>
        )}
      </View>

      {/* Navigation Menu */}
      <View className="flex-1">
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-4">
            {/* Section Header */}
            <View className="px-4 py-2">
              <Text className="text-xs font-semibold text-primary uppercase tracking-wide">
                {section.title}
              </Text>
            </View>

            {/* Section Items */}
            <View className="px-2 py-2">
              {section.items.map((item, itemIndex) => (
                <Button
                  key={`${sectionIndex}-${itemIndex}`}
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 mb-1"
                  onPress={() => {
                    // Close drawer and navigate
                    props.navigation?.closeDrawer();
                    if (item.route) {
                      router.push(item.route as any);
                    }
                  }}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={theme.mutedForeground}
                    style={{ marginRight: 12, width: 18, height: 18 }}
                  />
                  <Text className="text-muted-foreground font-medium text-left flex-1">
                    {item.title}
                  </Text>
                </Button>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Logout Button */}
      {user && (
        <View>
          <View className="px-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3"
              onPress={() => {
                props.navigation?.closeDrawer();
                handleLogout();
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={theme.destructive}
                style={{ marginRight: 12, width: 18, height: 18 }}
              />
              <Text className="text-red-600 font-medium text-left flex-1">
                Logout
              </Text>
            </Button>
          </View>
        </View>
      )}
    </DrawerContentScrollView>
  );
}
