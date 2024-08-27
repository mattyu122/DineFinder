import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { NotificationBehavior, Subscription } from 'expo-notifications';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  })
})
export default function TabLayout() {
  const {user} = useStateContext()
  const colorScheme = useColorScheme();
  const notificationListener = useRef<null | Subscription>(null);
  const responseListener = useRef<null| Subscription>(null);



  useEffect(()=>{
    try {
      if (user) {
        registerForPushNotificationsAsync().then(async token=>{
          console.log('🚀 ~ Expo Push Token:', token)
          console.log(`🚀 ~ user.data.restaurantId: ${user.restaurantId}`)
          if(token){
            await axiosClient.post(`/restaurant/${user.restaurantId}/updatePushNotificationToken`, {pushNotificationToken: token})
          }
    
        })
    
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        })
    
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response', response);
        })
    
        return () => {
          Notifications.removeNotificationSubscription(notificationListener.current as Subscription)
          Notifications.removeNotificationSubscription(responseListener.current as Subscription);
        }
      }
    } catch (error) {
      console.error('Error getting notifications:', error)
    }
  }, [user])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarLabelStyle: {
          fontFamily: 'mon-sb',
        }
        
        }}>
      <Tabs.Screen
        name="Booking"
        options={{
          tabBarLabel: 'Booking',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    try{
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
  
      console.log("🚀 ~ registerForPushNotificationsAsync ~ token:", token)
      return token;

    }catch(e: unknown){
      alert(`error message: ${e}`)
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

}
