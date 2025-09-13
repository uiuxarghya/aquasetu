import { useCallback, useEffect, useState } from "react";

// Types for groundwater data
export interface DWLRStation {
  id: string;
  location: string;
  level: number;
  trend: "rising" | "falling" | "stable";
  status: "normal" | "warning" | "critical";
  lastReading: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface GroundwaterMetrics {
  averageWaterLevel: number;
  rechargeRate: number;
  annualExtraction: number;
  aquiferStress: number;
  trend: number; // Change from last month
}

export interface ResourceInsight {
  type: "critical" | "optimization" | "success";
  title: string;
  message: string;
  stationId?: string;
}

export interface MonitoringStatus {
  dwlrNetwork: {
    total: number;
    active: number;
    status: "operational" | "degraded" | "maintenance";
  };
  dataSync: {
    status: "real-time" | "delayed" | "offline";
    lastSync: string;
  };
  analytics: {
    status: "active" | "processing" | "error";
  };
  alerts: {
    status: "monitoring" | "active" | "maintenance";
    activeCount: number;
  };
}

// Mock data generator for dynamic updates
class GroundwaterDataService {
  private static instance: GroundwaterDataService;
  private baseStations: DWLRStation[] = [
    {
      id: "DWLR-001",
      location: "Yamuna Basin, Delhi",
      level: 8.2,
      trend: "falling",
      status: "critical",
      lastReading: "15 mins ago",
      coordinates: { lat: 28.6139, lng: 77.209 },
    },
    {
      id: "DWLR-045",
      location: "Ganges Basin, Uttar Pradesh",
      level: 12.5,
      trend: "falling",
      status: "warning",
      lastReading: "30 mins ago",
      coordinates: { lat: 25.3176, lng: 82.9739 },
    },
    {
      id: "DWLR-089",
      location: "Krishna Basin, Karnataka",
      level: 15.7,
      trend: "stable",
      status: "normal",
      lastReading: "1 hour ago",
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    {
      id: "DWLR-156",
      location: "Cauvery Basin, Tamil Nadu",
      level: 6.2,
      trend: "falling",
      status: "critical",
      lastReading: "45 mins ago",
      coordinates: { lat: 13.0827, lng: 80.2707 },
    },
  ];

  private baseMetrics: GroundwaterMetrics = {
    averageWaterLevel: 8.7,
    rechargeRate: 67,
    annualExtraction: 234,
    aquiferStress: 45,
    trend: 0, // Not used anymore, trend is generated dynamically
  };

  private baseInsights: ResourceInsight[] = [
    {
      type: "critical",
      title: "Critical Resource Alert",
      message:
        "Kolkata Delta DWLR-004 showing rapid aquifer depletion. Immediate conservation measures required.",
      stationId: "DWLR-004",
    },
    {
      type: "optimization",
      title: "Recharge Optimization",
      message:
        "Delhi NCR showing strong recharge potential. Recommend enhanced rainwater harvesting initiatives.",
      stationId: "DWLR-001",
    },
    {
      type: "success",
      title: "Sustainable Management",
      message:
        "Chennai Basin maintaining optimal groundwater balance. Continue current conservation strategies.",
      stationId: "DWLR-089",
    },
  ];

  static getInstance(): GroundwaterDataService {
    if (!GroundwaterDataService.instance) {
      GroundwaterDataService.instance = new GroundwaterDataService();
    }
    return GroundwaterDataService.instance;
  }

  // Generate dynamic station data with slight variations
  getStations(): DWLRStation[] {
    return this.baseStations.map((station) => ({
      ...station,
      level: this.generateVariation(station.level, 0.1),
      lastReading: this.generateLastReading(),
      trend: this.generateTrend(),
      status: this.generateStatus(station.level),
    }));
  }

  // Generate dynamic metrics
  getMetrics(): GroundwaterMetrics {
    return {
      averageWaterLevel: this.generateVariation(
        this.baseMetrics.averageWaterLevel,
        0.05
      ),
      rechargeRate: Math.max(
        0,
        Math.min(100, this.generateVariation(this.baseMetrics.rechargeRate, 2))
      ),
      annualExtraction: this.generateVariation(
        this.baseMetrics.annualExtraction,
        5
      ),
      aquiferStress: Math.max(
        0,
        Math.min(100, this.generateVariation(this.baseMetrics.aquiferStress, 3))
      ),
      trend: this.generateVariation(0, 0.3), // Generate trend around 0, can be positive or negative
    };
  }

  // Generate dynamic insights based on current data
  getInsights(): ResourceInsight[] {
    const stations = this.getStations();
    const metrics = this.getMetrics();

    return this.baseInsights.map((insight) => {
      if (insight.stationId) {
        const station = stations.find((s) => s.id === insight.stationId);
        if (station) {
          return {
            ...insight,
            message: this.updateInsightMessage(insight, station, metrics),
          };
        }
      }
      return insight;
    });
  }

  // Get monitoring status
  getMonitoringStatus(): MonitoringStatus {
    return {
      dwlrNetwork: {
        total: 5260,
        active: Math.round(this.generateVariation(5123, 10)),
        status: Math.random() > 0.95 ? "maintenance" : "operational",
      },
      dataSync: {
        status: Math.random() > 0.98 ? "delayed" : "real-time",
        lastSync: this.generateLastReading(),
      },
      analytics: {
        status: Math.random() > 0.99 ? "error" : "active",
      },
      alerts: {
        status: "monitoring",
        activeCount: Math.floor(Math.random() * 5),
      },
    };
  }

  private generateVariation(baseValue: number, variation: number): number {
    const change = (Math.random() - 0.5) * 2 * variation;
    return Math.round((baseValue + change) * 100) / 100;
  }

  private generateLastReading(): string {
    const minutes = Math.floor(Math.random() * 60);
    if (minutes < 5) return `${minutes + 1} mins ago`;
    if (minutes < 30) return `${Math.floor(minutes / 5) * 5} mins ago`;
    if (minutes < 60) return `${Math.floor(minutes / 10) * 10} mins ago`;
    return `${Math.floor(minutes / 60) + 1} hour${Math.floor(minutes / 60) > 1 ? "s" : ""} ago`;
  }

  private generateTrend(): "rising" | "falling" | "stable" {
    const rand = Math.random();
    if (rand < 0.3) return "rising";
    if (rand < 0.7) return "falling";
    return "stable";
  }

  private generateStatus(level: number): "normal" | "warning" | "critical" {
    if (level < 7) return "critical";
    if (level < 10) return "warning";
    return "normal";
  }

  private updateInsightMessage(
    insight: ResourceInsight,
    station: DWLRStation,
    metrics: GroundwaterMetrics
  ): string {
    switch (insight.type) {
      case "critical":
        return `${station.location.split(",")[0]} ${station.id} showing ${station.trend === "falling" ? "rapid" : "continued"} aquifer depletion. ${station.status === "critical" ? "Immediate" : "Urgent"} conservation measures required.`;
      case "optimization":
        return `${station.location.split(",")[0]} showing ${metrics.rechargeRate > 70 ? "strong" : "moderate"} recharge potential. Recommend enhanced rainwater harvesting initiatives.`;
      case "success":
        return `${station.location.split(",")[0]} maintaining optimal groundwater balance. Continue current conservation strategies.`;
      default:
        return insight.message;
    }
  }
}

// React hook for using dynamic groundwater data
export function useGroundwaterData(timeframe: string = "24h") {
  const [stations, setStations] = useState<DWLRStation[]>([]);
  const [metrics, setMetrics] = useState<GroundwaterMetrics | null>(null);
  const [insights, setInsights] = useState<ResourceInsight[]>([]);
  const [monitoringStatus, setMonitoringStatus] =
    useState<MonitoringStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const dataService = GroundwaterDataService.getInstance();

  const refreshData = useCallback(() => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setStations(dataService.getStations());
      setMetrics(dataService.getMetrics());
      setInsights(dataService.getInsights());
      setMonitoringStatus(dataService.getMonitoringStatus());
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 500);
  }, [dataService]);

  useEffect(() => {
    refreshData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Filter data based on timeframe
  const getFilteredStations = useCallback(() => {
    if (!stations.length) return [];

    // For demo purposes, we'll simulate different data based on timeframe
    // In a real app, this would filter based on actual time ranges
    const multiplier =
      {
        "24h": 1,
        "7d": 1.2,
        "30d": 1.5,
        "90d": 2.0,
      }[timeframe] || 1;

    return stations.map((station) => ({
      ...station,
      level: Math.round(station.level * multiplier * 100) / 100,
      trend: multiplier > 1.5 ? "falling" : station.trend,
      status:
        multiplier > 1.5 && station.level * multiplier < 8
          ? "critical"
          : multiplier > 1.2 && station.level * multiplier < 10
            ? "warning"
            : station.status,
    }));
  }, [stations, timeframe]);

  const getFilteredMetrics = useCallback(() => {
    if (!metrics) return null;

    // For different timeframes, simulate realistic trend variations
    // Longer timeframes might show different trends than short-term
    const trendVariations = {
      "24h": metrics.trend, // Keep original trend for 24h
      "7d": metrics.trend * 0.8 + (Math.random() - 0.3) * 0.3, // Slight positive bias
      "30d": (Math.random() - 0.3) * 0.8, // Slight positive bias for longer term
      "90d": (Math.random() - 0.2) * 0.6, // Even more positive bias for long term
    };

    const multiplier =
      {
        "24h": 1,
        "7d": 1.1,
        "30d": 1.3,
        "90d": 1.6,
      }[timeframe] || 1;

    return {
      ...metrics,
      averageWaterLevel:
        Math.round(metrics.averageWaterLevel * multiplier * 100) / 100,
      rechargeRate: Math.max(
        0,
        Math.min(
          100,
          Math.round((metrics.rechargeRate / multiplier) * 100) / 100
        )
      ),
      annualExtraction:
        Math.round(metrics.annualExtraction * multiplier * 100) / 100,
      aquiferStress: Math.min(
        100,
        Math.round(metrics.aquiferStress * multiplier * 100) / 100
      ),
      trend:
        Math.round(
          trendVariations[timeframe as keyof typeof trendVariations] * 100
        ) / 100,
    };
  }, [metrics, timeframe]);

  return {
    stations: getFilteredStations(),
    metrics: getFilteredMetrics(),
    insights,
    monitoringStatus,
    isLoading,
    lastUpdate,
    refreshData,
  };
}
