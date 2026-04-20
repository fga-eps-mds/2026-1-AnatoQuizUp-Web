import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) return setErrorMsg('Campos obrigatórios.');
    setIsLoading(true);

    try {
      const response = await loginWithCredencials(email, password);
      login(response.token, response.user);
      navigate('/home');
    } catch (err) {
     const error = err as { status?: number };

      if (error.status === 401) {
        setErrorMsg('Email ou senha inválidos');
      } else if (error.status === 403) {
        setErrorMsg('Conta desativada. Entre em contato com o administrador.');
      } else {
        setErrorMsg('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[340px]">
      
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
          <Link to="/esqueci-senha" title="Esqueci senha" className="text-[#00214d] md:text-[#fffffe]/70 text-xs hover:text-[#0A1128] md:hover:text-[#71edc8] transition-colors font-semibold md:font-normal">
            Esqueceu sua senha?
          </Link>
        </div>
      </div>

      {errorMsg && <span className="text-red-500 text-sm font-medium">{errorMsg}</span>}
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Carregando...' : 'Continuar'}
      </Button>
      
      <div className="text-center text-sm text-[#00214d] md:text-[#fffffe]/80 mt-2 font-medium md:font-normal">
        Não tem uma conta? 
        <Link to="/cadastro" className="font-bold text-[#00214d] md:text-[#fffffe] hover:text-[#0A1128] md:hover:text-[#71edc8] transition-colors ml-1">
          Cadastrar-se
        </Link>
      </div>
      
      <div className="text-center text-sm text-[#00214d] md:text-[#fffffe]/80 mt-1 font-medium md:font-normal">
        <Link to="/cadastro" className="font-bold text-[#00214d] md:text-[#fffffe] hover:text-[#0A1128] md:hover:text-[#71edc8] transition-colors ml-1">
          Entrar como professor
        </Link>
      </div>
      
    </form>
  );
};