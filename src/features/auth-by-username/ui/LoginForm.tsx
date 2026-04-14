import { useState } from 'react';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { loginByUsername } from '../api/loginService.ts';
import { useUserModel } from '../../../entities/user/userStore.ts';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const saveUserToGlobalState = useUserModel((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userData = await loginByUsername(username, password);
      saveUserToGlobalState(userData); // Salva no estado global
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
        <Input placeholder="Digite 'admin'" onChange={(e: any) => setUsername(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <Input type="password" placeholder="Digite '123'" onChange={(e: any) => setPassword(e.target.value)} />
      </div>
      <div className="mt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Entrar'}
        </Button>
      </div>
    </form>
  );
};