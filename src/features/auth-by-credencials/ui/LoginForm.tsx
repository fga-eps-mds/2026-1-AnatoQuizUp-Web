import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../../app/providers/AuthProvider';
import { API_CONFIG } from '../../../shared/api/config';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) return setErrorMsg('Campos obrigatórios.');
    setIsLoading(true);

    try {
      const response = await loginWithCredencials(email, password);
      login(response.accessToken, response.refreshToken, response.user);
      navigate('/home');
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || 'Erro ao entrar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${API_CONFIG.baseURL}/api/auth/microsoft`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-[340px]">
      <Input
        label="Email"
        type="email"
        placeholder="Aluno@UnB"
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

      <button
        type="button"
        onClick={handleMicrosoftLogin}
        className="flex items-center justify-center gap-3 bg-white text-[#0A1128] rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wide shadow-sm hover:brightness-95 transition-colors border border-[#0A1128]/10"
      >
        <svg width="18" height="18" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="0" y="0" width="10" height="10" fill="#F25022" />
          <rect x="12" y="0" width="10" height="10" fill="#7FBA00" />
          <rect x="0" y="12" width="10" height="10" fill="#00A4EF" />
          <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
        </svg>
        Entrar como Professor (UnB)
      </button>

      <div className="text-center text-sm text-[#00214d] md:text-[#fffffe]/80 font-medium md:font-normal">
        Não tem uma conta?
        <Link
          to="/cadastro"
          className="font-bold text-[#00214d] md:text-[#fffffe] hover:text-[#0A1128] md:hover:text-[#71edc8] transition-colors ml-1"
        >
          Cadastrar-se
        </Link>
      </div>

      <button
        type="button"
        onClick={() => navigate('/admin/login')}
        className="border border-[#0A1128]/20 md:border-[#fffffe]/30 text-[#0A1128]/80 md:text-[#fffffe]/80 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-[#71edc8] hover:text-[#71edc8] transition-colors"
      >
        Entrar como Administrador
      </button>
    </form>
  );
};
