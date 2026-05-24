import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, Clock, AlertCircle } from 'lucide-react';
import type { ItemHistoricoQuiz } from '../../../features/historico-quiz/types';

type QuestaoAgrupadaLocal = {
  questao: ItemHistoricoQuiz['questao'];
  tentativasLocais: number;
  acertosLocais: number;
  distribuicaoLocal: Record<string, number>;
  ultimoHorario: string;
};

export const HistoricoDetalhesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const sessao = location.state?.sessao as { id: string; data: string; tema: string; dificuldade: string; itens: ItemHistoricoQuiz[] };

  if (!sessao) {
    return <Navigate to="/aluno/historico" replace />;
  }

  const questoesAgrupadas = Object.values(
    sessao.itens.reduce((acc, item) => {
      if (!acc[item.questaoId]) {
        acc[item.questaoId] = {
          questao: item.questao,
          tentativasLocais: 0,
          acertosLocais: 0,
          distribuicaoLocal: {},
          ultimoHorario: item.criadoEm
        };
      }
      
      const grupo = acc[item.questaoId];
      grupo.tentativasLocais += 1;
      
      const letra = item.respostaMarcada;
      grupo.distribuicaoLocal[letra] = (grupo.distribuicaoLocal[letra] || 0) + 1;
      
      if (letra === item.questao.respostaCorreta) {
        grupo.acertosLocais += 1;
      }
      
      return acc;
    }, {} as Record<string, QuestaoAgrupadaLocal>)
  );

  const totalRespostasSessao = sessao.itens.length;
  const totalAcertosSessao = questoesAgrupadas.reduce((sum, q) => sum + q.acertosLocais, 0);
  const taxaSessao = totalRespostasSessao > 0 ? Math.round((totalAcertosSessao / totalRespostasSessao) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => navigate('/aluno/historico')}
          className="flex items-center gap-2 text-[11px] text-[#0A1128]/50 hover:text-[#0A1128] font-black uppercase tracking-wide mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar às Sessões
        </button>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center bg-[#14D5C2]/10 text-[#14D5C2] border border-[#14D5C2]/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                {sessao.tema}
              </div>
            </div>
            <h1 className="text-3xl font-black text-[#0A1128]">Revisão da Questão</h1>
          </div>
          
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6">
             <div>
                <p className="text-[10px] uppercase font-bold text-[#0A1128]/40 tracking-wider">Tentativas Totais</p>
                <p className="text-xl font-black text-[#0A1128]">{totalRespostasSessao}x</p>
             </div>
             <div className="w-px h-8 bg-gray-200" />
             <div>
                <p className="text-[10px] uppercase font-bold text-[#0A1128]/40 tracking-wider">Taxa de Acerto</p>
                <p className={`text-xl font-black ${taxaSessao >= 50 ? 'text-[#14D5C2]' : 'text-rose-500'}`}>{taxaSessao}%</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {questoesAgrupadas.map((itemLocal, index) => {
            const taxaQuestao = Math.round((itemLocal.acertosLocais / itemLocal.tentativasLocais) * 100);

            const alternativas = itemLocal.questao.alternativas 
              ? Object.entries(itemLocal.questao.alternativas).filter(([, val]) => val !== null && val !== "")
              : [];

            return (
              <div key={index} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#0A1128] text-white flex items-center justify-center font-black text-sm">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-[#0A1128]/60 uppercase tracking-wider">
                      Seu acerto nesta questão: <span className={taxaQuestao >= 50 ? 'text-[#14D5C2]' : 'text-rose-500'}>{taxaQuestao}%</span> ({itemLocal.acertosLocais} de {itemLocal.tentativasLocais} tentativas)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0A1128]/40">
                    <Clock className="w-3.5 h-3.5" />
                    Última às {new Date(itemLocal.ultimoHorario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#0A1128]/40 uppercase tracking-wider mb-2">
                    <BookOpen className="w-3.5 h-3.5" /> Enunciado
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-[#0A1128] leading-relaxed">
                    {itemLocal.questao.enunciado}
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#0A1128]/40 uppercase tracking-wider mb-1 mt-2">
                    Alternativas e suas respostas
                  </div>
                  
                  {alternativas.map(([key, texto]) => {
                    const letra = key.replace('alternativa', '');
                    const isCorreta = letra === itemLocal.questao.respostaCorreta;
                    const vezesEscolhidaLocal = itemLocal.distribuicaoLocal[letra] || 0;
                    const foiEscolhidaNaSessao = vezesEscolhidaLocal > 0;
                    
                    let cardStyle = 'border-gray-100 bg-white text-[#0A1128]/70';
                    if (isCorreta) {
                      cardStyle = 'border-[#14D5C2] bg-white text-[#0A1128]';
                    } else if (foiEscolhidaNaSessao) {
                      cardStyle = 'border-rose-200 bg-rose-50 text-rose-800';
                    }

                    return (
                      <div key={letra} className={`p-4 rounded-xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm transition-all ${cardStyle}`}>
                        <div className="flex items-center gap-4">
                          <div className={`shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-black ${isCorreta ? 'bg-[#14D5C2] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
                            {letra}
                          </div>
                          <span className="font-bold leading-relaxed">{texto}</span>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-200/50">
                          {isCorreta && (
                             <span className="text-[10px] font-black text-[#14D5C2] uppercase tracking-wider px-3 py-1">
                               Resposta Correta
                             </span>
                          )}
                          {foiEscolhidaNaSessao && !isCorreta && (
                             <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider px-3 py-1">
                               Escolhida {vezesEscolhidaLocal}x
                             </span>
                          )}
                          {isCorreta ? <CheckCircle2 className="w-6 h-6 text-[#14D5C2]" /> : (foiEscolhidaNaSessao ? <XCircle className="w-6 h-6 text-rose-500" /> : <div className="w-6 h-6" />)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {itemLocal.questao.saibaMais && (
                  <div className="p-5 md:p-6 bg-amber-50 border border-amber-100 rounded-xl mt-2 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">Explicação do Professor</h5>
                      <p className="text-sm text-amber-900 font-medium leading-relaxed">{itemLocal.questao.saibaMais}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};