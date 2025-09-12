import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-24 h-24 mb-4 rounded-2xl"
          resizeMode="contain"
        />
        <Text className="text-4xl leading-[40px] font-bold font-space-mono text-blue-500 text-center">
          AquaSetu
        </Text>
        <Text className="mt-3 text-lg text-muted-foreground text-center">
          Checking authentication...
        </Text>
      </View>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return "trending-up";
      case "falling":
        return "trending-down";
      case "stable":
        return "remove";
      default:
        return "help-circle";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "rising":
        return "text-green-600";
      case "falling":
        return "text-red-600";
      case "stable":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 border-green-200";
      case "warning":
        return "bg-yellow-100 border-yellow-200";
      case "critical":
        return "bg-red-100 border-red-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  return (
    <ScrollView className="flex-1 bg-background mb-6">
      <View className="p-4">
        {/* Header Section */}
        <View className="items-start mb-4">
          <View className="flex flex-row gap-x-2 items-center mb-2">
            <Image
              source={require("@/assets/images/icon.png")}
              className="w-10 h-10 rounded-lg"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-foreground">AquaSetu</Text>
          </View>
        </View>

        {/* Timeframe Selector */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-muted-foreground mb-2">
            Timeframe
          </Text>
          <View className="flex-row gap-2">
            {["24h", "7d", "30d", "90d"].map((timeframe) => (
              <Button
                key={timeframe}
                variant={
                  selectedTimeframe === timeframe ? "default" : "outline"
                }
                size="sm"
                onPress={() => setSelectedTimeframe(timeframe)}
                className="flex-1"
              >
                <Text
                  className={`text-xs ${selectedTimeframe === timeframe ? "text-primary-foreground" : "text-primary"}`}
                >
                  {timeframe}
                </Text>
              </Button>
            ))}
          </View>
        </View>

        {/* Groundwater Overview */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-lg">Groundwater Overview</CardTitle>
              <View className="bg-blue-100 p-2 rounded-full">
                <Ionicons name="water" size={20} color="#3b82f6" />
              </View>
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-2xl font-bold text-blue-600">15.2m</Text>
                <Text className="text-sm text-muted-foreground">
                  Avg. Water Level
                </Text>
              </View>
              <View className="items-end">
                <View className="flex-row items-center">
                  <Ionicons name="trending-up" size={16} color="#10b981" />
                  <Text className="text-sm text-green-600 ml-1">+2.1m</Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  vs last month
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-lg font-semibold text-green-600">
                  85%
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Recharge Rate
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-semibold text-blue-600">
                  12.5m³
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Daily Extraction
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-semibold text-yellow-600">
                  68%
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Storage Level
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* DWLR Stations Status */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-lg">DWLR Stations</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push("/groundwater-analysis")}
              >
                <Text className="text-sm text-primary">View All</Text>
                <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
              </Button>
            </View>
          </CardHeader>
          <CardContent className="gap-3">
            {[
              {
                id: "DWLR-001",
                location: "Delhi NCR",
                level: 12.5,
                trend: "rising",
                status: "normal",
              },
              {
                id: "DWLR-002",
                location: "Mumbai",
                level: 8.3,
                trend: "falling",
                status: "warning",
              },
              {
                id: "DWLR-003",
                location: "Chennai",
                level: 15.7,
                trend: "stable",
                status: "normal",
              },
              {
                id: "DWLR-004",
                location: "Kolkata",
                level: 6.2,
                trend: "falling",
                status: "critical",
              },
            ].map((station) => (
              <View
                key={station.id}
                className={`p-3 rounded-lg border ${getStatusColor(station.status)}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-sm">{station.id}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {station.location}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-semibold text-sm">
                      {station.level}m
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name={getTrendIcon(station.trend)}
                        size={12}
                        className={getTrendColor(station.trend)}
                      />
                      <Text
                        className={`text-xs ml-1 ${getTrendColor(station.trend)}`}
                      >
                        {station.trend}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Decision Support */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-lg">Decision Support</CardTitle>
              <View className="bg-orange-100 p-2 rounded-full">
                <Ionicons name="bulb" size={20} color="#f59e0b" />
              </View>
            </View>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <View className="flex-row items-start">
                <Ionicons
                  name="warning"
                  size={16}
                  color="#f59e0b"
                  className="mt-0.5 mr-2"
                />
                <View className="flex-1">
                  <Text className="font-medium text-sm text-yellow-800">
                    Critical Alert
                  </Text>
                  <Text className="text-xs text-yellow-700 mt-1">
                    Kolkata DWLR-004 water level dropping rapidly. Immediate
                    intervention required.
                  </Text>
                </View>
              </View>
            </View>
            <View className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <View className="flex-row items-start">
                <Ionicons
                  name="information-circle"
                  size={16}
                  color="#3b82f6"
                  className="mt-0.5 mr-2"
                />
                <View className="flex-1">
                  <Text className="font-medium text-sm text-blue-800">
                    Recommendation
                  </Text>
                  <Text className="text-xs text-blue-700 mt-1">
                    Consider implementing rainwater harvesting in Delhi NCR to
                    maintain recharge rates.
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="server" size={16} color="#6b7280" />
                <Text className="ml-2 text-sm">Database</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text className="text-sm text-green-600 ml-1">Online</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="cloud" size={16} color="#6b7280" />
                <Text className="ml-2 text-sm">Cloud Sync</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text className="text-sm text-green-600 ml-1">Synced</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="cellular" size={16} color="#6b7280" />
                <Text className="ml-2 text-sm">Network</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="wifi" size={14} color="#10b981" />
                <Text className="text-sm text-green-600 ml-1">Strong</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
