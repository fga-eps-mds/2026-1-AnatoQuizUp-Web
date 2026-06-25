import { useEffect, useMemo, useState } from 'react';
import { BookOpen, List, Trophy } from 'lucide-react';

import { listarTurmas } from '../../../../entities/turmas/api/turmaApi';
import type { Turma } from '../../../../entities/turmas/model/types';
import { converterItensEquipadosParaSlots } from '../../../../features/profile-cosmetics';
import {
  obterListasDaTurma,
  obterRankingGeral,
  obterRankingLista,
  obterRankingTurma,
  RankingBoard,
  type LinhaRanking,
  type OpcaoListaTurma,
  type StatusListaAluno,
} from '../../../../features/ranking';

type AbaRanking = 'geral' | 'turma' | 'lista';

const TABS: Array<{ key: AbaRanking; label: string }> = [
  { key: 'geral', label: 'Geral AnatoQuiz' },
  { key: 'turma', label: 'Por turma' },
  { key: 'lista', label: 'Por lista' },
];

const STATUS_LABEL: Record<StatusListaAluno, string> = {
  SUBMETIDA: 'Respondida',
  EM_ANDAMENTO: 'Em andamento',
  NAO_RESPONDEU: 'Não respondeu',
};

const Seletor = ({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <label className="flex flex-1 flex-col gap-1">
    <span className="text-xs font-black uppercase tracking-wide text-[#0A1128]/50">{label}</span>
    <select
      value={value}
      disabled={disabled}
      onChange={(evento) => onChange(evento.target.value)}
      className="min-h-12 rounded-xl border border-[#0A1128]/10 bg-white px-4 text-sm font-semibold text-[#0A1128] outline-none transition focus:border-[#00A88F] focus:ring-4 focus:ring-[#71edc8]/20 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#0A1128]/40"
    >
      {children}
    </select>
  </label>
);

export const RankingProfessorPage = () => {
  const [aba, setAba] = useState<AbaRanking>('geral');

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaTurmaId, setTurmaTurmaId] = useState('');
  const [turmaListaId, setTurmaListaId] = useState('');
  const [listas, setListas] = useState<OpcaoListaTurma[]>([]);
  const [listaId, setListaId] = useState('');

  const [linhas, setLinhas] = useState<LinhaRanking[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carrega as turmas do professor uma vez.
  useEffect(() => {
    let ativo = true;
    listarTurmas()
      .then((dados) => {
        if (ativo) setTurmas(dados);
      })
      .catch(() => {
        if (ativo) setTurmas([]);
      });
    return () => {
      ativo = false;
    };
  }, []);

  // Carrega as listas vinculadas a turma selecionada na aba "por lista".
  useEffect(() => {
    let ativo = true;

    const carregarListas = async () => {
      if (aba !== 'lista' || !turmaListaId) {
        if (ativo) {
          setListas([]);
          setListaId('');
        }
        return;
      }

      try {
        const dados = await obterListasDaTurma(turmaListaId);
        if (ativo) {
          setListas(dados);
          setListaId('');
        }
      } catch {
        if (ativo) setListas([]);
      }
    };

    void carregarListas();

    return () => {
      ativo = false;
    };
  }, [aba, turmaListaId]);

  // Carrega o ranking conforme aba e selecoes.
  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      setErro(null);

      if (aba === 'turma' && !turmaTurmaId) {
        setLinhas([]);
        return;
      }
      if (aba === 'lista' && (!turmaListaId || !listaId)) {
        setLinhas([]);
        return;
      }

      setCarregando(true);

      try {
        if (aba === 'geral') {
          const resposta = await obterRankingGeral();
          if (ativo) {
            setLinhas(
              resposta.dados.map((entrada) => ({
                posicao: entrada.posicao,
                id: entrada.usuarioId,
                nome: entrada.nome,
                nickname: entrada.nickname,
                detalhe:
                  [entrada.curso, entrada.semestre ? `${entrada.semestre}º semestre` : null]
                    .filter(Boolean)
                    .join(' · ') || null,
                totalAcertos: entrada.totalAcertos,
                taxaAcerto: entrada.taxaAcerto,
                destaque: false,
                cosmeticos: converterItensEquipadosParaSlots(entrada.cosmeticos ?? []),
              })),
            );
          }
        } else if (aba === 'turma') {
          const resposta = await obterRankingTurma(turmaTurmaId);
          if (ativo) {
            setLinhas(
              resposta.dados.map((entrada) => ({
                posicao: entrada.posicao,
                id: entrada.alunoId,
                nome: entrada.nome,
                nickname: entrada.nickname,
                detalhe: `${entrada.totalRespondidas} respondidas`,
                totalAcertos: entrada.totalAcertos,
                taxaAcerto: entrada.taxaAcerto,
                destaque: false,
                cosmeticos: converterItensEquipadosParaSlots(entrada.cosmeticos ?? []),
              })),
            );
          }
        } else {
          const resposta = await obterRankingLista(turmaListaId, listaId);
          if (ativo) {
            setLinhas(
              resposta.dados.map((entrada) => ({
                posicao: entrada.posicao,
                id: entrada.alunoId,
                nome: entrada.nome,
                nickname: entrada.nickname,
                detalhe: STATUS_LABEL[entrada.status],
                totalAcertos: entrada.totalAcertos,
                taxaAcerto: entrada.taxaAcerto,
                destaque: false,
                cosmeticos: converterItensEquipadosParaSlots(entrada.cosmeticos ?? []),
              })),
            );
          }
        }
      } catch (error) {
        if (ativo) {
          setLinhas([]);
          setErro(error instanceof Error ? error.message : 'Erro ao carregar o ranking.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, [aba, turmaTurmaId, turmaListaId, listaId]);

  const listaSelecionada = useMemo(
    () => listas.find((lista) => lista.listaTurmaId === listaId) ?? null,
    [listas, listaId],
  );

  return (
    <main className="min-h-full bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[#0A1128]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#71edc8]/20 text-[#00A88F]">
              <Trophy size={24} />
            </span>
            <h1 className="text-3xl font-black">Ranking de desempenho</h1>
          </div>
          <p className="max-w-2xl text-sm font-medium text-[#0A1128]/60">
            Veja o ranking geral do AnatoQuizUp, o desempenho dos alunos por turma e o resultado em
            cada lista que você publicou.
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-[#0A1128]/10 bg-white shadow-sm">
          <div className="grid grid-cols-3">
            {TABS.map((tab) => {
              const isActive = aba === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setAba(tab.key)}
                  aria-pressed={isActive}
                  className={`min-h-12 border-r border-[#0A1128]/10 px-3 text-sm font-black transition-colors last:border-r-0 ${
                    isActive
                      ? 'bg-[#71edc8]/15 text-[#0A1128]'
                      : 'bg-white text-[#0A1128]/60 hover:bg-[#F8FAFC] hover:text-[#0A1128]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {aba === 'turma' && (
          <div className="flex flex-col gap-3 rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#71edc8]/20 text-[#00A88F]">
              <BookOpen size={22} />
            </span>
            <Seletor label="Turma" value={turmaTurmaId} onChange={setTurmaTurmaId}>
              <option value="">Selecione uma turma</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} ({turma.codigo})
                </option>
              ))}
            </Seletor>
          </div>
        )}

        {aba === 'lista' && (
          <div className="flex flex-col gap-3 rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#71edc8]/20 text-[#00A88F]">
                <List size={22} />
              </span>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Seletor label="Turma" value={turmaListaId} onChange={setTurmaListaId}>
                  <option value="">Selecione uma turma</option>
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} ({turma.codigo})
                    </option>
                  ))}
                </Seletor>
                <Seletor
                  label="Lista"
                  value={listaId}
                  onChange={setListaId}
                  disabled={!turmaListaId || listas.length === 0}
                >
                  <option value="">
                    {turmaListaId
                      ? listas.length === 0
                        ? 'Nenhuma lista publicada'
                        : 'Selecione uma lista'
                      : 'Escolha a turma primeiro'}
                  </option>
                  {listas.map((lista) => (
                    <option key={lista.listaTurmaId} value={lista.listaTurmaId}>
                      {lista.nomeLista}
                    </option>
                  ))}
                </Seletor>
              </div>
            </div>
            {listaSelecionada && (
              <p className="text-sm font-semibold text-[#0A1128]/55">
                Ranking da lista <span className="font-black text-[#0A1128]">{listaSelecionada.nomeLista}</span>
              </p>
            )}
          </div>
        )}

        <RankingBoard
          linhas={linhas}
          rotuloMetrica="acertos"
          carregando={carregando}
          erro={erro}
          mensagemVazio={
            aba === 'turma'
              ? 'Selecione uma turma para ver o ranking dos alunos.'
              : aba === 'lista'
                ? 'Selecione uma turma e uma lista para ver o ranking.'
                : 'Ainda não há alunos no ranking geral.'
          }
        />
      </section>
    </main>
  );
};
