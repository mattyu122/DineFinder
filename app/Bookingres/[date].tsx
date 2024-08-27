import { db } from '@/config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { collection, where } from '@firebase/firestore';
import { endOfDay, format, parseISO, startOfDay } from 'date-fns';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStateContext } from '../context/AuthContext';
interface BookingDetailItem {
  id: string;
  time: string;
  name: string;
  bookingId: string;
  guests: number;
  userId: string;
}


const BookingDetail: React.FC = () => {
  const { date } = useLocalSearchParams<{date: string}>();
  const { user } = useStateContext();
  const [bookingDetails, setBookingDetails] = useState<BookingDetailItem[]>([]);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: '',

        headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={'#000'}/>
            </TouchableOpacity>
        ),
    });
}, []);

  useEffect(()=>{
    const selectedDate = parseISO(date!)
    const start = format(startOfDay(selectedDate), "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX");
    const end = format(endOfDay(selectedDate), "EEE MMM dd yyyy HH:mm:ss 'GMT'XXX");
    console.log('selectedDate', selectedDate, user?.restaurantId)

    const q = query(collection(db, 'RESERVATION'), where('restaurantID', '==', user?.restaurantId), where('reservationDate', '>=', start), where('reservationDate', '<=', end));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDetails: BookingDetailItem[] = []

      querySnapshot.forEach((doc)=>{
        const data = doc.data()
        const formattedTime = format(new Date(data.reservationDate), 'h:mm a')
        fetchedDetails.push({
          id: doc.id,
          time: formattedTime,
          name: data.userID.displayName,
          userId: data.userID.userID,
          bookingId: data.reservationID,
          guests: data.numberOfCustomer,
        })
      })
      console.log('fetchedDetails', fetchedDetails)
      setBookingDetails(fetchedDetails)
    }, (error)=>{
      console.log('Error getting detailedReservation:', error)
    })

    return () => unsubscribe()
  },[date])
  const renderItem = ({ item } : {item: BookingDetailItem}) => (
    <View style={styles.item}>
      <View style={styles.details}>
        <Text style={styles.guests}>{item.guests}</Text>
        <View>
          <Text style={styles.time}>{item.time}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.bookingId}>Booking ID: {item.bookingId}</Text>
        </View>
      </View>
      {/* <TouchableOpacity style={styles.iconContainer}>
        <MaterialIcons name="notifications-none" size={24} color="black" />
      </TouchableOpacity> */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{date}</Text>
      <FlatList
        data={bookingDetails}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guests: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347', // Use the appropriate color
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingId: {
    fontSize: 14,
    color: '#666',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default BookingDetail;