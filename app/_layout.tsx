import { Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
