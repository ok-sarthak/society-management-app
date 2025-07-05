import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "../components/AppNavigator.jsx";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "black": require("../assets/fonts/Outfit-Black.ttf"),
    "bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "extrabold": require("../assets/fonts/Outfit-ExtraBold.ttf"),
    "extralight": require("../assets/fonts/Outfit-ExtraLight.ttf"),
    "medium": require("../assets/fonts/Outfit-Medium.ttf"),
    "regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "light": require("../assets/fonts/Outfit-Light.ttf"),
    "thin": require("../assets/fonts/Outfit-Thin.ttf"),
    "semibold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        if (fontsLoaded) {
          // Artificially delay for 1 second to simulate a slow loading experience
          await new Promise(resolve => setTimeout(resolve, 1000));
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return <AppNavigator />;
}