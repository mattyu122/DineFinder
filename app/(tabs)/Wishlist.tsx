import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import GuestWishlist from '@/components/DummyView/GuestWishlist';
import RestaurantListCell from '@/components/RestaurantListCell/RestaurantListCell';
import { googleApiKey } from '@/config/googleConsoleMapConfig';
import Colors from '@/constants/Colors';
import commonStyles from '@/styles/commonStyles';
import { GoogleRestaurantToRestaurant, Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';


const Wishlist = () => {
    const isFocused = useIsFocused();
    const { user } = useStateContext()
    const [wishListID, setWishListID] = useState<string[]>([])
    const [wishList, setWishList] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(false)
    const listRef = useRef<FlatList>(null)
    const [fetchingLoading, setfetchingLoading] = useState(false)

    useEffect(() => {
        console.log(`wishList: ${wishList}`)
    },[])

    useEffect(() => {
        setLoading(true)

        setTimeout(() => {
            setLoading(false)
        }, 200)
    }, [])

    useEffect(() => {
        if (user && isFocused) {
            getAllWishlistID()
        }
    }, [isFocused, user])

    useEffect(() => {
        if (user && wishListID.length > 0) {
            setfetchingLoading(true)
            getAllWishlistItems()
        } else {
            setWishList([])
        }
    }, [wishListID, user, isFocused])

    const getAllWishlistID = async () => {
        if (!user) return
        const response = await axiosClient.get(`/user/${user.userID}/allWishlistID`)
        setWishListID(response.data)
        console.log("🚀 ~ getAllWishlistID ~ response:", response.data)
    }

    const getAllWishlistItems = async () => {
        const restaurantList= []
        const restaurants: (Restaurant | null)[] = await Promise.all(wishListID.map(async (item) => {
            const restaurant = await fetchRestaurantDetailsFromGoogle(item)
            return restaurant
        }))
        
        // Filter out null values if fetchRestaurantDetailsFromGoogle returns null
        const validRestaurants = restaurants.filter(restaurant => restaurant !== null) as Restaurant[]
        for (let i in validRestaurants){
            console.log(`🚀 ~ ${validRestaurants[i].restaurantid}`)
        }
        restaurantList.push(...validRestaurants)
        setWishList(restaurantList)
        setfetchingLoading(false)
    }

    const fetchRestaurantDetailsFromGoogle = async (id: string) => {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${googleApiKey}`;
        try {
            const response = await axios.get(url);
            if (response.data && response.data.result) {
                const restaurant = GoogleRestaurantToRestaurant(response.data.result)

                return restaurant as Restaurant;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching restaurant details from Google:', error);
            return null
        }
    };

    const handleDeleteItem = async (id: string) => {
        if(!user) return
        try {
            await axiosClient.delete(`/user/${user.userID}/wishList/${id}`)
            setWishListID(prevData => prevData.filter(item => item !== id));
            setWishList(prevData => prevData.filter(item => item.restaurantid !== id));
        } catch (error) {
            console.log("🚀 ~ handleDeleteItem ~ error:", error)
        }
        
    };

    // const renderRow = ({ item }: { item: Restaurant }) => <RestaurantListCell item={item} wishList={wishList} />

    const renderRow = ({ item }: { item: Restaurant }) => (
        <RestaurantListCell
            item={item}
            wishListID={wishListID}
            onDelete={handleDeleteItem}
            isDeletable={true}
        />
    );


    return (
        <SafeAreaView style={commonStyles.safeAreaView}>
            <View>
                <Text style={{ fontWeight: 'bold', fontSize: 35, padding: 20 }}>Wishlists</Text>
            </View>

            <Animated.View>
                {user ? (
                    fetchingLoading ? (
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 300 }}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        wishList && wishList.length > 0 ? (
                            <Animated.FlatList
                                renderItem={renderRow}
                                data={loading ? [] : wishList}
                                ref={listRef}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="format-list-bulleted-add" size={100} color="black" />
                                <Text style={styles.font}>There don't have any restaurant added</Text>
                                <Link href="./" asChild>
                                    <Pressable style={styles.explorButton}>
                                        <Text style={styles.exploreText}>Start exploring</Text>
                                    </Pressable>
                                </Link>
                            </View>
                        )
                    )
                ) : (
                    <View style={styles.guestContainer}>
                        <GuestWishlist />
                        <Link href="./UserProfile" asChild>
                            <Pressable style={styles.logInButton}>
                                <Text style={styles.logInText}>Login</Text>
                            </Pressable>
                        </Link>
                    </View>
                )}
            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        gap: 10,
        marginTop: '35%',
    },
    font: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingTop: 50
    },
    guestContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    logInButton: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
        elevation: 3,
        marginTop: 50,
        backgroundColor: '#DF6100',
    },
    logInText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    explorButton: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 10,
        elevation: 3,
        marginTop: 50,
        borderWidth: 1,
    },
    exploreText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'black',
    },
})

export default Wishlist;