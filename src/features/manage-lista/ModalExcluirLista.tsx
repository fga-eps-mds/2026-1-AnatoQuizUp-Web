import { Trash2 } from 'lucide-react';
import type { ListaQuestao } from '../../entities/lista/model/types';

interface ModalExcluirListaProps {
  isOpen: boolean;
  lista: ListaQuestao | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isLoading?: boolean;
}

export const ModalExcluirLista = ({ isOpen, lista, onClose, onConfirm, isLoading }: ModalExcluirListaProps) => {
  if (!isOpen || !lista) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Excluir lista?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Esta acao removera a lista permanentemente e desvinculara todas as turmas. Confirme para excluir:
        </p>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-6">
          <strong className="text-gray-900">{lista.nome}</strong><br />
          <span className="text-gray-500 text-xs">{lista.quantidadeQuestoes} questao(oes) - {lista.turmas.length} turma(s) vinculada(s)</span>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(lista.id)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};
