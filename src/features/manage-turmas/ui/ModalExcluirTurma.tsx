import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Turma } from '../../../entities/turmas/model/types';

interface ModalExcluirTurmaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  turma: Turma | null;
  isLoading?: boolean;
}

/**
 * Modal de confirmacao de exclusao de turma. Mostra um resumo da turma e avisa que
 * a acao desvincula todos os alunos antes de o usuario confirmar.
 */
export const ModalExcluirTurma: React.FC<ModalExcluirTurmaProps> = ({
  isOpen,
  onClose,
  onConfirm,
  turma,
  isLoading
}) => {
  // Sem modal aberto ou turma alvo, nada e renderizado.
  if (!isOpen || !turma) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-bold text-gray-900">Excluir turma?</h3>
        
        <p className="mb-6 text-sm text-gray-500">
          Esta ação removerá a turma e desvinculará todos os alunos. Confirme para excluir:
        </p>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          {turma.nome} · {turma.ano}.{turma.semestre} · {turma.quantidadeAlunos} alunos
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};