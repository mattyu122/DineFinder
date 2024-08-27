import {Tabs, router} from 'expo-router';
import React, { useState, useEffect } from 'react';
import {TabBarIcon} from '@/components/navigation/TabBarIcon';
import Colors from '@/constants/Colors';
import {useColorScheme} from '@/hooks/useColorScheme';
// import { auth } from '@/config/firebaseConfig';
import { useStateContext } from '@/app/context/AuthContext';


export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { user } = useStateContext();
    const [currentRole, setCurrentRole] = useState('normal');

    useEffect(() => {
        if ( user && user.role === 'Restaurant' ){
            setCurrentRole('restaurant')
        } else {
            setCurrentRole('normal')
        }
        console.log(`TAB: ${currentRole}`)
    }, [user])

    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            tabBarLabelStyle: {
                fontFamily: 'mon-sb',
            },
        }}>
        <Tabs.Screen
            name="index"
            options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({color, focused}) => (
                    <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color}/>
                ),
            }}
        />
        <Tabs.Screen
            name="Wishlist"
            options={{
                headerShown: false,
                tabBarLabel: 'Wishlists',
                tabBarIcon: ({color, focused}) => (
                    <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color}/>
                ),
            }}
            redirect={currentRole == 'restaurant'}
        />
        <Tabs.Screen
            name="UserBooking"
            options={{
                headerShown: false,
                tabBarLabel: 'Booking',
                tabBarIcon: ({color, focused}) => (
                    <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color}/>
                ),
            }}
            redirect={currentRole == 'restaurant'}
        />
        <Tabs.Screen
            name="UserProfile"
            options={{
                headerShown: false,
                tabBarLabel: 'Profile',
                tabBarIcon: ({color, focused}) => (
                    <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color}/>
                ),
            }}
            redirect={currentRole == 'restaurant'}
        />
        <Tabs.Screen
            name="RestaurantProfile"
            options={{
                headerShown: false,
                tabBarLabel: 'Profile',
                tabBarIcon: ({color, focused}) => (
                    <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color}/>
                ),
            }}
            redirect={currentRole !== 'restaurant'}
        />
    </Tabs>
    );
}
