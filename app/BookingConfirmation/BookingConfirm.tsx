import axiosClient from '@/api/axiosClient';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Reservation } from '@/types/Reservation/ReservationDetail';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { getAuth } from "firebase/auth";
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, SlideInDown, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';

const IMG_HEIGHT = 300;
const { width } = Dimensions.get('window');

type Params = {
  restaurant?: string;
  reservation?: string;
};

const BookingConfirm = () => {
  const  params  = useLocalSearchParams<Params>()
  // const { restaurant, reservation } = route.params;
  const auth = getAuth()
  const user = auth.currentUser
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollViewOffset(scrollRef);
  const navigation = useNavigation();
  const [restaurant, setRestaurant] = useState<Restaurant>()
  const [reservation, setReservation] = useState<Reservation>()

  useEffect(() => {
    try {
      if (params.restaurant) {
        const parsedRestaurant = JSON.parse(params.restaurant);
        console.log("🚀 ~ useEffect ~ restaurant:", parsedRestaurant);
        setRestaurant(parsedRestaurant);
      }

      if (params.reservation) {
        const parsedReservation = JSON.parse(params.reservation);
        console.log("🚀 ~ useEffect ~ reservation:", parsedReservation);
        setReservation(parsedReservation);
      }
    } catch (error) {
      console.error('Error parsing params:', error);
      console.log('Raw restaurant param:', params.restaurant);
      console.log('Raw reservation param:', params.reservation);
    }
  }, [params.restaurant, params.reservation]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollOffset.value, [0, IMG_HEIGHT / 1.5], [0, 1]),
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackground: () => (
        <Animated.View style={[headerAnimatedStyle, styles.header]}></Animated.View>
      ),
    });
  }, []);

  const makeReservation = async (newReservation: Reservation | undefined) => {
    try {
      console.log("🚀 ~ makeReservation ~ newReservation:", newReservation)
      await axiosClient.post(`/user/${user?.uid}/reservation`, newReservation)
      // console.log("🚀 ~ makeReservation ~ newReservation:", newReservation)
      router.push({
        pathname: '/BookingConfirmation/BookingSuccess',
        params: {
          restaurant: JSON.stringify(restaurant),
          reservation: JSON.stringify(reservation)
        }
      })
      Alert.alert("Success")
    } catch (error) {
      Alert.alert("Error", `Failed to make reservation`)
      console.error('ERROR', error);
    }
  }

  const convertReadableDate = (date: string | undefined) => {
    if (date) {
      const newDate = new Date(date)
      const readableDate = newDate.toLocaleDateString()
      return readableDate
    }
  }

  const convertReadableTime = (date: string | undefined) => {
    if (date) {
      const newDate = new Date(date)
      const readableTime = newDate.toLocaleTimeString()
      return readableTime
    }
  }

  const renderImageItem = ({ item }: { item: string }) => {
    return (
      <Animated.Image source={{ uri: item }} style={styles.image} />
    )
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        scrollEventThrottle={16}>
        <View style={styles.cardInfo}>
          {/* restaurant detail */}
          <View style={{ flexDirection: 'row' }}>
            <Image source={{uri: restaurant?. coverpic[0]}}/>

            <Image
              source={{ uri: restaurant?.coverpic[0] }}
              style={{ marginTop: 15,marginHorizontal:15 ,borderRadius: 80, height: 60, width: 60 }}
              resizeMode='cover'
            />

            {/* title and address */}
            <View style={{marginTop:20, marginHorizontal:10, gap:8, width: 240}}>
              <Text style={{fontSize: 20, fontWeight: 'bold'}}>{restaurant?.restaurantname}</Text>
              <Text style={{ color: 'gray' }}>{restaurant?.address}, {restaurant?.city}</Text>
            </View>
          </View>

          {/* date and edit btn */}
          <View style={{ flexDirection: 'row' , marginTop:20, justifyContent: 'center'}}>
            <View style={{flexDirection: 'row', margin:20}}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>{convertReadableDate(reservation?.reservationDate)} · </Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>{convertReadableTime(reservation?.reservationDate)} · </Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>{reservation?.numberOfCustomer} Seats</Text>
            </View>

          </View>
        </View>

      </Animated.ScrollView>

      {/* Footer for book button */}
      <Animated.View style={defaultStyles.footer} entering={SlideInDown.delay(200)}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={[defaultStyles.btn, { paddingRight: 20, paddingLeft: 20 }]}
              onPress={() => makeReservation(reservation)}>
              <View style={[defaultStyles.btn, { width: '100%', paddingHorizontal: 150, marginHorizontal: 10 }]}>
                <Text style={defaultStyles.btnText}>Book</Text>
              </View>
            </TouchableOpacity>
          {/* </Link> */}
        </View>
      </Animated.View>


    </View>
  )
}

export default BookingConfirm

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    height: IMG_HEIGHT,
    width: width,
  },
  header: {
    backgroundColor: '#fff',
    height: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.grey,
  },
  cardInfo: {
    backgroundColor: "#fff",
    height: 180,
    marginVertical: 5,
    marginHorizontal: 10,
    borderWidth: 1.5,
    borderColor: '#c2c2c2',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  }
})