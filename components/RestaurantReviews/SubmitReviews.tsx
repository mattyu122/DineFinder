import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable } from 'react-native';
import { useStateContext } from '@/app/context/AuthContext';
import axiosClient from '@/api/axiosClient';
import { AirbnbRating } from 'react-native-ratings';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { launchImageLibrary } from 'react-native-image-picker';
import Animated from 'react-native-reanimated';
import { Review } from '@/types/RestaurantReview/review';

interface Props{
    restaurant: Restaurant | null
    bottomSheetModalRef: React.RefObject<BottomSheetModal>;
    setReviews: (newReviews: Review[]) => void;

}

const SubmitReviews: React.FC<Props> = ({ restaurant, bottomSheetModalRef, setReviews }) => {
    const { user } = useStateContext();
    const [ title, setTitle] = useState<string>('')
    const [comments, setComments] = useState<string>('');
    const [finalRating, setFinalRating] = useState<Number>(0);
    const [reviewID, setReviewID] = useState<string>('')
    const currentDate = new Date()

    const [responseReview, setResponseReview] = useState<Review | null>(null)

    const [imageFormData, setImageFormData] = useState<FormData | null>(null);
    const [selectedImages, setSelectedImages] = useState<string[]>()

    useEffect(() => {
        getRestaurantReview()
    }, [responseReview])


    useEffect(() => {
        setReviewID(generateRandom9DigitNumber())
    },[])

    const getRestaurantReview = async () => {
        try {
            const response = await axiosClient.get(`/restaurant/reviews/${restaurant?.restaurantid}`)
            setReviews(response.data)
        } catch (error) {
            console.log("🚀 ~ getRestaurantReview ~ error:", error)
        }
    }

    const pickImage = async () => {
        await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
            selectionLimit: 0
        }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const formData = new FormData();
                if (restaurant && user) {
                    let tempImageList: string[] = []
                    response.assets.forEach((asset) => {
                        if (asset.uri && asset.type && asset.fileName) {
                            formData.append('reviewPictures', {
                                uri: asset.uri,
                                type: asset.type,
                                name: asset.fileName,
                            } as unknown as Blob);
                            tempImageList.push(asset.uri)
                            console.log("🚀 ~ response.assets.forEach ~ asset.uri:", asset.uri)
                        }
                    })
                    console.log("🚀 ~ pickImage ~ formData:", formData)
                    setImageFormData(formData)
                    setSelectedImages(tempImageList)
                }
            }
        });
    };

    const uploadPicture = async() => {
        if(imageFormData){
            try{
                console.log("🚀 ~ uploadPicture ~ imageFormData:", imageFormData)
                const response = await axiosClient.post(`/user/${user.userID}/reviewPicture/${restaurant?.restaurantid}`, imageFormData)
                console.log("🚀 ~ uploadPicture ~ response:", response.data)
            }catch(error){
                console.error(`uploadPicture: ${error}`)
            }
        }
    }

    const handleSubmit = async () => {
        const review = {
            reviewID: reviewID,
            userID: user.userID,
            userDisplayName: user.displayName,
            submitDate: currentDate,
            title: title,
            rating: finalRating,
            comment: comments
        }

        const submitDate = {
            review: review,
            reviewID: reviewID
        }

        try{
            const response = await axiosClient.put(`/user/${user.userID}/review/${restaurant?.restaurantid}`, submitDate)
            if (imageFormData){ uploadPicture() }
            setResponseReview(response.data)
            alert('You have submit the review successfully!')
            bottomSheetModalRef.current?.dismiss();
        }catch (error) {
            console.error(`handleSubmit: ${error}`)
        }
    };

    const generateRandom9DigitNumber = (): string => {
        const min = 100000000;
        const max = 999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber.toString();
    };

    const ratingCompleted = (rating: number) => {
        console.log("Rating is: " + rating)
        setFinalRating(rating)

    }

    const renderRow = ({item}: {item:string}) => {
        return (
            <Animated.Image source={{ uri: item }} style={{height: 60, width: 60, borderRadius:12,marginHorizontal:5}} />
        )
        
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{restaurant?.restaurantname}</Text>
            <Text style={styles.header}>Hi, {user.displayName}!</Text>

            {selectedImages &&(
                <Animated.View style={{marginVertical:5}}>
                    <Animated.FlatList
                        data={selectedImages}
                        renderItem={renderRow}
                        horizontal
                        style={{ gap: 10 }}
                    />
                </Animated.View>
            )}

            <View style={styles.rateContainer}>
                <AirbnbRating
                    count={5}
                    reviews={[]}
                    defaultRating={0}
                    size={30}
                    onFinishRating={ratingCompleted}
                    starContainerStyle={{ gap: 10 }}
                />
            </View>

            <TextInput
                style={styles.titleInput}
                placeholder="Title"
                onChangeText={setTitle}
                inputMode="text"
                multiline={true}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.inputBase}
                placeholder="Share details fo your own experience at this place"
                onChangeText={setComments}
                inputMode="text"
                multiline={true}
                autoCapitalize="none"
            />
            <View style={{flex:1, flexDirection: 'row', gap: 20, justifyContent:'center'}}>
                {/* <Pressable style={styles.button} onPress={pickImage}>
                    <Text style={styles.buttonText}>Upload Photo</Text>
                </Pressable> */}

            <Pressable style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Post</Text>
            </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 23,
        paddingTop: 10,
        backgroundColor: '#fff',
        width: '100%',
    },
    rateContainer: {
        paddingHorizontal: 23,
        paddingVertical: 5,
        marginTop: -30,
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    header: {
        fontSize: 22,
        paddingBottom: 5,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 3,
        backgroundColor: '#DF6100',
        marginTop: 20,
        width: '50%',
        height: 50
    },
    buttonText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    titleInput:{
        height: 40,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 5,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    inputBase: {
        height: 150,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 5,
        paddingHorizontal: 12,
        marginTop: 10,
    },
});

export default SubmitReviews;