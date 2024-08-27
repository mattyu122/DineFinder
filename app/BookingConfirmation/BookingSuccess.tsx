import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import Animated, { interpolate, SlideInDown, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { defaultStyles } from '@/constants/Styles';
import { Reservation } from '@/types/Reservation/ReservationDetail';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import RNCalendarEvents, { Calendar } from 'react-native-calendar-events';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

type Params = {
  restaurant?: string;
  reservation?: string;
};

const BookingSuccess = () => {
  const router = useRouter();
  const params = useLocalSearchParams<Params>()
  const navigation = useNavigation();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerTransparent: true,

      headerLeft: () => (
        <TouchableOpacity style={styles.roundButton} onPress={() => router.dismissAll()}>
          <Ionicons name="close" size={24} color={'#000'} />
        </TouchableOpacity>
      ),
    });
  }, []);

  const scrollOffset = useScrollViewOffset(scrollRef);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

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

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        scrollEventThrottle={16}>
        {/* Heading */}
        <Animated.Image
          source={{ uri: restaurant?.coverpic[0] }}
          style={[styles.image, imageAnimatedStyle]}
          resizeMode="cover"
        />
        
        <View style={styles.infoContainer}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle-sharp" size={100} color="green" />
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center', fontSize: 20, color: 'gray' }}>Booking Success</Text>
          </View>

          {/* Body */}
          <View style={styles.divider} />

          <View style={{ flexDirection: 'row' }}>
            <Image
              source={{ uri: restaurant?.coverpic[0] }}
              style={{ marginTop: 15, marginHorizontal: 15, borderRadius: 80, height: 60, width: 60 }}
              resizeMode='cover'
            />

            <View style={{ marginTop: 20, marginHorizontal: 10, gap: 8, width: 240 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{restaurant?.restaurantname}</Text>
              <Text style={{ color: 'gray' }}>{restaurant?.address}, {restaurant?.city}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row',marginTop: 20, justifyContent: 'center', marginHorizontal: 30 }}>
            <View style={{ paddingHorizontal: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green', textAlign: 'center' }}>{convertReadableDate(reservation?.reservationDate)}</Text>
              <Text style={{ textAlign: 'center' }}>Date</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={{ paddingHorizontal: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green', textAlign: 'center' }}>{convertReadableTime(reservation?.reservationDate)}</Text>
              <Text style={{ textAlign: 'center' }}>Time</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={{ paddingHorizontal: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green', textAlign: 'center' }}>{reservation?.numberOfCustomer}</Text>
              <Text style={{ textAlign: 'center' }}>Seats</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

    </View>
  )
}

export default BookingSuccess

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  infoContainer: {
    padding: 24,
    backgroundColor: '#fff',
  },
  image: {
    height: IMG_HEIGHT,
    width: width,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'black',
    marginVertical: 16,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: "100%",
    backgroundColor: 'black',
    marginHorizontal: 10
  },
})