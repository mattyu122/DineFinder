import { defaultStyles } from '@/constants/Styles';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';

interface Props {
    listOfRestaurant: Restaurant[];
    latitude: number
    longitude: number
}

interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

const INITIAL_REGION = {
    latitude: 43.651070,
    longitude: -79.347015,
    latitudeDelta: 8,
    longitudeDelta: 8,
};


const Mapview = memo(({ listOfRestaurant, latitude, longitude }: Props) => {
    const router = useRouter();
    const mapRef = useRef<any>(null);
    const [locationRegion, setLocationRegion] = useState<Region>({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 8,
        longitudeDelta: 8,
    })

    useEffect(() => {
        setLocationRegion({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 8,
            longitudeDelta: 8,
        })
    }, [latitude, longitude])

    useEffect(() => {
        onLocateDevice();
        listOfRestaurant.forEach((item) => {
            console.log(item)
        });
    }, []);


    const onMarkerSelected = (event: Restaurant) => {
        router.push(`/listing/${event.restaurantid}`);
    };

    const onLocateDevice = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return;
        }

        let location = await Location.getCurrentPositionAsync({});

        const region = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.8,
            longitudeDelta: 0.8,
        };
        setLocationRegion(region);
        mapRef.current?.animateToRegion(region);
    };

    const renderCluster = (cluster: any) => {
        const { id, geometry, onPress, properties } = cluster;

        const points = properties.point_count;
        return (
            <Marker
                key={`cluster-${id}`}
                coordinate={{
                    longitude: geometry.coordinates[0],
                    latitude: geometry.coordinates[1],
                }}
                onPress={onPress}>
                <View style={styles.marker}>
                    <Text
                        style={{
                            color: '#000',
                            textAlign: 'center',
                            fontFamily: 'mon-sb',
                        }}>
                        {points}
                    </Text>
                </View>
            </Marker>
        );
    };

    return (
        <View style={defaultStyles.container}>
            <MapView
                ref={mapRef}
                animationEnabled={false}
                style={StyleSheet.absoluteFillObject}
                initialRegion={INITIAL_REGION}
                region={locationRegion}
                zoomControlEnabled={true}
                clusterColor="#fff"
                clusterTextColor="#000"
                clusterFontFamily="mon-sb"
                renderCluster={renderCluster}>
                {listOfRestaurant.map((item: Restaurant) => (
                    <Marker
                        coordinate={{
                            latitude: Number(item.geogcood.lat),
                            longitude: Number(item.geogcood.lng),
                        }}
                        key={item.restaurantid}
                        onPress={() => onMarkerSelected(item)}>
                        <View style={styles.marker}>
                            <Ionicons name='star' size={16} color={'#000'} />
                            <Text style={styles.markerText}>{item.rating}</Text>
                        </View>
                    </Marker>
                ))}
            </MapView>
            <TouchableOpacity style={styles.locateBtn} onPress={onLocateDevice}>
                <Ionicons name="navigate" size={24} color={'black'} />
            </TouchableOpacity>
        </View>
    );
})

export default Mapview

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    marker: {
        flexDirection: 'row',
        gap: 4,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        elevation: 5,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: {
            width: 1,
            height: 10,
        },
    },
    markerText: {
        fontSize: 14,
        fontFamily: 'mon-sb',
    },
    locateBtn: {
        position: 'absolute',
        top: 70,
        right: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: {
            width: 1,
            height: 10,
        },
    },
});