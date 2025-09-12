import { NAV_THEME, THEME } from "@/lib/theme";
//@ts-ignore
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "./globals.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
        {/* Status bar background view */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor:
              colorScheme === "dark"
                ? THEME.dark.background
                : THEME.light.background,
            zIndex: -1,
          }}
        />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Slot />
        <PortalHost />

        {/* Bottom safe area background view */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: insets.bottom,
            backgroundColor:
              colorScheme === "dark"
                ? THEME.dark.background
                : THEME.light.background,
            zIndex: -1,
          }}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
