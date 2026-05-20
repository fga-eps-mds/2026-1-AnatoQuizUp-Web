import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, ArrowLeft, CheckCircle2, XCircle, PauseCircle, PlayCircle, ChevronRight, Check, Loader2, Flag } from 'lucide-react';

import { buscarQuestoesQuiz, responderQuestaoQuiz } from '../../../features/random-quiz/randomQuizService';
import type { QuizQuestion, QuestaoQuizFeedback } from '../../../features/random-quiz/types';
import type { ApiQuestionDifficulty } from '../../../features/manage-questions';

export const ResponderQuizPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const temaQuery = searchParams.get('tema') || '';
  const dificuldadeQuery = searchParams.get('dificuldade') || '';

  const [questoes, setQuestoes] = useState<QuizQuestion[]>([]);
  const [feedback, setFeedback] = useState<QuestaoQuizFeedback & { respostaCorreta?: string } | null>(null);
  const [isRespondendo, setIsRespondendo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<string | null>(null);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const limit = 10;

  const carregarQuestoes = useCallback(async (
    page: number,
    append = false,
  ) => {
    try {
      setIsLoading(true);
      const response = await buscarQuestoesQuiz({
        tema: temaQuery,
        dificuldade: dificuldadeQuery as ApiQuestionDifficulty,
        page,
        limit,
      });

      const novasQuestoes = response.dados;

      if (append) {
        setQuestoes(prev => [...prev, ...novasQuestoes]);
      } else {
        setQuestoes(novasQuestoes);
      }
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
    } finally {
      setIsLoading(false);
    }
  }, [temaQuery, dificuldadeQuery]);

  useEffect(() => {
    carregarQuestoes(1, false);
  }, [carregarQuestoes]);

  useEffect(() => {
    let timer: number | undefined;
    if (!isPaused && !isLoading && questoes.length > 0) {
      timer = window.setInterval(() => setSegundos(s => s + 1), 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isPaused, isLoading, questoes.length]);

  const formatarTempo = (totalSegundos: number) => {
    const m = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
    const s = (totalSegundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading && questoes.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#14D5C2] animate-spin mb-4" />
        <p className="text-[#0A1128] font-bold">Buscando questões no servidor...</p>
      </div>
    );
  }

  if (questoes.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#0A1128] mb-2">Nenhuma questão encontrada</h2>
          <p className="text-[#0A1128]/60 mb-6">Não conseguimos encontrar questões para o tema selecionado no momento.</p>
          <button 
            onClick={() => navigate('/aluno/quiz/escolha')}
            className="bg-[#14D5C2] text-white px-6 py-3 rounded-full font-bold w-full"
          >
            Voltar e escolher outro
          </button>
        </div>
      </div>
    );
  }

  const questaoAtual = questoes[indiceAtual];
  const totalQuestoes = questoes.length;
  const isUltimaQuestao = indiceAtual === totalQuestoes - 1;
  const questoesConcluidas = jaRespondeu ? indiceAtual + 1 : indiceAtual;
  const progresso = (questoesConcluidas / totalQuestoes) * 100;
  const acertou = feedback?.correcao ?? false;

  const alternativasFormatadas = questaoAtual?.alternativas
    ? Object.entries(questaoAtual.alternativas).map(([id, texto]) => ({ id, texto }))
    : [];

  const handleConfirmar = async () => {
    if (!alternativaSelecionada) return;

    try {
      setIsRespondendo(true);
      const response = await responderQuestaoQuiz({
        questaoId: questaoAtual.id,
        tipo: questaoAtual.tipo,
        respostaMarcada: alternativaSelecionada as 'A' | 'B' | 'C' | 'D' | 'E',
      });
      setFeedback(response);
      setJaRespondeu(true);
      setIsPaused(true);
    } catch (error) {
      console.error('Erro ao responder questão:', error);
    } finally {
      setIsRespondendo(false);
    }
  };

  const handleProximaOuFinalizar = async () => {
    if (isUltimaQuestao) {
      navigate('/aluno/quiz/escolha');
      return;
    }

    const proximoIndice = indiceAtual + 1;
    setIndiceAtual(proximoIndice);
    setAlternativaSelecionada(null);
    setJaRespondeu(false);
    setFeedback(null);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        
        <button 
          onClick={() => navigate('/aluno/quiz/escolha')}
          className="flex items-center gap-2 text-[10px] text-[#0A1128]/50 hover:text-[#0A1128] font-bold uppercase tracking-wide mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Abandonar
        </button>

        {/* Cabeçalho Clássico recriado */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4 flex justify-between items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-black text-[#0A1128] leading-tight">Prática de Anatomia</h2>
            <p className="text-xs text-[#0A1128]/60 mt-0.5">Treinamento via sistema</p>
          </div>

          <div className="flex gap-6 items-center">
            
            {/* Bloco de Progresso */}
            <div className="flex flex-col w-32 hidden md:flex">
              <div className="flex justify-between text-[10px] text-[#0A1128]/50 font-bold uppercase tracking-wider mb-1.5">
                <span>Progresso</span>
                <span>{Math.round(progresso)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#14D5C2] transition-all duration-500 ease-out" 
                  style={{ width: `${progresso}%` }} 
                />
              </div>
            </div>

            {/* Bloco de Questão */}
            <div className="text-center border-l border-gray-100 pl-6 hidden sm:block">
              <p className="text-[10px] text-[#0A1128]/50 font-bold uppercase tracking-wider mb-0.5">Questão</p>
              <p className="text-sm font-black text-[#0A1128]">{indiceAtual + 1} de {totalQuestoes}</p>
            </div>
            
            {/* Bloco de Tempo */}
            <div className="text-right border-l border-gray-100 pl-6 flex items-center gap-4">
              <div>
                <p className="text-[10px] text-[#0A1128]/50 font-bold uppercase tracking-wider mb-0.5">Tempo</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <Clock className="w-3.5 h-3.5 text-[#0A1128]/50" />
                  <span className="text-sm font-black text-[#0A1128]">{formatarTempo(segundos)}</span>
                </div>
              </div>
              <button 
                onClick={() => !jaRespondeu && setIsPaused(!isPaused)}
                disabled={jaRespondeu}
                className={`transition-colors ${isPaused ? 'text-[#14D5C2]' : 'text-[#14D5C2] hover:brightness-95'}`}
              >
                {isPaused && !jaRespondeu ? <PlayCircle className="w-8 h-8" /> : <PauseCircle className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>

        {isPaused && !jaRespondeu ? (
          <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100 mb-4 flex flex-col items-center justify-center text-center animate-fade-in">
            <PauseCircle className="w-16 h-16 text-[#14D5C2] mb-4 opacity-50" />
            <h2 className="text-2xl font-black text-[#0A1128] mb-2">Quiz Pausado</h2>
            <p className="text-[#0A1128]/60 mb-8 max-w-md">O tempo foi interrompido. A questão está oculta para que você possa descansar.</p>
            <button 
              onClick={() => setIsPaused(false)}
              className="bg-[#14D5C2] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wide hover:brightness-95 transition-all shadow-md shadow-[#14D5C2]/30"
            >
              Retomar Quiz
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-4 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 bg-[#E6FCFA] text-[#14D5C2] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 border border-[#14D5C2]/20">
              <CheckCircle2 className="w-3 h-3" />
              {questaoAtual.tipo.replace('_', ' ')}
            </div>

            <h3 className="text-xl font-black text-[#0A1128] mb-8 leading-relaxed">
              {questaoAtual.enunciado}
            </h3>

            <div className="flex flex-col gap-4">
              {alternativasFormatadas.map((alt) => {
                const isSelecionada = alternativaSelecionada === alt.id;
                const isCorretaPeloFeedback = feedback?.respostaCorreta === alt.id;

                let estilosBase = 'p-4 rounded-xl border-2 flex items-center justify-between font-bold text-sm transition-all cursor-pointer';
                let iconClass = 'bg-gray-50 text-[#0A1128]/60 border border-gray-200';

                if (jaRespondeu) {
                  if (acertou && isSelecionada) {
                    estilosBase += ' bg-[#E6FCFA] border-[#14D5C2] text-[#0A1128]';
                    iconClass = 'bg-[#14D5C2] text-white border-[#14D5C2]';
                  } else if (!acertou && isSelecionada) {
                    estilosBase += ' bg-rose-50 border-rose-500 text-rose-600 opacity-90';
                    iconClass = 'bg-rose-500 text-white border-rose-500';
                  } else if (!acertou && isCorretaPeloFeedback) {
                    estilosBase += ' bg-[#E6FCFA] border-[#14D5C2] text-[#0A1128]';
                    iconClass = 'bg-[#14D5C2] text-white border-[#14D5C2]';
                  } else {
                    estilosBase += ' border-gray-100 text-[#0A1128]/40 bg-white cursor-default opacity-60';
                  }
                } else {
                  if (isSelecionada) {
                    estilosBase += ' border-[#14D5C2] text-[#0A1128] bg-white shadow-sm scale-[1.01]';
                    iconClass = 'bg-[#14D5C2] text-white border-[#14D5C2]';
                  } else {
                    estilosBase += ' border-gray-100 text-[#0A1128]/70 hover:border-gray-300 bg-white hover:bg-gray-50';
                  }
                }

                return (
                  <button
                    key={alt.id}
                    disabled={jaRespondeu}
                    onClick={() => setAlternativaSelecionada(alt.id)}
                    className={estilosBase}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-black ${iconClass}`}>
                        {alt.id}
                      </div>
                      <span>{alt.texto}</span>
                    </div>
                    {jaRespondeu && acertou && isSelecionada && <Check className="w-5 h-5 text-[#14D5C2]" />}
                    {jaRespondeu && !acertou && isSelecionada && <XCircle className="w-5 h-5 text-rose-500" />}
                    {jaRespondeu && !acertou && isCorretaPeloFeedback && <Check className="w-5 h-5 text-[#14D5C2] opacity-80" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 text-[10px] text-[#0A1128]/50 font-bold uppercase tracking-wider">
                  Dificuldade: <span className="bg-[#E6FCFA] text-[#14D5C2] px-2 py-0.5 rounded">{questaoAtual.dificuldade}</span>
                </span>
                <button className="flex items-center gap-1.5 text-[10px] text-rose-500/70 hover:text-rose-500 font-bold uppercase tracking-wider transition-colors">
                  <Flag className="w-3 h-3" /> Reportar
                </button>
              </div>

              <div>
                {jaRespondeu ? (
                  <button
                    onClick={handleProximaOuFinalizar}
                    className="bg-[#14D5C2] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wide hover:brightness-95 transition-all flex items-center gap-2 shadow-md shadow-[#14D5C2]/30"
                  >
                    {isUltimaQuestao ? 'Finalizar Quiz' : 'Próxima'} <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmar}
                    disabled={!alternativaSelecionada || isRespondendo}
                    className="bg-[#14D5C2] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wide hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#14D5C2]/30"
                  >
                    {isRespondendo ? 'Enviando...' : 'Confirmar'} 
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {jaRespondeu && feedback?.saibaMais && (
          <div className={`rounded-xl p-6 border animate-fade-in ${acertou ? 'bg-[#E6FCFA] border-[#14D5C2]' : 'bg-rose-50 border-rose-200'}`}>
            <h3 className={`text-sm font-black mb-2 uppercase tracking-wide ${acertou ? 'text-[#0E9384]' : 'text-rose-700'}`}>
              {acertou ? 'Resposta Correta!' : 'Resposta Incorreta!'}
            </h3>
            <p className="text-sm font-medium leading-relaxed text-[#0A1128]/80">
              {feedback.saibaMais}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};