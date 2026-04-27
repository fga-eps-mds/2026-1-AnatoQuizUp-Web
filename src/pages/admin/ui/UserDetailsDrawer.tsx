import React from "react";
import { Check, X, UserMinus, RefreshCw } from 'lucide-react';
import type { AdminUser} from '../../../entities/user/model/types';

interface Props {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDeactivate?: () => void;
  onReactivate?: () => void;
}

export const UserDetailsDrawer: React.FC<Props> = ({
  user,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDeactivate,
  onReactivate,
}) => {
  if (!isOpen || !user) return null;

  const getStatusLabel = () => {
    switch (user.status) {
      case "ACTIVE":
        return "Ativo";
      case "PENDING":
        return "Aguardando";
      case "INACTIVE":
        return "Inativo";
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case "STUDENT":
        return "Aluno";
      case "PROFESSOR":
        return "Professor";
      case "ADMIN":
        return "Admin";
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white z-50 shadow-lg flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detalhes do usuário</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* User basic */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-300" />
          <div>
            <p className="font-medium">{user.name}</p>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                {getRoleLabel()}
              </span>
              <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {getStatusLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 text-sm">
          <Info label="Nome" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Código" value={user.codigo} />
          <Info label="Departamento" value={user.department} />
          <Info label="Curso" value={user.course} />
          <Info label="Data de cadastro" value={user.createdAt} />
          <Info label="Último acesso" value={user.lastAccess || "-"} />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-4">
          {user.status === "PENDING" ? (
            <>
              <button
                onClick={onApprove}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00EBC7] px-4 py-2 text-[#00214D] font-medium shadow-sm transition hover:brightness-90 cursor-pointer"
              >
                <Check className="h-4 w-4 text-[#00214D]" />
                Aprovar usuário
              </button>
              <button
                onClick={onReject}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500 bg-white px-4 py-2 text-[#FF5470] font-medium transition hover:bg-red-50 cursor-pointer"
              >
                <X className="h-4 w-4" />
                Rejeitar usuário
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onDeactivate}
                disabled={user.status === "INACTIVE"}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-medium transition ${
                  user.status === "INACTIVE"
                    ? 'border border-[#F5F5F5] bg-[#F5F5F5] text-[#6B7280] cursor-not-allowed'
                    : 'border border-[#00214D] bg-transparent text-[#00214D] hover:bg-[#F5FAFF] hover:border-[#00214D] cursor-pointer'
                }`}
              >
                <UserMinus className={`h-4 w-4 ${user.status === "INACTIVE" ? 'text-[#6B7280]' : ''}`} />
                Desativar usuário
              </button>
              <button
                onClick={onReactivate}
                disabled={user.status === "ACTIVE"}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-medium transition ${
                  user.status === "ACTIVE"
                    ? 'border border-[#F5F5F5] bg-[#F5F5F5] text-[#6B7280] cursor-not-allowed'
                    : 'border border-[#00214D] bg-transparent text-[#00214D] hover:bg-[#F5FAFF] hover:border-[#00214D] cursor-pointer'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${user.status === "ACTIVE" ? 'text-[#6B7280]' : ''}`} />
                Reativar usuário
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
);