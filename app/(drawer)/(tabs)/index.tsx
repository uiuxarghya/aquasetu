import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/utils/auth";
import { useGroundwaterData } from "@/lib/utils/groundwater-data";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [refreshing, setRefreshing] = useState(false);

  const {
    stations,
    metrics,
    insights,
    monitoringStatus,
    isLoading: dataLoading,
    lastUpdate,
    refreshData,
  } = useGroundwaterData(selectedTimeframe);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Show loading while checking authentication status
  if (authLoading) {
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
    // Use neutral color for all trends to avoid color conflicts with status backgrounds
    return "text-gray-600 dark:text-gray-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800";
      case "warning":
        return "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
      case "critical":
        return "bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      default:
        return "bg-gray-100 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800";
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background mb-6"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
          <Text className="text-sm text-muted-foreground">
            Real-time Groundwater Resource Evaluation
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Text>
        </View>

        {/* Timeframe Selector */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-muted-foreground mb-2">
            Analysis Period
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

        {/* Groundwater Resource Dashboard */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Groundwater Resource Dashboard
              </CardTitle>
              <View className="bg-blue-100 p-2 rounded-full">
                <Ionicons name="analytics" size={20} color="#3b82f6" />
              </View>
            </View>
          </CardHeader>
          <CardContent>
            {dataLoading || !metrics ? (
              <View className="items-center py-4">
                <Text className="text-muted-foreground">
                  Loading metrics...
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="text-2xl font-bold text-blue-600">
                      {metrics.averageWaterLevel}m
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      Avg. Water Level (DWLR)
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center">
                      <Ionicons
                        name={
                          metrics.trend >= 0 ? "trending-up" : "trending-down"
                        }
                        size={16}
                        color={metrics.trend >= 0 ? "#10b981" : "#dc2626"}
                      />
                      <Text
                        className={`text-sm ml-1 ${metrics.trend >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {metrics.trend >= 0 ? "+" : ""}
                        {metrics.trend}m
                      </Text>
                    </View>
                    <Text className="text-xs text-muted-foreground">
                      vs last month
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-orange-600">
                      {metrics.rechargeRate}%
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Recharge Rate
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-red-600">
                      {metrics.annualExtraction} MCM
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Annual Extraction
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-yellow-600">
                      {metrics.aquiferStress}%
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Aquifer Stress
                    </Text>
                  </View>
                </View>
              </>
            )}
          </CardContent>
        </Card>

        {/* DWLR Network Status */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-lg">DWLR Network Status</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push("/analytics")}
              >
                <Text className="text-sm text-primary">View Analytics</Text>
                <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
              </Button>
            </View>
          </CardHeader>
          <CardContent className="gap-3">
            {dataLoading || !stations.length ? (
              <View className="items-center py-4">
                <Text className="text-muted-foreground">
                  Loading station data...
                </Text>
              </View>
            ) : (
              stations.map((station) => (
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
                      <Text className="text-xs text-muted-foreground/60">
                        Last reading: {station.lastReading}
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
              ))
            )}
          </CardContent>
        </Card>

        {/* Resource Management Insights */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Resource Management Insights
              </CardTitle>
              <View className="bg-orange-100 p-2 rounded-full">
                <Ionicons name="bulb" size={20} color="#f59e0b" />
              </View>
            </View>
          </CardHeader>
          <CardContent className="gap-3">
            {dataLoading || !insights.length ? (
              <View className="items-center py-4">
                <Text className="text-muted-foreground">
                  Loading insights...
                </Text>
              </View>
            ) : (
              insights.map((insight, index) => {
                const getInsightStyle = (type: string) => {
                  switch (type) {
                    case "critical":
                      return {
                        container:
                          "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
                        icon: "alert-circle",
                        iconColor: "#dc2626",
                        titleColor: "text-red-800 dark:text-red-200",
                        messageColor: "text-red-700 dark:text-red-300",
                      };
                    case "optimization":
                      return {
                        container:
                          "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
                        icon: "analytics",
                        iconColor: "#3b82f6",
                        titleColor: "text-blue-800 dark:text-blue-200",
                        messageColor: "text-blue-700 dark:text-blue-300",
                      };
                    case "success":
                      return {
                        container:
                          "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
                        icon: "checkmark-circle",
                        iconColor: "#10b981",
                        titleColor: "text-green-800 dark:text-green-200",
                        messageColor: "text-green-700 dark:text-green-300",
                      };
                    default:
                      return {
                        container:
                          "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800",
                        icon: "information-circle",
                        iconColor: "#6b7280",
                        titleColor: "text-gray-800 dark:text-gray-200",
                        messageColor: "text-gray-700 dark:text-gray-300",
                      };
                  }
                };

                const style = getInsightStyle(insight.type);

                return (
                  <View
                    key={index}
                    className={`p-3 rounded-lg border ${style.container}`}
                  >
                    <View className="flex-row items-start">
                      <Ionicons
                        name={style.icon as any}
                        size={16}
                        color={style.iconColor}
                        className="mt-0.5 mr-2"
                      />
                      <View className="flex-1">
                        <Text
                          className={`font-medium text-sm ${style.titleColor}`}
                        >
                          {insight.title}
                        </Text>
                        <Text className={`text-xs mt-1 ${style.messageColor}`}>
                          {insight.message}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Monitoring Infrastructure */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Monitoring Infrastructure</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            {dataLoading || !monitoringStatus ? (
              <View className="items-center py-4">
                <Text className="text-muted-foreground">
                  Loading infrastructure status...
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="radio" size={16} color="#6b7280" />
                    <Text className="ml-2 text-sm">DWLR Network</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name={
                        monitoringStatus.dwlrNetwork.status === "operational"
                          ? "checkmark-circle"
                          : "warning"
                      }
                      size={14}
                      color={
                        monitoringStatus.dwlrNetwork.status === "operational"
                          ? "#10b981"
                          : "#f59e0b"
                      }
                    />
                    <Text
                      className={`text-sm ml-1 ${
                        monitoringStatus.dwlrNetwork.status === "operational"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {monitoringStatus.dwlrNetwork.active.toLocaleString()}{" "}
                      Active
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="cloud-upload" size={16} color="#6b7280" />
                    <Text className="ml-2 text-sm">Data Synchronization</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name={
                        monitoringStatus.dataSync.status === "real-time"
                          ? "checkmark-circle"
                          : "time"
                      }
                      size={14}
                      color={
                        monitoringStatus.dataSync.status === "real-time"
                          ? "#10b981"
                          : "#f59e0b"
                      }
                    />
                    <Text
                      className={`text-sm ml-1 ${
                        monitoringStatus.dataSync.status === "real-time"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {monitoringStatus.dataSync.status === "real-time"
                        ? "Real-time"
                        : "Delayed"}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="analytics" size={16} color="#6b7280" />
                    <Text className="ml-2 text-sm">Resource Analytics</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name={
                        monitoringStatus.analytics.status === "active"
                          ? "checkmark-circle"
                          : "warning"
                      }
                      size={14}
                      color={
                        monitoringStatus.analytics.status === "active"
                          ? "#10b981"
                          : "#f59e0b"
                      }
                    />
                    <Text
                      className={`text-sm ml-1 ${
                        monitoringStatus.analytics.status === "active"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {monitoringStatus.analytics.status === "active"
                        ? "Active"
                        : "Processing"}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="notifications" size={16} color="#6b7280" />
                    <Text className="ml-2 text-sm">Alert System</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name={
                        monitoringStatus.alerts.status === "monitoring"
                          ? "checkmark-circle"
                          : "warning"
                      }
                      size={14}
                      color={
                        monitoringStatus.alerts.status === "monitoring"
                          ? "#10b981"
                          : "#f59e0b"
                      }
                    />
                    <Text
                      className={`text-sm ml-1 ${
                        monitoringStatus.alerts.status === "monitoring"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {monitoringStatus.alerts.status === "monitoring"
                        ? "Monitoring"
                        : "Active"}
                      {monitoringStatus.alerts.activeCount > 0 &&
                        ` (${monitoringStatus.alerts.activeCount})`}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
