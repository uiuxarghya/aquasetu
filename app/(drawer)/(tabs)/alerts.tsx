import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAlerts } from "@/lib/alerts-context";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

export default function AlertsScreen() {
  const {
    alerts,
    isLoading,
    error,
    addAlert,
    removeAlert,
    acknowledgeAlert,
    clearAllAlerts,
    refreshAlerts,
  } = useAlerts();
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [currentAlertAction, setCurrentAlertAction] = useState<{
    alertId: number;
    action: string;
  } | null>(null);

  const [isGeneratingAlerts, setIsGeneratingAlerts] = useState(false);
  const [alertGenerationInterval, setAlertGenerationInterval] = useState<
    number | null
  >(null);

  // Random alert generation data
  const alertTypes = ["critical", "warning", "info"] as const;
  const riverBasins = [
    "Ganges Basin",
    "Yamuna Basin",
    "Cauvery Basin",
    "Krishna Basin",
    "Godavari Basin",
    "Narmada Basin",
    "Mahanadi Basin",
    "Indus Basin",
  ];
  const cities = [
    { name: "Varanasi", lat: 25.3176, lng: 82.9739 },
    { name: "Delhi", lat: 28.6139, lng: 77.209 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
    { name: "Mumbai", lat: 19.076, lng: 72.8777 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  ];

  const criticalTitles = [
    "Critical Water Level Drop",
    "Emergency Water Shortage",
    "Severe Aquifer Depletion",
    "Critical Infrastructure Failure",
  ];

  const warningTitles = [
    "Recharge Rate Declining",
    "Quality Parameter Alert",
    "Maintenance Required",
    "Flow Rate Anomaly",
    "Contamination Detected",
  ];

  const infoTitles = [
    "Maintenance Scheduled",
    "Sensor Calibration Due",
    "Routine Inspection",
    "System Update Available",
    "Data Synchronization Complete",
  ];

  const generateRandomAlert = () => {
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const basin = riverBasins[Math.floor(Math.random() * riverBasins.length)];
    const stationId = `DWLR${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;
    const sensorId = `${stationId}-SENSOR-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;

    let title: string;
    let message: string;
    let lastReading: string;
    let threshold: string;
    let trend: string;
    let recommendedAction: string;

    switch (type) {
      case "critical":
        title =
          criticalTitles[Math.floor(Math.random() * criticalTitles.length)];
        lastReading = `${(Math.random() * 2 + 1).toFixed(1)}m`;
        threshold = `${(Math.random() * 2 + 2).toFixed(1)}m`;
        trend = "Falling";
        recommendedAction = "Immediate water conservation measures required";
        message = `${stationId} in ${city.name} showing ${Math.floor(Math.random() * 30 + 10)}% drop in water levels`;
        break;
      case "warning":
        title = warningTitles[Math.floor(Math.random() * warningTitles.length)];
        if (Math.random() > 0.5) {
          lastReading = `${Math.floor(Math.random() * 50 + 30)}%`;
          threshold = `${Math.floor(Math.random() * 20 + 40)}%`;
          trend = Math.random() > 0.5 ? "Declining" : "Rising";
          recommendedAction =
            "Monitor rainfall patterns and implement recharge programs";
          message = `Aquifer recharge rate below sustainable threshold at ${stationId}`;
        } else {
          lastReading = `${Math.floor(Math.random() * 1500 + 500)} ppm`;
          threshold = `${Math.floor(Math.random() * 500 + 800)} ppm`;
          trend = "Rising";
          recommendedAction =
            "Water quality testing recommended for affected areas";
          message = `TDS levels exceeding safe limits at ${stationId}`;
        }
        break;
      case "info":
        title = infoTitles[Math.floor(Math.random() * infoTitles.length)];
        lastReading = `${(Math.random() * 3 + 2).toFixed(1)}m`;
        threshold = `${(Math.random() * 2 + 3).toFixed(1)}m`;
        trend = "Stable";
        recommendedAction =
          Math.random() > 0.5
            ? "Scheduled maintenance will be completed by EOD"
            : "System update will be applied automatically";
        message = `Routine maintenance scheduled for ${stationId} ${Math.random() > 0.5 ? "tomorrow" : "next week"}`;
        break;
    }

    const priority =
      type === "critical" ? "high" : type === "warning" ? "medium" : "low";

    return {
      id: Date.now(), // Use timestamp as unique ID
      type,
      title,
      message,
      station: `${stationId} - ${basin}`,
      timestamp: "Just now",
      priority,
      latitude: city.lat + (Math.random() - 0.5) * 0.1, // Add some variation
      longitude: city.lng + (Math.random() - 0.5) * 0.1,
      sensorId,
      lastReading,
      threshold,
      trend,
      affectedArea: `${city.name} Region`,
      recommendedAction,
    };
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return "close-circle";
      case "warning":
        return "warning";
      case "info":
        return "information-circle";
      default:
        return "notifications";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "#ef4444"; // Red for critical alerts
      case "warning":
        return "#f59e0b"; // Orange/amber for warnings
      case "info":
        return "#3b82f6"; // Blue for informational alerts
      default:
        return "#6b7280";
    }
  };

  const getAlertBackgroundColor = (type: string) => {
    switch (type) {
      case "critical":
        return "rgba(239, 68, 68, 0.05)"; // Light red background
      case "warning":
        return "rgba(245, 158, 11, 0.05)"; // Light orange background
      case "info":
        return "rgba(59, 130, 246, 0.05)"; // Light blue background
      default:
        return "rgba(107, 114, 128, 0.05)";
    }
  };

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case "critical":
        return "rgba(239, 68, 68, 0.2)"; // Light red border
      case "warning":
        return "rgba(245, 158, 11, 0.2)"; // Light orange border
      case "info":
        return "rgba(59, 130, 246, 0.2)"; // Light blue border
      default:
        return "rgba(107, 114, 128, 0.1)";
    }
  };

  const getIconBackgroundColor = (type: string) => {
    switch (type) {
      case "critical":
        return "rgba(239, 68, 68, 0.2)"; // Semi-transparent red background
      case "warning":
        return "rgba(245, 158, 11, 0.2)"; // Semi-transparent orange background
      case "info":
        return "rgba(59, 130, 246, 0.2)"; // Semi-transparent blue background
      default:
        return "rgba(107, 114, 128, 0.2)";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          text: "#ef4444",
          background: "rgba(239, 68, 68, 0.15)",
          border: "rgba(239, 68, 68, 0.3)",
        };
      case "medium":
        return {
          text: "#f59e0b",
          background: "rgba(245, 158, 11, 0.15)",
          border: "rgba(245, 158, 11, 0.3)",
        };
      case "low":
        return {
          text: "#3b82f6",
          background: "rgba(59, 130, 246, 0.15)",
          border: "rgba(59, 130, 246, 0.3)",
        };
      default:
        return {
          text: "#6b7280",
          background: "rgba(107, 114, 128, 0.1)",
          border: "rgba(107, 114, 128, 0.2)",
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  const getAlertCounts = () => {
    const counts = {
      critical: 0,
      warning: 0,
      info: 0,
    };

    alerts.forEach((alert) => {
      if (counts[alert.type as keyof typeof counts] !== undefined) {
        counts[alert.type as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const handleAlertAction = (alertId: number, action: string) => {
    setCurrentAlertAction({ alertId, action });
    setAlertDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (currentAlertAction) {
      console.log(
        `${currentAlertAction.action} alert ${currentAlertAction.alertId}`
      );
      setAlertDialogOpen(false);
      setCurrentAlertAction(null);
    }
  };

  const handleCancelAction = () => {
    setAlertDialogOpen(false);
    setCurrentAlertAction(null);
  };

  const getCurrentAlert = () => {
    return alerts.find((alert) => alert.id === currentAlertAction?.alertId);
  };

  const dismissAlert = async (alertId: number) => {
    try {
      await removeAlert(alertId);
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await acknowledgeAlert(alertId);
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    }
  };

  const startAlertGeneration = () => {
    if (isGeneratingAlerts) return;

    setIsGeneratingAlerts(true);

    const generateAndAddAlert = async () => {
      try {
        const newAlert = generateRandomAlert();
        await addAlert(newAlert);
      } catch (err) {
        console.error("Failed to add generated alert:", err);
      }
    };

    // Generate first alert immediately
    generateAndAddAlert();

    // Set up interval for subsequent alerts (random interval between 5-15 seconds)
    const interval = setInterval(() => {
      const delay = Math.random() * 10000 + 5000; // 5-15 seconds
      setTimeout(generateAndAddAlert, delay);
    }, 8000); // Check every 8 seconds on average

    setAlertGenerationInterval(interval);
  };

  const stopAlertGeneration = () => {
    setIsGeneratingAlerts(false);
    if (alertGenerationInterval) {
      clearInterval(alertGenerationInterval);
      setAlertGenerationInterval(null);
    }
  };

  // Format timestamp to relative time
  const handleClearAllAlerts = async () => {
    try {
      await clearAllAlerts();
    } catch (err) {
      console.error("Failed to clear alerts:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background mb-16">
      <ScrollView className="flex-1 rounded-t-lg">
        <View className="p-4 rounded-lg">
          {/* Loading State */}
          {isLoading && (
            <View className="items-center justify-center py-8">
              <Text className="text-muted-foreground">Loading alerts...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-800 text-sm">Error: {error}</Text>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onPress={refreshAlerts}
              >
                <Text className="text-xs">Retry</Text>
              </Button>
            </View>
          )}

          {/* Header */}
          <View className="items-start mb-4">
            <Text className="text-xl font-bold text-foreground mb-2">
              Alerts & Notifications
            </Text>
            <View className="flex-row gap-2">
              <Button
                variant={isGeneratingAlerts ? "destructive" : "default"}
                size="sm"
                className="rounded-md"
                onPress={
                  isGeneratingAlerts
                    ? stopAlertGeneration
                    : startAlertGeneration
                }
              >
                <Text className="text-xs">
                  {isGeneratingAlerts ? "Stop Generation" : "Start Generation"}
                </Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md"
                onPress={handleClearAllAlerts}
              >
                <Text className="text-xs">Clear All</Text>
              </Button>
            </View>
          </View>

          {/* Alert Summary */}
          <Card className="mb-4 rounded-xl">
            <CardContent className="pt-4">
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: getAlertColor("critical") }}
                  >
                    {getAlertCounts().critical}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Critical
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: getAlertColor("warning") }}
                  >
                    {getAlertCounts().warning}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Warnings
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: getAlertColor("info") }}
                  >
                    {getAlertCounts().info}
                  </Text>
                  <Text className="text-xs text-muted-foreground">Info</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <View className="gap-2">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: getAlertBackgroundColor(alert.type),
                  borderColor: getAlertBorderColor(alert.type),
                }}
              >
                <CardContent className="px-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-start flex-1">
                      <View
                        className="w-6 h-6 rounded-full justify-center items-center mr-2"
                        style={{
                          backgroundColor: getIconBackgroundColor(alert.type),
                        }}
                      >
                        <Ionicons
                          name={
                            getAlertIcon(
                              alert.type
                            ) as keyof typeof Ionicons.glyphMap
                          }
                          size={12}
                          color={getAlertColor(alert.type)}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold mb-1 text-foreground">
                          {alert.title}
                        </Text>
                        <Text className="text-xs text-muted-foreground mb-1 leading-4">
                          {alert.message}
                        </Text>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-muted-foreground">
                            {alert.station}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {formatTimestamp(alert.timestamp)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      className="px-1.5 py-0.5 rounded-full border ml-2"
                      style={{
                        backgroundColor: getPriorityColor(alert.priority)
                          .background,
                        borderColor: getPriorityColor(alert.priority).border,
                      }}
                    >
                      <Text
                        className="text-xs font-medium capitalize"
                        style={{ color: getPriorityColor(alert.priority).text }}
                      >
                        {alert.priority}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-1 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-md"
                      onPress={() => handleAcknowledgeAlert(alert.id)}
                    >
                      <Text className="text-xs">Ack</Text>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-md"
                      size="sm"
                      onPress={() =>
                        handleAlertAction(alert.id, "View Details")
                      }
                    >
                      <Text className="text-xs">Details</Text>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 rounded-md"
                      onPress={() => dismissAlert(alert.id)}
                    >
                      <Text className="text-xs">Dismiss</Text>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* Alert Dialog */}
        <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
          <AlertDialogContent className="rounded-xl max-w-sm">
            {currentAlertAction?.action === "View Details" ? (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex-row items-center">
                    <Ionicons
                      name={
                        getAlertIcon(
                          getCurrentAlert()?.type || "info"
                        ) as keyof typeof Ionicons.glyphMap
                      }
                      size={20}
                      color={getAlertColor(getCurrentAlert()?.type || "info")}
                      style={{ marginRight: 8 }}
                    />
                    {getCurrentAlert()?.title}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-left">
                    {getCurrentAlert()?.message}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <View className="py-2">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium">Station:</Text>
                    <Text className="text-sm text-muted-foreground">
                      {getCurrentAlert()?.station}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium">Location:</Text>
                    <Text className="text-sm text-muted-foreground">
                      {getCurrentAlert()?.latitude?.toFixed(4)},{" "}
                      {getCurrentAlert()?.longitude?.toFixed(4)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium">Sensor ID:</Text>
                    <Text className="text-sm text-muted-foreground">
                      {getCurrentAlert()?.sensorId}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium">Last Reading:</Text>
                    <Text className="text-sm text-muted-foreground">
                      {getCurrentAlert()?.lastReading}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium">Threshold:</Text>
                    <Text className="text-sm text-muted-foreground">
                      {getCurrentAlert()?.threshold}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium">Trend:</Text>
                    <Text className="text-sm text-muted-foreground">
                      {getCurrentAlert()?.trend}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium">Priority:</Text>
                    <View
                      className="px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: getPriorityColor(
                          getCurrentAlert()?.priority || "low"
                        ).background,
                        borderColor: getPriorityColor(
                          getCurrentAlert()?.priority || "low"
                        ).border,
                      }}
                    >
                      <Text
                        className="text-xs font-medium capitalize"
                        style={{
                          color: getPriorityColor(
                            getCurrentAlert()?.priority || "low"
                          ).text,
                        }}
                      >
                        {getCurrentAlert()?.priority}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 p-3 rounded-lg bg-muted">
                    <Text className="text-sm font-medium mb-1">
                      Recommended Action:
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {getCurrentAlert()?.recommendedAction}
                    </Text>
                  </View>
                </View>
                <AlertDialogFooter>
                  <AlertDialogCancel onPress={handleCancelAction}>
                    <Text>Close</Text>
                  </AlertDialogCancel>
                  <AlertDialogAction onPress={handleConfirmAction}>
                    <Text>Acknowledge</Text>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </>
            ) : (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                  <AlertDialogDescription>
                    <Text>
                      Are you sure you want to{" "}
                      {currentAlertAction?.action.toLowerCase()} alert #
                      {currentAlertAction?.alertId}?
                    </Text>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onPress={handleCancelAction}>
                    <Text>Cancel</Text>
                  </AlertDialogCancel>
                  <AlertDialogAction onPress={handleConfirmAction}>
                    <Text>Confirm</Text>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogContent>
        </AlertDialog>
      </ScrollView>
    </SafeAreaView>
  );
}
