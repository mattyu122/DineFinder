import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import SignUp from '@/components/Authenication/SignUp';
import { auth } from '@/config/firebaseConfig';
import { Role } from '@/enum/Role';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
// import analytics from '@react-native-firebase/analytics';
// import { analyticsInstance } from '@/config/firebaseConfig';

const Login: React.FC = () => {
    const { mode, setMode, setUser } = useStateContext();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // const logLoginEvent = async () => {
    //     try {
    //         await analytics().logLogin({
    //             method: 'email'
    //         })
    //         console.log('user login event log successfully')
    //     } catch (error) {
    //         console.error(`log event error: ${error}`)
    //     }
    // }

    const login = async (email: string, password: string) => {
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                const response = await axiosClient.post('/user/login', { email });
                const { userID, displayName, role, restaurantId, wishList } = response.data;
                if(role !== mode){
                    await signOut(auth)
                    alert(`Cannot find information in your ${role} account`)
                    return
                }

                if (role == 'NormalUser') {
                    setUser({
                        userID: userID,
                        displayName: displayName,
                        role: role,
                        wishList: wishList
                    });
                } else {
                    setUser({
                        userID: userID,
                        displayName: displayName,
                        role: role,
                        restaurantId: restaurantId,
                        wishList: wishList
                    });
                }

                console.log(`LOGIN: ${userID}, ${displayName}, ${role}, ${restaurantId}, ${wishList}`);
            }

        } catch (error) {
            console.error('Login failed:', error);
            setError('Login failed. Please check your credentials and try again.');
        }
    };

    const handleLogin = () => {
        setError(null);
        login(email, password);
        // logLoginEvent()
    };

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    // const { dismiss, dismissAll } = useBottomSheetModal();
    const GoToRestaurantStack = () => {
        setMode(Role.RESTAURANT)
        router.replace("/(restaurant)/Profile")
    }

    const GoToTabsStack = () => {
        setMode(Role.USER)
        router.replace("/(tabs)")
    }

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const snapPoints = useMemo(() => ['25%', '90%'], []);

    return (
        <BottomSheetModalProvider>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome to DineFinder!</Text>
                <TextInput
                    style={[styles.inputBase, styles.inputEmail]}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={[styles.inputBase, styles.inputPassword]}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {error && <Text style={styles.error}>{error}</Text>}
                <Pressable style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>

                {
                    mode === Role.USER ? (
                        <Pressable onPress={GoToRestaurantStack}>
                            <Text style={styles.signup}>I am restaurant owner</Text>
                        </Pressable>
                    ) : 
                        <Pressable onPress={GoToTabsStack}>
                            <Text style={styles.signup}>I am EATER!</Text>
                        </Pressable>
                }

                <Pressable onPress={handlePresentModalPress}>
                    <Text style={styles.signup}>SignUp</Text>
                </Pressable>
                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                    style={styles.sheetContainer}
                >
                    <BottomSheetView style={styles.BottomSheetContainer}>
                        <SignUp />
                    </BottomSheetView>
                </BottomSheetModal>
            </View>
        </BottomSheetModalProvider>
    );
};

const styles = StyleSheet.create({
    BottomSheetContainer: {
        flex: 1,
        alignItems: 'center',
    },
    sheetContainer: {
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: {
            width: 1,
            height: 1,
        },
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'left',
    },
    signup: {
        fontSize: 15,
        marginTop: 24,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    button: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
        elevation: 3,
        backgroundColor: '#DF6100',
        marginTop: 20,
    },
    buttonText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    inputBase: {
        height: 60,
        borderColor: 'gray',
        borderWidth: 0.5,
        paddingHorizontal: 12,
    },
    inputEmail: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 0,
    },
    inputPassword: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    error: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center',
    },
});

export default Login;