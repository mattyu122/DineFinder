import axiosClient from '@/api/axiosClient';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable, FlatList } from 'react-native';
import { Link } from 'expo-router';
import { useStateContext } from '@/app/context/AuthContext';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Animated from 'react-native-reanimated';
import { Review } from '@/types/RestaurantReview/review';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';


interface Props {
    onPressBottomSheet: () => void;
    reviews: Review[]
}

const ReviewsPage: React.FC<Props> = ({ onPressBottomSheet, reviews }) => {
    const { user } = useStateContext();

    const formatDate = (isoDateString: string) => {
        const date = new Date(isoDateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const renderRow = (item: Review, index: number) => {
        return (
            <View key={index} style={styles.reviewItem}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: 'grey' }}>{item.comment}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.text}>{item.userDisplayName}</Text>
                    <Text style={styles.fonts}> · </Text>
                    <Text style={styles.text}>Level {item.rating}</Text>
                    <Text style={styles.fonts}> · </Text>
                    <Text style={styles.text}>{formatDate(item.submitDate)}</Text>
                </View>
            </View>
        )
    }



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <FontAwesome name="star" size={24} color="black" />
                <Text style={styles.starRate}>4.95</Text>
                <Text style={styles.fonts}> · </Text>
                <Text style={styles.starRate}>{reviews.length} reviews</Text>
            </View>

            <Animated.ScrollView showsVerticalScrollIndicator={false}>
                {reviews.length > 0 ? (
                    reviews.map((item, index) => renderRow(item, index))
                ) : (
                    <Text style={{
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginBottom: 20
                    }}>
                        No reviews available.
                    </Text>
                )}
            </Animated.ScrollView>


            {
                user ? (
                    <Pressable style={styles.submitButton} onPress={onPressBottomSheet}>
                        <FontAwesome5 name="edit" size={20} color="black" />
                        <Text style={styles.submitText}>Write a review</Text>
                    </Pressable>
                ) : (
                    <Link href="/UserProfile" asChild>
                        <Pressable style={styles.submitButton}>
                            <FontAwesome5 name="edit" size={20} color="black" />
                            <Text style={styles.submitText}>Sign In to write a review</Text>
                        </Pressable>
                    </Link>
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // flexDirection: 'column',
        backgroundColor: 'white',
        paddingTop: 5,
        // borderWidth: 1,
        height: 590,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingBottom: 20,
    },
    starRate: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    submitButton: {
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.lightGrey,
    },
    submitText: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'black',
    },
    fonts: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'orange',

        fontFamily: 'mon',
    },
    reviewItem: {
        marginBottom: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey,
    },
    text: {
        marginTop: 8
    }
});

export default ReviewsPage;
