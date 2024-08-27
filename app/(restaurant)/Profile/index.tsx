import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import Login from '@/components/Authenication/Login';
import Colors from '@/constants/Colors';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Animated from 'react-native-reanimated';
const IMG_HEIGHT = 300;

interface CustomTable {
  id: number;
  totalTable: number;
  maxCapacity: number;
  minCapacity: number;
  openForBooking: boolean;
}
const { width } = Dimensions.get('window');

const Profile: React.FC = () => {
  const { user,setUser } = useStateContext();
  const [restaurantInfo, setRestaurantInfo] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [customTables, setCustomTables] = useState<CustomTable[]>([]);
  const [nextTableId, setNextTableId] = useState(1); // ID counter for custom tables

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        if (user) {
          const res = await axiosClient.get(`/restaurant/${user.restaurantId}`);
          console.log('resgot:', res.data);
          console.log('user:', user);
          if (res.data.table) {
            const initialTables = Object.keys(res.data.table).map((size, index) => ({
              id: index + 1,
              size,
              ...res.data.table[size]
            }));
            setCustomTables(initialTables);
            setNextTableId(initialTables.length + 1);
          }
          setRestaurantInfo(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantInfo();
  }, [user]);

  const handleTableUpdate = (size: string, field: string, value: number | boolean) => {
    if (!restaurantInfo) return;
    setRestaurantInfo({
      ...restaurantInfo,
      table: {
        ...restaurantInfo.table,
        [size]: {
          ...restaurantInfo.table[size],
          [field]: value,
        },
      },
    });
  };
  const deleteTable = (id: number) => {
    setCustomTables((prevTables) => prevTables.filter((table) => table.id !== id));
  };

  const addRestaurant = async () => {
    console.log('add restaurant');
    router.push('/addRestaurant')
  }
  const handleCustomTableChange = (id: number, field: string, value: string | number | boolean) => {
    setCustomTables((prevTables) =>
      prevTables.map((table) =>
        table.id === id ? { ...table, [field]: value } : table
      )
    );
  };

  const addCustomTable = () => {
    setCustomTables((prevTables) => [
      ...prevTables,
      {
        id: nextTableId,
        totalTable: 0,
        maxCapacity: 0,
        minCapacity: 0,
        openForBooking: false,
      },
    ]);
    setNextTableId(nextTableId + 1);
  };


  const logOut = () =>{
    setUser(null)

  }
  const saveChanges = async () => {
    if (!restaurantInfo) return;
    const updatedTables = { ...restaurantInfo.table };

    customTables.forEach((customTable) => {
      if (customTable.totalTable > 0 && customTable.openForBooking) {
        updatedTables[`${customTable.maxCapacity}`] = {
          totalTable: customTable.totalTable,
          maxCapacity: customTable.maxCapacity,
          minCapacity: customTable.minCapacity,
          openForBooking: customTable.openForBooking,
        };
      }
    });

    const finalRestaurantInfo = {
      ...restaurantInfo,
      table: updatedTables,
      ownerid: user?.userID,
    }

    console.log('finalRestaurantInfo:', finalRestaurantInfo);

    try {
      await axiosClient.put(`/restaurant/${user.restaurantId}`, finalRestaurantInfo);
      console.log('finalRestaurantInfo:', finalRestaurantInfo);
      alert('Changes saved successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to save changes');
    }
  };

  const renderImageItem = ({ item } : {item:string}) => {
    return (
        <Animated.Image source={{ uri: item}} style={styles.image}/>
    )
  }

    const pickImageAndUpload = async () => {
      const  result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 0,
      })

      if (result.assets && result.assets.length > 0) {
        const formData = new FormData();
        formData.append('restaurantId', user?.restaurantId);
        result.assets.forEach((asset) => {
          if (asset.uri && asset.type && asset.fileName) {
            formData.append('files', {
              uri: asset.uri,
              type: asset.type,
              name: asset.fileName,
            } as unknown as Blob); // Type assertion to Blob
          }
        })

        try{
          const response = await axiosClient.post('/restaurant/uploadPhoto', formData);
          
        }catch(error){
          console.error('Error uploading image:', error);
        }
      }
    }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      { user ? ( <Animated.ScrollView style={styles.container} >

          <FlatList
            data={restaurantInfo?.coverpic}
            renderItem={renderImageItem}
            keyExtractor={(item:string, index:any) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          />
        {restaurantInfo ? (
          <View>
            {/* <Pressable style={styles.addButton} onPress={pickImageAndUpload}>
              <Text style={styles.addButtonText}>Add Photo</Text>
            </Pressable> */}
            <Text style={styles.profileName}>{restaurantInfo.restaurantname}</Text>

            <Text style={styles.profileAddress}>{restaurantInfo.address}</Text>
            {/* {restaurantInfo.table && Object.keys(restaurantInfo.table).map((size) => (
              <View key={size} style={styles.tableConfig}>
                <Text style={styles.tableTitle}>{`Table for ${size}`}</Text>
                <View style={styles.tableRow}>
                  <Text>Total Tables:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={String(restaurantInfo.table[size].totalTable)}
                    onChangeText={(value) => handleTableUpdate(size, 'totalTables', parseInt(value))}
                  />
                </View>
                <View style={styles.tableRow}>
                  <Text>Max Capacity:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={String(restaurantInfo.table[size].maxCapacity)}
                    onChangeText={(value) => handleTableUpdate(size, 'maxCapacity', parseInt(value))}
                  />
                </View>
                <View style={styles.tableRow}>
                  <Text>Min Capacity:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={String(restaurantInfo.table[size].minCapacity)}
                    onChangeText={(value) => handleTableUpdate(size, 'minCapacity', parseInt(value))}
                  />
                </View>
                <View style={styles.tableRow}>
                  <Text>Open for Booking:</Text>
                  <Pressable
                    style={[styles.checkbox, restaurantInfo.table[size].openForBooking && styles.checked]}
                    onPress={() => handleTableUpdate(size, 'openForBooking', !restaurantInfo.table[size].openForBooking)}
                  >
                    {restaurantInfo.table[size].openForBooking && <FontAwesome5 name="check" size={18} color="white" />}
                  </Pressable>
                </View>
              </View>
            ))} */}
            {customTables.map((customTable) => (
              <View key={customTable.id} style={styles.customTableContainer}>
                <View style={{ flexDirection: 'row'}}> 
                  <Text style={styles.tableTitle}>{`Table for ${customTable.maxCapacity}`}</Text>

                  <Pressable style={styles.deleteButton} onPress={() => deleteTable(customTable.id)}>
                      <MaterialIcons name="close" size={24} color="grey" />
                  </Pressable>
                </View>
                <View style={styles.tableRow}>
                  <Text>Total Tables:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={String(customTable.totalTable)}
                    onChangeText={(value) => handleCustomTableChange(customTable.id, 'totalTable', parseInt(value))}
                  />
                </View>
                <View style={styles.tableRow}>
                  <Text>Max Capacity:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={String(customTable.maxCapacity)}
                    onChangeText={(value) => handleCustomTableChange(customTable.id, 'maxCapacity', parseInt(value))}
                  />
                </View>
                <View style={styles.tableRow}>
                  <Text>Min Capacity:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={String(customTable.minCapacity)}
                    onChangeText={(value) => handleCustomTableChange(customTable.id, 'minCapacity', parseInt(value))}
                  />
                </View>
                <View style={styles.tableRow}>
                  <Text>Open for Booking:</Text>
                  <Pressable
                    style={[styles.checkbox, customTable.openForBooking && styles.checked]}
                    onPress={() => handleCustomTableChange(customTable.id, 'openForBooking', !customTable.openForBooking)}
                  >
                    {customTable.openForBooking && <FontAwesome5 name="check" size={18} color="white" />}
                  </Pressable>
                </View>
              </View>
            ))}
            <Pressable style={styles.circleButton} onPress={addCustomTable}>
              <Text style={styles.circleButtonText}>+</Text>
            </Pressable>
            <Pressable style={{...styles.addButton}} onPress={saveChanges}>
              <Text style={styles.addButtonText}>Save Changes</Text>
            </Pressable>
            <Pressable style={{...styles.logOutButton}} onPress={logOut}>
              <Text style={styles.addButtonText}>Log Out</Text>
            </Pressable>
          </View>
        ) : (
          <View>
              <Text>No restaurant information available</Text>
              <Pressable style={styles.addButton} onPress={addRestaurant}>
                <Text>Add Restaurant</Text>
              </Pressable>
          </View>
        )}
      </Animated.ScrollView>) : <Login />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  padding: 20,
  backgroundColor: '#fff',
  },
  image: {
  height: IMG_HEIGHT,
  width: width * 0.9,
  borderRadius: 10,
},
  profileName: {
  fontSize: 26,
  fontWeight: 'bold',
  marginBottom: 10,
  },
  profileAddress: {
  fontSize: 16,
  marginVertical: 10,
  },
  sectionTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  marginBottom: 10,
  },
  tableConfig: {
  marginBottom: 20,
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
  },
  tableTitle: {
  flex:1,
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
  color: '#FF6347',
  },
  tableRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 10,
  },
  input: {
  borderBottomWidth: 1,
  borderBottomColor: Colors.lightGrey,
  width: 50,
  textAlign: 'center',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 20, // Adjust the vertical margin as needed

  },
  circleButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkbox: {
  width: 24,
  height: 24,
  borderWidth: 1,
  borderColor: Colors.lightGrey,
  alignItems: 'center',
  justifyContent: 'center',
  },
  checked: {
  backgroundColor: '#FF6347',
  },
  addButton: {
  marginVertical: 20,
  padding: 10,
  backgroundColor: '#FF6347',
  borderRadius: 10,
  alignItems: 'center',
  },
  deleteButton: {
    borderRadius: 12,
    width: 24,
    height: 24,
    // alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    },
  addButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
  },
  logOutButton: {
  marginVertical: 20,
  padding: 10,
  backgroundColor: 'red',
  borderRadius: 10,
  alignItems: 'center',
  },
  customTableContainer: {
  marginVertical: 10,
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
  },
  });



  
    export default Profile