import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ClipboardList, Save, X } from 'lucide-react';
import type { ListaQuestao } from '../../entities/lista/model/types';

interface ModalListaProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  lista: ListaQuestao | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (nome: string) => void | Promise<void>;
}

/**
 * Modal simples de criacao/edicao de lista: um unico campo (nome) que serve aos
 * dois modos, variando titulo e rotulo do botao conforme criar ou editar.
 */
export const ModalLista = ({
  isOpen,
  mode,
  lista,
  isLoading = false,
  onClose,
  onSubmit,
}: ModalListaProps) => {
  // Nome controlado (semeado no modo edicao) e validacao de campo obrigatorio.
  const [nome, setNome] = useState(mode === 'edit' ? lista?.nome ?? '' : '');
  const isFormValido = useMemo(() => nome.trim().length > 0, [nome]);

  if (!isOpen) return null;

  // Titulo e rotulo do botao dependem do modo.
  const titulo = mode === 'create' ? 'Nova lista' : 'Editar lista';
  const textoBotao = mode === 'create' ? 'Criar lista' : 'Salvar alterações';

  /** Valida e envia o nome (sem espacos nas pontas) ao handler do componente pai. */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValido || isLoading) return;

    await onSubmit(nome.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-lista-title"
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700">
              <ClipboardList size={20} />
            </span>
            <div>
              <h3 id="modal-lista-title" className="text-lg font-bold text-gray-900">
                {titulo}
              </h3>
              <p className="text-sm text-gray-500">
                Defina um nome claro para organizar seu material.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Fechar modal de lista"
            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold text-gray-700">
          Nome da lista
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="Ex: Simulado de Anatomia - 2026.1"
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!isFormValido || isLoading}
            className="cursor-pointer flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          >
            <Save size={16} />
            {isLoading ? 'Salvando...' : textoBotao}
          </button>
        </div>
      </form>
    </div>
  );
};