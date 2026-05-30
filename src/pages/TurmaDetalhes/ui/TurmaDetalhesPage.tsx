import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Edit, LayoutList, Activity } from 'lucide-react';

import { buscarDashboardMacro } from '../../../entities/dashboardTurma/api/dashboardTurmaApi';
import { buscarTurmaPorId } from '../../../entities/turmas/api/turmaApi'; 

import type { DashboardMacro } from '../../../entities/dashboardTurma/model/types';
import type { Turma } from '../../../entities/turmas/model/types';

import { CardsResumo } from '../../../features/dashboard-turmas/ui/CardsResumo';
import { GraficoTemas } from '../../../features/dashboard-turmas/ui/GraficoTemas';
import { EmptyState } from '../../../features/dashboard-turmas/ui/EmptyState';

export const TurmaDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const [activeTab, setActiveTab] = useState<'alunos' | 'listas' | 'dashboard'>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardMacro | null>(null);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        // Busca os dados da turma E do dashboard ao mesmo tempo
        const [turmaResponse, dashResponse] = await Promise.all([
          buscarTurmaPorId(id), 
          buscarDashboardMacro(id)
        ]);
        
        setTurma(turmaResponse);
        setDashboardData(dashResponse);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Carregando detalhes da turma...</div>;
  }

  if (!turma) {
    return <div className="flex h-64 items-center justify-center text-red-500">Turma não encontrada.</div>;
  }

  return (
    <div className="w-full p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da Turma</h1>
          <p className="text-sm text-gray-500">Visão completa de alunos, listas e desempenho</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm">
          <Users size={16} /> Professor
          <div className="flex h-6 w-6 items-center justify-center rounded bg-teal-500 text-xs font-bold text-white">PS</div>
        </div>
      </div>

      <div className="mb-4 text-xs font-medium text-gray-400">
        <Link to="/turmas" className="hover:text-teal-500">Turmas</Link> &gt; <span className="text-gray-600">{turma.nome}</span>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white pt-6 shadow-sm">
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md shadow-teal-200">
              <Users size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{turma.nome}</h2>
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span>{turma.ano}.{turma.semestre}</span>
                <span>•</span>
                <span>{turma.quantidadeAlunos ?? 0} alunos</span>
                <span>•</span>
                <span>Prof. Responsável</span>
                <span>•</span>
                <span className={`flex items-center gap-1 ${turma.status === 'ATIVA' ? 'text-teal-600' : 'text-amber-600'}`}>
                  <span className={`h-2 w-2 rounded-full ${turma.status === 'ATIVA' ? 'bg-teal-500' : 'bg-amber-500'}`}></span>
                  {turma.status === 'ATIVA' ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </div>
          
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
            <Edit size={16} />
            Editar turma
          </button>
        </div>

        <div className="mt-6 flex border-t border-gray-100 px-6">
          <button 
            onClick={() => setActiveTab('alunos')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold transition-colors ${activeTab === 'alunos' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >
            <Users size={18} /> Alunos
          </button>
          <button 
            onClick={() => setActiveTab('listas')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold transition-colors ${activeTab === 'listas' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >
            <LayoutList size={18} /> Listas
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >
            <Activity size={18} /> Dashboard
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && dashboardData && (
        <>
          <CardsResumo dados={dashboardData} />

          {dashboardData.totalQuestoesRespondidas === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              
              <div className="flex flex-col gap-6 lg:col-span-8">
                {/* A sua parte: Temas */}
                <GraficoTemas temas={dashboardData.desempenhoPorTema} />
                
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <Users size={20} className="text-gray-400" />
                    Desempenho Individual
                  </h3>
                  <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                    [ Área reservada para a dupla: Tabela de Alunos (Visão Micro) ]
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <LayoutList size={20} className="text-gray-400" />
                    Desempenho por Lista
                  </h3>
                  <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400 text-center px-4">
                    [ Área reservada para a dupla:<br/>Listas Vinculadas ]
                  </div>
                </div>
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
};