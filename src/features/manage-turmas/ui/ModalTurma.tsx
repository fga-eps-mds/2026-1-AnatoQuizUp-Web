import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import type { SalvarTurmaPayload, StatusTurma, Turma } from '../../../entities/turmas/model/types';

interface ModalTurmaProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  turma: Turma | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: SalvarTurmaPayload) => void | Promise<void>;
}

const valoresIniciais = {
  codigo: '',
  nome: '',
  ano: String(new Date().getFullYear()),
  semestre: '1',
  descricao: '',
  status: 'ATIVA' as StatusTurma,
};

const obterValoresIniciais = (mode: 'create' | 'edit', turma: Turma | null) => {
  if (mode === 'edit' && turma) {
    return {
      codigo: turma.codigo,
      nome: turma.nome,
      ano: String(turma.ano),
      semestre: turma.semestre,
      descricao: turma.descricao,
      status: turma.status,
    };
  }

  return valoresIniciais;
};

export const ModalTurma = ({
  isOpen,
  mode,
  turma,
  isLoading = false,
  onClose,
  onSubmit,
}: ModalTurmaProps) => {
  const estadoInicial = obterValoresIniciais(mode, turma);
  const [codigo, setCodigo] = useState(estadoInicial.codigo);
  const [nome, setNome] = useState(estadoInicial.nome);
  const [ano, setAno] = useState(estadoInicial.ano);
  const [semestre, setSemestre] = useState(estadoInicial.semestre);
  const [descricao, setDescricao] = useState(estadoInicial.descricao);
  const [status, setStatus] = useState<StatusTurma>(estadoInicial.status);

  const anoNumerico = Number(ano);
  const isFormValido = useMemo(() => (
    codigo.trim().length > 0 &&
    nome.trim().length > 0 &&
    semestre.trim().length > 0 &&
    Number.isInteger(anoNumerico) &&
    anoNumerico > 0 &&
    descricao.trim().length > 0
  ), [anoNumerico, codigo, descricao, nome, semestre]);

  if (!isOpen) return null;

  const titulo = mode === 'create' ? 'Nova turma' : 'Editar turma';
  const textoBotao = mode === 'create' ? 'Criar turma' : 'Salvar alteracoes';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValido || isLoading) return;

    await onSubmit({
      codigo: codigo.trim(),
      nome: nome.trim(),
      ano: anoNumerico,
      semestre: semestre.trim(),
      descricao: descricao.trim(),
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-turma-title"
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 id="modal-turma-title" className="text-lg font-bold text-gray-900">
              {titulo}
            </h3>
            <p className="text-sm text-gray-500">
              Informe os dados basicos da turma.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Fechar modal de turma"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Codigo
            <input
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="ANAT-01"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Nome
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Turma A"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Ano
            <input
              type="number"
              min={2000}
              value={ano}
              onChange={(event) => setAno(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="2026"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Semestre
            <select
              value={semestre}
              onChange={(event) => setSemestre(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusTurma)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="ATIVA">Ativa</option>
              <option value="INATIVA">Encerrada</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
            Descricao
            <textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              rows={4}
              className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Escopo, materia ou observacoes da turma"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!isFormValido || isLoading}
            className="flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {isLoading ? 'Salvando...' : textoBotao}
          </button>
        </div>
      </form>
    </div>
  );
};
