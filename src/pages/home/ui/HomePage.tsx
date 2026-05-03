import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { ProfileHome } from '../../../shared/ui/profile-home';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    if (user?.role === 'PROFESSOR') {
      return <Navigate to="/professor/home" replace />;
    }
    return <Navigate to="/aluno/home" replace />;
  }

  return (
    <ProfileHome
      isAuthenticated={false}
      profileLabel=""
      onLogin={() => navigate('/login')}
    />
  );
};