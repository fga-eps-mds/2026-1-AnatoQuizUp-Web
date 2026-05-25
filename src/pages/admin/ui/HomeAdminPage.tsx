import { ShieldCheck, Users, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';

export const HomeAdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const primeiroNome = user?.name?.split(' ')[0] || 'Administrador';

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center animate-fade-in">
        
        <div className="w-20 h-20 bg-[#E6FCFA] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-[#14D5C2]" />
        </div>
        
        <h1 className="text-3xl font-black text-[#0A1128] mb-4">
          Bem-vindo(a), {primeiroNome}!
        </h1>
        <p className="text-[#0A1128]/70 text-lg mb-10">
          Este é o seu painel de controle do AnatoQuizUp. Aqui você possui acesso total para gerenciar a plataforma.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-gray-50 p-6 rounded-xl flex flex-col items-center text-center border border-gray-100">
            <Users className="w-8 h-8 text-[#F97316] mb-3" />
            <h3 className="font-bold text-[#0A1128]">Aprovar Professores</h3>
            <p className="text-xs text-[#0A1128]/60 mt-2">Libere o acesso para novos docentes que se cadastraram.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl flex flex-col items-center text-center border border-gray-100">
            <Search className="w-8 h-8 text-[#14D5C2] mb-3" />
            <h3 className="font-bold text-[#0A1128]">Monitorar Contas</h3>
            <p className="text-xs text-[#0A1128]/60 mt-2">Busque usuários, verifique status e bloqueie acessos indevidos.</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="bg-[#0A1128] hover:bg-[#00214d] text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-3 mx-auto w-full sm:w-auto shadow-md"
        >
          Acessar Gerenciamento de Usuários
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};