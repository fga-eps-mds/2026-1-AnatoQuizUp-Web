/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getAuthenticatedUser } from '../../features/auth-by-credencials/model/authService.ts';
import type { User, AuthState } from '../../entities/user/model/types.ts';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    const loadAuthenticatedUser = useCallback(async () => {
        const userData = await getAuthenticatedUser();
        setUser(userData);
    }, []);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const restoreSession = async () => {
            try {
                const userData = await getAuthenticatedUser();

                if (isMounted) {
                    setUser(userData);
                }
            } catch {
                if (isMounted) {
                    logout();
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void restoreSession();

        return () => {
            isMounted = false;
        };
    }, [logout]);

    const login = useCallback(async (accessToken: string, refreshToken: string) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        try {
            await loadAuthenticatedUser();
        } catch (error) {
            logout();
            throw error;
        }
    }, [loadAuthenticatedUser, logout]);

    const value = useMemo<AuthState>(
        () => ({ user, isAuthenticated: !!user, isLoading, login, logout }),
        [user, isLoading, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
