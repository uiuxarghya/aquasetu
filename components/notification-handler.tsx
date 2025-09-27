import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    // Handle notification when app is in foreground
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "Notification received in foreground:",
          notification.request.content.title,
        );
      });

    // Handle notification when user taps on it
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { notification } = response;
        const data = notification.request.content.data;

        console.log("Notification tapped:", data);

        // Handle different notification types
        if (data?.type === "alert" && data?.screen === "alerts") {
          // Navigate to alerts screen
          router.push("/(drawer)/(tabs)/alerts");
        } else if (data?.type === "test") {
          // Handle test notification
          console.log("Test notification tapped");
        }
      });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [router]);

  return null;
}
