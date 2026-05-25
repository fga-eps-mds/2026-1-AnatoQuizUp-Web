import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { ProfileHome } from '../../../shared/ui/profile-home';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const role = String(user?.role ?? '').toUpperCase();

  if (isAuthenticated) {
    if (role === 'PROFESSOR') {
      return <Navigate to="/professor/home" replace />;
    }

    if (role === 'ADMIN' || role === 'ADMINISTRADOR') {
      return <Navigate to="/admin/home" replace />;
    }

    return <Navigate to="/aluno/home" replace />;
  }

  return (
    <ProfileHome
      isAuthenticated={isAuthenticated}
      profileLabel={user?.name || ''}
      onLogin={() => navigate('/login')}
    />
  );
};