import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/utils/auth";
import { useGroundwaterData } from "@/lib/utils/groundwater-data";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

export default function GroundwaterAnalysis() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    stations,
    metrics,
    insights,
    monitoringStatus,
    isLoading: dataLoading,
    lastUpdate,
    refreshData,
  } = useGroundwaterData();
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("waterLevel");
  const [refreshing, setRefreshing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showAllStations, setShowAllStations] = useState(false);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Pulse animation for live data indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Fade in animation for station list
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Enhanced refresh function with visual feedback
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Show loading while checking authentication status
  if (authLoading || dataLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <View className="items-center space-y-4">
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
            className="bg-blue-100 p-4 rounded-full"
          >
            <Ionicons name="analytics" size={32} color="#3b82f6" />
          </Animated.View>
          <Text className="text-lg text-muted-foreground">
            Loading real-time groundwater data...
          </Text>
          <View className="flex-row space-x-1">
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  const filteredStations =
    selectedRegion === "all"
      ? stations
      : stations.filter((station) =>
          station.location.toLowerCase().includes(selectedRegion.toLowerCase())
        );

  return (
    <ScrollView className="flex-1 bg-background mb-16">
      <View className="p-4 pt-12">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="flex-row items-center justify-center mb-4">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
              className="bg-blue-100 p-3 rounded-full mr-3"
            >
              <Ionicons name="analytics" size={24} color="#3b82f6" />
            </Animated.View>
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-xs font-medium text-green-800">LIVE</Text>
            </View>
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2">
            Groundwater Analysis
          </Text>
          <Text className="text-muted-foreground text-center mb-2">
            Real-time evaluation using DWLR data
          </Text>
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={refreshing}
              className="p-1"
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: refreshing
                        ? pulseAnim.interpolate({
                            inputRange: [1, 1.2],
                            outputRange: ["0deg", "360deg"],
                          })
                        : "0deg",
                    },
                  ],
                }}
              >
                <Ionicons
                  name={refreshing ? "sync" : "refresh"}
                  size={14}
                  color={refreshing ? "#3b82f6" : "#6b7280"}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View className="gap-4 mb-6">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Region
            </Text>
            <View className="flex-row gap-2">
              {["all", "Delhi", "Uttar Pradesh", "Karnataka", "Tamil Nadu"].map(
                (region) => (
                  <TouchableOpacity
                    key={region}
                    onPress={() => setSelectedRegion(region)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedRegion === region ? "bg-blue-600" : "bg-muted"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedRegion === region
                          ? "text-white"
                          : "text-muted-foreground"
                      }`}
                    >
                      {region === "all" ? "All Regions" : region}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Metric
            </Text>
            <View className="flex-row gap-2">
              {["waterLevel", "recharge", "extraction"].map((metric) => (
                <TouchableOpacity
                  key={metric}
                  onPress={() => setSelectedMetric(metric)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedMetric === metric ? "bg-blue-600" : "bg-muted"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedMetric === metric
                        ? "text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    {metric === "waterLevel"
                      ? "Water Level"
                      : metric === "recharge"
                        ? "Recharge"
                        : "Extraction"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Regional Overview */}
        <Card className="mb-6">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <View>
                <CardTitle className="text-lg">Overview</CardTitle>
                <CardDescription>
                  Live groundwater resource evaluation across India
                </CardDescription>
              </View>
            </View>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              <View className="grid grid-cols-2 gap-4">
                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      Total Stations
                    </Text>
                    <Ionicons name="radio" size={16} color="#3b82f6" />
                  </View>
                  <Text className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {monitoringStatus?.dwlrNetwork.total.toLocaleString()}
                  </Text>
                  <Text className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Network capacity
                  </Text>
                </View>
                <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Active Stations
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10b981"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {monitoringStatus?.dwlrNetwork.active.toLocaleString()}
                  </Text>
                  <Text className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Currently online
                  </Text>
                </View>
              </View>

              {metrics && (
                <>
                  <View className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                        Average Water Level
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons
                          name={
                            metrics.trend >= 0 ? "trending-up" : "trending-down"
                          }
                          size={14}
                          color={metrics.trend >= 0 ? "#10b981" : "#ef4444"}
                        />
                        <Text
                          className={`text-xs ml-1 ${metrics.trend >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {metrics.trend >= 0 ? "+" : ""}
                          {metrics.trend.toFixed(2)}m
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      {metrics.averageWaterLevel.toFixed(1)}m
                    </Text>
                    <Text className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Current groundwater level across network
                    </Text>
                  </View>

                  <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                        Resource Metrics
                      </Text>
                      <Ionicons name="stats-chart" size={16} color="#8b5cf6" />
                    </View>
                    <View className="space-y-1">
                      <Text className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Recharge: {metrics.rechargeRate.toFixed(1)}%
                      </Text>
                      <Text className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Extraction: {metrics.annualExtraction.toFixed(0)}{" "}
                        MCM/year
                      </Text>
                      <Text className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Stress Level: {metrics.aquiferStress.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* Data Quality Indicator */}
              <View className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color="#6b7280"
                    />
                    <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2 font-medium">
                      Data Quality
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                      <View
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "95%" }}
                      />
                    </View>
                    <Text className="text-xs text-green-600 font-medium">
                      95%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Station Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <View>
                <CardTitle className="text-lg">Station Analysis</CardTitle>
                <CardDescription>
                  Real-time evaluation of {filteredStations.length} active DWLR
                  stations
                  {monitoringStatus &&
                    ` (${monitoringStatus.dwlrNetwork.active} total active)`}
                </CardDescription>
              </View>
              
            </View>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              {/* Status Overview */}
              <View className="flex-row justify-between items-center p-3 bg-muted/50 rounded-lg">
                <View className="flex-row items-center space-x-2">
                  <Animated.View
                    style={{
                      transform: [{ scale: pulseAnim }],
                    }}
                    className="w-3 h-3 bg-green-500 rounded-full"
                  />
                  <Text className="font-medium">Network Status</Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <Text className="text-sm text-muted-foreground">
                    {monitoringStatus?.dwlrNetwork.active || 0} Active
                  </Text>
                  <Text className="text-sm text-muted-foreground">•</Text>
                  <Text className="text-sm text-muted-foreground">
                    {monitoringStatus?.dwlrNetwork.status === "maintenance"
                      ? "Maintenance"
                      : "Operational"}
                  </Text>
                </View>
              </View>

              {/* Station List with Dynamic Status */}
              <View className="space-y-2">
                {filteredStations
                  .slice(0, showAllStations ? filteredStations.length : 5)
                  .map((station, index) => (
                    <Animated.View
                      key={station.id}
                      style={{
                        opacity: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1],
                        }),
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0],
                            }),
                          },
                        ],
                      }}
                      className="flex-row items-center justify-between p-3 bg-card border rounded-lg"
                    >
                      <View className="flex-row items-center space-x-3">
                        <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center">
                          <Text className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {station.id.charAt(0)}
                          </Text>
                        </View>
                        <View>
                          <Text className="font-medium">{station.id}</Text>
                          <Text className="text-xs text-muted-foreground">
                            {station.location}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center space-x-2">
                        <Animated.View
                          style={{
                            opacity: pulseAnim.interpolate({
                              inputRange: [1, 1.2],
                              outputRange: [0.5, 1],
                            }),
                          }}
                          className="w-2 h-2 bg-green-500 rounded-full"
                        />
                        <Text className="text-xs text-muted-foreground">
                          {station.status === "normal" ? "Live" : "Alert"}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
              </View>

              {/* View All Button */}
              <TouchableOpacity
                onPress={() => setShowAllStations(!showAllStations)}
                className="flex-row items-center justify-center p-2 bg-muted/50 rounded-lg"
              >
                <Text className="text-sm font-medium mr-2">
                  {showAllStations
                    ? "Show Less"
                    : `View All ${filteredStations.length} Stations`}
                </Text>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: showAllStations ? "180deg" : "0deg",
                      },
                    ],
                  }}
                >
                  <Text className="text-xs">▼</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Decision Support */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              AI-Powered Recommendations
            </CardTitle>
            <CardDescription>
              Data-driven insights for groundwater management
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            {insights && insights.length > 0 ? (
              insights.map((insight, index) => {
                const getInsightStyle = (type: string) => {
                  switch (type) {
                    case "critical":
                      return {
                        container: "bg-red-50",
                        icon: "alert-circle",
                        iconColor: "#dc2626",
                        titleColor: "text-red-900",
                        messageColor: "text-red-800",
                      };
                    case "optimization":
                      return {
                        container: "bg-blue-50",
                        icon: "bulb",
                        iconColor: "#3b82f6",
                        titleColor: "text-blue-900",
                        messageColor: "text-blue-800",
                      };
                    case "success":
                      return {
                        container: "bg-green-50",
                        icon: "checkmark-circle",
                        iconColor: "#10b981",
                        titleColor: "text-green-900",
                        messageColor: "text-green-800",
                      };
                    default:
                      return {
                        container: "bg-gray-50",
                        icon: "information-circle",
                        iconColor: "#6b7280",
                        titleColor: "text-gray-900",
                        messageColor: "text-gray-800",
                      };
                  }
                };

                const style = getInsightStyle(insight.type);

                return (
                  <View
                    key={index}
                    className={`${style.container} p-4 rounded-lg`}
                  >
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name={style.icon as any}
                        size={20}
                        color={style.iconColor}
                      />
                      <Text
                        className={`ml-2 font-semibold ${style.titleColor}`}
                      >
                        {insight.title}
                      </Text>
                    </View>
                    <Text className={`text-sm ${style.messageColor}`}>
                      {insight.message}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View className="bg-gray-50 p-4 rounded-lg">
                <Text className="text-sm text-gray-800">
                  Loading recommendations...
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Export & Share */}
        <View className="gap-3">
          <Button variant="outline" className="w-full">
            <Ionicons name="download" size={16} color="#3b82f6" />
            <Text className="ml-2 text-primary">Export Report</Text>
          </Button>
          <Button variant="outline" className="w-full">
            <Ionicons name="share" size={16} color="#3b82f6" />
            <Text className="ml-2 text-primary">Share Analysis</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
