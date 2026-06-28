/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    getAuthenticatedUser,
    logoutSession,
} from '../../features/auth-by-credencials/model/authService.ts';
import type { User, AuthState } from '../../entities/user/model/types.ts';

// Contexto de autenticacao consumido por toda a aplicacao via useAuth.
const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * Provedor de autenticacao: mantem o usuario logado, restaura a sessao a partir do
 * token salvo e expoe login/logout/recarregar via contexto. Os tokens ficam no
 * localStorage; o usuario e buscado no backend.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    // Comeca carregando apenas se ha um token salvo a restaurar.
    const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('access_token')));

    // Limpa tokens e usuario do estado local (sessao encerrada).
    const clearSession = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    // Revoga o refresh token no backend (se houver) e sempre encerra a sessao local.
    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem('refresh_token');

        try {
            if (refreshToken) {
                await logoutSession(refreshToken);
            }
        } catch {
            // O logout local deve acontecer mesmo se a revogacao remota falhar.
        } finally {
            clearSession();
        }
    }, [clearSession]);

    // Busca o usuario autenticado no backend e o coloca no estado.
    const loadAuthenticatedUser = useCallback(async () => {
        const userData = await getAuthenticatedUser();
        setUser(userData);
    }, []);

    // Na montagem, tenta restaurar a sessao a partir do access token salvo.
    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
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
                    clearSession();
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
    }, [clearSession]);

    // Salva os tokens recebidos no login e carrega o usuario; em falha, limpa a sessao.
    const login = useCallback(async (accessToken: string, refreshToken: string) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        try {
            await loadAuthenticatedUser();
        } catch (error) {
            clearSession();
            throw error;
        }
    }, [clearSession, loadAuthenticatedUser]);

    const value = useMemo<AuthState>(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            recarregarUsuario: loadAuthenticatedUser,
        }),
        [user, isLoading, login, logout, loadAuthenticatedUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Hook de acesso ao contexto de auth; lanca erro se usado fora do AuthProvider. */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
