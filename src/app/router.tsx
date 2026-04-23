import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/login/index'; 
import { HomePage } from '../pages/home/index';  
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};
