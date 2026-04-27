import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/login/index'; 
import { HomePage } from '../pages/home/index';  
import { RegisterPage } from '../pages/register/index';
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';
import { ProtectedRoute } from './router/ProtectedRoute';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        {/*<Route 
          path="/painel-professor" 
          element={
            <ProtectedRoute allowedRoles={['PROFESSOR']}>
              <PainelProfessor/>
            </ProtectedRoute>
          } 
        />*/}
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};