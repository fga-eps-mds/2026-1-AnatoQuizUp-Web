import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/login/index";
import { HomePage } from "../pages/home/index";
import { HomeAlunoPage } from "../pages/homeAluno/index";
import { RegisterPage } from "../pages/register/index";
import { ProfessorRegisterPage } from "../pages/professor-register";
import { ForgotPasswordPage } from "../pages/forgot-password";
import { ResetPasswordPage } from "../pages/reset-password";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { HomeProfessorPage } from "../pages/homeProfessor";
import { QuestionsPage } from "../pages/questao";
import { CreateQuestionPage } from "../pages/professor/criar-questao";
import { TurmasPage } from "../pages/turma/ui/TurmaPage";
import { ListaPage } from "../pages/lista-professor/ui/ListaPage";
import { EscolhaQuizPage, ResponderQuizPage } from "../pages/quizAluno";

import { HistoricoPage } from "../pages/historicoAluno/ui/HistoricoPage";

import { HistoricoDetalhesPage } from "../pages/historicoAluno/ui/HistoricoDetalhesPage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/professor/cadastro" element={<ProfessorRegisterPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
    
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />

      {/* TODAS AS ROTAS AQUI DENTRO TERÃO A BARRA LATERAL (MENU) */}
      <Route
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route 
          path="/aluno/home"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <HomeAlunoPage />
            </ProtectedRoute>
          } 
        />

        {/* ROTA: ESCOLHA O QUIZ */}
        <Route 
          path="/aluno/quiz/escolha"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <EscolhaQuizPage />
            </ProtectedRoute>
          } 
        />

        {/* ROTA: RESPONDER O QUIZ (A que estava faltando!) */}
        <Route
          path="/aluno/quiz/escolha"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <EscolhaQuizPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aluno/quiz/responder"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ResponderQuizPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/aluno/historico"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <HistoricoPage />
            </ProtectedRoute>
          } 
        />


        <Route 
          path="/aluno/historico/detalhes"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <HistoricoDetalhesPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/professor/home"
          element={
            <ProtectedRoute allowedRoles={['PROFESSOR']}>
              <HomeProfessorPage />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/professor/questoes"
          element={
            <ProtectedRoute allowedRoles={['PROFESSOR', 'ADMIN']}>
              <QuestionsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/professor/criar-questao"
          element={
            <ProtectedRoute allowedRoles={['PROFESSOR', 'ADMIN']}>
              <CreateQuestionPage openCreateModal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/lista"
          element={
            <ProtectedRoute allowedRoles={['PROFESSOR', 'ADMIN']}>
              <ListaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/turmas"
          element={
            <ProtectedRoute allowedRoles={['PROFESSOR', 'ADMIN']}>
              <TurmasPage />
            </ProtectedRoute>
          }
        />
        
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};