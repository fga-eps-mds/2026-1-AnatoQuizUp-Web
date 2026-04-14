import { useUserModel } from '../../entities/user/userStore.ts';

export const Header = () => {
  const { data: user, isAuth, logout } = useUserModel();

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm mb-8">
      
      {isAuth ? (
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Olá, <strong>{user?.name}</strong></span>
          <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Sair</button>
        </div>
      ) : (
        <span className="text-gray-500">Você não está logado.</span>
      )}
    </header>
  );
};