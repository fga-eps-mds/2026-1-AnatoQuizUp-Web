import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '../../../shared/ui/Button.tsx';
import { Input } from '../../../shared/ui/Input.tsx';
import { loginByUsername } from '../api/loginService.ts';
import { useUserModel } from '../../../entities/user/userStore.ts';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const saveUserToGlobalState = useUserModel((state) => state.login);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await loginByUsername(username, password);
      saveUserToGlobalState(userData);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
        <Input placeholder="Digite 'admin'" onChange={handleUsernameChange} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <Input type="password" placeholder="Digite '123'" onChange={handlePasswordChange} />
      </div>
      <div className="mt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Entrar'}
        </Button>
      </div>
    </form>
  );
};