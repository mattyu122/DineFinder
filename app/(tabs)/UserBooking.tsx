import axiosClient from '@/api/axiosClient'
import { useStateContext } from '@/app/context/AuthContext'
import GuestBooking from '@/components/DummyView/GuestBooking'
import BookingListCell from '@/components/RestaurantListCell/BookingListCell'
import Colors from '@/constants/Colors'
import commonStyles from '@/styles/commonStyles'
import { Reservation } from '@/types/Reservation/ReservationDetail'
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces'
import { MaterialIcons } from '@expo/vector-icons'
import { useIsFocused } from '@react-navigation/native'
import { Link } from "expo-router"
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, ListRenderItem, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'

interface CombinedItem {
  bookingItem: Reservation;
  restaurantInfo: Restaurant;
}

const UserBooking = () => {
  const isFocused = useIsFocused();
  const { user } = useStateContext()
  const [restaurantList, setRestaurantList] = useState<Restaurant[]>([])
  const [bookingList, setBookingList] = useState<Reservation[]>([])
  const [combinedList, setCombinedList] = useState<CombinedItem[]>([]);
  const [loading, setLoading] = useState(false)
  const listRef = useRef<FlatList>(null)
  const [fetchingLoading, setfetchingLoading] = useState(false)


  useEffect(() => {
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
    }, 200)
  }, [])

  useEffect(() => {
    if (user && isFocused) {
      getAllBookingItems()
    }
  }, [isFocused])


  useEffect(() => {
    if (user) {
      if (bookingList.length > 0){
        setfetchingLoading(true)
        const fetchRestaurantDetailsAndCombine = async () => {
          await getBookingRestaurantDetail();
          const combined = combineLists(bookingList, restaurantList);
          setCombinedList(combined);
          setLoading(false);
          setfetchingLoading(false)
        };

        fetchRestaurantDetailsAndCombine()
      }
    }
  }, [bookingList,user, isFocused])

  const getAllBookingItems = async () => {
    try{
      const response = await axiosClient.get(`/user/${user.userID}/allReservation`)
      setBookingList(response.data)
    } catch(error){
      console.error('Error fetching booking items:', error)
    }
  }

  const getBookingRestaurantDetail = async () => {
    try {
      const restaurantList: Restaurant[] = await Promise.all(
        bookingList.map(async item => {
          const response = await axiosClient.get(`/restaurant/${item.restaurantID}`)
          console.log('response', response.data)
          return response.data
        })
      )
      setRestaurantList(restaurantList)
    } catch (error){
      console.error(`Error fetching restaurant details`, error)
    }
  
  }

  const combineLists = (
    bookingList: Reservation[],
    restaurantInfoList: Restaurant[]
  ): CombinedItem[] => {
    if (bookingList.length !== restaurantInfoList.length) {
      return [];
    }

    return bookingList.map((bookingItem, index) => ({
      bookingItem,
      restaurantInfo: restaurantInfoList[index],
    }));
  };

  const renderRow: ListRenderItem<CombinedItem> = ({ item }) => {
    const { bookingItem, restaurantInfo } = item;
    return (
      <BookingListCell bookingItem={bookingItem} restaurantInfo={restaurantInfo} />
    );
  };

  const combinedData = combineLists(bookingList, restaurantList);


  return (
    <SafeAreaView style={commonStyles.safeAreaView}>
      <View style={styles.container}>
        <Text style={{ fontWeight: 'bold', fontSize: 35, padding: 20 }}>
          Booking
        </Text>

        <Animated.View>
          {user ? (
            fetchingLoading ? (
              <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 300 }}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ):(

              bookingList && bookingList.length > 0 ? (
              <Animated.FlatList
                    renderItem={renderRow}
                    data={loading ? [] : combinedData}
                    ref={listRef}
                />
            ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="format-list-bulleted-add" size={100} color="black" />
                  <Text style={styles.font}>There don't have any booking added</Text>
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
                <GuestBooking/>
                <Link href="./UserProfile" asChild>
                  <Pressable style={styles.logInButton}>
                    <Text style={styles.logInText}>Login</Text>
                  </Pressable>
                </Link>
              </View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

export default UserBooking

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 80
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    marginVertical: 200
  },
  font: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 50
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
})