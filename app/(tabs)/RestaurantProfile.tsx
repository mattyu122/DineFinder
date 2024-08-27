import axiosClient from '@/api/axiosClient';
import Colors from '@/constants/Colors';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useStateContext } from '@/app/context/AuthContext';
const IMG_HEIGHT = 300;

interface CustomTable {
  id: number;
  totalTable: number;
  maxCapacity: number;
  minCapacity: number;
  openForBooking: boolean;
}

const Profile: React.FC = () => {
  const { user } = useStateContext();
  const [restaurantInfo, setRestaurantInfo] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [customTables, setCustomTables] = useState<CustomTable[]>([]);
  const [nextTableId, setNextTableId] = useState(1); 

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        if (user) {
          const res = await axiosClient.get(`/restaurant/${user.restaurantId}`);
          console.log('RestProfile:', user.restaurantId);
          console.log('resgot:', res.data);
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

  const saveChanges = async () => {
    if (!restaurantInfo) return;
    
    const updatedTables = { ...restaurantInfo.table };

    customTables.forEach((customTable) => {
      if (customTable.totalTable > 0) {
        updatedTables[`person_${customTable.maxCapacity}`] = {
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
    }


    try {
      await axiosClient.put(`/restaurant/${user.restaurantId}`, finalRestaurantInfo);
    } catch (error) {
      console.error(error);
      alert('Failed to save changes');
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.ScrollView style={styles.container}>
        <Animated.Image
          source={{ uri: restaurantInfo?.coverpic[0] }}
          style={[styles.image]}
          resizeMode="cover"
        />
        {restaurantInfo ? (
          <View>
            <Text style={styles.profileName}>{restaurantInfo.restaurantname}</Text>
            <Text style={styles.profileAddress}>{restaurantInfo.address}</Text>
            <Text style={styles.sectionTitle}>Table Configurations</Text>
            {Object.keys(restaurantInfo.table).map((size) => (
              <View key={size} style={styles.tableConfig}>
                <Text style={styles.tableTitle}>{size.replace('_', ' ')} table</Text>
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
            ))}
            {customTables.map((customTable) => (
              <View key={customTable.id} style={styles.customTableContainer}>
                <Text style={styles.sectionTitle}>{`person ${customTable.maxCapacity} table`}</Text>
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
            <Pressable style={styles.addButton} onPress={addCustomTable}>
              <Text style={styles.addButtonText}>+ Add New Table Configuration</Text>
            </Pressable>
            <Pressable style={{...styles.addButton}} onPress={saveChanges}>
            <Text style={styles.addButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        ) : (
          <Text>No restaurant information available</Text>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Add a slight white background with transparency
    paddingHorizontal: 20,
  },
  image: {
    height: IMG_HEIGHT,
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'mon-sb',
    marginBottom: 10,
    color: "#FF6347",
  },
  profileAddress: {
    fontSize: 16,
    color: Colors.grey,
    marginVertical: 10,
    fontFamily: 'mon',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "#FF6347",
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
    addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    },
    customTableContainer: {
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
    });

    export default Profile