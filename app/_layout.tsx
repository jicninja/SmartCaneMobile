import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { soundService } from "@/services/SoundService";

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): JSX.Element | null {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Initialize sound service after fonts are loaded and app is ready
    if (loaded) {
      // Delay initialization to avoid "keep awake" errors
      const initTimer = setTimeout(() => {
        void soundService.initialize();
      }, 1000);

      return () => {
        clearTimeout(initTimer);
        // Cleanup on app unmount
        void soundService.release();
      };
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="dark" backgroundColor="#ffffff" />
    </ThemeProvider>
  );
}
