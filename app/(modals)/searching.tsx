import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, Modal } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import Animated, { FadeIn, FadeOut, SlideInDown, interpolate } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { TextInput } from 'react-native-gesture-handler';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import {Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { useNavigation } from '@react-navigation/native';
import Voice, { SpeechResultsEvent, SpeechErrorEvent, SpeechEndEvent } from '@react-native-voice/voice';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const places = [
    {
        img: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Concord_Pacific_Master_Plan_Area.jpg',
        name: 'Vancouver'
    },
    {
        img: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/CC_2022-06-18_193-Pano_%28cropped%29_01.jpg',
        name: 'Toronto'
    },
    {
        img: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Downtown_Calgary_2020-4.jpg',
        name: 'Calgary'
    },
    {
        img: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Montreal-canada-parc-urban.jpg',
        name: 'Montreal'
    },
]

const searching = () => {
    const router = useRouter();
    const params = useLocalSearchParams()
    const navigation = useNavigation()
    const [openCard, setOpenCard] = useState(0);
    const [selectedPlace, setSelectedPlace] = useState(0);
    const [restaurantSearch, setRestaurantSearch] = useState('')
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([])
    const [filterRestaurants, setFilterRestaurants] = useState<Restaurant[]>([])

    const [started, setStarted] = useState(false);
    const [results, setResults] = useState<string[]>([]);


    useEffect(() => {
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechEnd = onSpeechEnd;

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        }
    }, []);

    useEffect(() => {
        if (params.restaurantList && typeof params.restaurantList === 'string') {
            setAllRestaurants(JSON.parse(params.restaurantList))
        } else {
            console.log(`error occur in getting params`)
        }
    }, [])

    useEffect(() => {
        filterRestaurant(restaurantSearch)
    }, [restaurantSearch])

    const startSpeechToText = async () => {
        try {
            await Voice.start('en-US');
            setStarted(true);
        } catch (error) {
            console.error(error);
        }
    };

    const stopSpeechToText = async () => {
        try {
            await Voice.stop();
            setStarted(false);
        } catch (error) {
            console.error(error);
        }
    };

    const onSpeechResults = (event: SpeechResultsEvent) => {
        setResults(event.value || []);
    };

    const onSpeechEnd = (event: SpeechEndEvent) => {
        setStarted(false);
        debounceUpdateSearch();
    };

    const onSpeechError = (event: SpeechErrorEvent) => {
        console.error(event.error);
    };

    const debounceUpdateSearch = useCallback(
        debounce(() => {
            if (results.length > 0) {
                setRestaurantSearch(results.join(' '));
                setResults([]); 
            }
        }, 300),
        [results]
    );

    useEffect(() => {
        console.log("🚀 ~ useEffect ~ results:", results);
        debounceUpdateSearch();
    }, [results, debounceUpdateSearch]);

    function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
        let timeout: ReturnType<typeof setTimeout>;
        return (...args: Parameters<T>): void => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    const filterRestaurant = (text: string) => {
        if (text.trim() === "") {
            setFilterRestaurants([])
        } else {
            const filterData =
                allRestaurants.filter(item => item.city.toLowerCase().includes(text.toLowerCase()) || item.address.toLowerCase().includes(text.toLowerCase()));
            setFilterRestaurants([...filterData]);
        }
    };

    const handleFocus = () => {
        setOpenCard(1)
    };

    const onClearAll = () => {
        setRestaurantSearch('')
    };

    return (
        <BlurView intensity={100} style={styles.container} tint="light">
            {/*  Where */}
            {openCard != 1 && (
                <View style={styles.card}>
                    {openCard != 0 && openCard != 1 && (
                        <AnimatedTouchableOpacity
                            onPress={() => setOpenCard(0)}
                            style={styles.cardPreview}
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(200)}>
                            <Text style={styles.previewText}>Where</Text>
                            <Text style={styles.previewdData}>I'm flexible</Text>
                        </AnimatedTouchableOpacity>
                    )}

                    {openCard == 0 && <Text style={styles.cardHeader}>Where to?</Text>}
                    {openCard == 0 && (
                        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.cardBody}>
                            <View style={styles.searchSection}>
                                <Ionicons style={styles.searchIcon} name="search" size={24} color="#000" />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Search restaurants"
                                    keyboardType='ascii-capable'
                                    placeholderTextColor={Colors.grey}
                                    value={restaurantSearch}
                                    onChangeText={(text) => setRestaurantSearch(text)}
                                    onFocus={handleFocus}
                                />
                            </View>


                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.placesContainer}>
                                {places.map((item, index) => (
                                    <TouchableOpacity onPress={() => setSelectedPlace(index)} key={index}>
                                        <Image
                                            source={{ uri: item?.img }}
                                            style={selectedPlace == index ? styles.placeSelected : styles.place}
                                        />
                                        <Text style={{ fontFamily: 'mon', paddingTop: 6 }}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    )}
                </View>
            )}

            {openCard == 1 && (
                <Animated.View style={styles.modalOverlay}>
                    <View style={styles.searchBarExpanded}>
                        {restaurantSearch == "" ? 
                            (<Ionicons style={styles.searchIcon} name="search" size={24} color="#000" />) :
                            (<Ionicons style={styles.searchIcon} name="close" size={24} color="#000" onPress={onClearAll} />) 
                        }
                        <TextInput
                            style={styles.inputField}
                            placeholder="Search restaurants"
                            placeholderTextColor={Colors.grey}
                            value={restaurantSearch}
                            onChangeText={(text) => setRestaurantSearch(text)}
                        />
                        {!started ?
                            (<Ionicons style={{ paddingRight: 10 }} name="mic" size={24} color="black" onPress={startSpeechToText} />) :
                            (<Ionicons style={{ paddingRight: 10 }} name="mic-off" size={24} color="red" onPress={stopSpeechToText} />)
                        }
                    </View>
                    <Animated.FlatList
                        data={filterRestaurants}
                        renderItem={({ item }) => (
                            <View style={{ backgroundColor: "white", borderColor: "gray", paddingHorizontal: 20 }}>
                                <Link href={{
                                    pathname: `/listing/${item.restaurantid}`,
                                    params: { restaurantID: item.restaurantid }
                                }} asChild>
                                    <TouchableOpacity onPress={() => router.back()}>
                                        <View style={{ flexDirection: 'row', gap: 25, padding: 10 }}>
                                            <Image
                                                source={{ uri: item?.coverpic[0] }}
                                                style={{ borderRadius: 10, width: 50, height: 50 }}
                                            />
                                            <Text style={{ justifyContent: 'center', paddingTop: 15 }}>
                                                {item.restaurantname}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </Link>
                            </View>

                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </Animated.View>
            )}

            {/* Footer */}
            {openCard != 1 && (
            <Animated.View style={defaultStyles.footer} entering={SlideInDown.delay(200)}>
                <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ height: '100%', justifyContent: 'center' }}
                        onPress={onClearAll}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontFamily: 'mon-sb',
                                textDecorationLine: 'underline',
                            }}>
                            Clear all
                        </Text>
                    </TouchableOpacity>

                    <Link href={{
                        pathname: "/",
                        params: { cityName: places[selectedPlace]?.name }
                    }} asChild>
                        <TouchableOpacity
                            style={styles.searchBtn}
                        >
                            <Ionicons
                                name="search-outline"
                                size={24}
                                style={defaultStyles.btnIcon}
                                color={'#fff'}
                            />
                            <Text style={defaultStyles.btnText}>Search</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
            )}
        </BlurView>
    )
}

export default searching

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        margin: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: {
            width: 2,
            height: 2,
        },
        gap: 20,
    },
    cardHeader: {
        fontFamily: 'mon-b',
        fontSize: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    cardBody: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cardPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    searchSection: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ABABAB',
        borderRadius: 8,
        marginBottom: 16,
    },
    modalOverlay: {
        backgroundColor: '#fff',
        borderRadius: 14,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: {
            width: 2,
            height: 2,
        },
        gap: 10,
        height: "100%",
    },
    searchBarExpanded: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ABABAB',
        borderRadius: 8,
        margin: 20
    },
    searchIcon: {
        padding: 10,
    },
    inputField: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    placesContainer: {
        flexDirection: 'row',
        gap: 25,
    },
    place: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    placeSelected: {
        borderColor: Colors.grey,
        borderWidth: 2,
        borderRadius: 10,
        width: 100,
        height: 100,
    },
    previewText: {
        fontFamily: 'mon-sb',
        fontSize: 14,
        color: Colors.grey,
    },
    previewdData: {
        fontFamily: 'mon-sb',
        fontSize: 14,
        color: 'black',
    },

    guestItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    itemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.grey,
    },
    searchBtn: {
        paddingRight: 20,
        paddingLeft: 50,
        backgroundColor: Colors.primary,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }
});