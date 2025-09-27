import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { useAuth } from "@/lib/utils/auth";
import {
  fetchStates,
  getAgencyList,
  getBlockList,
  getDistrictByState,
  getStationDSList,
  getTahsilList,
} from "@/lib/utils/search";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Search() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? THEME.dark : THEME.light;

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  const [searchType, setSearchType] = useState<"GWATERLVL" | "RAINF">(
    "GWATERLVL",
  );
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Hierarchical selection states
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [tahsils, setTahsils] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);

  // Selected values
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTahsil, setSelectedTahsil] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [selectedTelemetric, setSelectedTelemetric] = useState<string>("");

  // Loading states
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTahsils, setLoadingTahsils] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(false);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Load initial states data
  useEffect(() => {
    console.log("States useEffect triggered for searchType:", searchType);
    const loadStates = async () => {
      console.log("Loading states for type:", searchType);
      setLoadingStates(true);
      try {
        const data = await fetchStates(searchType);
        console.log("States loaded:", data);
        setStates(data || []);
      } catch (error) {
        console.error("Failed to load states:", error);
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, [searchType]);

  // Load districts when state is selected
  useEffect(() => {
    console.log("District useEffect triggered:", { selectedState, searchType });
    if (selectedState) {
      const loadDistricts = async () => {
        console.log("Loading districts for state:", selectedState);
        setLoadingDistricts(true);
        try {
          const data = await getDistrictByState(selectedState, searchType);
          console.log("Districts loaded:", data);
          setDistricts(data || []);
          // Reset dependent selections after a short delay to prevent viewState issues
          setTimeout(() => {
            console.log("Resetting dependent selections after district load");
            setSelectedDistrict("");
            setSelectedTahsil("");
            setSelectedBlock("");
            setSelectedAgency("");
            setSelectedTelemetric("");
            setTahsils([]);
            setBlocks([]);
            setAgencies([]);
          }, 100);
        } catch (error) {
          console.error("Failed to load districts:", error);
        } finally {
          setLoadingDistricts(false);
        }
      };
      loadDistricts();
    } else {
      console.log("Clearing districts - no state selected");
      // Clear districts when no state is selected
      setDistricts([]);
      setSelectedDistrict("");
      setSelectedTahsil("");
      setSelectedBlock("");
      setSelectedAgency("");
      setSelectedTelemetric("");
      setTahsils([]);
      setBlocks([]);
      setAgencies([]);
    }
  }, [selectedState, searchType]);

  // Load tahsils when district is selected
  useEffect(() => {
    console.log("Tahsil useEffect triggered:", {
      selectedDistrict,
      selectedState,
      searchType,
    });
    if (selectedDistrict) {
      const loadTahsils = async () => {
        console.log("Loading tahsils for district:", selectedDistrict);
        setLoadingTahsils(true);
        try {
          const data = await getTahsilList(
            selectedState,
            selectedDistrict,
            searchType,
          );
          console.log("Tahsils loaded:", data);
          setTahsils(data || []);
          // Reset dependent selections after a short delay
          setTimeout(() => {
            console.log("Resetting dependent selections after tahsil load");
            setSelectedTahsil("");
            setSelectedBlock("");
            setSelectedAgency("");
            setSelectedTelemetric("");
            setBlocks([]);
            setAgencies([]);
          }, 100);
        } catch (error) {
          console.error("Failed to load tahsils:", error);
        } finally {
          setLoadingTahsils(false);
        }
      };
      loadTahsils();
    } else {
      console.log("Clearing tahsils - no district selected");
      // Clear tahsils when no district is selected
      setTahsils([]);
      setSelectedTahsil("");
      setSelectedBlock("");
      setSelectedAgency("");
      setSelectedTelemetric("");
      setBlocks([]);
      setAgencies([]);
    }
  }, [selectedDistrict, selectedState, searchType]);

  // Load blocks when tahsil is selected
  useEffect(() => {
    if (selectedTahsil) {
      const loadBlocks = async () => {
        setLoadingBlocks(true);
        try {
          const data = await getBlockList(
            selectedState,
            selectedDistrict,
            selectedTahsil,
            searchType,
          );
          setBlocks(data || []);
          // Reset dependent selections after a short delay
          setTimeout(() => {
            setSelectedBlock("");
            setSelectedAgency("");
            setSelectedTelemetric("");
            setAgencies([]);
          }, 100);
        } catch (error) {
          console.error("Failed to load blocks:", error);
        } finally {
          setLoadingBlocks(false);
        }
      };
      loadBlocks();
    } else {
      // Clear blocks when no tahsil is selected
      setBlocks([]);
      setSelectedBlock("");
      setSelectedAgency("");
      setSelectedTelemetric("");
      setAgencies([]);
    }
  }, [selectedTahsil, selectedDistrict, selectedState, searchType]);

  // Load agencies when block is selected
  useEffect(() => {
    if (selectedBlock) {
      const loadAgencies = async () => {
        setLoadingAgencies(true);
        try {
          const data = await getAgencyList(
            selectedDistrict,
            searchType,
            "0",
            "0",
            selectedTahsil,
            selectedBlock,
          );
          setAgencies(data || []);
          // Reset dependent selections after a short delay
          setTimeout(() => {
            setSelectedAgency("");
            setSelectedTelemetric("");
          }, 100);
        } catch (error) {
          console.error("Failed to load agencies:", error);
        } finally {
          setLoadingAgencies(false);
        }
      };
      loadAgencies();
    } else {
      // Clear agencies when no block is selected
      setAgencies([]);
      setSelectedAgency("");
      setSelectedTelemetric("");
      setSelectedTelemetric("");
    }
  }, [selectedBlock, selectedDistrict, selectedTahsil, searchType]);

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-lg text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const handleSearch = () => {
    setIsSearching(true);
    if (selectedAgency && selectedTelemetric) {
      const loadStations = async () => {
        try {
          const data = await getStationDSList(
            selectedDistrict,
            selectedAgency,
            searchType,
            selectedTelemetric,
          );

          setSearchResults(data || []);
          // Reset dependent selection after a short delay
          setTimeout(() => {
            setSelectedTelemetric("");
          }, 100);
        } catch (error) {
          console.error("Failed to load stations:", error);
        } finally {
          setIsSearching(false);
        }
      };
      loadStations();
    } else {
      setIsSearching(false);
      // Clear stations when no agency or telemetric is selected

      setSelectedTelemetric("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "critical":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="items-start mb-4">
          <Text className="text-xl font-bold text-foreground">
            Search Stations
          </Text>
        </View>

        {/* Search Type Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search By</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row gap-2">
              <Button
                variant={searchType === "GWATERLVL" ? "default" : "outline"}
                onPress={() => setSearchType("GWATERLVL")}
                className="flex-1"
              >
                <Ionicons
                  name="water"
                  size={16}
                  color={
                    searchType === "GWATERLVL"
                      ? theme.primaryForeground
                      : theme.primary
                  }
                />
                <Text
                  className={` ${searchType === "GWATERLVL" ? "text-primary-foreground" : "text-primary"}`}
                >
                  GW Level
                </Text>
              </Button>
              <Button
                variant={searchType === "RAINF" ? "default" : "outline"}
                onPress={() => setSearchType("RAINF")}
                className="flex-1"
              >
                <Ionicons
                  name="rainy"
                  size={16}
                  color={
                    searchType === "RAINF"
                      ? theme.primaryForeground
                      : theme.primary
                  }
                />
                <Text
                  className={`ml-2 ${searchType === "RAINF" ? "text-primary-foreground" : "text-primary"}`}
                >
                  Rainfall
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* GW Level Search Form */}
        {searchType === "GWATERLVL" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Search by GW Level</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View>
                <Label className="text-foreground mb-2">State</Label>
                <Select
                  value={
                    selectedState
                      ? {
                          value: selectedState,
                          label:
                            states.find((s) => s.statecode === selectedState)
                              ?.state || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) => {
                    console.log("GWATERLVL State selected:", value);
                    setSelectedState(value?.value || "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent insets={contentInsets}>
                    <NativeSelectScrollView className="max-h-64 overflow-y-auto">
                      {loadingStates ? (
                        <SelectItem
                          value=""
                          label="Loading states..."
                          disabled
                        />
                      ) : (
                        states.map((state) => (
                          <SelectItem
                            key={state.statecode}
                            value={state.statecode}
                            label={state.state}
                          />
                        ))
                      )}
                    </NativeSelectScrollView>
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">District</Label>
                <Select
                  value={
                    selectedDistrict
                      ? {
                          value: selectedDistrict,
                          label:
                            districts.find(
                              (d) => d.district_id === selectedDistrict,
                            )?.districtname || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedDistrict(value?.value || "")
                  }
                  disabled={!selectedState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDistricts ? (
                      <SelectItem
                        value=""
                        label="Loading districts..."
                        disabled
                      />
                    ) : (
                      districts.map((district) => (
                        <SelectItem
                          key={district.district_id}
                          value={district.district_id}
                          label={district.districtname}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">Tahsil</Label>
                <Select
                  value={
                    selectedTahsil
                      ? {
                          value: selectedTahsil,
                          label:
                            tahsils.find((t) => t.tahsil_id === selectedTahsil)
                              ?.tahsilname || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedTahsil(value?.value || "")
                  }
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tahsil" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingTahsils ? (
                      <SelectItem
                        value=""
                        label="Loading tahsils..."
                        disabled
                      />
                    ) : (
                      tahsils.map((tahsil) => (
                        <SelectItem
                          key={tahsil.tahsil_id}
                          value={tahsil.tahsil_id}
                          label={tahsil.tahsilname}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">Block</Label>
                <Select
                  value={
                    selectedBlock
                      ? {
                          value: selectedBlock,
                          label:
                            blocks.find((b) => b.block_id === selectedBlock)
                              ?.blockname || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedBlock(value?.value || "")
                  }
                  disabled={!selectedTahsil}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a block" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingBlocks ? (
                      <SelectItem value="" label="Loading blocks..." disabled />
                    ) : (
                      blocks.map((block) => (
                        <SelectItem
                          key={block.block_id}
                          value={block.block_id}
                          label={block.blockname}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">Agency</Label>
                <Select
                  value={
                    selectedAgency
                      ? {
                          value: selectedAgency,
                          label:
                            agencies.find((a) => a.agencyid === selectedAgency)
                              ?.agencyname || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedAgency(value?.value || "")
                  }
                  disabled={!selectedBlock}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingAgencies ? (
                      <SelectItem
                        value=""
                        label="Loading agencies..."
                        disabled
                      />
                    ) : (
                      agencies.map((agency) => (
                        <SelectItem
                          key={agency.agencyid}
                          value={agency.agencyid}
                          label={agency.agencyname}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">Data Type</Label>
                <Select
                  value={
                    selectedTelemetric
                      ? {
                          value: selectedTelemetric,
                          label:
                            selectedTelemetric === "1"
                              ? "Telemetric"
                              : "Manual",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedTelemetric(value?.value || "")
                  }
                  disabled={!selectedAgency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={1} value="1" label="Telemetric" />
                    <SelectItem key={0} value="0" label="Manual" />
                  </SelectContent>
                </Select>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Station Search Form */}
        {/* {searchType === "RAINF" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Search by Rainfall</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View>
                <Label className="text-foreground mb-2">State</Label>
                <Select
                  value={
                    selectedState
                      ? {
                          value: selectedState,
                          label:
                            states.find((s) => s.statecode === selectedState)
                              ?.state || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedState(value?.value || "")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStates ? (
                      <SelectItem value="" label="Loading states..." disabled />
                    ) : (
                      states.map((state) => (
                        <SelectItem
                          key={state.statecode}
                          value={state.statecode}
                          label={state.state}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">District</Label>
                <Select
                  value={
                    selectedDistrict
                      ? {
                          value: selectedDistrict,
                          label:
                            districts.find(
                              (d) => d.district_id === selectedDistrict
                            )?.districtname || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedDistrict(value?.value || "")
                  }
                  disabled={!selectedState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDistricts ? (
                      <SelectItem
                        value=""
                        label="Loading districts..."
                        disabled
                      />
                    ) : (
                      districts.map((district) => (
                        <SelectItem
                          key={district.district_id}
                          value={district.district_id}
                          label={district.districtname}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">Tahsil</Label>
                <Select
                  value={
                    selectedTahsil
                      ? {
                          value: selectedTahsil,
                          label:
                            tahsils.find((t) => t.tehsil_id === selectedTahsil)
                              ?.tahsilname || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedTahsil(value?.value || "")
                  }
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tahsil" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingTahsils ? (
                      <SelectItem
                        value=""
                        label="Loading tahsils..."
                        disabled
                      />
                    ) : (
                      tahsils.map((tahsil) => (
                        <SelectItem
                          key={tahsil.tehsil_id}
                          value={tahsil.tehsil_id}
                          label={tahsil.tahsilname}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">Block</Label>
                <Select
                  value={
                    selectedBlock
                      ? {
                          value: selectedBlock,
                          label:
                            blocks.find((b) => b.block_id === selectedBlock)
                              ?.blockname || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedBlock(value?.value || "")
                  }
                  disabled={!selectedTahsil}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a block" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingBlocks ? (
                      <SelectItem value="" label="Loading blocks..." disabled />
                    ) : (
                      blocks.map((block) => (
                        <SelectItem
                          key={block.block_id}
                          value={block.block_id}
                          label={block.blockname}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">Agency</Label>
                <Select
                  value={
                    selectedAgency
                      ? {
                          value: selectedAgency,
                          label:
                            agencies.find((a) => a.agencyid === selectedAgency)
                              ?.agencyname || "",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedAgency(value?.value || "")
                  }
                  disabled={!selectedBlock}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingAgencies ? (
                      <SelectItem
                        value=""
                        label="Loading agencies..."
                        disabled
                      />
                    ) : (
                      agencies.map((agency) => (
                        <SelectItem
                          key={agency.agencyid}
                          value={agency.agencyid}
                          label={agency.agencyname}
                        />
                      ))
                    )}
                  </SelectContent>
                </Select>
              </View>

              <View>
                <Label className="text-foreground mb-2">Data Type</Label>
                <Select
                  value={
                    selectedTelemetric
                      ? {
                          value: selectedTelemetric,
                          label:
                            selectedTelemetric === "1"
                              ? "Telemetric"
                              : "Manual",
                        }
                      : undefined
                  }
                  onValueChange={(value) =>
                    setSelectedTelemetric(value?.value || "")
                  }
                  disabled={!selectedAgency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1" label="Telemetric" />
                    <SelectItem value="0" label="Manual" />
                  </SelectContent>
                </Select>
              </View>
            </CardContent>
          </Card>
        )} */}

        {/* Search Button */}
        <Button
          onPress={handleSearch}
          className="w-full mb-6"
          disabled={isSearching || !selectedAgency || !selectedTelemetric}
        >
          <Ionicons
            name={isSearching ? "refresh" : "search"}
            size={16}
            color={theme.primaryForeground}
          />
          <Text className="text-primary-foreground font-semibold ml-2">
            {isSearching ? "Searching..." : "Search"}
          </Text>
        </Button>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Search Results</CardTitle>
              <CardDescription>
                {searchResults.length} stations found
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.stationcode}
                  onPress={() => router.push(`/station/${result.stationcode}`)}
                  className="border border-border rounded-lg p-4"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold text-foreground flex-1 mr-2">
                      {result.stationname}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name={getStatusIcon(result.status) as any}
                        size={16}
                        color={
                          result.status === "normal"
                            ? "#10b981"
                            : result.status === "warning"
                              ? "#f59e0b"
                              : result.status === "critical"
                                ? "#ef4444"
                                : theme.mutedForeground
                        }
                      />
                      <Text
                        className={`text-sm ml-1 ${getStatusColor(result.status)}`}
                      >
                        {result.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="navigate"
                        size={14}
                        color={theme.mutedForeground}
                      />
                      <Text className="text-sm text-muted-foreground ml-1">
                        {result.stationcode}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => router.push(`/station/${result.id}`)}
                      >
                        <Ionicons name="eye" size={12} color={theme.primary} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => router.push("/map")}
                      >
                        <Ionicons name="map" size={12} color={theme.primary} />
                      </Button>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {searchResults.length === 0 && !isSearching && (
          <Card>
            <CardContent className="items-center py-12">
              <Ionicons
                name="search-outline"
                size={48}
                color={theme.mutedForeground}
              />
              <Text className="text-lg font-medium text-muted-foreground mt-4 mb-2">
                No results yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-6">
                Enter search criteria and tap search to find monitoring stations
              </Text>
              <Button onPress={() => router.push("/map")}>
                <Ionicons
                  name="map"
                  size={16}
                  color={theme.primaryForeground}
                />
                <Text className="ml-2 text-primary-foreground">
                  View All Stations
                </Text>
              </Button>
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
