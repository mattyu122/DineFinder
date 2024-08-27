import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const categories = [
    {
        name: 'Restaurant',
        icon: 'chef-hat',
    },
    {
        name: 'NormalUser',
        icon: 'account-group',
    },
];

const SignUp: React.FC = () => {
    const { setUser } = useStateContext();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string>('https://www.iconpacks.net/icons/5/free-no-profile-picture-icon-15257-thumb.png');
    const [activeIndex, setActiveIndex] = useState(0);
    const [role, setRole] = useState<string>(categories[activeIndex].name);

    const itemsRef = useRef<Array<TouchableOpacity | null>>([]);
    const selectCategory = (index: number) => {
        setActiveIndex(index);
        setRole(categories[index].name);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSubmit = async () => {
        console.log('Submitting...', role);

        const payload = {
            email: email,
            password: password,
            displayName: displayName,
            photoURL: photoURL,
            role: role,
            disabled: false,
        }

        try {
            const response = await axiosClient.post('/user/register', payload)
            // const {userID} = response.data;
            // setUser(userID);
            // console.log(`SignUp: ${userID}`);
            const { uid } = response.data;
            setUser(uid);
            console.log(`SignUp: ${uid}`);
            

        } catch (error) {
            console.log('SignUp failed:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Here to start the journey</Text>
            <TextInput
                style={[styles.inputBase, styles.inputTop]}
                placeholder="Email"
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.inputBase, styles.inputMid]}
                placeholder="Password"
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={[styles.inputBase, styles.inputMid]}
                placeholder="Display Name"
                onChangeText={setDisplayName}
            />
            <TextInput
                style={[styles.inputBase, styles.inputBottom]}
                placeholder="Photo URL"
                onChangeText={setPhotoURL}
            />

            <View
                style={styles.categoriesContainer}
            >
                {categories.map((item, index) => (
                    <TouchableOpacity
                        ref={(el) => (itemsRef.current[index] = el)}
                        key={index}
                        style={activeIndex === index ? styles.categoriesBtnActive : styles.categoriesBtn}
                        onPress={() => selectCategory(index)}>
                        <MaterialCommunityIcons
                            name={item.icon as any}
                            size={24}
                            color={activeIndex === index ? '#000' : Colors.lightGrey}
                        />
                        <Text style={activeIndex === index ? styles.categoryTextActive : styles.categoryText}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Pressable style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 23,
        paddingTop: 20,
        backgroundColor: '#fff',
        width: '100%',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'left',
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
    inputTop: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 0,
    },
    inputMid: {
        borderBottomWidth: 0,
    },
    inputBottom: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    categoriesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 35,
        marginTop: 20,
        paddingHorizontal: 50,
        borderColor: 'gray',
        height: 50,
    },
    categoryText: {
        fontSize: 14,
        fontFamily: 'mon-sb',
        color: Colors.lightGrey,
    },
    categoryTextActive: {
        fontSize: 14,
        fontFamily: 'mon-sb',
        color: '#000',
    },
    categoriesBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8,
    },
    categoriesBtnActive: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: '#000',
        borderBottomWidth: 2,
        paddingBottom: 8,
    },
});

export default SignUp;