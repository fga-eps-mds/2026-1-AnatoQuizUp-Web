import { useState } from "react";
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
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
      const error = err as Error;
      setErrorMsg(error.message || 'Erro ao entrar.');
    } finally {
      setIsLoading(false);
    }
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
          <Link to="/esqueci-senha" title="Esqueci senha" className="text-[#fffffe]/70 text-xs hover:text-[#71edc8] transition-colors">
            Esqueceu sua senha?
          </Link>
        </div>
      </div>

      {errorMsg && <span className="text-red-500 text-sm font-medium">{errorMsg}</span>}
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Carregando...' : 'Continuar'}
      </Button>
      
      <div className="text-center text-sm text-[#fffffe]/80 mt-2">
        Não tem uma conta? <Link to="/cadastro" className="font-bold text-[#fffffe] hover:text-[#71edc8] transition-colors ml-1">Cadastrar-se</Link>
      </div>
      
    </form>
  );
};