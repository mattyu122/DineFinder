import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import UserProfile from '../components/UserProfile';
// import AccountSettings from '../components/AccountSettings';
// import PrivacySettings from '../components/PrivacySettings';
import Booking from '@/app/(tabs)/UserBooking';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="UserProfile">
                <Stack.Screen name="UserProfile" component={Booking} />
                <Stack.Screen name="AccountSettings" component={Booking} />
                <Stack.Screen name="PrivacySettings" component={Booking} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
