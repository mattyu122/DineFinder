import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'
import Animated from 'react-native-reanimated'
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces'
import { Reservation } from '@/types/Reservation/ReservationDetail'

interface BookingProps {
    bookingItem: Reservation
    restaurantInfo: Restaurant
}


const BookingListCell = ({ bookingItem, restaurantInfo }: BookingProps) => {

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
          <View style={styles.card}>
              <Animated.Image
                testID={"booking-image"}
                  source={{
                      uri: restaurantInfo.coverpic[0],
                  }}
                  style={styles.image}
                  resizeMode="cover"
              />
              <View style={styles.infoContainer}>
                  <View style={{ gap: 10 }}>
                      <Text style={styles.name}>{restaurantInfo.restaurantname}</Text>
                      <Text style={styles.address}>{restaurantInfo.address}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={{ flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 25 }}>
                      <View style={{ paddingHorizontal: 20 }}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{convertReadableDate(bookingItem.reservationDate)}</Text>
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'orange' }}>{convertReadableTime(bookingItem.reservationDate)}</Text>
                      </View>
                      <View style={styles.verticalDivider} />
                      <View style={{ paddingHorizontal: 20, justifyContent:'center'}}>
                          <Text style={{ fontSize: 20 }}>{bookingItem.numberOfCustomer} people</Text>
                      </View>
                  </View>
              </View>
          </View>
      </View>
  )
}

export default BookingListCell


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginHorizontal: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: {
            width: 1,
            height: 2,
        },
        alignItems: 'center',
        marginBottom: 24,
    },
    image: {
        width: "100%",
        height: 150,
        backgroundColor: Colors.grey,
        borderTopStartRadius: 16,
        borderTopEndRadius: 16
    },
    infoContainer: {
        paddingHorizontal: 50,
        paddingVertical: 20,
    },
    name: {
        fontSize: 25,
        fontWeight: "600",
    },
    address: {
        fontSize: 16
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.grey,
        marginVertical: 12
    },
    verticalDivider: {
        width: StyleSheet.hairlineWidth,
        height: "100%",
        backgroundColor: Colors.grey,
        marginHorizontal: 10
    },

})