import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { notificationService } from "./utils/notifications";

interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  station: string;
  timestamp: string;
  priority: string;
  latitude: number;
  longitude: number;
  sensorId: string;
  lastReading: string;
  threshold: string;
  trend: string;
  affectedArea: string;
  recommendedAction: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
}

interface AlertsContextType {
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  alertCount: number;
  isLoading: boolean;
  error: string | null;
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => Promise<void>;
  removeAlert: (alertId: number) => Promise<void>;
  acknowledgeAlert: (alertId: number) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

const ALERTS_STORAGE_KEY = "@alerts_data";
const MAX_STORED_ALERTS = 100; // Limit stored alerts to prevent storage bloat

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }
  return context;
};

interface AlertsProviderProps {
  children: ReactNode;
}

export const AlertsProvider: React.FC<AlertsProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Save alerts to AsyncStorage
  const saveAlerts = useCallback(async (alertsToSave: Alert[]) => {
    try {
      // Limit the number of stored alerts to prevent storage bloat
      const limitedAlerts = alertsToSave.slice(-MAX_STORED_ALERTS);
      await AsyncStorage.setItem(
        ALERTS_STORAGE_KEY,
        JSON.stringify(limitedAlerts)
      );
    } catch (err) {
      console.error("Failed to save alerts:", err);
      setError("Failed to save alerts to storage");
    }
  }, []);

  // Load alerts from AsyncStorage on mount
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize notification service
        await notificationService.initialize();

        const storedAlerts = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
        if (storedAlerts) {
          const parsedAlerts = JSON.parse(storedAlerts) as Alert[];
          // Filter out old alerts (keep only last 7 days)
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const recentAlerts = parsedAlerts.filter(
            (alert) => new Date(alert.timestamp).getTime() > sevenDaysAgo
          );
          setAlerts(recentAlerts);
        } else {
          // Initialize with default alerts if no stored data
          const defaultAlerts: Alert[] = [
            {
              id: 1,
              type: "critical",
              title: "Critical Water Level Drop",
              message: "DWLR001 in Varanasi showing 15% drop in last 24 hours",
              station: "DWLR001 - Ganges Basin",
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              priority: "high",
              latitude: 25.3176,
              longitude: 82.9739,
              sensorId: "DWLR001-SENSOR-001",
              lastReading: "2.3m",
              threshold: "2.5m",
              trend: "Falling",
              affectedArea: "Varanasi District",
              recommendedAction:
                "Immediate water conservation measures required",
            },
            {
              id: 2,
              type: "warning",
              title: "Recharge Rate Declining",
              message: "Aquifer recharge rate below sustainable threshold",
              station: "DWLR002 - Yamuna Basin",
              timestamp: new Date(
                Date.now() - 5 * 60 * 60 * 1000
              ).toISOString(),
              priority: "medium",
              latitude: 28.6139,
              longitude: 77.209,
              sensorId: "DWLR002-SENSOR-002",
              lastReading: "45%",
              threshold: "50%",
              trend: "Declining",
              affectedArea: "Delhi NCR Region",
              recommendedAction:
                "Monitor rainfall patterns and implement recharge programs",
            },
            {
              id: 3,
              type: "info",
              title: "Maintenance Scheduled",
              message: "Routine maintenance scheduled for DWLR003 tomorrow",
              station: "DWLR003 - Cauvery Basin",
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
              priority: "low",
              latitude: 12.9716,
              longitude: 77.5946,
              sensorId: "DWLR003-SENSOR-003",
              lastReading: "3.8m",
              threshold: "4.0m",
              trend: "Stable",
              affectedArea: "Bangalore Metropolitan Area",
              recommendedAction:
                "Scheduled maintenance will be completed by EOD",
            },
          ];
          setAlerts(defaultAlerts);
          await saveAlerts(defaultAlerts);
        }
      } catch (err) {
        console.error("Failed to load alerts:", err);
        setError("Failed to load alerts from storage");
        // Fallback to empty array
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, [saveAlerts]);

  // Save alerts whenever the alerts state changes
  useEffect(() => {
    if (!isLoading) {
      saveAlerts(alerts);
    }
  }, [alerts, isLoading, saveAlerts]);

  // Computed values
  const alertCount = useMemo(() => alerts.length, [alerts]);

  // Alert management functions
  const addAlert = useCallback(
    async (alertData: Omit<Alert, "id" | "timestamp">) => {
      try {
        const newAlert: Alert = {
          ...alertData,
          id: Date.now(),
          timestamp: new Date().toISOString(),
        };
        setAlerts((prev) => [newAlert, ...prev]);

        // Send push notification for the new alert
        await notificationService.sendAlertNotification({
          alertId: newAlert.id,
          type: newAlert.type,
          title: newAlert.title,
          message: newAlert.message,
          station: newAlert.station,
          priority: newAlert.priority,
        });
      } catch (err) {
        console.error("Failed to add alert:", err);
        setError("Failed to add alert");
      }
    },
    []
  );

  const removeAlert = useCallback(async (alertId: number) => {
    try {
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (err) {
      console.error("Failed to remove alert:", err);
      setError("Failed to remove alert");
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: number) => {
    try {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                acknowledged: true,
                acknowledgedAt: new Date().toISOString(),
              }
            : alert
        )
      );
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
      setError("Failed to acknowledge alert");
    }
  }, []);

  const clearAllAlerts = useCallback(async () => {
    try {
      setAlerts([]);
    } catch (err) {
      console.error("Failed to clear alerts:", err);
      setError("Failed to clear alerts");
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedAlerts = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
      if (storedAlerts) {
        const parsedAlerts = JSON.parse(storedAlerts) as Alert[];
        setAlerts(parsedAlerts);
      }
    } catch (err) {
      console.error("Failed to refresh alerts:", err);
      setError("Failed to refresh alerts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      alerts,
      setAlerts,
      alertCount,
      isLoading,
      error,
      addAlert,
      removeAlert,
      acknowledgeAlert,
      clearAllAlerts,
      refreshAlerts,
    }),
    [
      alerts,
      alertCount,
      isLoading,
      error,
      addAlert,
      removeAlert,
      acknowledgeAlert,
      clearAllAlerts,
      refreshAlerts,
    ]
  );

  return (
    <AlertsContext.Provider value={contextValue}>
      {children}
    </AlertsContext.Provider>
  );
};
