import { useState, useEffect } from 'react';
import { Search, Plus, Users, Edit, Trash2 } from 'lucide-react';
import type { Turma } from '../../../entities/turmas/model/types';
import { listarTurmas, excluirTurma } from '../../../entities/turmas/api/turmaApi';
import { ModalExcluirTurma } from './ModalExcluirTurma';

export const ListaTurmas = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('');
  
  const [atualizarLista, setAtualizarLista] = useState(0); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const dados = await listarTurmas({ 
          busca: busca || undefined, 
          status: statusFiltro ? (statusFiltro as Turma['status']) : undefined 
        });
        setTurmas(dados);
      } catch (error) {
        console.error('Erro ao carregar turmas', error);
      }
    };

    fetchTurmas();
  }, [busca, statusFiltro, atualizarLista]); 

  const handleAbrirModalExcluir = (turma: Turma) => {
    setTurmaSelecionada(turma);
    setIsModalOpen(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!turmaSelecionada) return;
    setIsDeleting(true);
    try {
      await excluirTurma(turmaSelecionada.id);
      setIsModalOpen(false);
      setTurmaSelecionada(null);
      
      setAtualizarLista(prev => prev + 1); 
      
    } catch (error) {
      console.error('Erro ao excluir turma', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Suas turmas</h2>
          <p className="text-sm text-gray-500">{turmas.length} turmas cadastradas</p>
        </div>
        
        <button 
          onClick={() => alert('Abrir feature de Nova Turma')}
          className="flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-bold text-teal-950 hover:bg-teal-500 transition-colors"
        >
          <Plus size={18} />
          Nova Turma
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar turma"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <select className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500">
          <option value="">Todos os semestres</option>
          <option value="2026.1">2026.1</option>
          <option value="2025.2">2025.2</option>
        </select>

        <select 
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="ATIVA">Ativa</option>
          <option value="INATIVA">Encerrada</option>
        </select>

        <span className="text-sm text-gray-500">{turmas.length} resultado(s)</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Turma</th>
              <th className="px-6 py-4">Semestre</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Alunos</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Criada em</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {turmas.map((turma) => (
              <tr key={turma.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-900">{turma.nome}</td>
                <td className="px-6 py-4">{turma.ano}.{turma.semestre}</td>
                <td className="px-6 py-4">{turma.descricao}</td>
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-1.5 mt-0.5">
                  <Users size={16} className="text-gray-400" />
                  {turma.quantidadeAlunos}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    turma.status === 'ATIVA' 
                      ? 'bg-teal-100 text-teal-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${turma.status === 'ATIVA' ? 'bg-teal-600' : 'bg-amber-600'}`}></span>
                    {turma.status === 'ATIVA' ? 'Ativa' : 'Encerrada'}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(turma.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors">
                      <Users size={14} />
                      Alunos
                    </button>
                    <button 
                      onClick={() => alert(`Abrir edição para ${turma.nome}`)}
                      className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Edit size={14} />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleAbrirModalExcluir(turma)}
                      className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {turmas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma turma encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalExcluirTurma 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmarExclusao}
        turma={turmaSelecionada}
        isLoading={isDeleting}
      />
    </div>
  );
};