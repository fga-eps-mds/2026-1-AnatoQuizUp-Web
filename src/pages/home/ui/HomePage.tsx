import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../shared/ui/button/Button';
import { ProfileHome } from '../../../shared/ui/profile-home';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <ProfileHome
      isAuthenticated={isAuthenticated}
      profileLabel="Perfil do Estudante"
      name={user?.name}
      metadata={`${user?.course ?? ''} | UnB`}
      onLogin={() => navigate('/login')}
      action={<Button onClick={() => navigate('/quizzes')}>Acessar Quizzes</Button>}
    />
  );
};
