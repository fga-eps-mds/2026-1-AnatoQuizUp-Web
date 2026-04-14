export const loginByUsername = async (username: string, password: string) => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === '123') {
        resolve({ id: '1', name: 'Mano Dev' });
      } else {
        reject(new Error('Credenciais inválidas! Tente admin e 123.'));
      }
    }, 1500);
  });
};