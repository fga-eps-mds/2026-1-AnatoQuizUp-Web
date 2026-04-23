import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../shared/ui/button/Button';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center p-6">
      
      <div className="w-full max-w-xl flex flex-col items-center gap-10">
        
        <div className="text-center">
          <h1 className="text-5xl font-black text-[#0A1128]">
            Anato<span className="text-[#00E5FF]">QuizUp</span>
          </h1>
          <p className="text-[#0A1128]/40 tracking-[0.3em] text-[10px] font-bold uppercase mt-2">
            Plataforma de Estudos
          </p>
        </div>

        {isAuthenticated ? (
          <div className="w-full bg-[#0A1128] p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#71edc8] to-[#00E5FF]"></div>

            <div className="w-20 h-20 bg-[#00214d] border-2 border-[#71edc8] rounded-full flex items-center justify-center text-[#71edc8] text-2xl font-black shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="text-center">
              <p className="text-[#fffffe]/50 text-[10px] uppercase tracking-widest font-bold mb-1">Perfil do Estudante</p>
              <h2 className="text-[#fffffe] text-3xl font-bold">{user?.name}</h2>
              <div className="mt-3 inline-block px-4 py-1 bg-[#00E5FF]/10 rounded-full border border-[#00E5FF]/20">
                <p className="text-[#00E5FF] text-[10px] font-black uppercase">{user?.course} | UnB</p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3 mt-4">
              <Button onClick={() => navigate('/quizzes')}>
                Acessar Quizzes
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[#0A1128] p-12 rounded-[2.5rem] shadow-2xl text-center flex flex-col gap-8">
            <p className="text-[#fffffe] text-xl font-medium leading-relaxed">
              Domine a <span className="text-[#71edc8] font-bold">anatomia humana</span> com quizzes gamificados criados para a UnB.
            </p>
            <Button onClick={() => navigate('/login')}>
              Entrar agora
            </Button>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 opacity-30">
            <p className="text-[#0A1128] text-[10px] font-bold uppercase tracking-tighter">Universidade de Brasília</p>
            <div className="h-px w-8 bg-[#0A1128]"></div>
        </div>
      </div>
    </main>
  );
};