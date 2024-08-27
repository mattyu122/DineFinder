// src/context/AuthContext.tsx
import { Role } from '@/enum/Role';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface StateContextType {
    user: any | null;
    token: string | null;
    mode: Role;
    setUser: (user: any | null) => void;
    setToken: (token: string | null) => void;
    setMode: (mode: Role) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [mode, setMode] = useState<Role>(Role.USER)
    const [token, _setToken] = useState<string | null>(null);
    const setToken = async (token: string | null) => {
        _setToken(token);
        if (token) {
            await SecureStore.setItemAsync('ACCESS_TOKEN', token);
        } else {
            await SecureStore.deleteItemAsync('ACCESS_TOKEN');
        }
    };

    return (
        <StateContext.Provider value={{ user, mode, token, setUser, setToken, setMode}}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = (): StateContextType => {
    const context = useContext(StateContext);
    if (!context) {
        throw new Error('useStateContext must be used within a ContextProvider');
    }
    return context;
};
