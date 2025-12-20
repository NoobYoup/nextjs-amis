'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Config API URL - Change this to your PHP Backend URL
// For development, you might use localhost if PHP is running locally
// In production, this should be the absolute URL to your /api
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                // If token invalid, clear it
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Don't clear user immediately on network error, but here we assume invalid
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        // We can also store user in localStorage for faster initial load, 
        // but verify with API is safer.
        setUser(userData);
        router.push('/admin/activities'); // Default admin page
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
