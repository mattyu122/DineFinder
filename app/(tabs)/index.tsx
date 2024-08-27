import axiosClient from '@/api/axiosClient';
import ExploreHeader from '@/components/ExploreHeader/ExploreHeader';
import ListingBottomSheet from '@/components/ExploreHeader/ListingBottomSheet';
import Mapview from '@/components/ExploreHeader/Mapview';
import { googleApiKey } from '@/config/googleConsoleMapConfig';
import { RestaurantType } from '@/enum/RestaurantType';
import { GoogleRestaurantToRestaurant, Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

// google ads mob initialization
const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-9404738156794100/7539850451';
const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});

const categories = [
  {
    name: RestaurantType.RESTAURANT,
    icon: 'restaurant-menu',
  },
  {
    name: RestaurantType.CAFE,
    icon: 'coffee',
  },
  {
    name: RestaurantType.DESSERT,
    icon: 'cake',
  },
  {
    name: RestaurantType.BAKERY,
    icon: 'bakery-dining',
  },
];

export default function HomeScreen() {
  const [category, setCategory] = useState<RestaurantType>(RestaurantType.RESTAURANT);
  const [loading, setLoading] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [fetchComplete, setFetchComplete] = useState<boolean>(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filterList, setFilterList] = useState<Restaurant[]>([]); 
  const [cityNameFromSearching, setCityNameFromSearching] = useState<string>('')
  const [latitude, setLatitude] = useState<number>(43.651070)
  const [longtitude, setLongitude] = useState<number>(-79.347015)
  const params = useLocalSearchParams()
  const {cityName} = params

  useEffect(() => {
    if (!adLoaded) {
      const eventListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show();
        setAdLoaded(true);
      });

      interstitial.load();

      return () => {
        eventListener();
      };
    }
  }, [adLoaded])


  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      let data = Linking.parse(event.url);
      console.log('Received URL:', data);
    };

    const listener = Linking.addEventListener('url', handleDeepLink);

    return () => {
      listener.remove();
    };
  }, []);

  const onDataChanged = (category: RestaurantType) => {
    setCategory(category);
  };

  const previousCategory = useRef(category);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    getAllRestaurants();
  }, [latitude, longtitude]);

  useEffect(() => {
    if (fetchComplete) {
      filterResult(category, restaurants, cityName);
      fadeAndSlide();
      previousCategory.current = category;
    }
  }, [fetchComplete, restaurants, category]);

  useEffect(() => {
    if (cityName) {
      console.log("🚀 ~ useEffect ~ data:", cityName)
      // setCityNameFromSearching(cityName.toString())
      forwardGeocoding(cityName.toString())
    }
  }, [cityName])

  const getGoogleRestaurants = async(latitude: Double, longitude: Double): Promise<Restaurant[]> =>{
    const radius = 8000;
    const url =`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${googleApiKey}`;
    try{
      const response = await axios.get(url);
      const restaurants = GoogleRestaurantToRestaurant(response.data.results)
      if(Array.isArray(restaurants)){
        restaurants.forEach((restaurant) => {
          // console.log("🚀 ~ getGoogleRestaurants ~ restaurant:", restaurant)
        })
      }
      return restaurants as Restaurant[];
    }catch(err){
      console.log(err);
      return [];
    }
  }

  // MARK - Testing without get data from DB, directly fetch from google map api
  const getAllRestaurants = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/restaurant/all');
      const responseFromGoogle = await getGoogleRestaurants(latitude, longtitude);
      const filteredGoogleResponse: Restaurant[] = responseFromGoogle!.filter((googleRestaurant: Restaurant) =>
        !response.data.some((existingRestaurant: Restaurant) => existingRestaurant.restaurantid === googleRestaurant.restaurantid)
      );
      setRestaurants([...response.data, ...filteredGoogleResponse]);
      setLoading(false);
      setFetchComplete(true);
    } catch (error) {
      console.error(error);
    }
  }

  // filter fetch result by category
  const filterResult = (selectedCategory: RestaurantType, allRestaurants: Restaurant[], cityName: string | string[] | undefined) => {

    if(allRestaurants.length > 0) {
      const newList = allRestaurants.filter((restaurant) => {
        const matchesCuisine = restaurant.cuisine.includes(selectedCategory);
        if (!cityName || Array.isArray(cityName)) {
          return matchesCuisine;
        } else {
          return matchesCuisine && restaurant.city.includes(cityName);
        }
      });

      setFilterList(newList);
    }
  }


  const forwardGeocoding = async(cityName:string) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=${googleApiKey}`
    try {
      const response = await axios.get(url)
      const result = response.data
      console.log("🚀 ~ forwardGeocoding ~ result:", result.results[0].geometry.location)
      
      if (result.results.length > 0) {
        const { lat, lng } = result.results[0].geometry.location
        console.log("🚀 ~ forwardGeocoding ~ lng:", lng)
        console.log("🚀 ~ forwardGeocoding ~ lat:", lat)
        setLatitude(lat)
        setLongitude(lng)
      }else{
        console.log(`No result found`)
      }
    }catch (error) {
      console.error(`ERROR:${error}`)
    }
  }


  const fadeAndSlide = () => {
    const previousIndex = categories.findIndex(c => c.name === previousCategory.current);
    const currentIndex = categories.findIndex(c => c.name === category);
    const direction = currentIndex > previousIndex ? 1 : -1;
    translateX.value = direction * 50; 
    opacity.value = 0;

    translateX.value = withTiming(0, {
      duration: 850,
      easing: Easing.inOut(Easing.ease),
    });
    opacity.value = withTiming(1, {
      duration: 850,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });


  return (
    <Animated.View style={[{ flex: 1, marginTop: 80 }, animatedStyle]}>
      <Stack.Screen
      options={{
          header: () => <ExploreHeader onCategoryChanged={onDataChanged} restaurants={restaurants} />,
          }}
        />
      <Mapview listOfRestaurant={filterList} latitude={latitude} longitude={longtitude} />
      <ListingBottomSheet listOfRestaurant={filterList} category={category}/>
    </Animated.View>
  );
}
