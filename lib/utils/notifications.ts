import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const NOTIFICATIONS_SETTINGS_KEY = "@notifications_settings";

/**
 * Local Notification Service
 *
 * This service handles LOCAL notifications only - notifications that are
 * scheduled and displayed locally on the device. No server or remote
 * notification service is required.
 *
 * Features:
 * - Schedule local notifications for alerts
 * - Manage notification permissions
 * - Persistent user preferences
 * - Test notifications for debugging
 */

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  criticalAlertsOnly: boolean;
}

export interface AlertNotificationData {
  alertId: number;
  type: string;
  title: string;
  message: string;
  station: string;
  priority: string;
}

class NotificationService {
  private settings: NotificationSettings = {
    enabled: true,
    sound: true,
    vibration: true,
    criticalAlertsOnly: false,
  };

  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load saved settings
      await this.loadSettings();

      // Set up notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: this.settings.sound,
          shouldSetBadge: true,
          shouldShowBanner: this.settings.enabled,
          shouldShowList: this.settings.enabled,
        }),
      });

      // Request permissions
      await this.requestPermissions();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Notification permissions not granted");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to request notification permissions:", error);
      return false;
    }
  }

  private getAlertEmoji(type: string): string {
    switch (type) {
      case "critical":
        return "🚨";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
    }
  }

  private formatNotificationContent(alertData: AlertNotificationData): {
    title: string;
    body: string;
  } {
    const stationInfo = `DWLR ${alertData.station}`;

    switch (alertData.type) {
      case "critical":
        return {
          title: `${this.getAlertEmoji(alertData.type)} Critical Groundwater Alert`,
          body: `${stationInfo}: ${alertData.message} - Immediate evaluation required.`,
        };
      case "warning":
        return {
          title: `${this.getAlertEmoji(alertData.type)} Groundwater Resource Warning`,
          body: `${stationInfo}: ${alertData.message} - Monitor resource levels closely.`,
        };
      case "info":
        return {
          title: `${this.getAlertEmoji(alertData.type)} Groundwater Evaluation Update`,
          body: `${stationInfo}: ${alertData.message} - Resource assessment completed.`,
        };
      default:
        return {
          title: `${this.getAlertEmoji(alertData.type)} ${alertData.title}`,
          body: `${stationInfo}: ${alertData.message}`,
        };
    }
  }

  async sendAlertNotification(alertData: AlertNotificationData): Promise<void> {
    if (!this.settings.enabled) return;

    // Check if we should send notification based on settings
    if (this.settings.criticalAlertsOnly && alertData.priority !== "critical") {
      return;
    }

    try {
      const content = this.formatNotificationContent(alertData);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: {
            alertId: alertData.alertId,
            type: "alert",
            screen: "alerts",
          },
          sound: this.settings.sound ? "default" : undefined,
          priority:
            alertData.priority === "critical"
              ? "max"
              : alertData.priority === "warning"
                ? "high"
                : "default",
          sticky: alertData.priority === "critical",
        },
        trigger: null, // Send immediately
      });

      console.log("Groundwater alert notification scheduled:", notificationId);
    } catch (error) {
      console.error("Failed to send groundwater alert notification:", error);
    }
  }

  async sendTestNotification(): Promise<void> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧪 AquaSetu Test Notification",
          body: "Groundwater monitoring system is active and functioning properly.",
          data: { type: "test" },
          sound: this.settings.sound ? "default" : undefined,
        },
        trigger: null,
      });

      console.log("Test notification sent:", notificationId);
    } catch (error) {
      console.error("Failed to send test notification:", error);
    }
  }

  async updateSettings(
    newSettings: Partial<NotificationSettings>
  ): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };

    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_SETTINGS_KEY,
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error("Failed to save notification settings:", error);
    }
  }

  async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATIONS_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  async getBadgeCount(): Promise<number> {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      console.error("Failed to get badge count:", error);
      return 0;
    }
  }

  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error("Failed to clear badge:", error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to cancel notifications:", error);
    }
  }
}

export const notificationService = new NotificationService();
