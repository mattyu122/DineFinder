import axiosClient from '@/api/axiosClient';
import SubmitReviews from '@/components/RestaurantReviews/SubmitReviews';
import { googleApiKey } from '@/config/googleConsoleMapConfig';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { OperationStatus } from '@/enum/OperationStatus';
import { GoogleRestaurantToRestaurant, Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { ParamListBase, useIsFocused, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as Haptics from 'expo-haptics';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    SlideInDown,
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollViewOffset,
} from 'react-native-reanimated';

import { useStateContext } from '@/app/context/AuthContext';

import OverviewPage from '@/components/RestaurantDetailsPage/OverviewPage';
import ReviewsPage from '@/components/RestaurantDetailsPage/ReviewsPage';
import ReviewPhoto from '@/components/RestaurantReviews/ReviewPhoto';
import { Reservation } from '@/types/Reservation/ReservationDetail';
import { Review } from '@/types/RestaurantReview/review';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment-timezone';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

type MonthName =
    | 'january' | 'february' | 'march' | 'april' | 'may' | 'june'
    | 'july' | 'august' | 'september' | 'october' | 'november' | 'december';

interface TimeParts {
    hours: number;
    minutes: number;
    modifier: string;
}

const detailCategories = [
    {
        name: 'Overview',
        icon: 'local-dining',
    },
    {
        name: 'Reviews',
        icon: 'rate-review',
    },
];

export type RootStackParamList = {
    BookingConfirm: {
        restaurant: Restaurant;
        reservation: Reservation;
    };
} & ParamListBase

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BookingConfirm'>;


const DetailsPage = () => {
    const params = useLocalSearchParams()
    const { user, setUser } = useStateContext();
    const { id } = useLocalSearchParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [operationStatus, setOperationStatus] = useState(OperationStatus.UNKNOWN);
    const openTimeSlotsRef = useRef<string[]>([]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [bookingTimeSlot, setBookingTimeSlot] = useState<{ time: string, isDisabled: boolean }[]>()
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [seatSlot, setSeatSlot] = useState<{ customer: string, isDisabled: boolean }[]>([])
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

    const itemsRef = useRef<Array<TouchableOpacity | null>>([]);
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    const [bookingDate, setBookingDate] = useState<{ day: string, month: string }>({ day: '', month: '' })
    const [selectedDate, setSelectedDate] = useState('');
    const [isPressedSeatSlot, setIsPressedSeatSlot] = useState(false)
    const [isPressedTimeSlot, setIsPressedTimeSlot] = useState(false)

    const [isRestaurantRegistration, setIsRestaurantRegistration] = useState(null)
    const [isInWishlist, setIsInWishlist] = useState(user?.wishList.includes(id));
    // tab selection
    const [selectedTab, setSelectedTab] = useState('Overview');
    const [reservation, setReservation] = useState<Reservation | null>(null)
    const [isValid, setIsValid] = useState(false)

    const [reviews, setReviews] = useState<Review[]>([])
    const [fetchingLoading, setfetchingLoading] = useState(false)

    useEffect(() => {
        if (restaurant && bookingDate.day && bookingDate.month) {
            checkBookingDateOpenHours();
        }
    }, [selectedDate]);

    useEffect(() => {
        if (params.restaurantID) {
            handleRestaurantCheck()
        }
    }, [params.restaurantID])

    useEffect(() => {
        setfetchingLoading(true)
        getRestaurantDetail()
    }, [])

    useEffect(() => {
        const userWishList = user?.wishList || []
        console.log('userWishList', userWishList)
        setIsInWishlist(userWishList.includes(id))
    }, [user])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerTransparent: true,

            headerBackground: () => (
                <Animated.View style={[headerAnimatedStyle, styles.header]}></Animated.View>
            ),
            headerRight: () => (
                <View style={styles.bar}>
                    <TouchableOpacity style={styles.roundButton} onPress={shareListing}>
                        <Ionicons name="share-outline" size={22} color={'#000'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.roundButton} onPress={saveToWishlist}>
                        <Ionicons
                            accessibilityLabel={isInWishlist ? 'heart' : 'heart-outline'}
                            name={isInWishlist ? "heart" : "heart-outline"}
                            size={22} color={'#000'} />
                    </TouchableOpacity>
                </View>
            ),
            headerLeft: () => (
                <TouchableOpacity style={styles.roundButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={'#000'} />
                </TouchableOpacity>
            ),
        });
    }, []);

    useEffect(() => {
        getCurrentDayOfWeek()
    }, [restaurant])

    useEffect(() => {
        createReservation()
    }, [selectedTimeSlot, selectedSeat])

    useEffect(() => {
        if (reservation && restaurant) {
            setIsValid(true)
        }
    }, [reservation, restaurant])

    useEffect(() => {
        if (restaurant) {
            getRestaurantReview()
        }
    }, [restaurant])

    const getRestaurantReview = async () => {
        try {
            const response = await axiosClient.get(`/restaurant/reviews/${restaurant?.restaurantid}`)
            setReviews(response.data)
        } catch (error) {
            console.log("🚀 ~ getRestaurantReview ~ error:", error)
        }
    }

    const handleRestaurantCheck = async () => {
        try {
            const exists = await confirmRestaurantRegistration();
            setIsRestaurantRegistration(exists);
        } catch (error) {
            console.error(error);
            setIsRestaurantRegistration(null);
        }
    }

    const confirmRestaurantRegistration = async () => {
        try {
            const restaurantID = params.restaurantID
            const response = await axiosClient.get(`/user/confirmRestaurantRegistration/${restaurantID}`);
            return response.data.exists;
        } catch (error) {
            console.error('Error confirming restaurant registration:', error);
            throw error;
        }
    };

    const fetchFromFirestore = async (): Promise<Restaurant | null> => {
        try {
            const response = await axiosClient.get(`/restaurant/${id}`);

            if (response.data === null) {
                return null;
            }
            return response.data;
        } catch (error: any) {
            console.log('error', error.message)
            return null
        }
    };

    const fetchRestaurantDetailsFromGoogle = async () => {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${googleApiKey}`;
        try {
            const response = await axios.get(url);
            const restaurant = GoogleRestaurantToRestaurant(response.data.result)

            return restaurant as Restaurant;
        } catch (error) {
            console.error('Error fetching restaurant details from Google:', error);
            return null;
        }
    };

    const createGoogleRestaurant = (restaurant: Restaurant, callback: (res: any, error?: any) => void) => {
        try {
            axiosClient.post('/restaurant/createFromGoogle', restaurant)
                .then(response => {
                    callback(response.data, null)
                })

        } catch (error) {
            console.error('ERROR', error)
            callback(null, error)
        }
    }

    const getRestaurantDetail = async () => {
        try {
            const restaurantFromFirestore = await fetchFromFirestore()
            if (restaurantFromFirestore && restaurantFromFirestore.table) {
                setRestaurant(restaurantFromFirestore)
                const uniqueSeats = new Set<string>();
                for (const key in restaurantFromFirestore.table) {
                    if (restaurantFromFirestore.table.hasOwnProperty(key) && restaurantFromFirestore.table[key].openForBooking) {
                        const table = restaurantFromFirestore.table[key]

                        const maxCapacity = table.maxCapacity
                        const minCapacity = table.minCapacity
                        for (let i = minCapacity; i <= maxCapacity; i++) {
                            uniqueSeats.add(i.toString());
                        }

                    }
                }
                const slots = Array.from(uniqueSeats).map(seat => ({
                    customer: seat,
                    isDisabled: false,
                }));
                setSeatSlot(slots)
                setfetchingLoading(false)
                return
            }
            const restaurant = await fetchRestaurantDetailsFromGoogle();

            if (restaurant) {
                createGoogleRestaurant(restaurant, (res, err) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                })
            }
            setRestaurant(restaurant);
            setfetchingLoading(false)

        } catch (error) {
            console.error('ERROR', error)
        }
    }

    const shareListing = async () => {
        try {
            await Share.share({
                title: restaurant?.cuisine,
                url: restaurant!.website,
            });
        } catch (err) {
            console.log(err);
        }
    };

    const selectCategory = (index: number) => {
        const selected = itemsRef.current[index];
        setActiveIndex(index);
        selected?.measure((x) => {
            scrollRef.current?.scrollTo({ x: x - 16, y: 0, animated: true });
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTab(detailCategories[index].name);
    };


    const scrollOffset = useScrollViewOffset(scrollRef);

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset.value,
                        [-IMG_HEIGHT, 0, IMG_HEIGHT, IMG_HEIGHT],
                        [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
                    ),
                },
                {
                    scale: interpolate(scrollOffset.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]),
                },
            ],
        };
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollOffset.value, [0, IMG_HEIGHT / 1.5], [0, 1]),
        };
    }, []);

    const getCurrentDayOfWeek = (date = new Date()) => {
        const daysOfWeek = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];
        const current = new Date();
        const currentDayOfWeek = daysOfWeek[current.getDay()]

        if (restaurant?.openinghours) {
            switch (currentDayOfWeek) {
                case 'sunday':
                    isCurrentTimeInRange(restaurant.openinghours.sunday, date);
                    break;
                case 'monday':
                    isCurrentTimeInRange(restaurant.openinghours.monday, date);
                    break;
                case 'tuesday':
                    isCurrentTimeInRange(restaurant.openinghours.tuesday, date);
                    break;
                case 'wednesday':
                    isCurrentTimeInRange(restaurant.openinghours.wednesday, date);
                    break;
                case 'thursday':
                    isCurrentTimeInRange(restaurant.openinghours.thursday, date);
                    break;
                case 'friday':
                    isCurrentTimeInRange(restaurant.openinghours.friday, date);
                    break;
                case 'saturday':
                    isCurrentTimeInRange(restaurant.openinghours.saturday, date);
                    break;
                default:
                    break;
            }


        }
    }

    const convertTo24HourFormat = (timeStr: string, previousModifier: string | null = 'AM'): Date | null => {
        if (!timeStr) return null;
        const date = new Date();
        let newDate = new Date();

        let normalizedPreviousModifier = ""
        let timeStringWithModifier = timeStr;

        if (previousModifier) {
            normalizedPreviousModifier = previousModifier.toUpperCase().replace(/\.(?=M)/g, '');
        }


        if (!timeStr.match(/(AM|PM|am|pm|a\.m\.|p\.m\.)/i)) {            // append the previousModifier if missing
            timeStringWithModifier = `${timeStr} ${normalizedPreviousModifier}`;
        }

        try {
            const timePart = splitTimeString(timeStringWithModifier);

            if (!timePart) {
                console.error('convertTo24HourFormat: Time part is null or undefined');
                return null;
            }

            const { hours, minutes, modifier } = timePart;

            if (hours == null || minutes == null) {
                console.error('Hours or minutes are null');
                return null;
            }

            const effectiveModifier = modifier || previousModifier;

            if (effectiveModifier !== 'AM' && effectiveModifier !== 'PM') {

                console.error('convertTo24HourFormat: Invalid time modifier');
                return null;
            }

            // convert hours based on the modifier
            let convertedHours = hours;
            if (effectiveModifier === 'PM' && convertedHours < 12) {
                convertedHours += 12;
            } else if (effectiveModifier === 'AM' && convertedHours === 12) {
                convertedHours = 0;
            }

            newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), convertedHours, minutes);
        } catch (error) {
            console.error('Error in convertTo24HourFormat:', error);
            return null;
        }

        return newDate;
    };

    const splitTimeString = (timeString: string): TimeParts | null => {
        let normalizedTimeString = timeString
            .replace(/\s+/g, ' ')
            .replace(/[^\x00-\x7F]/g, '')
            .trim()
            .toLowerCase()
            .replace(/a\.m\./g, 'am')
            .replace(/p\.m\./g, 'pm');


        if (/^\d{1,2}\s*(am|pm)$/i.test(normalizedTimeString)) {
            normalizedTimeString = normalizedTimeString.replace(/\s*(am|pm)$/i, ':00 $1');
        }

        const regexWithMinutes = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i;
        const match = normalizedTimeString.match(regexWithMinutes);

        if (!match) {
            console.log(`!match: false`)
            return null;
        }


        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const modifier = match[3].toUpperCase();


        return {
            hours,
            minutes,
            modifier,
        };
    };

    const convertTimeRange = (timeRangeStr: string, index: number, previousModifier: string | null): { startTime: Date | null, endTime: Date | null } => {
        const timeRangeParts = timeRangeStr.split('–').map(part => part.trim());

        if (timeRangeParts.length !== 2) {
            console.error('convertTimeRange: Invalid time range format');
            return { startTime: null, endTime: null };
        }

        const [startTimeStr, endTimeStr] = timeRangeParts;

        // Infer modifier for the second time slot if missing
        if (/PM/i.test(startTimeStr)) {
            previousModifier = 'PM';
        } else if (/AM/i.test(startTimeStr)) {
            previousModifier = 'AM';
        } else {
            previousModifier = index === 0 && (/AM/i.test(endTimeStr)) ? 'AM' : 'PM';
        }

        const startTime = convertTo24HourFormat(startTimeStr, previousModifier);
        const endTime = convertTo24HourFormat(endTimeStr, previousModifier);

        return { startTime, endTime };

    };

    const formatDateTo12Hour = (date: Date): string => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const modifier = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${modifier}`;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        const inputDate = new Date(date);

        return today.getFullYear() === inputDate.getFullYear() &&
            today.getMonth() === inputDate.getMonth() &&
            today.getDate() === inputDate.getDate();
    };

    const checkBookingDateOpenHours = () => {
        const monthMapping: { [key: string]: string } = {
            'January': '01',
            'February': '02',
            'March': '03',
            'April': '04',
            'May': '05',
            'June': '06',
            'July': '07',
            'August': '08',
            'September': '09',
            'October': '10',
            'November': '11',
            'December': '12'
        };

        const daysOfWeek = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];

        // Ensure the day is a two-digit number
        const day = parseInt(bookingDate.day)

        // Get the month index for the Date constructor
        const month = monthMapping[bookingDate.month as keyof typeof monthMapping]; // Cast to keyof typeof monthMapping
        const year = new Date().getFullYear(); // Get the current year

        if (!month) {
            console.error('Invalid month:', bookingDate.month);
            return;
        }

        const now = moment();
        console.log("🚀 ~ checkBookingDateOpenHours ~ now:", now)
        const nowYear = now.year();
        const nowMonth = now.format('MM');
        const nowDay = now.format('DD');
        const hour = now.format('HH');
        const minute = now.format('mm');
        const second = now.format('ss');

        let booking;
        if (`${year}-${month}-${day}` == `${nowYear}-${nowMonth}-${nowDay}`) {
            const dateString = `${nowYear}-${nowMonth}-${nowDay} ${hour}:${minute}:${second}`;
            booking = moment.tz(dateString, 'YYYY-MM-DD HH:mm:ss', 'America/Toronto');
        } else {
            const dateString = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
            booking = moment.tz(dateString, 'YYYY-MM-DD HH:mm:ss', 'America/Toronto');
        }
        const bookingDayOfWeek = daysOfWeek[booking.day()];
        console.log("🚀 ~ checkBookingDateOpenHours ~ bookingDayOfWeek:", bookingDayOfWeek)

        if (restaurant?.openinghours) {
            switch (bookingDayOfWeek) {
                case 'sunday':
                    isCurrentTimeInRange(restaurant.openinghours.sunday, booking.toDate());
                    break;
                case 'monday':
                    isCurrentTimeInRange(restaurant.openinghours.monday, booking.toDate());
                    break;
                case 'tuesday':
                    isCurrentTimeInRange(restaurant.openinghours.tuesday, booking.toDate());
                    break;
                case 'wednesday':
                    isCurrentTimeInRange(restaurant.openinghours.wednesday, booking.toDate());
                    break;
                case 'thursday':
                    isCurrentTimeInRange(restaurant.openinghours.thursday, booking.toDate());
                    break;
                case 'friday':
                    isCurrentTimeInRange(restaurant.openinghours.friday, booking.toDate());
                    break;
                case 'saturday':
                    isCurrentTimeInRange(restaurant.openinghours.saturday, booking.toDate());
                    break;
                default:
                    break;
            }
        }
    };


    const updateOpenTimeSlots = useCallback((newOpenTimes: string[] = [], clear: boolean = false) => {
        if (clear) {
            openTimeSlotsRef.current = [];
        } else {
            openTimeSlotsRef.current = [...newOpenTimes];
        }
    }, []);

    const isCurrentTimeInRange = (timeRange: string, date = new Date()) => {
        console.log("🚀 ~ isCurrentTimeInRange ~ timeRange:", timeRange)
        const currentDay = date.toLocaleString('en-US', { day: '2-digit' })
        const currentMonth = date.toLocaleString('en-US', { month: 'long' })
        let previousModifier: string | null = null;

        if (!timeRange) {
            setOperationStatus(OperationStatus.UNKNOWN)
            updateOpenTimeSlots([], true)
            setBookingTimeSlot([]);
            return
        }

        if (timeRange === OperationStatus.CLOSETODAY) {
            setOperationStatus(OperationStatus.CLOSETODAY)
            updateOpenTimeSlots([], true)
            setBookingDate({ day: (parseInt(currentDay) + 1).toString(), month: currentMonth })
            setBookingTimeSlot([]);

            return
        }

        if (timeRange === OperationStatus.HOURS24) {
            setOperationStatus(OperationStatus.HOURS24)
            updateOpenTimeSlots([], true)
            setBookingTimeSlot([]);

            return
        }
        if (timeRange && timeRange !== OperationStatus.HOURS24 && timeRange !== OperationStatus.CLOSETODAY) {
            const timeslots = timeRange.split(',').map(time => time.trim());
            const openTimes: string[] = []
            let isOpenNow = false;

            for (let index = 0; index < timeslots.length; index++) {
                const timeslot = timeslots[index]
                let isInCurrentRange = false
                const { startTime, endTime } = convertTimeRange(timeslot, index, previousModifier);


                if (!startTime || !endTime) {
                    console.error("isCurrentTimeInRange: Invalid time range format");
                    continue;
                }

                if (isToday(date)) {
                    console.log("🚀 ~ isCurrentTimeInRange ~ date:", date)
                    isInCurrentRange = (date >= startTime && date <= endTime) ||
                        (endTime < startTime && (date >= startTime || date <= endTime));
                }

                const { nextDay, nextMonth } = getNextDayAndMonth(currentDay, currentMonth);


                openTimes.push(`${formatDateTo12Hour(startTime)} - ${formatDateTo12Hour(endTime)}`)
                if (isInCurrentRange) {
                    console.log("🚀 ~ isCurrentTimeInRange ~ isInCurrentRange:", isInCurrentRange)
                    isOpenNow = true;
                    setOperationStatus(OperationStatus.OPEN)
                    setBookingDate({ day: currentDay, month: currentMonth })
                    const availableTimeSlots = generateTimeSlots(formatDateTo12Hour(date), formatDateTo12Hour(endTime))
                    setBookingTimeSlot(availableTimeSlots)
                } else {
                    if (isToday(date)) {
                        console.log("🚀 ~ isCurrentTimeInRange ~ isToday(date):", isToday(date))
                        setOperationStatus(OperationStatus.CLOSE)
                        setBookingDate({ day: nextDay, month: nextMonth })
                    } else {
                        setBookingDate({ day: currentDay, month: currentMonth })
                        const availableTimeSlots = generateTimeSlots(formatDateTo12Hour(startTime), formatDateTo12Hour(endTime))
                        setBookingTimeSlot(availableTimeSlots)
                    }
                }
            }

            updateOpenTimeSlots(openTimes)

        }
    };


    const monthNames: Record<MonthName, number> = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11
    };

    function getDateFromDayAndMonth(day: string, month: string): Date {

        const monthIndex = monthNames[month.toLowerCase() as MonthName];
        if (monthIndex === undefined) {
            throw new Error(`Invalid month name: ${month}`);
        }

        // Use the current year as default
        const currentYear = new Date().getFullYear();

        return new Date(currentYear, monthIndex, parseInt(day, 10));
    }

    function getNextDay(date: Date): Date {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        return nextDay;
    }

    const monthNamesReverse: { [index: number]: string } = Object.keys(monthNames).reduce((acc, month) => {
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
        acc[monthNames[month as MonthName]] = capitalizedMonth;
        return acc;
    }, {} as { [index: number]: string });

    function getNextDayAndMonth(day: string, month: string): { nextDay: string; nextMonth: string } {
        const currentDate = getDateFromDayAndMonth(day, month);
        const nextDay = getNextDay(currentDate);

        const nextDayFormatted = nextDay.getDate().toString().padStart(2, '0');
        const nextMonthIndex = nextDay.getMonth(); // 0-based index
        const nextMonthName = monthNamesReverse[nextMonthIndex];

        return {
            nextDay: nextDayFormatted,
            nextMonth: nextMonthName
        };
    }


    const getNextInterval = (date: Date): Date => {
        const minutes = date.getMinutes();
        const nextMinutes = Math.ceil(minutes / 15) * 15;
        const nextInterval = new Date(date);
        nextInterval.setMinutes(nextMinutes, 0, 0);
        return nextInterval;
    };

    const generateTimeSlots = (startTime: string, endTime: string): { time: string, isDisabled: boolean }[] => {
        const slots: { time: string, isDisabled: boolean }[] = [];
        const start = convertTo24HourFormat(startTime);
        console.log("🚀 ~ generateTimeSlots ~ start:", start)
        const end = convertTo24HourFormat(endTime);

        if (!start || !end) return slots;
        let currentTime = getNextInterval(start);
        console.log("🚀 ~ generateTimeSlots ~ currentTime:", currentTime)

        while (currentTime <= end) {
            const isDisabled = (end.getTime() - currentTime.getTime()) <= (15 * 60 * 1000);
            slots.push({ time: formatDateTo12Hour(currentTime), isDisabled });
            currentTime.setMinutes(currentTime.getMinutes() + 15)

            if (currentTime.getHours() === 0 && currentTime.getMinutes() === 0) {
                break
            }
        }
        return slots;
    }

    const saveToWishlist = async () => {
        try {
            if (!user) {
                console.log(`User not yet login`)
                Alert.alert("Please login first")
                return
            }
            const restaurantID = params.restaurantID
            const isCurrentlyWished = user.wishList.includes(restaurantID);
            if (isCurrentlyWished) {


                try {
                    await axiosClient.delete(`/user/${user.userID}/wishlist/${restaurantID}`);
                    // Remove the item from the wishlist
                    const newWishList = user.wishList.filter((item: string) => item !== restaurantID)
                    setUser({ ...user, wishList: newWishList })
                    Alert.alert("Removed from Wishlist");
                } catch (error) {
                    // Revert if the API call fails
                    setUser({ ...user, wishList: user.wishList });
                    Alert.alert("Failed to remove from Wishlist");
                }
            } else {
                try {
                    await axiosClient.post(`/user/${user.userID}/wishlist/${restaurantID}`);
                    const newWishList = [...user.wishList, restaurantID];
                    setUser({ ...user, wishList: newWishList });
                    Alert.alert("Added to Wishlist");
                } catch (error) {
                    // Revert if the API call fails
                    setUser({ ...user, wishList: user.wishList });
                    Alert.alert("Failed to add to Wishlist");
                }
            }
            console.log('User', user)

        } catch (error) {
            console.error('ERROR', error);
        }
    }

    const createReservation = () => {
        const parseDateTime = (dateTimeStr: String) => {
            const monthMap: { [key: string]: number } = {
                "January": 0,
                "February": 1,
                "March": 2,
                "April": 3,
                "May": 4,
                "June": 5,
                "July": 6,
                "August": 7,
                "September": 8,
                "October": 9,
                "November": 10,
                "December": 11
            };
            const [time, period, day, month] = dateTimeStr.split(' ');

            // Convert time to 24-hour format if necessary
            let [hours, minutes] = time.split(':').map(Number);

            if (period.toLowerCase() === 'p.m.' && hours !== 12) {
                hours += 12;
            } else if (period.toLowerCase() === 'a.m.' && hours === 12) {
                hours = 0;
            }
            const date = new Date(new Date().getFullYear(), monthMap[month], parseInt(day), hours, minutes);
            return date.toString();
        };

        try {
            if (isPressedSeatSlot && isPressedTimeSlot) {
                const reservationID = generateRandom9DigitNumber()
                const combineTimeSlotAndDate = `${selectedTimeSlot} ${bookingDate?.day} ${bookingDate?.month}`
                const date = parseDateTime(combineTimeSlotAndDate);
                const newReservation = {
                    reservationID: reservationID,
                    reservationDate: date,
                    numberOfCustomer: selectedSeat,
                    userID: user,
                    restaurantID: params.restaurantID,
                    pushNotificationToken: restaurant?.pushNotificationToken
                }
                setReservation(newReservation)
            }
        } catch (error) {
            console.log(`Error of create reservation: ${error}`)
        }
    }


    const generateRandom9DigitNumber = (): string => {
        const min = 100000000;
        const max = 999999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber.toString();
    };

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // dismiss BottomSheet while change tab
    const screenIsFocused = useIsFocused();
    if (!screenIsFocused) {
        bottomSheetModalRef.current?.dismiss();
    }

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const snapPoints = useMemo(() => ['25%', '70%'], []);

    const tabContent = () => {
        switch (selectedTab) {
            case 'Menu':
                return <></>
            case 'Reviews':
                return <ReviewsPage onPressBottomSheet={handlePresentModalPress} reviews={reviews} />;
            case 'Photos':
                return <ReviewPhoto restaurant={restaurant} />
            default:
                return <OverviewPage restaurant={restaurant!}
                    operationStatus={operationStatus} openTimeSlots={openTimeSlotsRef} bookingTimeSlot={bookingTimeSlot ?? []}
                    selectedTimeSlot={selectedTimeSlot} setSelectedTimeSlot={setSelectedTimeSlot} seatSlot={seatSlot}
                    selectedSeat={selectedSeat} setSelectedSeat={setSelectedSeat} bookingDate={bookingDate} setBookingDate={setBookingDate}
                    setIsPressedSeatSlot={setIsPressedSeatSlot} setIsPressedTimeSlot={setIsPressedTimeSlot} isRestaurantRegistration={isRestaurantRegistration}
                    selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
        }
    }

    const handlePress = () => {
        if (!isValid) {
            Alert.alert('Error', 'Please select both time and seat');
        }
    };

    const handleNavigateLogin = () => {
        router.push(`/(tabs)/UserProfile`)
    }

    const renderImageItem = ({ item }: { item: string }) => {
        return (
            <Animated.Image source={{ uri: item }} style={[styles.image]} resizeMode="cover" />
        )
    }

    return (
        <View style={styles.container}>

            <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                scrollEventThrottle={16}>

                {!fetchingLoading ? (
                    <>
                        {/* Restaurant photos */}
                        <Animated.View style={[imageAnimatedStyle]}>
                            <FlatList
                                data={restaurant?.coverpic}
                                renderItem={renderImageItem}
                                keyExtractor={(item, index) => index.toString()}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                            />
                        </Animated.View>

                        <View style={styles.infoContainer}>
                            {/* Restaurant name */}
                            <Text style={styles.name}>{restaurant?.restaurantname}</Text>

                            {/* Restaurant star & review count */}
                            <View style={{ flexDirection: 'row', gap: 4, paddingTop: 15 }}>
                                <Ionicons name='star' size={24} color={'#000'} />
                                <Text style={styles.fonts}>{restaurant?.rating} · </Text>
                                <Text style={{ marginVertical: 4, fontWeight: 'bold', fontSize: 16 }}>
                                    {reviews.length}
                                </Text>
                            </View>

                            {/* Restaurant address */}
                            <Text style={styles.fonts}>{restaurant?.address}</Text>

                            {/* Custom Picker */}
                            <View style={{
                                flexDirection:'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 65,
                                paddingHorizontal: 15,
                                paddingVertical: 15,
                                // marginLeft: 50
                            }}>
                                {detailCategories.map((item, index) => (
                                    <TouchableOpacity
                                        ref={(el) => (itemsRef.current[index] = el)}
                                        key={index}
                                        style={activeIndex === index ? styles.categoriesBtnActive : styles.categoriesBtn}
                                        onPress={() => selectCategory(index)}>
                                        <MaterialIcons
                                            name={item.icon as any}
                                            size={24}
                                            color={activeIndex === index ? '#000' : Colors.grey}
                                        />
                                        <Text style={activeIndex === index ? styles.categoryTextActive : styles.categoryText}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                            {/* Change contents view based on selected tab */}
                            {tabContent()}
                            <BottomSheetModalProvider>
                                <BottomSheetModal
                                    ref={bottomSheetModalRef}
                                    index={1}
                                    snapPoints={snapPoints}
                                    onChange={handleSheetChanges}
                                    style={styles.sheetContainer}
                                >
                                    <BottomSheetView style={styles.BottomSheetContainer}>
                                        <SubmitReviews bottomSheetModalRef={bottomSheetModalRef} restaurant={restaurant} setReviews={setReviews}/>
                                    </BottomSheetView>
                                </BottomSheetModal>
                            </BottomSheetModalProvider>
                        </View>
                    </>

                ) : (
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 300 }}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                )}

            </Animated.ScrollView>

            {/* Footer for book button */}
            {isRestaurantRegistration && (
                <Animated.View style={defaultStyles.footer} entering={SlideInDown.delay(200)}>
                    {user ? (
                        isValid ? (
                            <Link href={{
                                pathname: `/BookingConfirmation/BookingConfirm`,
                                params: {
                                    restaurant: JSON.stringify(restaurant),
                                    reservation: JSON.stringify(reservation)
                                }
                            }}>
                                <View style={[defaultStyles.btn, { justifyContent: 'center', width: 'auto' }]}>
                                    <Text style={[defaultStyles.btnText, { textAlign: 'center', width: 500 }]}>Book</Text>
                                </View>
                            </Link>
                        ) : (
                            <View style={[defaultStyles.btn,]}>
                                <Text onPress={handlePress} style={[defaultStyles.btnText, { textAlign: 'center' }]}>Book</Text>
                            </View>
                        )
                    ) : (
                        <View style={{ borderColor: 'red', borderWidth: 1, borderRadius: 12 }}>
                            <TouchableOpacity onPress={handleNavigateLogin}>
                                <Text style={{ textAlign: 'center', padding: 15, fontSize: 18, fontWeight: '500', color: 'red' }} >Please login for reservation</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    image: {
        height: IMG_HEIGHT,
        width: width,
    },
    infoContainer: {
        padding: 24,
        backgroundColor: '#fff',
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: 'mon-sb',
    },
    fonts: {
        fontSize: 16,
        color: Colors.grey,
        marginVertical: 4,
        fontFamily: 'mon',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.grey,
        marginVertical: 16,
    },
    roundButton: {
        width: 40,
        height: 40,
        borderRadius: 50,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        color: Colors.primary,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    header: {
        backgroundColor: '#fff',
        height: 100,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.grey,
    },
    description: {
        fontSize: 16,
        marginVertical: 10,
        fontFamily: 'mon',
    },
    categoryText: {
        fontSize: 14,
        fontFamily: 'mon-sb',
        color: Colors.grey,
    },
    categoryTextActive: {
        fontSize: 14,
        fontFamily: 'mon-sb',
        color: '#000',
    },
    categoriesBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8,
    },
    categoriesBtnActive: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: '#000',
        borderBottomWidth: 2,
        paddingBottom: 8,
    },
    Slot: {
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'orange',
        backgroundColor: 'orange',
    },
    selectedSlot: {
        backgroundColor: '#ff1900',
    },
    disabledSlot: {
        backgroundColor: '#ddd',
    },
    disabledSlotText: {
        color: '#888',
    },
    SlotText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 600
    },
    footerText: {
        height: '100%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    operationStatusText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seatBtn: {
        margin: 5,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 12,
        borderWidth: 2,
        marginVertical: 5,
        alignItems: 'center',
        borderColor: 'orange',
        backgroundColor: 'orange',
    },
    bookingButtonStyle: {
        width: '100%',
        paddingHorizontal: 20,
        // Add any other styles you want for the button appearance
        justifyContent: 'center',
        alignItems: 'center',
    },
    BottomSheetContainer: {
        flex: 1,
        alignItems: 'center',
    },
    sheetContainer: {
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: {
            width: 1,
            height: 1,
        },
    },
});

export default DetailsPage;