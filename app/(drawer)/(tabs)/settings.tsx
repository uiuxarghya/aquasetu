import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-12">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="bg-muted p-4 rounded-full mb-4">
            <Ionicons name="settings" size={32} color={theme.primary} />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2">
            Settings
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            Manage your preferences and account settings
          </Text>
        </View>

        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex-row items-center min-h-[24px]">
              <Ionicons name="person" size={20} color={theme.primary} />
              <Text className="ml-2">Profile</Text>
            </CardTitle>
            <CardDescription>
              Your profile information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onPress={openDrawer}
            >
              <Ionicons name="person" size={16} color={theme.primary} />
              <Text className="ml-2 text-primary">View Profile Details</Text>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onPress={openDrawer}
            >
              <Ionicons name="pencil" size={16} color={theme.primary} />
              <Text className="ml-2 text-primary">Edit Profile</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex-row items-center min-h-[24px]">
              <Ionicons name="settings" size={20} color={theme.primary} />
              <Text className="ml-2">Preferences</Text>
            </CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Notifications Toggle */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3 overflow-hidden">
                  <Ionicons
                    name="notifications"
                    size={18}
                    color={theme.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">
                    Push Notifications
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Receive alerts about water quality changes
                  </Text>
                </View>
              </View>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </View>

            {/* Location Services Toggle */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3 overflow-hidden">
                  <Ionicons name="location" size={18} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">
                    Location Services
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Allow access to find nearby stations
                  </Text>
                </View>
              </View>
              <Switch
                checked={locationServices}
                onCheckedChange={setLocationServices}
              />
            </View>

            {/* Auto Refresh Toggle */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3 overflow-hidden">
                  <Ionicons name="refresh" size={18} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">
                    Auto Refresh
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Automatically refresh data every 5 minutes
                  </Text>
                </View>
              </View>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </View>

            {/* Data Sharing Toggle */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3 overflow-hidden">
                  <Ionicons name="share" size={18} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">
                    Data Sharing
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Help improve the app by sharing anonymous usage data
                  </Text>
                </View>
              </View>
              <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
            </View>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex-row flex items-center h-10 min-h-[28px]">
              <Ionicons name="help-circle" size={16} color={theme.primary} />
              <Text className="ml-2">Support & Help</Text>
            </CardTitle>
            <CardDescription>Get help and contact support</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onPress={openDrawer}
            >
              <Ionicons name="help-circle" size={16} color={theme.primary} />
              <Text className="ml-2 text-primary">Help Center</Text>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onPress={openDrawer}
            >
              <Ionicons name="mail" size={16} color={theme.primary} />
              <Text className="ml-2 text-primary">Contact Support</Text>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onPress={openDrawer}
            >
              <Ionicons name="information" size={16} color={theme.primary} />
              <Text className="ml-2 text-primary">About</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <View className="gap-3 mb-10">
          <Button variant="outline" className="w-full" onPress={openDrawer}>
            <Ionicons name="log-out" size={16} color={theme.destructive} />
            <Text className="ml-2 text-destructive">Sign Out</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
