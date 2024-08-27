import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import { auth } from '@/config/firebaseConfig';
import Colors from '@/constants/Colors';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'; // Import Firebase Storage
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const UserProfile: React.FC = () => {
    const { user, setUser } = useStateContext();
    const [userData, setUserData] = useState<any>(null);
    const [newPhoto, setNewPhoto] = useState<any>(null);
    const [imageFile, setImageFile] = useState<any>(null);
    const storage = getStorage();
    const pickImage = async() => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
            selectionLimit: 1,
        })

        if( !result.didCancel){
            console.log(result?.assets?.[0]?.uri || "");
            setImageFile(result);
            setNewPhoto(result?.assets?.[0]?.uri || "");
        }
    }

    const saveChanges = async() => {
        // try{
        //     if(newPhoto){
        //         const formData = new FormData();
        //         formData.append('userId', user.userID);
        //         imageFile.assets.forEach((asset: Asset) => {
        //             if (asset.uri && asset.type && asset.fileName) {
        //                 formData.append('files', {
        //                 uri: asset.uri,
        //                 type: asset.type,
        //                 name: asset.fileName,
        //               } as unknown as Blob); // Type assertion to Blob
        //             }
        //         })
        //         console.log('FORM DATA:', formData);
        //         const response = await axiosClient.post(`/user/updatePhoto`, formData, {
        //             headers: {
        //                 'Content-Type': 'multipart/form-data',
        //             }
        //         })
        //     }
        // }catch(error){
        //     console.error('Error updating photo:', error)
        // }
        try {
            if (newPhoto && imageFile) {
                const asset = imageFile.assets[0];
                console.log('Asset:', asset);
                if (!asset.uri || !asset.fileName || !asset.type) {
                    console.error('Invalid asset:', asset);
                    return;
                }
    
                const response = await fetch(asset.uri);
                const blob = await response.blob();
    
                const storageRef = ref(storage, `user-images/${user.userID}/${Date.now()}-${asset.fileName}`);
                const snapshot = await uploadBytes(storageRef, blob);
                const downloadURL = await getDownloadURL(snapshot.ref);
    
                console.log('Uploaded a blob or file!');
                console.log('Download URL:', downloadURL);
    
                // Update user profile photo URL in the database
                const updateResponse = await axiosClient.put(`/user/updatePhotoUrl/${user.userID}`, { photoURL: downloadURL });
                console.log('User profile updated:', updateResponse.data);
            }
        } catch (error) {
            console.error('Error updating photo:', error);
        }
    }

    useEffect(() => {
        if (user) {
            console.log(`USER PROFILE: `, user);
            axiosClient.get(`/user/info/${user.userID}`)
                .then((response) => {
                    console.log(`USER DATA: `, response.data);
                    setUserData(response.data);
                    setNewPhoto(response.data.photoURL);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [user]);

    const handleLogout = () => {
        setUser(null);
        console.log('User logged out!');
    };

    const createTwoButtonAlert = () => {
        Alert.alert('Delete Account', 'Are you sure to delete account', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            { text: 'OK', onPress: () => handleDeleteAccount()},
        ]);
    }

    const handleDeleteAccount = async() => {
        try {
            if (user) {
                await axiosClient.post(`/user/deleteAccount`, { userID: user.userID });
                setUser(null);
                console.log('User account deletion process initiated.');
            } else {
                console.error('No user is currently logged in.');
            }
        } catch (error) {
            console.error('Error requesting user account deletion:', error);
        }
    }

    return (
        <View style={ styles.container }>
            {userData ? (<View style={ styles.profileContainer }>
                <View>
                    <Image
                        source={{ uri: newPhoto }}
                        style={ styles.profileImage }
                    />
                </View>
                <Text style={ styles.profileName }>{ userData.displayName }</Text>
            </View>
            ) : (
                <ActivityIndicator size="large" color={Colors.primary} />
            )}
            <View style={ styles.optionsContainer }>
                {/* <Text style={ styles.optionTitle }>Account Settings</Text> */}
                <View style={ styles.buttonBase } >
                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <Feather name="mail" size={24} color="black" />
                    <Text style={ styles.buttonText }>{`Email: ${userData?.email ?? ""}`}</Text>
                    </View>
                </View>

                <View style={[styles.buttonBase, styles.buttonMid1]} >
                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <FontAwesome5 name="user-circle" size={24} color="black" />
                        <Text style={ styles.buttonText }>{`Role: ${userData?.role}`}</Text>
                    </View>
                </View>

                <Link href="/Wishlist" asChild>
                    <Pressable style={ styles.buttonMid2 } >
                        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                            <Ionicons name="heart-outline" size={24} color="black" />
                            <Text style={ styles.buttonText }>Manage Wishlists</Text>
                        </View>
                        <Feather name="chevron-right" size={24} color="black" />
                    </Pressable>
                </Link>

                <Link href="/UserBooking" asChild>
                    <Pressable style={ styles.buttonBase } >
                        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                            <Feather name="clock" size={24} color="black" />
                            <Text style={styles.buttonText}>Manage Bookings</Text>
                        </View>
                        <Feather name="chevron-right" size={24} color="black" />
                    </Pressable>
                </Link>
                {/* <Pressable style={styles.logOutButton} onPress={saveChanges} disabled={!newPhoto}>
                    <Text style={styles.logOutText}>Save Changes</Text>
                </Pressable> */}

                <Pressable style={ styles.logOutButton } onPress={handleLogout}>
                    <Text style={ styles.logOutText }>Logout</Text>
                </Pressable>

                <Pressable style={styles.logOutButton} onPress={createTwoButtonAlert}>
                    <Text style={styles.logOutText}>Delete Account</Text>
                </Pressable>

            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    editButton: {
        marginBottom: 10, // Additional margin for spacing after the Edit button
        alignContent: 'center',
        alignSelf: 'center',
    },
    editText: {
        fontSize: 12, // Smaller font size for the Edit text
        textAlign: 'center',
        color: Colors.primary, // Adjust the color as needed
    },
    profileContainer: {
        alignItems: 'flex-start',
        padding: 20,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 1,
    },
    profileName: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    rewardsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rewardsLogo: {
        width: 40,
        height: 40,
    },
    optionsContainer: {
        // borderTopWidth: 1,
        // borderColor: Colors.lightGrey,
        paddingHorizontal: 20,
    },
    optionTitle: {
        fontSize: 27,
        fontWeight: 'bold',
        paddingTop: 28,
        paddingBottom: 15,
    },
     buttonBase: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        justifyContent: 'space-between',
    },
    buttonMid1: {
        borderTopWidth: 1,
        borderColor: Colors.lightGrey,
    },
    buttonMid2: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.lightGrey,
    },
    buttonText: {
        fontSize: 18,
        lineHeight: 21,
        letterSpacing: 0.25,
        marginLeft: 13,
    },
    RewardText: {
        fontSize: 18,
    },
    logOutButton: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
        elevation: 3,
        backgroundColor: '#DF6100',
        marginTop: 50,
    },
    logOutText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
});

export default UserProfile;