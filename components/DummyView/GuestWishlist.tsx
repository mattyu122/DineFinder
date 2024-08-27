import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Colors from '@/constants/Colors';

const GuestWishlist = () => {
 
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Log in to view your wishlists</Text>
            <Text style={styles.contentText}>You can create, view, or edit wishlists once you've logged in.</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        gap: 10,
    },
    headerText: {
        fontSize: 23,
        fontWeight: 'bold',
    },
    contentText: {
        fontSize: 15,
        color: Colors.grey,
    },
})

export default GuestWishlist;