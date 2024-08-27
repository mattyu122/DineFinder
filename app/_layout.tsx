import { ContextProvider } from '@/app/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Reservation } from '@/types/Reservation/ReservationDetail';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ParamListBase, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import 'react-native-reanimated';
import 'regenerator-runtime/runtime';
import VersionCheck from 'react-native-version-check';
import '@/app/ignoreWarning'
//deeplink url -> dinefinder://
import analytics from '@react-native-firebase/analytics';
// import { analyticsInstance } from '@/config/firebaseConfig';

export {
  ErrorBoundary
} from "expo-router";


export type RootStackParamList = {
  BookingConfirm: {
    restaurant: Restaurant;
    reservation: Reservation;
  };
} & ParamListBase;

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    logAppOpenEvent()
  },[])

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    console.log(`Current Build Number: ${VersionCheck.getCurrentBuildNumber()}`); 
    console.log(`Current Version: ${VersionCheck.getCurrentVersion()}`);   
  },[])

  const logAppOpenEvent = async() => {
    try{
      await analytics().logAppOpen()
      console.log('log app open event successfully')
    }catch(error){
      console.error(`log event error: ${error}`)
    }
  }

  // Initialize google ads
  useEffect(() => {
    mobileAds().initialize()
  }, [])



  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  } 

  return (
    <ContextProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName={'(tabs)'} >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="listing/[id]" options={{ headerTitle: '' }} />
            <Stack.Screen name="BookingConfirmation/BookingConfirm" options={{
              headerTitle: 'Book Now'}} />
            <Stack.Screen name="BookingConfirmation/BookingSuccess" options={{ headerTitle: '' }} />
            <Stack.Screen name="(modals)/searching"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
                headerTransparent: true,
                headerTitle: '',
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                      backgroundColor: '#fff',
                      borderColor: 'gray',
                      borderRadius: 20,
                      borderWidth: 1,
                      padding: 4,
                    }}>
                    <Ionicons name='close-outline' size={22} />
                  </TouchableOpacity>
                )
              }}
            />
            <Stack.Screen name="(restaurant)" options={{headerShown: false, headerTitle: 'Restaurant'}} />
            <Stack.Screen name="addRestaurant" options={{headerShown: true, headerTitle: 'Add Restaurant'}} />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ContextProvider>

  );
}
