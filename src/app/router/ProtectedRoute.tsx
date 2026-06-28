import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; 
}

/**
 * Guarda de rota: bloqueia acesso conforme autenticacao e papel do usuario.
 * Sem login, redireciona para /login; com papel nao permitido, redireciona para a
 * home correspondente ao papel. Mapeia os papeis do backend (PT-BR) para os do front.
 */
export const ProtectedRoute = ({children, allowedRoles}: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Aguarda a restauracao da sessao antes de decidir.
    if (isLoading) {
        return null;
    }

    // Sem autenticacao, sempre vai para o login.
    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    if (allowedRoles && user) {
        const roleBackend = String(user.role).toUpperCase();

        // Equivalencia entre papeis do backend (PT-BR) e os usados nas rotas (EN).
        const roleMap: Record<string, string> = {
            'ALUNO': 'STUDENT',
            'PROFESSOR': 'PROFESSOR',
            'ADMINISTRADOR': 'ADMIN'
        };

        const roleFrontend = roleMap[roleBackend] || roleBackend;

        const temPermissao = allowedRoles.includes(roleFrontend) || allowedRoles.includes(roleBackend);

        // Papel sem permissao: redireciona para a home do proprio papel.
        if (!temPermissao) {
            console.warn(`[Redirecionamento] Acesso negado. Usuário: ${roleBackend}. Exigido: ${allowedRoles}`);
            
            if (roleFrontend === 'ADMIN' && location.pathname === '/home') {
                 return <>{children}</>;
            }

            if (roleFrontend === 'STUDENT') return <Navigate to='/aluno/home' replace />;
            if (roleFrontend === 'PROFESSOR') return <Navigate to='/professor/home' replace />;
            if (roleFrontend === 'ADMIN') return <Navigate to='/admin/home' replace />;
            
            return <Navigate to='/home' replace />;
        }
    }

    return <>{children}</>;
}