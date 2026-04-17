import type { User } from '../../../entities/user/userStore.ts';
export const loginByUsername = async (username: string, password: string) => {
  return new Promise<User>((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === '123') {
        resolve({ id: '1', name: 'Mano Dev' });
      } else {
        reject(new Error('Credenciais inv\u00E1lidas! Tente admin e 123.'));
      }
    }, 1500);
  });
};