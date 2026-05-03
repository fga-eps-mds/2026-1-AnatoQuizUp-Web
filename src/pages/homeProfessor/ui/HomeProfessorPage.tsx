import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { ProfileHome } from '../../../shared/ui/profile-home';

export const HomeProfessorPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <ProfileHome
      isAuthenticated={isAuthenticated}
      profileLabel="Perfil do Professor"
      name={user?.name}
      metadata={user?.email}
      onLogin={() => navigate('/login')}
    />
  );
};
