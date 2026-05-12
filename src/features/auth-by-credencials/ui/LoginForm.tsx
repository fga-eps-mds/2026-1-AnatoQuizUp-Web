import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../shared/ui/button/Button';
import { Input } from '../../../shared/ui/input/Input';
import { loginWithCredencials } from '../model/authService';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email || !password) return setErrorMsg('Campos obrigatórios.');
    setIsLoading(true);

    try {
      const response = await loginWithCredencials(email, password);
      await login(response.accessToken, response.refreshToken);
      navigate('/home');
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || 'Erro ao entrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="flex flex-col gap-6 w-full max-w-[340px]">
      <Input
        label="Email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link
            to="/esqueci-senha"
            title="Esqueci senha"
            className="text-[#00214d] md:text-[#fffffe]/70 text-xs hover:text-[#0A1128] md:hover:text-[#71edc8] transition-colors font-semibold md:font-normal"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </div>

      {errorMsg && <span className="text-red-500 text-sm font-medium">{errorMsg}</span>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Carregando...' : 'Continuar'}
      </Button>

      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#00214d]/40 md:text-[#fffffe]/40 font-bold">
        <div className="flex-1 h-px bg-[#00214d]/20 md:bg-[#fffffe]/20"></div>
        ou
        <div className="flex-1 h-px bg-[#00214d]/20 md:bg-[#fffffe]/20"></div>
      </div>

      <div className="text-center text-sm text-[#00214d] md:text-[#fffffe]/80 font-medium md:font-normal">
        Não tem uma conta?
        <Link
          to="/cadastro"
          className="font-bold text-[#00214d] md:text-[#fffffe] hover:text-[#0A1128] md:hover:text-[#71edc8] transition-colors ml-1"
        >
          Cadastrar-se como aluno
        </Link>
      </div>

      <div className="text-center text-sm text-[#00214d] md:text-[#fffffe]/80 font-medium md:font-normal">
        <Link
          to="/professor/cadastro"
          className="font-bold text-[#00214d] md:text-[#fffffe] hover:text-[#0A1128] md:hover:text-[#71edc8] transition-colors ml-1"
        >
          Cadastrar-se como professor
        </Link>
      </div>
    </form>
  );
};
