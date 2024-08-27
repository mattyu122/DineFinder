import { useStateContext } from "@/app/context/AuthContext";
import { db } from '@/config/firebaseConfig';
import Colors from "@/constants/Colors";
import { format } from "date-fns";
import { Link } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
interface BookingList {
  id: string
  date : string
}

export default function DateList(){
  const {user} = useStateContext()
  const [bookingDate, setBookingDate] = useState<BookingList[]>([])
  useEffect(()=>{
    if (user?.restaurantId){
      console.log("RESTAURANTID", user.restaurantId)
      const q = query(collection(db, 'RESERVATION'), where('restaurantID', '==', user?.restaurantId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const dates = new Set<string>()

        querySnapshot.forEach((doc)=>{
          console.log('doc', doc.data())
          const data = doc.data()
          const formattedDate = format(new Date(data.reservationDate), 'yyyy-MM-dd');
          dates.add(formattedDate)
        })

        const fetchedBookings: BookingList[] = Array.from(dates).map(date => ({
          id: date,
          date: date,
        }))

        console.log('fetchedBookings', fetchedBookings)
        setBookingDate(fetchedBookings)
      }, (error)=>{
        console.log('Error getting documents:', error)
      })

      return () => unsubscribe()
    }
  },[])


  const renderItem = ({ item } : {item: BookingList}) => (
    <Link href={`/Bookingres/${item.date}`} asChild>
      <TouchableOpacity>
        <View style={styles.item}>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    </Link>

  );

  return  user ? (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>
      <FlatList
        data={bookingDate}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  ) : (
    <View style={styles.guestContainer}>
      <View>
        <Text style={styles.headerText}>Log in to view your bookings</Text>
        <Text style={styles.contentText}>You can view bookings once you've logged in.</Text>
      </View>
      <Link href="./Profile" asChild>
        <Pressable style={styles.logInButton}>
          <Text style={styles.logInText}>Login</Text>
        </Pressable>
      </Link>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  date: {
    fontSize: 18,
  },
  headerText: {
    fontSize: 23,
    fontWeight: 'bold',
},
contentText: {
    fontSize: 15,
    color: Colors.grey,
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
});

