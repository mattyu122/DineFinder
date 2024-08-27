import { useStateContext } from '@/app/context/AuthContext';
import Login from '@/components/Authenication/Login';
import LoginUserProfile from '@/components/Authenication/LoginUserProfile';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

const Profile: React.FC = () => {
    const { user } = useStateContext();
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                { user ? <LoginUserProfile /> : <Login /> }
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    userData: {
        fontSize: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        color: 'red',
    },
});

export default Profile;
