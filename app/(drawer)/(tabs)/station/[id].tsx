import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import client from "@/lib/appwrite.config";
import { addBookmark, isBookmarked } from "@/lib/utils/db";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { LineChart } from "react-native-gifted-charts";

import {
  Building2,
  Calendar,
  CheckCircle,
  MapPin,
  Navigation,
  Wrench,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { Account } from "react-native-appwrite";

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

const mockData = {
  date_of_establishment: null,
  classified: "No",
  flood_forecast: "No",
  warning_level: null,
  danger_level: null,
  highest_flow_level_date: null,
  highest_flow_level: null,
  water_level_data_available_from: null,
  discharge_data_available: "No",
  reduced_level_of_zero_gauge: null,
  mslmeter: 5.2,
  unit: "m",
  block: null,
  village: null,
  well_type: null,
  well_depth: 251.4,
  well_aquifer_type: "Confined",
  tributary_id: null,
  independent_river: null,
  sub_Tributary: null,
  data_Acquisition_Mode: "Telemetric",
  station_Status: "Active",
  station_Type: "Ground Water",
  data_available_from: "2023-01-03",
  data_available_Till: "2025-09-13",
  state_Code: "25",
  district_Id: 119018,
  basin_Code: null,
  major_Basin: null,
  agency_Name: "CGWB",
  station_Code: "CGWB1WBKOL022",
  station_Name: "Salt Lake Pz_1",
  saved_By_Userid: 848,
  save_date: "2023-05-02T00:00:00",
  state: "West Bengal",
  agencyId: 113,
  latitude: 22.576,
  longitude: 88.4385,
  district: "KOLKATA",
  tributary: null,
  tehsil: "-",
};

const oneDayData = [
  {
    label: "00:00:00",
    value: 9.44,
  },
  {
    label: "06:00:00",
    value: 9.4,
  },
  {
    label: "12:00:00",
    value: 9.29,
  },
  {
    label: "18:00:00",
    value: 9.35,
  },
  {
    label: "00:00:00",
    value: 9.39,
  },
];

export default function StationDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<StationData | null>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isbooked, setIsBooked] = useState<Boolean>(false);
  const account = new Account(client);

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
    // fetchData();
  }, [id]);

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
    <SafeAreaView className="flex-1 bg-background">
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
                    Aquifer
                  </Text>
                  <Text className="text-[hsl(var(--foreground))] text-xs font-semibold">
                    {data.well_aquifer_type}
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

        {/* Space for Charts */}
        <View className="h-[300px] w-[600px]">
          <View className="flex-1 justify-center items-center">
            <LineChart
              spacing={60}
              data={oneDayData}
              width={600}
              height={250}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
