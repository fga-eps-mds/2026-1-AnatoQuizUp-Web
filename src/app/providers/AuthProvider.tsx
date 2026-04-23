/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';
import type { User, AuthState } from '../../entities/user/model/types.ts';

const AuthContext = createContext<AuthState | undefined>(undefined);


export const AuthProvider = ({children}:{children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (accessToken: string, refreshToken: string, userData: User) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setUser(userData);
    }

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context;
}

