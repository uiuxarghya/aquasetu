import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import client from "@/lib/appwrite.config";
import { addBookmark, isBookmarked } from "@/lib/utils/db";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import {
  Building2,
  Calendar,
  CheckCircle,
  MapPin,
  Navigation,
  Wrench,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Account } from "react-native-appwrite";
import { LineChart } from "react-native-gifted-charts";

interface StationData {
  station_Name: string;
  station_Code: string;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  agency_Name: string;
  station_Type: string;
  station_Status: string;
  data_available_from: string;
  data_available_Till: string;
  well_depth: number;
  well_aquifer_type: string;
  mslmeter: number;
  unit: string;
}

export default function StationDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isbooked, setIsBooked] = useState<boolean>(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("1D");
  const [chartData, setChartData] = useState<any[]>([]);
  const account = useMemo(() => new Account(client), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://indiawris.gov.in/stationMaster/getMasterStationsList",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              stationcode: id,
              datasetcode: "GWATERLVL",
            }),
          }
        );

        const bookstatus = async () => {
          const res = await isBookmarked(account, String(id));
          console.log(res);
          if (res) setIsBooked(true);
          else setIsBooked(false);
        };

        await bookstatus();
        const json = await response.json();
        if (json.statusCode === 200 && json.data.length > 0) {
          setData(json.data[0]);
        } else {
          setError("Failed to fetch data");
        }
      } catch {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, account]);

  const fetchGWData = useCallback(
    async (
      stationCode: string,
      startTime: string,
      endTime: string,
      dataset: string,
      timeRange: string
    ) => {
      setLoading(true);
      try {
        console.log("Fetching GW data for:", {
          stationCode,
          startTime,
          endTime,
          dataset,
          timeRange,
        });
        const response = await fetch(
          "https://indiawris.gov.in/CommonDataSetMasterAPI/getCommonDataSetByStationCode",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              station_code: stationCode,
              starttime: startTime,
              endtime: endTime,
              dataset: dataset,
            }),
          }
        );

        console.log("GW API response status:", response.status);
        const json = await response.json();
        console.log("GW API response:", json);

        if (json.statusCode === 200) {
          console.log("Raw API data:", json.data);
          if (!json.data || json.data.length === 0) {
            console.log("No data returned from API");
            setChartData([]);
            setError(
              "No groundwater data available for this station and time range"
            );
            return;
          }
          const processedData = processChartData(json.data, timeRange);
          console.log("Processed chart data:", processedData);
          if (processedData.length === 0) {
            setError("No valid data points found after processing");
          } else {
            setError(null); // Clear any previous errors
          }
          setChartData(processedData);
        } else {
          console.log("GW API error:", json.message || json);
          setError(
            `Failed to fetch groundwater data: ${json.message || "API returned error"}`
          );
        }
      } catch (error) {
        console.error("GW fetch error:", error);
        setError("Error fetching groundwater data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!data) return; // Don't fetch if station data not loaded yet

    const { startTime, endTime } = getDateRange(selectedTimeRange);

    // Validate and parse available data dates
    const dataStart = new Date(data.data_available_from);
    const dataEnd = new Date(data.data_available_Till);

    // Check if dates are valid
    if (isNaN(dataStart.getTime()) || isNaN(dataEnd.getTime())) {
      console.error("Invalid date format in station data:", {
        data_available_from: data.data_available_from,
        data_available_Till: data.data_available_Till,
      });
      setChartData([]);
      setError("Invalid date format in station data availability");
      return;
    }

    // Check if data start is before data end
    if (dataStart > dataEnd) {
      console.error("Data start date is after end date:", {
        dataStart: dataStart.toISOString(),
        dataEnd: dataEnd.toISOString(),
      });
      setChartData([]);
      setError("Invalid data availability range (start date after end date)");
      return;
    }

    const requestStart = new Date(startTime);
    const requestEnd = new Date(endTime);

    console.log("Data availability check:", {
      stationCode: id,
      dataStart: dataStart.toISOString(),
      dataEnd: dataEnd.toISOString(),
      requestStart: requestStart.toISOString(),
      requestEnd: requestEnd.toISOString(),
      dataRange: `${dataStart.toLocaleDateString()} to ${dataEnd.toLocaleDateString()}`,
      requestRange: `${requestStart.toLocaleDateString()} to ${requestEnd.toLocaleDateString()}`,
    });

    // Check if requested range overlaps with available data
    const hasOverlap = requestEnd >= dataStart && requestStart <= dataEnd;

    if (hasOverlap) {
      console.log("Time range has overlap with available data, fetching...");
      fetchGWData(
        String(id),
        startTime,
        endTime,
        "GWATERLVL",
        selectedTimeRange
      );
    } else {
      console.log("No overlap with available data range");
      setChartData([]);
      setError(
        `No data available for selected time range. Station data available from ${dataStart.toLocaleDateString()} to ${dataEnd.toLocaleDateString()}`
      );
    }
  }, [selectedTimeRange, id, fetchGWData, data]);

  useFocusEffect(
    useCallback(() => {
      // Cleanup function to clear data when screen loses focus
      return () => {
        setData(null);
        setLoading(false);
        setError(null);
        setIsBooked(false);
        setSelectedTimeRange("1D");
        setChartData([]);
      };
    }, [])
  );

  const getDateRange = (timeRange: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timeRange) {
      case "1D":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "5D":
        startDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        break;
      case "1M":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case "6M":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate()
        );
        break;
      case "YTD":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "1YR":
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        break;
      case "5YR":
        startDate = new Date(
          now.getFullYear() - 5,
          now.getMonth(),
          now.getDate()
        );
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Try different date formats that the API might expect
    const formats = [
      startDate.toISOString().split("T")[0], // YYYY-MM-DD
      startDate.toISOString(), // Full ISO string
      startDate.toLocaleDateString("en-IN"), // DD/MM/YYYY (Indian format)
    ];

    return {
      startTime: formats[0], // Use YYYY-MM-DD as primary
      endTime: endDate.toISOString().split("T")[0],
      alternativeFormats: formats, // Keep alternatives for debugging
    };
  };

  const processChartData = (rawData: any[], timeRange: string) => {
    if (!rawData || rawData.length === 0) return [];

    // Filter out invalid data points
    const validData = rawData.filter(
      (item) =>
        item.dataTime &&
        typeof item.dataValue === "number" &&
        !isNaN(item.dataValue)
    );

    if (validData.length === 0) return [];

    console.log(
      `Processing ${validData.length} data points for time range: ${timeRange}`
    );

    switch (timeRange) {
      case "1D":
      case "5D":
        // Return all data points with time labels, limit to reasonable number for mobile
        const timeData = validData
          .sort(
            (a, b) =>
              new Date(a.dataTime).getTime() - new Date(b.dataTime).getTime()
          )
          .slice(-25) // Limit to last 25 points for mobile performance
          .map((item) => ({
            label: new Date(item.dataTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            value: Number(item.dataValue.toFixed(2)), // Round to 2 decimal places
          }));
        console.log("Time-based data points:", timeData.length);
        return timeData;

      case "1M":
        // Aggregate to daily averages
        const dailyMap = new Map<string, number[]>();
        validData.forEach((item) => {
          const date = new Date(item.dataTime).toISOString().split("T")[0];
          if (!dailyMap.has(date)) dailyMap.set(date, []);
          dailyMap.get(date)!.push(item.dataValue);
        });
        const dailyData = Array.from(dailyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-20) // Last 20 days for mobile
          .map(([date, values]) => ({
            label: new Date(date).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            }),
            value: Number(
              (
                values.reduce((sum, val) => sum + val, 0) / values.length
              ).toFixed(2)
            ),
          }));
        console.log("Daily aggregated data points:", dailyData.length);
        return dailyData;

      case "6M":
        // Aggregate to weekly averages
        const weeklyMap = new Map<string, number[]>();
        validData.forEach((item) => {
          const date = new Date(item.dataTime);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split("T")[0];
          if (!weeklyMap.has(weekKey)) weeklyMap.set(weekKey, []);
          weeklyMap.get(weekKey)!.push(item.dataValue);
        });
        const weeklyData = Array.from(weeklyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-15) // Last 15 weeks for mobile
          .map(([week, values]) => ({
            label: `W${new Date(week).toLocaleDateString([], { month: "short", day: "numeric" }).slice(-5)}`,
            value: Number(
              (
                values.reduce((sum, val) => sum + val, 0) / values.length
              ).toFixed(2)
            ),
          }));
        console.log("Weekly aggregated data points:", weeklyData.length);
        return weeklyData;

      case "YTD":
      case "1YR":
        // Aggregate to monthly averages
        const monthlyMap = new Map<string, number[]>();
        validData.forEach((item) => {
          const date = new Date(item.dataTime);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, []);
          monthlyMap.get(monthKey)!.push(item.dataValue);
        });
        const monthlyData = Array.from(monthlyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-8) // Last 8 months for mobile
          .map(([month, values]) => ({
            label: new Date(month + "-01").toLocaleDateString([], {
              month: "short",
            }),
            value: Number(
              (
                values.reduce((sum, val) => sum + val, 0) / values.length
              ).toFixed(2)
            ),
          }));
        console.log("Monthly aggregated data points:", monthlyData.length);
        return monthlyData;

      case "5YR":
        // Aggregate to yearly averages
        const yearlyMap = new Map<number, number[]>();
        validData.forEach((item) => {
          const year = new Date(item.dataTime).getFullYear();
          if (!yearlyMap.has(year)) yearlyMap.set(year, []);
          yearlyMap.get(year)!.push(item.dataValue);
        });
        const yearlyData = Array.from(yearlyMap.entries())
          .sort(([a], [b]) => a - b)
          .slice(-5) // Last 5 years
          .map(([year, values]) => ({
            label: year.toString(),
            value: Number(
              (
                values.reduce((sum, val) => sum + val, 0) / values.length
              ).toFixed(2)
            ),
          }));
        console.log("Yearly aggregated data points:", yearlyData.length);
        return yearlyData;

      default:
        return validData
          .sort(
            (a, b) =>
              new Date(a.dataTime).getTime() - new Date(b.dataTime).getTime()
          )
          .slice(-20)
          .map((item) => ({
            label: new Date(item.dataTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            value: Number(item.dataValue.toFixed(2)),
          }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[hsl(var(--background))]">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[hsl(var(--background))]">
        <Text className="text-[hsl(var(--destructive))] font-medium">
          {error}
        </Text>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[hsl(var(--background))]">
        <Text className="text-[hsl(var(--muted-foreground))]">
          No data found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background mb-16">
      <ScrollView className="flex-1">
        {/* Modern Header */}
        <View className="bg-background px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-foreground text-base font-bold mb-0.5">
                {data.station_Name}
              </Text>
              <Text className="text-foreground text-xs font-medium opacity-80">
                {data.station_Code}
              </Text>
              {/* Current Groundwater Level */}
              {chartData.length > 0 && (
                <View className="flex-row items-center mt-1">
                  <View className="bg-blue-100 dark:bg-blue-900 rounded-full px-2 py-0.5 mr-2">
                    <Text className="text-blue-800 dark:text-blue-200 text-xs font-semibold">
                      Current:{" "}
                      {chartData[chartData.length - 1]?.value?.toFixed(2)}m
                    </Text>
                  </View>
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs">
                    {new Date().toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center bg-background rounded-full px-1.5 py-0.5">
              <CheckCircle size={10} color="#10b981" />
              <Text className="text-primary text-xs font-semibold ml-0.5">
                {data.station_Status}
              </Text>
            </View>
            <Button
              className="bg-background"
              onPressIn={() => {
                addBookmark(account, String(id));
                setIsBooked(true);
              }}
            >
              <Ionicons
                name={isbooked ? "bookmark" : "bookmark-outline"}
                size={18}
                color="#3b82f6"
              />
            </Button>
          </View>
          <View className="flex-row items-center mt-1.5">
            <Building2 size={12} color="#93c5fd" />
            <Text className="text-muted-foreground text-xs ml-1.5 opacity-80">
              {data.agency_Name} • {data.station_Type}
            </Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View className="px-2 py-1.5">
          {/* Row 1: Location & Coordinates */}
          <View className="flex-row gap-1.5 mb-1.5">
            {/* Location Card */}
            <View className="flex-1 bg-[hsl(var(--card))] rounded-md p-2 shadow-sm border border-[hsl(var(--border))]">
              <View className="flex-row items-center mb-1">
                <View className="bg-[hsl(var(--accent))] rounded p-1 mr-1.5">
                  <MapPin size={14} color="#059669" />
                </View>
                <Text className="text-[hsl(var(--muted-foreground))] text-xs font-semibold uppercase tracking-wide">
                  Location
                </Text>
              </View>
              <Text className="text-[hsl(var(--foreground))] text-xs font-semibold mb-0.5">
                {data.state}
              </Text>
              <Text className="text-[hsl(var(--muted-foreground))] text-xs">
                {data.district}
              </Text>
            </View>

            {/* Coordinates Card */}
            <View className="flex-1 bg-[hsl(var(--card))] rounded-md p-2 shadow-sm border border-[hsl(var(--border))]">
              <View className="flex-row items-center mb-1">
                <View className="bg-[hsl(var(--accent))] rounded p-1 mr-1.5">
                  <Navigation size={14} color="#7c3aed" />
                </View>
                <Text className="text-[hsl(var(--muted-foreground))] text-xs font-semibold uppercase tracking-wide">
                  Coordinates
                </Text>
              </View>
              <Text className="text-[hsl(var(--foreground))] text-xs font-semibold mb-0.5">
                {data.latitude.toFixed(4)}°
              </Text>
              <Text className="text-[hsl(var(--muted-foreground))] text-xs">
                {data.longitude.toFixed(4)}°
              </Text>
            </View>
          </View>

          {/* Row 2: Technical Details & Data Availability */}
          <View className="flex-row gap-1.5">
            {/* Technical Metrics */}
            <View className="flex-1 bg-[hsl(var(--card))] rounded-md p-2 shadow-sm border border-[hsl(var(--border))]">
              <View className="flex-row items-center mb-1.5">
                <View className="bg-[hsl(var(--accent))] rounded p-1 mr-1.5">
                  <Wrench size={14} color="#d97706" />
                </View>
                <Text className="text-[hsl(var(--muted-foreground))] text-xs font-semibold uppercase tracking-wide">
                  Technical Details
                </Text>
              </View>
              <View className="flex-row gap-1.5">
                <View className="flex-1 text-center">
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs font-medium mb-0.5">
                    Well Depth
                  </Text>
                  <Text className="text-[hsl(var(--foreground))] text-sm font-bold">
                    {data.well_depth}
                  </Text>
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs">
                    m
                  </Text>
                </View>
                <View className="flex-1 text-center">
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs font-medium mb-0.5">
                    Current GW
                  </Text>
                  <Text className="text-blue-600 text-sm font-bold">
                    {chartData.length > 0
                      ? chartData[chartData.length - 1]?.value?.toFixed(2)
                      : "N/A"}
                  </Text>
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs">
                    m
                  </Text>
                </View>
                <View className="flex-1 text-center">
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs font-medium mb-0.5">
                    MSL
                  </Text>
                  <Text className="text-[hsl(var(--foreground))] text-sm font-bold">
                    {data.mslmeter}
                  </Text>
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs">
                    {data.unit}
                  </Text>
                </View>
              </View>
            </View>

            {/* Data Timeline */}
            <View className="flex-1 bg-[hsl(var(--card))] rounded-md p-2 shadow-sm border border-[hsl(var(--border))]">
              <View className="flex-row items-center mb-1.5">
                <View className="bg-[hsl(var(--accent))] rounded p-1 mr-1.5">
                  <Calendar size={14} color="#dc2626" />
                </View>
                <Text className="text-[hsl(var(--muted-foreground))] text-xs font-semibold uppercase tracking-wide">
                  Data Availability
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs font-medium mb-0.5">
                    From
                  </Text>
                  <Text className="text-[hsl(var(--foreground))] text-xs font-semibold">
                    {new Date(data.data_available_from).toLocaleDateString()}
                  </Text>
                </View>
                <View className="w-px h-4 bg-[hsl(var(--border))] mx-1.5"></View>
                <View className="flex-1">
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs font-medium mb-0.5">
                    To
                  </Text>
                  <Text className="text-[hsl(var(--foreground))] text-xs font-semibold">
                    {new Date(data.data_available_Till).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Time Range Selector */}
        <View className="px-4 py-2">
          <Tabs value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="1D" className="text-xs">
                <Text>1D</Text>
              </TabsTrigger>
              <TabsTrigger value="5D" className="text-xs">
                <Text>5D</Text>
              </TabsTrigger>
              <TabsTrigger value="1M" className="text-xs">
                <Text>1M</Text>
              </TabsTrigger>
              <TabsTrigger value="6M" className="text-xs">
                <Text>6M</Text>
              </TabsTrigger>
              <TabsTrigger value="YTD" className="text-xs">
                <Text>YTD</Text>
              </TabsTrigger>
              <TabsTrigger value="1YR" className="text-xs">
                <Text>1YR</Text>
              </TabsTrigger>
              <TabsTrigger value="5YR" className="text-xs">
                <Text>5YR</Text>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Data Availability Info */}
          {data && (
            <View className="mt-2 p-2 bg-[hsl(var(--muted))] rounded-md">
              <Text className="text-[hsl(var(--muted-foreground))] text-xs text-center">
                Data available:{" "}
                {new Date(data.data_available_from).toLocaleDateString()} -{" "}
                {new Date(data.data_available_Till).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Space for Charts */}
        <View className="px-4 py-2">
          <View
            className="bg-[hsl(var(--card))] rounded-lg p-3 shadow-sm border border-[hsl(var(--border))] mx-auto"
            style={{ maxWidth: 340 }}
          >
            <Text className="text-[hsl(var(--foreground))] text-sm font-semibold mb-2 text-center">
              Groundwater Level Trend
            </Text>
            <View
              className="h-[200px] justify-center items-center mx-auto overflow-hidden"
              style={{
                width: Math.min(Dimensions.get("window").width - 40, 320),
                paddingBottom: 20, // Add padding for X-axis labels
              }}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#3b82f6" />
              ) : error ? (
                <View className="justify-center items-center w-full h-full">
                  <Text className="text-red-500 text-sm text-center">
                    {error}
                  </Text>
                </View>
              ) : chartData.length === 0 ? (
                <View className="justify-center items-center w-full h-full">
                  <Text className="text-gray-500 text-sm text-center">
                    No data available for selected time range
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    width:
                      Math.min(Dimensions.get("window").width - 40, 320) - 10,
                    height: 180, // Increased height for better label visibility
                  }}
                >
                  {(() => {
                    // Calculate adaptive Y-axis values
                    const values = chartData.map((d) => d.value);
                    const minVal = Math.min(...values);
                    const maxVal = Math.max(...values);
                    const avgVal =
                      values.reduce((sum, val) => sum + val, 0) / values.length;
                    const range = maxVal - minVal;

                    // Set Y-axis minimum to be near mean - 1.5 (between -1 and -2 as requested)
                    const targetOffset = Math.max(1, Math.min(2, range * 0.15)); // Adaptive offset: 1-2 units or 15% of range
                    const adaptiveMin = avgVal - targetOffset;

                    // Add padding above max (10% of range, minimum 0.1)
                    const paddingTop = Math.max(range * 0.1, 0.1);
                    const adaptiveMax = maxVal + paddingTop;

                    // Ensure adaptiveMin doesn't go below a reasonable floor
                    const reasonableFloor = Math.min(
                      avgVal * 0.7,
                      minVal * 0.9
                    );
                    const finalAdaptiveMin = Math.max(
                      adaptiveMin,
                      reasonableFloor
                    );

                    // Calculate adaptive step size
                    // Use fewer sections for better readability on mobile
                    const totalRange = adaptiveMax - finalAdaptiveMin;
                    const optimalSections =
                      totalRange > 3 ? 4 : totalRange > 1.5 ? 3 : 2;
                    const adaptiveStep = totalRange / optimalSections;

                    // Adaptive X-axis: show labels based on data length and time range
                    const getAdaptiveXLabels = (
                      data: any[],
                      timeRange: string
                    ) => {
                      switch (timeRange) {
                        case "1D":
                        case "5D":
                          // For short time ranges, show every 2nd label for better visibility
                          return data.map((item, index) => ({
                            ...item,
                            label: index % 2 === 0 ? item.label : "",
                          }));

                        case "1M":
                          // For monthly, show every 2nd label
                          return data.map((item, index) => ({
                            ...item,
                            label: index % 2 === 0 ? item.label : "",
                          }));

                        case "6M":
                        case "YTD":
                        case "1YR":
                          // For longer ranges, show every label (they're aggregated)
                          return data;

                        case "5YR":
                          // For 5 years, show all labels (they're yearly)
                          return data;

                        default:
                          // Default: show every 2nd label
                          return data.map((item, index) => ({
                            ...item,
                            label: index % 2 === 0 ? item.label : "",
                          }));
                      }
                    };

                    const adaptiveChartData = getAdaptiveXLabels(
                      chartData,
                      selectedTimeRange
                    );

                    console.log(
                      `Adaptive Y-axis: min=${finalAdaptiveMin.toFixed(2)}, max=${adaptiveMax.toFixed(2)}, step=${adaptiveStep.toFixed(2)}, mean=${avgVal.toFixed(2)}, offset=${targetOffset.toFixed(2)}`
                    );
                    console.log(
                      `X-axis: ${chartData.length} points, adaptive labels applied`
                    );

                    return chartData.length > 15 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        <LineChart
                          data={adaptiveChartData}
                          width={Math.max(320, chartData.length * 25)}
                          height={200}
                          spacing={15}
                          thickness={2}
                          color="#3b82f6"
                          startFillColor="#3b82f6"
                          endFillColor="#3b82f6"
                          startOpacity={0.3}
                          endOpacity={0.1}
                          initialSpacing={8}
                          endSpacing={8}
                          yAxisColor="#9ca3af"
                          xAxisColor="#9ca3af"
                          yAxisThickness={1}
                          xAxisThickness={1}
                          rulesColor="#e5e7eb"
                          rulesType="solid"
                          yAxisTextStyle={{
                            color: "#374151",
                            fontSize: 11,
                            fontWeight: "600",
                          }}
                          textFontSize={12}
                          hideDataPoints={false}
                          dataPointsColor="#3b82f6"
                          dataPointsRadius={2}
                          showVerticalLines={false}
                          showYAxisIndices={true}
                          showXAxisIndices={true}
                          xAxisIndicesHeight={3}
                          yAxisIndicesWidth={3}
                          adjustToWidth={false}
                          maxValue={adaptiveMax}
                          stepValue={adaptiveStep - 1}
                          yAxisOffset={adaptiveMax + 5}
                        />
                      </ScrollView>
                    ) : (
                      <LineChart
                          data={adaptiveChartData}
                          width={
                            Math.min(Dimensions.get("window").width - 40, 320) -
                            20
                          }
                          height={200}
                          spacing={Math.max(
                            8,
                            (Math.min(Dimensions.get("window").width - 40, 320) -
                              40) /
                            Math.max(chartData.length, 1)
                          )}
                          thickness={2}
                          color="#3b82f6"
                          startFillColor="#3b82f6"
                          endFillColor="#3b82f6"
                          startOpacity={0.3}
                          endOpacity={0.1}
                          initialSpacing={8}
                          endSpacing={8}
                          yAxisColor="#9ca3af"
                          xAxisColor="#9ca3af"
                          yAxisThickness={1}
                          xAxisThickness={1}
                          rulesColor="#e5e7eb"
                          rulesType="solid"
                          yAxisTextStyle={{
                            color: "#374151",
                            fontSize: 11,
                            fontWeight: "600",
                          }}
                          textFontSize={12}
                          hideDataPoints={chartData.length > 12}
                          dataPointsColor="#3b82f6"
                          dataPointsRadius={2}
                          showVerticalLines={false}
                          showYAxisIndices={true}
                          showXAxisIndices={true}
                          xAxisIndicesHeight={3}
                          yAxisIndicesWidth={3}
                          adjustToWidth={false}
                          maxValue={adaptiveMax}
                          stepValue={adaptiveStep - 1}
                          yAxisOffset={adaptiveMax + 5}
                      />
                    );
                  })()}
                </View>
              )}
            </View>
            {/* Data Summary */}
            {chartData.length > 0 && (
              <View className="mt-2 px-1">
                <View className="flex-row justify-between items-center bg-[hsl(var(--muted))] rounded-md p-2">
                  <View className="flex-1">
                    <Text className="text-[hsl(var(--muted-foreground))] text-xs font-medium">
                      Min
                    </Text>
                    <Text className="text-[hsl(var(--foreground))] text-sm font-semibold">
                      {Math.min(...chartData.map((d) => d.value)).toFixed(2)}m
                    </Text>
                  </View>
                  <View className="flex-1 text-center">
                    <Text className="text-[hsl(var(--muted-foreground))] text-xs font-medium">
                      Avg
                    </Text>
                    <Text className="text-[hsl(var(--foreground))] text-sm font-semibold">
                      {(
                        chartData.reduce((sum, d) => sum + d.value, 0) /
                        chartData.length
                      ).toFixed(2)}
                      m
                    </Text>
                  </View>
                  <View className="flex-1 text-right">
                    <Text className="text-[hsl(var(--muted-foreground))] text-xs font-medium">
                      Max
                    </Text>
                    <Text className="text-[hsl(var(--foreground))] text-sm font-semibold">
                      {Math.max(...chartData.map((d) => d.value)).toFixed(2)}m
                    </Text>
                  </View>
                </View>
                <Text className="text-[hsl(var(--muted-foreground))] text-xs text-center mt-1">
                  {chartData.length} data points • Last updated:{" "}
                  {new Date().toLocaleTimeString()}
                </Text>

                {/* Individual Data Points */}
                <View className="mt-3">
                  <Text className="text-[hsl(var(--foreground))] text-sm font-semibold mb-2">
                    Data Points
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="max-h-20"
                  >
                    <View className="flex-row gap-2">
                      {chartData.slice(0, 10).map((point, index) => (
                        <TouchableOpacity
                          key={index}
                          className="bg-[hsl(var(--card))] rounded-md p-2 min-w-20 border border-[hsl(var(--border))] active:bg-[hsl(var(--accent))]"
                          onPress={() => {
                            // Show detailed info (could be expanded to show more details)
                            console.log(`Data point ${index + 1}:`, point);
                          }}
                        >
                          <Text className="text-[hsl(var(--muted-foreground))] text-xs">
                            {point.label}
                          </Text>
                          <Text className="text-[hsl(var(--foreground))] text-sm font-semibold">
                            {point.value}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {chartData.length > 10 && (
                        <View className="bg-[hsl(var(--muted))] rounded-md p-2 justify-center items-center min-w-16">
                          <Text className="text-[hsl(var(--muted-foreground))] text-xs">
                            +{chartData.length - 10}
                          </Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                  {chartData.length > 10 && (
                    <Text className="text-[hsl(var(--muted-foreground))] text-xs text-center mt-1">
                      Showing first 10 points • Scroll for more
                    </Text>
                  )}
                  <Text className="text-[hsl(var(--muted-foreground))] text-xs text-center mt-1">
                    Tap any point for details
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
