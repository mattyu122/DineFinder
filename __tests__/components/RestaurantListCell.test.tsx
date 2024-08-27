import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Restaurant } from '@/types/Restaurant/restaurantInterfaces';
import RestaurantListCell from '@/components/RestaurantListCell/RestaurantListCell';
import { useStateContext } from '@/app/context/AuthContext';

jest.mock('expo-router', () => ({
    Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/api/axiosClient', () => ({
    post: jest.fn(),
    delete: jest.fn(),
}));

jest.mock('@/app/context/AuthContext', () => ({
    useStateContext: jest.fn(),
}));

const mockSetUser = jest.fn();
const mockUserWithRestaurant = {
    userID: 'user1',
    wishList: ['rest123456'],
};

const mockUserWithoutRestaurant = {
    userID: 'user2',
    wishList: [],
};
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
    coverpic: ["https://example.com/bellaitalia-cover.jpg"],
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


describe('RestaurantListCell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        (useStateContext as jest.Mock).mockReturnValue({
            user: mockUserWithRestaurant,
            setUser: mockSetUser,
        });

        const { getByText, getByTestId } = render(
            <RestaurantListCell item={mockRestaurant} wishListID={[]} />
        );

        expect(getByText('Bella Italia')).toBeTruthy();
        expect(getByText('Italian')).toBeTruthy();
        expect(getByText('CA$$$')).toBeTruthy();
        expect(getByText('123 Pasta Street, Rome')).toBeTruthy();
        expect(getByText('4.7')).toBeTruthy();
    });

    it('shows heart icon as outline when restaurant is in wishlist', () => {
        (useStateContext as jest.Mock).mockReturnValue({
            user: mockUserWithoutRestaurant,
            setUser: mockSetUser,
        });

        const { getByTestId } = render(
            <RestaurantListCell item={mockRestaurant} wishListID={[]} />
        );

        expect(getByTestId('heart-icon').props.accessibilityLabel).toBe('heart-outline');
    });

    it('shows heart icon as filled when restaurant is not in wishlist', () => {
        (useStateContext as jest.Mock).mockReturnValue({
            user: mockUserWithRestaurant,
            setUser: mockSetUser,
        });
        const { getByTestId } = render(
            <RestaurantListCell item={mockRestaurant} wishListID={[]} />
        );

        expect(getByTestId('heart-icon').props.accessibilityLabel).toBe('heart');
    }); 

    it('navigates to the correct restaurant detail page when clicked', () => {
        const { getByTestId } = render(
            <RestaurantListCell item={mockRestaurant} wishListID={[]} />
        );

        fireEvent.press(getByTestId('restaurant-touchable'));
    });
}); 