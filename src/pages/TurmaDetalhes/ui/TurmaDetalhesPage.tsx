import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Edit,
  LayoutList,
  Link2,
  Loader2,
  Lock,
  Unlock,
  Users,
} from 'lucide-react';

import { buscarDashboardMacro } from '../../../entities/dashboardTurma/api/dashboardTurmaApi';
import {
  atualizarVinculoListaTurma,
  listarVinculosDaTurma,
} from '../../../entities/lista/api/listaApi';
import { buscarTurmaPorId } from '../../../entities/turmas/api/turmaApi'; 

import type { DashboardMacro } from '../../../entities/dashboardTurma/model/types';
import type { VinculoListaTurma } from '../../../entities/lista/model/types';
import type { Turma } from '../../../entities/turmas/model/types';

import { CardsResumo } from '../../../features/dashboard-turmas/ui/CardsResumo';
import { GraficoTemas } from '../../../features/dashboard-turmas/ui/GraficoTemas';
import { EmptyState } from '../../../features/dashboard-turmas/ui/EmptyState';
import { TabelaDesempenhoIndividual } from '../../../features/dashboard-turmas/ui/TabelaDesempenhoIndividual';
import { CardDesempenhoListas } from '../../../features/dashboard-turmas/ui/CardDesempenhoListas';
import { AbaAlunos } from '../../../features/manage-turmas/ui/AbaAlunos';
import { ModalVincularLista } from '../../../features/manage-turmas/ui/ModalVincularLista';

type ToastType = 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

const formatarPrazo = (prazo: string | null) => {
  if (!prazo) return 'Sem prazo';

  const data = new Date(prazo);
  if (Number.isNaN(data.getTime())) return prazo;

  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TurmaDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const [activeTab, setActiveTab] = useState<'alunos' | 'listas' | 'dashboard'>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardMacro | null>(null);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [vinculosListas, setVinculosListas] = useState<VinculoListaTurma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingListas, setIsLoadingListas] = useState(false);
  const [erroListas, setErroListas] = useState<string | null>(null);
  const [idEmOperacao, setIdEmOperacao] = useState<string | null>(null);
  const [isModalVincularListaOpen, setIsModalVincularListaOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const mostrarToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

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

  const carregarVinculosListas = useCallback(async () => {
    if (!id) return;

    setIsLoadingListas(true);
    setErroListas(null);
    try {
      const dados = await listarVinculosDaTurma(id);
      setVinculosListas(dados);
    } catch (error) {
      console.error('Erro ao carregar listas da turma', error);
      setErroListas('Nao foi possivel carregar as listas publicadas.');
    } finally {
      setIsLoadingListas(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab !== 'listas') return undefined;

    const timeoutId = window.setTimeout(() => {
      void carregarVinculosListas();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, carregarVinculosListas]);

  const handleAtualizarListas = () => {
    void carregarVinculosListas();
  };

  const handleAlternarGabarito = async (vinculo: VinculoListaTurma) => {
    if (!id) return;

    setIdEmOperacao(vinculo.id);
    try {
      const vinculoAtualizado = await atualizarVinculoListaTurma(vinculo.listaQuestaoId, id, {
        gabaritoLiberado: !vinculo.gabaritoLiberado,
      });

      setVinculosListas((atuais) =>
        atuais.map((item) => (item.id === vinculoAtualizado.id ? vinculoAtualizado : item)),
      );
      mostrarToast(
        vinculoAtualizado.gabaritoLiberado
          ? 'Gabarito liberado para a turma.'
          : 'Gabarito ocultado para a turma.',
      );
    } catch (error) {
      console.error('Erro ao atualizar gabarito da lista', error);
      mostrarToast('Nao foi possivel atualizar o gabarito.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  const renderCardDesempenhoListas = () => (
    <div className="lg:col-span-4">
      <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
          <LayoutList size={20} className="text-gray-400" />
          Desempenho por Lista
        </h3>
        <CardDesempenhoListas turmaId={id!} />
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Carregando detalhes da turma...</div>;
  }

  if (!turma) {
    return <div className="flex h-64 items-center justify-center text-red-500">Turma não encontrada.</div>;
  }

  return (
    <div className="w-full p-6 md:p-8">
      {toast && (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`fixed right-6 top-6 z-[60] flex max-w-sm items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'border-teal-200 bg-teal-50 text-teal-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <EmptyState />
              </div>
              {renderCardDesempenhoListas()}
            </div>
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
                  <TabelaDesempenhoIndividual turmaId={id!} />
                </div>
              </div>

              {renderCardDesempenhoListas()}

            </div>
          )}
        </>
      )}

      {activeTab === 'alunos' && <AbaAlunos turmaId={id!} />}

      {activeTab === 'listas' && (
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Listas publicadas</h3>
              <p className="text-sm text-gray-500">
                {vinculosListas.length} lista(s) vinculada(s) a {turma.nome}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalVincularListaOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <Link2 size={16} />
              Vincular lista
            </button>
          </div>

          {isLoadingListas ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-12 text-sm text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              Carregando listas publicadas...
            </div>
          ) : erroListas ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800"
            >
              <span className="flex items-center gap-2 font-medium">
                <AlertCircle size={18} />
                {erroListas}
              </span>
              <button
                type="button"
                onClick={handleAtualizarListas}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
              >
                Tentar novamente
              </button>
            </div>
          ) : vinculosListas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
              <ClipboardList size={36} className="mb-3 text-gray-300" />
              <h4 className="text-base font-bold text-gray-900">
                Nenhuma lista publicada nesta turma.
              </h4>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Publique listas para liberar exercicios, definir prazo opcional e controlar o gabarito.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Lista</th>
                    <th className="px-4 py-3">Questoes</th>
                    <th className="px-4 py-3">Prazo</th>
                    <th className="px-4 py-3">Gabarito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vinculosListas.map((vinculo) => (
                    <tr key={vinculo.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-2 font-bold text-gray-900">
                          <ClipboardList size={16} className="text-teal-600" />
                          {vinculo.nome}
                        </span>
                      </td>
                      <td className="px-4 py-4">{vinculo.quantidadeQuestoes} questao(oes)</td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-2 text-gray-700">
                          <CalendarClock size={16} className="text-gray-400" />
                          {formatarPrazo(vinculo.prazo)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => void handleAlternarGabarito(vinculo)}
                          disabled={idEmOperacao === vinculo.id}
                          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                            vinculo.gabaritoLiberado
                              ? 'border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100'
                              : 'border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {idEmOperacao === vinculo.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : vinculo.gabaritoLiberado ? (
                            <Unlock size={13} />
                          ) : (
                            <Lock size={13} />
                          )}
                          {idEmOperacao === vinculo.id
                            ? 'Atualizando...'
                            : vinculo.gabaritoLiberado
                              ? 'Gabarito liberado'
                              : 'Gabarito oculto'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <ModalVincularLista
        isOpen={isModalVincularListaOpen}
        turma={turma}
        onClose={() => setIsModalVincularListaOpen(false)}
        onAfterChange={handleAtualizarListas}
        onFeedback={mostrarToast}
      />
    </div>
  );
};
