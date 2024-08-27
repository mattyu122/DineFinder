import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import axiosClient from '@/api/axiosClient';
import { useStateContext } from '@/app/context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import Wishlist from '@/app/(tabs)/Wishlist';

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(),
}));
jest.mock('expo-router', () => ({
    Link: jest.fn(),
}));
jest.mock('@/app/context/AuthContext', () => ({
    useStateContext: jest.fn(),
}));

jest.mock('expo-router', () => ({
    Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock data
const mockUser = { userID: 'test-user' };
const mockWishListID = [
    { id: 'restaurant1' },
    { id: 'restaurant2' }
];

// Mock implementations
(useStateContext as jest.Mock).mockReturnValue({ user: mockUser });
(useIsFocused as jest.Mock).mockReturnValue(true);

// Mock the axiosClient directly in the test file
jest.mock('@/api/axiosClient', () => ({
    get: jest.fn(),
    interceptors: {
        request: {
            use: jest.fn(),
            eject: jest.fn(),
        },
        response: {
            use: jest.fn(),
            eject: jest.fn(),
        },
    },
}));
describe('Wishlist Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetches all wishlist IDs correctly', async () => {
        (useStateContext as jest.Mock).mockReturnValue({ user: mockUser });
        (axiosClient.get as jest.Mock).mockResolvedValueOnce({ data: mockWishListID });

        render(
                <Wishlist />
        );

        await waitFor(() => {
            expect(axiosClient.get).toHaveBeenCalledWith(`/user/${mockUser.userID}/allWishlistID`);
            expect(axiosClient.get).toHaveBeenCalledTimes(1);
        });
    });

    it('handles empty wishlist state correctly', async () => {
        (axiosClient.get as jest.Mock).mockResolvedValue({ data: [] });

        render(<Wishlist />);

        await waitFor(() => 
            expect(screen.getByText("There don't have any restaurant added")).toBeTruthy()
        );
        
    });

    it('should show guest view when no user is logged in', async () => {
        (useStateContext as jest.Mock).mockReturnValue({ user: null });

        render(<Wishlist />);

        expect(screen.getByText('Log in to view your wishlists')).toBeTruthy();
        expect(screen.getByText('You can create, view, or edit wishlists once you\'ve logged in.')).toBeTruthy();
    })

    it('should display the Login button when no user is logged in', async () => {
        (useStateContext as jest.Mock).mockReturnValue({ user: null });

        render(<Wishlist />);

        await waitFor(() => {
            expect(screen.getByText('Login')).toBeTruthy();
        });    
    });

    it('handles API errors gracefully', async () => {
        (axiosClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

        render(<Wishlist />);

        await waitFor(() => expect(screen.queryByText('Bella Italia')).toBeNull());
    });
});

