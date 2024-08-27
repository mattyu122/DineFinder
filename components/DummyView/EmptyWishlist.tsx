import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Colors from '@/constants/Colors';

const EmptyWishlist = () => {
 
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>No wishlists added ... yet!</Text>
            <Text style={styles.contentText}>Time to get hungry and search for your next meal.</Text>
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

export default EmptyWishlist;