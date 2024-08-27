import axiosClient from '@/api/axiosClient';
import { googleApiKey } from '@/config/googleConsoleMapConfig';
import { GoogleRestaurantToRestaurant, Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useStateContext } from './context/AuthContext';

const AddRestaurant = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const {user, setUser} = useStateContext();
  const [inputValue, setInputValue] = useState('');
  const googlePlacesRef = useRef<any>(null);

  const handleConfirmAddRestaurant = async () =>{
    try{
        if(selectedRestaurant){
            console.log('user', user)
            const restaurant = {
                ...selectedRestaurant,
                ownerid: user?.userID
            }
            const restaurantInFirebase = await axiosClient.get(`/restaurant/${selectedRestaurant?.restaurantid}`)
            if(restaurantInFirebase.data && restaurantInFirebase.data.ownerid){
                alert('This restaurant is already added by another user')
                return
            }else if (restaurantInFirebase.data){
                await axiosClient.put(`/restaurant/${selectedRestaurant?.restaurantid}`, restaurant)
            }else{
                await axiosClient.post(`/restaurant/create`, restaurant)
            }
    
            await axiosClient.put(`/user/update/${user?.userID}`,{restaurantId: selectedRestaurant.restaurantid})
            setUser({...user, restaurantId: selectedRestaurant.restaurantid})
            console.log('selectedRestaurant', restaurant)
        
            router.back()
        }
    }
    catch(error){
        console.error('Error adding restaurant:', error)
    }
  }

  const handleRestaurantSelect = (data: any, details: any) => {
    if (details) {
      const restaurant = GoogleRestaurantToRestaurant(details);
      console.log('restaurant', restaurant);
      setSelectedRestaurant(restaurant as Restaurant);
      setInputValue(data.description); // Set the input value to the selected place name
    }
  };

//   const handleClearSelection = () => {
//     setSelectedRestaurant(null);
//     googlePlacesRef.current?.clear();
//     setInputValue(''); // Clear the input value
//   };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          ref={googlePlacesRef}
          placeholder="Search for restaurants"
          onPress={handleRestaurantSelect}
          query={{
            key: googleApiKey,
            language: 'en',
            types: 'establishment',
            location: '37.7749,-122.4194', // Example coordinates for a specific location
            radius: 100000, // 100 km radius
          }}
          styles={{
            textInputContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              borderRadius: 10,
              borderColor: '#5d5d5d',
            },
            textInput: {
              flex: 1,
              height: 38,
              color: '#5d5d5d',
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#ddd',
              paddingHorizontal: 10,
              borderRadius: 5,
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
          }}
          textInputProps={{
            value: inputValue,
            onChangeText: (text) => setInputValue(text),
          }}
          GooglePlacesSearchQuery={{
            rankby: 'distance',
            types: 'restaurant',
          }}
          fetchDetails={true} // Fetch place details including opening hours, phone number, etc.
          enablePoweredByContainer={false} // Optionally hide the 'Powered by Google' text
          nearbyPlacesAPI="GooglePlacesSearch" // Which API to use
          debounce={200} // Delay in ms before making requests
        />
      </View>

      {selectedRestaurant && (
        <View style={styles.selectedRestaurantContainer}>
          <Text style={styles.restaurantName}>{selectedRestaurant.restaurantname}</Text>
          <Text>{selectedRestaurant.address}</Text>
          <Text>{selectedRestaurant.cuisine}</Text>
        </View>
      )}

      <Pressable disabled={selectedRestaurant == null} style={styles.confirmButton} onPress={handleConfirmAddRestaurant}>
        <Text>{selectedRestaurant ? "Confirm" : 'No restaurant selected'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButton: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedRestaurantContainer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    position: 'relative',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    marginLeft: 10,
  },
});

export default AddRestaurant;