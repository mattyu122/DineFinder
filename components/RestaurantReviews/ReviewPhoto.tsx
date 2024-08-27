import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
// import serviceAccount from '@/backend/secret/dinefinder-203c7-37bf680da269.json';
import axiosClient from '@/api/axiosClient';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { AnimatedImage } from 'react-native-reanimated/lib/typescript/reanimated2/component/Image';
import Animated from 'react-native-reanimated';
import { text } from 'body-parser';

interface Props {
    restaurant : Restaurant | null
}

const ReviewPhoto = ({restaurant} : Props) => {
    const [images, setImages] = useState<{ name: string, url: string }[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchImageFromStorage();
    }, []);

    const fetchImageFromStorage = async () => {
        try {
            const response = await axiosClient.get(`/restaurant/photo/${restaurant?.restaurantid}`)
            if (response.data === 0) {
                setMessage('No images found.');
            } else {
                setImages(response.data);
            }
        } catch (error) {
            console.error('Error fetching image URLs:', error);
            setMessage('Failed to fetch image URLs.');
        }
    };

    const renderImageItem = (item: { name: string; url: string }) => (
        <Animated.Image
            key={item.name}
            source={{ uri: item.url }}
            style={styles.image}
            resizeMode='cover'
        />
    );

    return (
        <View style={styles.container}>

            {images.length > 0 ? (
                images.map((url) => renderImageItem(url))
            ) : (
                <View style={{marginTop: 20}}>
                    <Text style={styles.text}>No images available.</Text>
                </View>
            )}
    
        </View>
    )
}

export default ReviewPhoto

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    flatListContent: {
        alignItems: 'center',
    },
    image: {
        
        height: 150,
        margin: 10,
        borderRadius:12
    },
    text: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold'
    }
})