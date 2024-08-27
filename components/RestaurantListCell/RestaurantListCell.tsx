import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
interface RestaurantRowProps {
    item: Restaurant
    wishListID: string[]
    onDelete?: (id: string) => void; 
    isDeletable?: boolean;
}
const { width } = Dimensions.get('window');

const RestaurantListCell = ({ item, wishListID, onDelete, isDeletable = false }: RestaurantRowProps) => {
    const {user, setUser} = useStateContext()
    const [isInWishlist, setIsInWishlist] = useState(user?.wishList.includes(item.restaurantid))
    useEffect(() => {
        if (isDeletable){
            const userWishList = user?.wishList || []
            console.log('userWishList', userWishList)
            setIsInWishlist(userWishList.includes(item.restaurantid))
        }
    }, [item, user])

    const saveToWishList = async () => {
        try {
            if (!user) {
                console.log(`User not yet login`)
                Alert.alert("Please login first")
                return
            }
            const restaurantID = item.restaurantid
            const isCurrentlyWished = user.wishList.includes(restaurantID);
            if (isCurrentlyWished) {


                try {
                    await axiosClient.delete(`/user/${user.userID}/wishlist/${restaurantID}`);
                    // Remove the item from the wishlist
                    const newWishList =  user.wishList.filter((item:string) => item !== restaurantID)
                    setUser({...user, wishList: newWishList})
                    Alert.alert("Removed from Wishlist");
                } catch (error) {
                    // Revert if the API call fails
                    setUser({...user, wishList: user.wishList});
                    Alert.alert("Failed to remove from Wishlist");
                }
            } else {
                try {
                    await axiosClient.post(`/user/${user.userID}/wishlist/${restaurantID}`);
                    const newWishList = [...user.wishList, restaurantID];
                    setUser({...user, wishList: newWishList});
                    Alert.alert("Added to Wishlist");
                } catch (error) {
                    // Revert if the API call fails
                    setUser({...user, wishList: user.wishList});
                    Alert.alert("Failed to add to Wishlist");
                }
            }
            console.log('User',user)


        } catch (error) {
            console.error('ERROR', error);
        }
    }
    const renderImageItem = ({ item } : {item:string}) => {
        return (
            <Image source={{ uri: item}} style={styles.image}/>
        )
    }

    const renderRightActions = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete && onDelete(item.restaurantid)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
    );

    const content = (
        <View style={styles.listing}>
            { !item.coverpic ? (  
                <Image source={require('@/assets/images/photo_placeholder.png')} style={styles.image} />
            ) : (
                <Image source = {{ uri: item.coverpic[0] }} style={styles.image} />
            )}

            <TouchableOpacity testID="restaurant-touchable" style={{ position: 'absolute', right: 30, top: 30 }} onPress={saveToWishList}>
                <Ionicons
                    accessibilityLabel={isInWishlist ? 'heart' : 'heart-outline'}
                    name={isInWishlist ? 'heart' : 'heart-outline'}
                    size={24}
                    color={'red'}
                    testID="heart-icon"
                />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12 }}>
                <Text style={{ fontSize: 16, paddingVertical: 4, fontWeight: 'bold' }}>{item.restaurantname}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Ionicons name='star' size={20} color={'#000'} />
                    <Text style={{ paddingVertical: 4, fontSize: 16, paddingHorizontal: 6 }}>{item.rating}</Text>
                </View>
            </View>
            <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 14, color: 'gray' }}>{item.cuisine}</Text>
                <Text style={{ fontSize: 14, color: 'gray' }}>CA{item.priceRange}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Ionicons name='location-sharp' size={18} color={'gray'} />
                    <Text style={{ fontSize: 14, color: 'gray' }}>{item.address}, {item.city}</Text>
                </View>
            </View>
        </View>
    );

    return isDeletable ? (
        <Swipeable renderRightActions={renderRightActions}>
            <Link href={{
                pathname: `/listing/${item.restaurantid}`,
                params: { restaurantID: item.restaurantid }
            }} asChild>
                <TouchableOpacity>{content}</TouchableOpacity>
            </Link>
        </Swipeable>

    ) : (
            <Link href={{
                pathname: `/listing/${item.restaurantid}`,
                params: { restaurantID: item.restaurantid }
            }} asChild>
                <TouchableOpacity>{content}</TouchableOpacity>
            </Link>
    )
}

export default RestaurantListCell

const styles = StyleSheet.create({
    listing: {
        padding: 16,
    },
    image: {
        width: '100%',
        height: 350,
        borderRadius: 12,
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '70%',
        borderRadius:12,
        marginHorizontal: 10,
        marginTop:14,
        marginBottom: 14
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});