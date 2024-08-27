import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import { defaultStyles } from '@/constants/Styles';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { BottomSheetFlatList, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import RestaurantListCell from '../RestaurantListCell/RestaurantListCell';

interface Props {
    listings: any[];
    refresh: number;
    category: string;
}




const ExploreListing = ({ listings: items, refresh, category }: Props) => {
    const { user } = useStateContext()
    const [wishListID, setWishListID] = useState<string[]>([])
    const [wishList, setWishList] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(false)
    const listRef = useRef<BottomSheetFlatListMethods>(null)

    useEffect(() => {
        if (refresh) {
            scrollListTop();
        }
    }, [refresh]);

    useEffect(() => {
        setLoading(true)

        setTimeout(() => {
            setLoading(false)
        }, 200)
    }, [category])

    useEffect(() => {
        if (user){
            getAllWishlistID()
        }
    }, [user])

    useEffect(() => {
        if (wishListID.length > 0){
            getAllWishlistItems()
        }
    }, [wishListID])


    const getAllWishlistID = async () => {
        try {
            const response = await axiosClient.get(`/user/${user.userID}/allWishlistID`);
            setWishListID(response.data);
        } catch (error) {
            console.error('Error fetching wishlist IDs:', error);
        }
    }

    const getAllWishlistItems = async () => {
        if (!Array.isArray(wishListID) || wishListID.length === 0) {
            console.error('wishListID is not an array or is empty');
            return;
        }

        try {
            const results = await Promise.all(
                wishListID.map(async (item) => {
                    const response = await axiosClient.get(`/restaurant/${item}`);
                    return response.data;
                })
            );
            setWishList(results);
        } catch (error) {
            console.error('Error fetching wishlist items:', error);
        }
    } 

    const scrollListTop = () => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    const renderRow = ({item}: {item: Restaurant}) => <RestaurantListCell item={item} wishListID={wishListID}/>

    return (
        <Animated.View style={defaultStyles.container}>
            <BottomSheetFlatList
                renderItem={renderRow}
                data={loading ? [] : items}
                ref={listRef}
                ListHeaderComponent={<Text style={styles.info}>{items.length} Restaurants</Text>}
            />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    info: {
        textAlign: 'center',
        fontFamily: 'mon-sb',
        fontSize: 16,
        // marginTop: 4,
        marginBottom: 5,
    },
})

export default ExploreListing
