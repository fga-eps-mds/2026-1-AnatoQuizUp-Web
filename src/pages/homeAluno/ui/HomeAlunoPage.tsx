import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { ProfileHome } from '../../../shared/ui/profile-home/index';
import { Button } from '../../../shared/ui/button/Button';

/** Acao principal da home do aluno: atalho para iniciar um quiz. */
const StudentActions = () => {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate('/aluno/quiz/escolha')}>
      Acessar Quizzes
    </Button>
  );
};

/**
 * Home do aluno: reaproveita o ProfileHome com os dados do usuario e um bloco
 * explicativo de como a plataforma funciona.
 */
export const HomeAlunoPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <ProfileHome
      isAuthenticated={isAuthenticated}
      profileLabel="Perfil do Estudante"
      name={user?.name}
      metadata={user?.course ? `${user.course} | UnB` : 'UnB'}
      onLogin={() => navigate('/login')}
      action={<StudentActions />}
    >
      <div className="bg-white border-2 border-[#0A1128]/5 rounded-3xl p-8 text-left shadow-sm w-full">
        <h3 className="text-xl font-black text-[#0A1128] mb-6 flex items-center gap-2">
          👋 Como a plataforma funciona?
        </h3>
        
        <ul className="flex flex-col gap-5 text-[#0A1128]/70 font-medium">
          <li className="flex gap-3 items-start">
            <span className="text-[#00E5FF] text-xl">🧠</span>
            <p><strong>Banco Compartilhado:</strong> Responda questões de anatomia radiológica criadas e validadas por professores da UnB.</p>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-[#00E5FF] text-xl">🎯</span>
            <p><strong>Filtros Inteligentes:</strong> Busque os exercícios focando em temas específicos que você precisa estudar para a prova.</p>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-[#00E5FF] text-xl">⚡</span>
            <p><strong>Feedback Imediato:</strong> Ao responder, saiba na hora se você acertou ou errou, garantindo um aprendizado ativo.</p>
          </li>
        </ul>
      </div>
    </ProfileHome>
  );
};