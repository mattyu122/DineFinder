import React from 'react';
import { render } from '@testing-library/react-native';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import { Reservation } from '@/types/Reservation/ReservationDetail';
import BookingListCell from '@/components/RestaurantListCell/BookingListCell';

const mockRestaurant: Restaurant = {
    pushNotificationToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    restaurantid: "rest123456",
    restaurantname: "Bella Italia",
    cuisine: "Italian",
    address: "123 Pasta Street",
    city: "Rome",
    postalcode: "00100",
    website: "https://www.bellaitalia.com",
    rating: "4.7",
    description: "Authentic Italian cuisine in the heart of Rome.",
    coverpic: ["https://dynl.mktgcdn.com/p/us05GI9ADixBYhyLUD5pKKbMJcApThtpWvFFR6BVe1s/1200x1200.jpg"] ,
    priceRange: "$$$",
    geogcood: {
        lat: "41.9028",
        lng: "12.4964"
    },
    openinghours: {
        sunday: "12:00 PM - 10:00 PM",
        monday: "11:30 AM - 10:00 PM",
        tuesday: "11:30 AM - 10:00 PM",
        wednesday: "11:30 AM - 10:00 PM",
        thursday: "11:30 AM - 10:00 PM",
        friday: "11:30 AM - 11:00 PM",
        saturday: "12:00 PM - 11:00 PM"
    },
    service: {
        dineIn: true,
        takeout: true,
        delivery: false
    },
    table: {
        "2_seater": {
            totalTable: 10,
            maxCapacity: 2,
            minCapacity: 1,
            openForBooking: true
        },
        "4_seater": {
            totalTable: 15,
            maxCapacity: 4,
            minCapacity: 3,
            openForBooking: true
        },
        "6_seater": {
            totalTable: 5,
            maxCapacity: 6,
            minCapacity: 5,
            openForBooking: true
        }
    },
    ownerid: "owner1"
};

const mockReservation: Reservation = {
    reservationID: "821668322",
    reservationDate: "Thu Jul 18 2024 16:15:00 GMT-0400",
    numberOfCustomer: "4",
    userID: "N0wau2dQ4sa4Hy2VJwxreW0pNI72",
    restaurantID: "5H6HCVgS6zLQuMZLk8RX",
    pushNotificationToken: "tokenXYZ"
};

describe('BookingListCell', () => {
    it('renders correctly with restaurant and booking details', () => {
        const { getByText, getByTestId } = render(
            <BookingListCell bookingItem={mockReservation} restaurantInfo={mockRestaurant} />
        );

        expect(getByText('Bella Italia')).toBeTruthy();
        expect(getByText('123 Pasta Street')).toBeTruthy();

        const formattedDate = new Date(mockReservation.reservationDate).toLocaleDateString();
        const formattedTime = new Date(mockReservation.reservationDate).toLocaleTimeString();
        expect(getByText(formattedDate)).toBeTruthy();
        expect(getByText(formattedTime)).toBeTruthy();
        expect(getByText('4 people')).toBeTruthy();

        expect(getByTestId('booking-image').props.source.uri).toBe(mockRestaurant.coverpic[0]);
    });
});
