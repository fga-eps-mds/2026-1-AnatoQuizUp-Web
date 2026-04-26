import { Navigate } from 'react-router';
import { useAuth } from '../providers/AuthProvider';
import type { Role } from '../../entities/user/model/types'; 

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export const ProtectedRoute = ({children, allowedRoles}: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAuth();
    if(!isAuthenticated){
        return <Navigate to='/login' replace/>;
    }

    if(allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.warn('Acesso não autorizado');
        return <Navigate to='/home' replace/>;
    }

    return <>{children}</>;
}