import { Cinzel_600SemiBold, Cinzel_700Bold, useFonts } from '@expo-google-fonts/cinzel';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { Fonts } from '@/constants/theme';
import { ThemeProvider, useAppTheme } from '@/contexts/theme-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [Fonts.display]: Cinzel_700Bold,
    [Fonts.displaySemi]: Cinzel_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { colors, scheme } = useAppTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.gold,
          headerTitleStyle: { fontFamily: Fonts.displaySemi, fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ presentation: 'modal', title: 'Aggiungi carta' }} />
        <Stack.Screen name="card/[id]" options={{ title: '' }} />
        <Stack.Screen name="deck-add" options={{ presentation: 'modal', title: 'Nuovo mazzo' }} />
        <Stack.Screen name="deck/[id]" options={{ title: '' }} />
      </Stack>
    </>
  );
}
