import { useEffect, useMemo, useState } from 'react';
import { EyeOff, Medal, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../../../app/providers/AuthProvider';
import { converterItensEquipadosParaSlots } from '../../../../features/profile-cosmetics';
import {
  obterRankingAmigos,
  obterRankingGeral,
  RankingBoard,
  type EntradaRanking,
  type LinhaRanking,
  type RankingAlunoResposta,
} from '../../../../features/ranking';

type AbaRanking = 'geral' | 'amigos';

const TABS: Array<{ key: AbaRanking; label: string }> = [
  { key: 'geral', label: 'Ranking geral' },
  { key: 'amigos', label: 'Entre amigos' },
];

const montarDetalhe = (curso: string | null, semestre: string | null): string | null => {
  return (
    [curso, semestre ? `${semestre}º semestre` : null].filter(Boolean).join(' · ') || null
  );
};

export const RankingAlunoPage = () => {
  const { user } = useAuth();
  const [aba, setAba] = useState<AbaRanking>('geral');
  const [resposta, setResposta] = useState<RankingAlunoResposta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const dados = aba === 'geral' ? await obterRankingGeral() : await obterRankingAmigos();
        if (ativo) {
          setResposta(dados);
        }
      } catch (error) {
        if (ativo) {
          setResposta(null);
          setErro(error instanceof Error ? error.message : 'Erro ao carregar o ranking.');
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, [aba]);

  const mapearLinha = (entrada: EntradaRanking): LinhaRanking => ({
    posicao: entrada.posicao,
    id: entrada.usuarioId,
    nome: entrada.nome,
    nickname:
      entrada.ehUsuarioAtual && !entrada.nickname ? user?.nickname ?? null : entrada.nickname,
    detalhe: montarDetalhe(entrada.curso, entrada.semestre),
    totalAcertos: entrada.totalAcertos,
    taxaAcerto: entrada.taxaAcerto,
    destaque: entrada.ehUsuarioAtual,
    cosmeticos: converterItensEquipadosParaSlots(entrada.cosmeticos ?? []),
  });

  const linhas = useMemo(
    () => (resposta ? resposta.dados.map(mapearLinha) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resposta, user?.nickname],
  );

  const usuarioAtual = useMemo(
    () => (resposta?.usuarioAtual ? mapearLinha(resposta.usuarioAtual) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resposta, user?.nickname],
  );

  const perfilPrivado = aba === 'geral' && !carregando && !erro && resposta !== null && usuarioAtual === null;

  const resumoPosicao = () => {
    if (carregando) return '—';
    if (perfilPrivado) return 'Perfil privado';
    if (!usuarioAtual) return 'Sem dados';
    return `${usuarioAtual.posicao}º`;
  };

  const resumoTotal = () => {
    if (!resposta) return aba === 'amigos' ? 'amigos' : 'participantes';
    const sufixo = aba === 'amigos' ? 'amigos (incluindo você)' : 'alunos no ranking';
    return `de ${resposta.totalParticipantes} ${sufixo}`;
  };

  return (
    <main className="min-h-full bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[#0A1128]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#71edc8]/20 text-[#00A88F]">
              <Trophy size={24} />
            </span>
            <h1 className="text-3xl font-black">Ranking</h1>
          </div>
          <p className="max-w-2xl text-sm font-medium text-[#0A1128]/60">
            Acompanhe seu desempenho no AnatoQuizUp pelo total de acertos e veja como você está em
            relação aos colegas e amigos.
          </p>
        </div>

        <article className="flex items-center gap-5 rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#71edc8]/20 text-[#00A88F]">
            <Medal size={28} />
          </span>
          <div className="min-w-0">
            <p className="text-3xl font-black leading-none text-[#0A1128]">{resumoPosicao()}</p>
            <h2 className="mt-2 text-base font-black text-[#0A1128]">Sua posição</h2>
            <p className="mt-1 text-sm font-medium text-[#0A1128]/55">{resumoTotal()}</p>
          </div>
        </article>

        <div className="w-full overflow-hidden rounded-2xl border border-[#0A1128]/10 bg-white shadow-sm">
          <div className="grid grid-cols-2">
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

        {perfilPrivado && (
          <div className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <EyeOff size={22} />
            </span>
            <div>
              <h3 className="text-base font-black text-[#0A1128]">Seu perfil está privado</h3>
              <p className="mt-1 text-sm font-medium text-[#0A1128]/60">
                Com o perfil privado você não aparece no ranking geral. Ative a visibilidade em{' '}
                <Link to="/aluno/amigos" className="font-black text-[#00A88F] hover:underline">
                  Amigos › Privacidade
                </Link>{' '}
                para entrar na disputa.
              </p>
            </div>
          </div>
        )}

        {aba === 'amigos' && !carregando && !erro && resposta && resposta.totalParticipantes <= 1 && (
          <div className="flex items-start gap-4 rounded-2xl border border-[#0A1128]/10 bg-white p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#71edc8]/20 text-[#00A88F]">
              <Users size={22} />
            </span>
            <div>
              <h3 className="text-base font-black text-[#0A1128]">Adicione amigos para comparar</h3>
              <p className="mt-1 text-sm font-medium text-[#0A1128]/60">
                Você ainda não tem amigos no ranking. Vá em{' '}
                <Link to="/aluno/amigos" className="font-black text-[#00A88F] hover:underline">
                  Amigos
                </Link>{' '}
                e envie convites para disputar com seus colegas.
              </p>
            </div>
          </div>
        )}

        <RankingBoard
          linhas={linhas}
          rotuloMetrica="acertos"
          usuarioAtual={usuarioAtual}
          carregando={carregando}
          erro={erro}
          mensagemVazio={
            aba === 'amigos'
              ? 'Ninguém por aqui ainda. Adicione amigos e comece a responder questões para aparecer no ranking.'
              : 'Ainda não há alunos no ranking. Responda questões para somar acertos e aparecer aqui.'
          }
        />
      </section>
    </main>
  );
};
