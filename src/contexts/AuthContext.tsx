'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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

// Config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
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
                setLastActivityTime(Date.now()); // Reset activity time on successful auth
            } else {
                // If token invalid, clear it
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Update activity time on user interaction
    const updateActivity = () => {
        setLastActivityTime(Date.now());
    };

    // Check for session timeout every minute
    useEffect(() => {
        if (!user) return;
        
        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastActivityTime > SESSION_TIMEOUT) {
                logout();
                toast.info('Phiên đăng nhập đã hết hạn do không hoạt động');
            }
        }, 60000); // Check every minute
        
        return () => clearInterval(interval);
    }, [user, lastActivityTime]);

    // Add global activity listeners
    useEffect(() => {
        if (!user) return;
        
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });
        
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
        };
    }, [user]);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        setUser(userData);
        setLastActivityTime(Date.now());
        router.push('/admin/activities');
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
