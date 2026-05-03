import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/login/index";
import { HomePage } from "../pages/home/index";
import { RegisterPage } from "../pages/register/index";
import { ForgotPasswordPage } from "../pages/forgot-password";
import { ResetPasswordPage } from "../pages/reset-password";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { HomeProfessorPage } from "../pages/homeProfessor";
import { QuestionsPage } from "../pages/questao";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
    
      <Route
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />

        {<Route 
          path="/professor/home"
          element={
            <ProtectedRoute allowedRoles={['PROFESSOR']}>
              <HomeProfessorPage/>
            </ProtectedRoute>
          } 
        />}
        <Route
          path="/professor/questoes"
          element={
            <ProtectedRoute allowedRoles={['PROFESSOR']}>
              <QuestionsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};
