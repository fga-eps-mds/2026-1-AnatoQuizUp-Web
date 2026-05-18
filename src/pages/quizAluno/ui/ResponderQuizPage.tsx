import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, ArrowLeft, CheckCircle2, XCircle, PauseCircle, PlayCircle, ChevronRight, Check, Loader2 } from 'lucide-react';

import { buscarQuestoesQuiz, responderQuestaoQuiz } from '../../../features/random-quiz/randomQuizService';
import type { QuizQuestion, QuestaoQuizFeedback } from '../../../features/random-quiz/types';
import type { ApiQuestionDifficulty } from '../../../features/manage-questions';

export const ResponderQuizPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const temaQuery = searchParams.get('tema') || '';
  const dificuldadeQuery = searchParams.get('dificuldade') || '';

  const [questoes, setQuestoes] = useState<QuizQuestion[]>([]);
  const [feedback, setFeedback] = useState<QuestaoQuizFeedback | null>(null);
  const [isRespondendo, setIsRespondendo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<string | null>(null);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregarQuestoes = async (
    page: number,
    append = false,
  ) => {
    try {
      setIsLoading(true);
    

      const response = await buscarQuestoesQuiz({
        tema: temaQuery,
        dificuldade: dificuldadeQuery as ApiQuestionDifficulty,
        page,
        limit: 10,
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
  };

  useEffect(() => {
  carregarQuestoes(1, false);
}, [temaQuery, dificuldadeQuery]);

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

  if (isLoading) {
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
  // --------------------------------------------

  const questaoAtual = questoes[indiceAtual];

  const questoesConcluidas = jaRespondeu ? indiceAtual + 1 : indiceAtual;
  
  const acertou = feedback?.correcao ?? false;

  const alternativasFormatadas = questaoAtual.alternativas
  ? Object.entries(questaoAtual.alternativas).map(([id, texto]) => ({
      id,
      texto,
    }))
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

  const handleProxima = async () => {
    const proximoIndice = indiceAtual + 1;

    const chegouAoFimDoLote =
      proximoIndice >= questoes.length;

    if (chegouAoFimDoLote) {
      const proximaPagina = paginaAtual + 1;

      await carregarQuestoes(proximaPagina, true);

      setPaginaAtual(proximaPagina);
    }

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

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4 flex justify-between items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-black text-[#0A1128] leading-tight">Prática de Anatomia</h2>
            <p className="text-xs text-[#0A1128]/60 mt-0.5">Treinamento via sistema</p>
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-200"></div>

          <div className="flex gap-6 items-center">
            <div className="text-center">
              <p className="text-[10px] text-[#0A1128]/50 font-bold uppercase tracking-wider mb-0.5">Questões respondidas</p>
              <p className="text-sm font-black text-[#0A1128]">{questoesConcluidas}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-[#0A1128]/50 font-bold uppercase tracking-wider mb-0.5">Tempo</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <Clock className="w-3.5 h-3.5 text-[#0A1128]/50" />
                  <span className="text-sm font-black text-[#0A1128]">{formatarTempo(segundos)}</span>
                </div>
              </div>
              <button 
                onClick={() => !jaRespondeu && setIsPaused(!isPaused)}
                disabled={jaRespondeu}
                className={`transition-colors ${isPaused ? 'text-emerald-500' : 'text-[#0A1128]/40 hover:text-[#0A1128]'}`}
              >
                {isPaused && !jaRespondeu ? <PlayCircle className="w-7 h-7" /> : <PauseCircle className="w-7 h-7" />}
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 bg-[#E6FCFA] text-[#14D5C2] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border border-[#14D5C2]/20">
              <CheckCircle2 className="w-3 h-3" />
              {questaoAtual.tipo.replace('_', ' ')}
            </div>

            <h3 className="text-lg font-black text-[#0A1128] mb-6 leading-snug">
              {questaoAtual.enunciado}
            </h3>

            <div className="flex flex-col gap-3">
              {alternativasFormatadas.map((alt) => {
                const isSelecionada = alternativaSelecionada === alt.id;

                const isCorreta =
                  jaRespondeu &&
                  feedback?.correcao &&
                  isSelecionada;

                const isIncorreta =
                  jaRespondeu &&
                  !feedback?.correcao &&
                  isSelecionada;
                
                let estilosBase = 'p-3 rounded-lg border-2 flex items-center justify-between font-bold text-sm transition-all cursor-pointer';
                
                if (jaRespondeu) {
                  if (isCorreta) {
                    estilosBase += ' bg-[#E6FCFA] border-[#14D5C2] text-[#14D5C2]';
                  } else if (isIncorreta) {
                    estilosBase += ' bg-rose-50 border-rose-500 text-rose-500';
                  } else {
                    estilosBase += ' border-gray-100 text-[#0A1128]/40 bg-white cursor-default';
                  }
                } else {
                  if (isSelecionada) {
                    estilosBase += ' border-[#14D5C2] text-[#14D5C2] bg-white';
                  } else {
                    estilosBase += ' border-gray-100 text-[#0A1128] hover:border-gray-300 bg-white';
                  }
                }

                return (
                  <button
                    key={alt.id}
                    disabled={jaRespondeu}
                    onClick={() => setAlternativaSelecionada(alt.id)}
                    className={estilosBase}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs ${jaRespondeu && isCorreta ? 'bg-[#14D5C2] text-white' : jaRespondeu && isSelecionada ? 'bg-rose-500 text-white' : 'bg-gray-100 text-[#0A1128]'}`}>
                        {alt.id}
                      </div>
                      <span>{alt.texto}</span>
                    </div>
                    {jaRespondeu && isCorreta && <Check className="w-5 h-5" />}
                    {jaRespondeu && isSelecionada && !isCorreta && <XCircle className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 text-[10px] text-[#0A1128]/50 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">Dificuldade: <span className="bg-[#E6FCFA] text-[#14D5C2] px-1.5 py-0.5 rounded">{questaoAtual.dificuldade}</span></span>
              </div>

              <div className="flex gap-3">
                {jaRespondeu ? (
                  <button
                    onClick={handleProxima}
                    className="bg-[#14D5C2] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide hover:brightness-95 transition-all flex items-center gap-1.5 shadow-md shadow-[#14D5C2]/30"
                  >
                    {'Próxima'} <ChevronRight className="w-4 h-4" />
                  </button>

                ) : (
                  <button
                    onClick={handleConfirmar}
                    disabled={!alternativaSelecionada || isRespondendo}
                    className="bg-[#14D5C2] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRespondendo ? 'Enviando...' : 'Confirmar'} 
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {jaRespondeu && feedback?.saibaMais && (
          <div className={`rounded-xl p-5 border animate-fade-in ${acertou ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <h3 className={`text-sm font-black mb-2 uppercase tracking-wide ${acertou ? 'text-emerald-700' : 'text-rose-700'}`}>
              {acertou ? 'Resposta Correta!' : 'Resposta Incorreta'}
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