import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/login/index'; 
import { HomePage } from '../pages/home/index';  

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};