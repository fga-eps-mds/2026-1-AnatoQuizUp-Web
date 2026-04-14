import './style/global.css'
import { Header } from '../components/header/Header.tsx';
import { LoginPage } from '../pages/login/ui/LoginPage.tsx';
import { useUserModel } from '../entities/user/userStore.ts';

export const App = () => {
  const isAuth = useUserModel((state) => state.isAuth);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4">
        {isAuth ? (
          <div className="p-8 bg-green-50 border border-green-200 rounded-lg text-center text-green-800">
            <h2 className="text-2xl font-bold mb-2">Parabéns!</h2>
            <p>Você entrou com sucesso no sistema.</p>
          </div>
        ) : (
          <LoginPage />
        )}
      </main>
    </div>
  );
};