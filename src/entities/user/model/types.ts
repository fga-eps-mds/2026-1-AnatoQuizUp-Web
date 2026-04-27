export type Role = 'STUDENT' | 'PROFESSOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type AuthProviderType = 'LOCAL' | 'MICROSOFT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  authProvider: AuthProviderType;
  microsoftId?: string | null;
  institution?: string | null;
  course?: string | null;
  period?: number | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}
