import Colors from '@/constants/Colors';
import { OperationStatus } from '@/enum/OperationStatus';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import Animated from 'react-native-reanimated';
interface BookingDate {
    day: string;
    month: string;
}

interface Props {
    restaurant: Restaurant | null
    operationStatus: string
    openTimeSlots: React.MutableRefObject<string[]>;
    bookingTimeSlot: { time: string, isDisabled: boolean }[]
    selectedTimeSlot: string | null
    setSelectedTimeSlot: React.Dispatch<React.SetStateAction<string | null>>;
    seatSlot: { customer: string, isDisabled: boolean }[]
    selectedSeat: string | null
    setSelectedSeat: React.Dispatch<React.SetStateAction<string | null>>
    bookingDate: BookingDate
    setBookingDate: React.Dispatch<React.SetStateAction<{ day: string, month: string }>>
    setIsPressedSeatSlot: React.Dispatch<React.SetStateAction<boolean>>
    setIsPressedTimeSlot: React.Dispatch<React.SetStateAction<boolean>>
    isRestaurantRegistration: null
    selectedDate: string
    setSelectedDate: React.Dispatch<React.SetStateAction<string>>
}

const OverviewPage = ({ restaurant, operationStatus, openTimeSlots,
    bookingTimeSlot, selectedTimeSlot, setSelectedTimeSlot,
    seatSlot, selectedSeat, bookingDate, setBookingDate, setSelectedSeat, setIsPressedSeatSlot,
    setIsPressedTimeSlot, isRestaurantRegistration, selectedDate, setSelectedDate }: Props) => {

    const date = new Date()
    const [openCalendar, setOpenCalendar] = useState(false)
    const [today, setToday] = useState('')
    const [afterOneWeek, setAfterOneWeek] = useState('')

    useEffect(() => {
        setToday(getTodayDate(date))
        setAfterOneWeek(getDateAfterOneWeek())
    }, [])

    useEffect(() => {
        console.log(`selectedDate : ${selectedDate}`)
    }, [selectedDate])

    useEffect(() => {
        console.log(`isRestaurantRegistration in overview: ${isRestaurantRegistration}`)
    },[])

    const getTodayDate = (date:Date):string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function getDateAfterOneWeek(): string {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7); // Add 7 days to today's date

        return getTodayDate(nextWeek);
    }

    const handleURLOpen = (URL: string | null | undefined) => {
        if (URL) {
            Linking.openURL(URL)
                .catch(err => console.error("Failed to open URL:", err));
        } else {
            console.log("URL is null");
        }
    }

    const handlePressTimeSlot = (time: string, isPressed: boolean) => {
        setSelectedTimeSlot(time)
        setIsPressedTimeSlot(isPressed)
    }

    const handlePressSeatSlot = (seat: string, isPressed: boolean) => {
        console.log(`seat: ${seat}`)
        setSelectedSeat(seat)
        setIsPressedSeatSlot(isPressed)
    }

    const handleCalendarOpen = () => {
        if (openCalendar) {
            setOpenCalendar(false)
        } else {
            setOpenCalendar(true)
        }
    }

    function getMonthName(dateString: string) {
        const [year, month, day] = dateString.split('/');

        const monthNumber = parseInt(month, 10);
        if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            console.error('Invalid month in date string');
            return 'Invalid Month';
        }

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames[monthNumber - 1];
    }

    function getDay(dateString: string) {
        const [year, month, day] = dateString.split('/');

        const dayNumber = parseInt(day, 10);
        if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
            console.error('Invalid day in date string');
            return 'Invalid Day';
        }

        return dayNumber.toString();
    }

    const onSelectDateChange = (date: string) => {
        setSelectedDate(date)
        setBookingDate({ day: getDay(date), month: getMonthName(date) })
        setOpenCalendar(false)
    }

    return (
        <>
            {/* Restaurant open hour / status */}
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
                {
                    operationStatus === OperationStatus.UNKNOWN ? (
                        <Text style={[styles.operationStatusText, { color: 'grey' }]}>{operationStatus}</Text>
                    ) : operationStatus === OperationStatus.HOURS24 ? (
                        <Text style={[styles.operationStatusText, { color: 'green' }]}>{operationStatus}</Text>
                    ) : operationStatus === OperationStatus.OPEN ? (
                        <Text style={[styles.operationStatusText, { color: 'green' }]}>{operationStatus}</Text>
                    ) : (
                        <Text style={[styles.operationStatusText, { color: 'red' }]}>{operationStatus}</Text>
                    )
                }
                {
                    openTimeSlots.current.map((time, index) => (
                        <Text key={index} style={{ color: 'gray', paddingVertical: 5 }}>{time}</Text>
                    ))
                }
            </View>
            <View style={styles.divider} />

            {/* Restaurant description */}
            <Text style={styles.description}>
                {restaurant?.description == null ? (restaurant?.description) : ("No description provided")}
            </Text>

            <View style={styles.divider} />

            {/* Restaurant service */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10 }}>
                {restaurant?.service['dineIn'] ? (<MaterialIcons name='done' size={24} color={'orange'} />) : (<MaterialIcons name='close' size={24} color={'gray'} />)}
                <Text style={{ fontSize: 18 }}>Dine-in</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>·</Text>
                {restaurant?.service['takeout'] ? (<MaterialIcons name='done' size={24} color={'orange'} />) : (<MaterialIcons name='close' size={24} color={'gray'} />)}
                <Text style={{ fontSize: 18 }}>Takeout</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>·</Text>
                {restaurant?.service['delivery'] ? (<MaterialIcons name='done' size={24} color={'orange'} />) : (<MaterialIcons name='close' size={24} color={'gray'} />)}
                <Text style={{ fontSize: 18 }}>Delivery</Text>
            </View>

            <View style={styles.divider} />

            {/* Restaurant website */}
            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => handleURLOpen(restaurant?.website)}>
                <Ionicons name='earth-outline' size={24} color={'gray'} />
                <Text style={{ marginHorizontal: 20, marginVertical: 4 }}>{restaurant?.website}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {isRestaurantRegistration && (
                <>
                    {/* Time slot */}
                    <View>
                        <Text style={{
                            fontSize: 16,
                            marginHorizontal: 5,
                            marginBottom: 5,
                            fontFamily: 'mon',
                        }}>Time Slot - {`${bookingDate ? (`${bookingDate.month} ${bookingDate.day}`) : (`NA`)}`} </Text>
                    </View>
                    {/* Calendar */}
                    {openCalendar && (
                        <DatePicker
                            options={{
                                backgroundColor: '#090C08',
                                textHeaderColor: '#FFA25B',
                                textDefaultColor: '#F6E7C1',
                                selectedTextColor: '#fff',
                                mainColor: '#F4722B',
                                textSecondaryColor: '#D6C7A1',
                                borderColor: 'rgba(122, 146, 165, 0.1)',
                            }}
                            // current={today}
                            style={{
                                position: 'absolute', top: 180, left: 20, right: 0, bottom: 0,
                                zIndex: 99, borderRadius: 12, height: 100
                            }}
                            mode='calendar'
                            onSelectedChange={onSelectDateChange}
                            //not yet fix the time range
                            minimumDate={today}
                            maximumDate={afterOneWeek}
                        />
                    )}

                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.Slot} onPress={handleCalendarOpen}>
                            <Text style={styles.SlotText}>Other Date</Text>
                        </TouchableOpacity>
                        <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                            {bookingTimeSlot?.map((slot, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.Slot,
                                    selectedTimeSlot === slot.time ? styles.selectedSlot : null,
                                    slot.isDisabled ? styles.disabledSlot : null
                                    ]}
                                    onPress={() => !slot.isDisabled && handlePressTimeSlot(slot.time, true)}
                                    disabled={slot.isDisabled}
                                >
                                    <Text style={[
                                        styles.SlotText,
                                        slot.isDisabled ? styles.disabledSlotText : null
                                    ]}>
                                        {slot.time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </Animated.ScrollView>
                    </View>
                    <View style={styles.divider} />

                    {/* Seat slot */}
                    <View>
                        <Text style={{
                            fontSize: 16,
                            marginHorizontal: 5,
                            marginBottom: 5,
                            fontFamily: 'mon',
                        }}>Seats:</Text>
                    </View>
                    <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                        {seatSlot.map((slot, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.seatBtn,
                                selectedSeat === slot.customer ? styles.selectedSlot : null,
                                slot.isDisabled ? styles.disabledSlot : null
                                ]}
                                onPress={() => !slot.isDisabled && handlePressSeatSlot(slot.customer, true)}
                                disabled={slot.isDisabled}
                            >
                                <Text style={styles.SlotText}>{slot.customer}</Text>
                            </TouchableOpacity>
                        ))
                        }
                    </Animated.ScrollView>
                </>
            )}
        </>
    );
};

const styles = StyleSheet.create({
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
});

export default OverviewPage;