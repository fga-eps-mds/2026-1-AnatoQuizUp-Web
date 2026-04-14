import { LoginForm } from '../../../features/auth-by-username/ui/LoginForm';

export const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Acesse sua conta</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};