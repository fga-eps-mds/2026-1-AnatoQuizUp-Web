import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
}

interface UserModel {
  data: User | null;
  isAuth: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const useUserModel = create<UserModel>((set) => ({
  data: null,
  isAuth: false,
  login: (userData) => set({ data: userData, isAuth: true }),
  logout: () => set({ data: null, isAuth: false }),
}));