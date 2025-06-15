import { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [session, setSession] = useState<Session | null>(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const isMounted = useRef(true);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    let mounted = true;
    isMounted.current = true;

    const initializeApp = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && isMounted.current) {
          setSession(session);
          setAppIsReady(true);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        if (mounted && isMounted.current) {
          setAppIsReady(true);
        }
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && isMounted.current) {
        setSession(session);
      }
    });

    return () => {
      mounted = false;
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && appIsReady && isMounted.current) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [fontsLoaded, fontError, appIsReady]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!appIsReady) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="success" />
          </>
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}