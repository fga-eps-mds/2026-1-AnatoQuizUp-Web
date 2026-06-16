import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resolucaoListaApi } from '../../../entities/resolucaoLista/api/resolucaoListaApi';
import type { DetalhesListaAluno } from '../../../entities/resolucaoLista/model/types';
import { Clock, Lock, FileText, CheckCircle, XCircle, Info, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const ResponderLista = () => {
  const { turmaId, listaId } = useParams<{ turmaId: string; listaId: string }>();
  const navigate = useNavigate();
  const [lista, setLista] = useState<DetalhesListaAluno | null>(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (listaId) {
      resolucaoListaApi.buscarDetalhes(listaId).then(setLista).catch(console.error);
    }
  }, [listaId]);

  if (!lista) {
    return (
      <div className="flex min-h-[400px] flex-1 items-center justify-center">
        <span className="animate-pulse text-sm font-bold text-gray-500">A carregar lista...</span>
      </div>
    );
  }

  if (lista.questoes.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center w-full max-w-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 text-gray-400"><FileText size={32}/></div>
          <div className="font-bold text-lg mb-2 text-gray-900">Esta lista ainda não tem questões</div>
          <div className="text-sm text-gray-500 max-w-md">O professor publicou a lista, mas ainda não adicionou questões a ela. Volte mais tarde.</div>
          <button 
            className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer mx-auto mt-6" 
            onClick={() => navigate(`/aluno/turmas/${turmaId}`)}
          >
            Voltar para turma
          </button>
        </div>
      </div>
    );
  }

  if (lista.status === 'EXPIRADA' && !lista.gabaritoLiberado) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center w-full max-w-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-amber-100 text-amber-700"><Clock size={32}/></div>
          <div className="font-bold text-lg mb-2 text-gray-900">O prazo desta lista já encerrou</div>
          <div className="text-sm text-gray-500 max-w-md">Esta lista expirou e não pode mais ser respondida. Aguarde a liberação do gabarito.</div>
          <button 
            className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer mx-auto mt-6" 
            onClick={() => navigate(`/aluno/turmas/${turmaId}`)}
          >
            Voltar para turma
          </button>
        </div>
      </div>
    );
  }

  if ((lista.status === 'RESPONDIDA' || lista.status === 'SUBMETIDA') && !lista.gabaritoLiberado) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center w-full max-w-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 text-gray-400"><Lock size={32}/></div>
          <div className="font-bold text-lg mb-2 text-gray-900">O gabarito ainda não foi liberado</div>
          <div className="text-sm text-gray-500 max-w-md">Você já submeteu as suas respostas. O gabarito ficará disponível assim que o professor responsável libertar o acesso.</div>
          <button 
            className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer mx-auto mt-6" 
            onClick={() => navigate(`/aluno/turmas/${turmaId}`)}
          >
            Voltar para turma
          </button>
        </div>
      </div>
    );
  }

  if (lista.gabaritoLiberado) {
    const total = lista.questoes.length;
    const acertos = lista.questoes.filter(q => q.respostaMarcada === q.respostaCorreta).length;
    const taxaAcerto = Math.round((acertos / total) * 100);

    return (
      <main className="flex-1 flex flex-col overflow-hidden bg-[#dde2ea]">
        <div className="bg-gradient-to-br from-[#0A1128] to-[#1e3a5f] py-5 px-7 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[17px] text-white">Gabarito · {lista.nome}</h2>
            <p className="flex items-center gap-2 mt-1 opacity-80 text-white text-xs">
              Acertou {acertos} de {total} · {taxaAcerto}%
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
            <CheckCircle size={18} />
            Gabarito liberado
          </div>
        </div>
        
        <div className="p-6 md:p-7 overflow-y-auto flex-1">
          {lista.questoes.map((q, idx) => {
            const acertou = q.respostaMarcada === q.respostaCorreta;
            
            return (
              <div key={q.id} className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                <div className="pt-4 px-5 pb-3 flex items-center gap-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-gray-50 text-gray-500">{q.tema}</span>
                  
                  {acertou ? (
                    <span className="ml-auto px-3 py-1 rounded-md text-xs font-extrabold flex items-center gap-1.5 bg-green-100 text-green-800">
                      <CheckCircle size={14} /> Acertou
                    </span>
                  ) : (
                    <span className="ml-auto px-3 py-1 rounded-md text-xs font-extrabold flex items-center gap-1.5 bg-red-100 text-red-800">
                      <XCircle size={14} /> Errou
                    </span>
                  )}

                </div>
                <div className="p-5">
                  <div className="text-[14.5px] font-bold text-gray-900 leading-relaxed mb-4">{q.enunciado}</div>
                  
                  {q.urlImagem && (
                    <div className="mx-0 my-4 h-40 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src={q.urlImagem} alt="Imagem da questão" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5 mt-4">
                    {q.alternativas && Object.entries(q.alternativas).filter(([, texto]) => texto && texto.trim() !== '').map(([letra, texto]) => {
                      
                      const labelVisual = q.tipo === 'CERTO_ERRADO' 
                        ? (letra === 'C' ? 'V' : letra === 'E' ? 'F' : letra) 
                        : letra;

                      const isCorreta = letra === q.respostaCorreta;
                      const isMarcada = letra === q.respostaMarcada;
                      
                      let containerClass = "flex items-center gap-3 p-3 rounded-xl border-2 ";
                      let letterClass = "w-8 h-8 rounded-lg flex shrink-0 items-center justify-center font-extrabold text-sm border-2 ";
                      let tagContent = null;

                      if (isCorreta) {
                        containerClass += "border-green-500 bg-green-50";
                        letterClass += "bg-green-500 border-green-500 text-white";
                        tagContent = <span className="text-[11px] font-extrabold ml-auto text-green-700">Correta{isMarcada ? ' · sua resposta' : ''}</span>;
                      } else if (isMarcada) {
                        containerClass += "border-red-500 bg-red-50";
                        letterClass += "bg-red-500 border-red-500 text-white";
                        tagContent = <span className="text-[11px] font-extrabold ml-auto text-red-700">Sua resposta</span>;
                      } else {
                        containerClass += "border-gray-200";
                        letterClass += "border-gray-200 text-gray-500";
                      }

                      return (
                        <div key={letra} className={containerClass}>
                          <div className={letterClass}>{labelVisual}</div>
                          <div className="text-[13.5px] font-semibold text-gray-800 flex-1">{texto}</div>
                          {tagContent}
                        </div>
                      );
                    })}
                  </div>

                  {q.saibaMais && (
                    <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 mb-1.5"><Info size={16} /> Saiba mais</div>
                      <p className="text-[12.5px] text-blue-900 leading-relaxed">{q.saibaMais}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="mt-6 flex justify-center">
             <button className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/aluno/turmas/${turmaId}`)}>
              <ChevronLeft size={16} /> Voltar para turma
            </button>
          </div>
        </div>
      </main>
    );
  }

  const q = lista.questoes[questaoAtual];
  const total = lista.questoes.length;
  const respondidas = lista.questoes.filter(qItem => qItem.respostaMarcada !== null).length;
  const progressoPct = total > 0 ? Math.round((respondidas / total) * 100) : 0;

  const marcarAlternativa = async (alt: string) => {
    setSalvando(true);
    try {
      await resolucaoListaApi.autosave(lista.id, q.id, alt);
      
      setLista(prev => {
        if (!prev) return prev;
        const novas = [...prev.questoes];
        novas[questaoAtual].respostaMarcada = alt;
        return { ...prev, questoes: novas };
      });
    } finally {
      setSalvando(false);
    }
  };

  const confirmarSubmissao = async () => {
    try {
      await resolucaoListaApi.submeter(lista.id);
      setShowConfirmModal(false);
      navigate(`/aluno/turmas/${turmaId}`);
    } catch {
      alert('Erro ao submeter a lista. Verifique se respondeu a pelo menos uma questão.');
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden bg-[#dde2ea]">
        <div className="bg-gradient-to-br from-[#0A1128] to-[#1e3a5f] py-5 px-7 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[17px] text-white">{lista.nome}</h2>
            {lista.prazo && (
              <p className="flex items-center gap-2 mt-1 opacity-80 text-white text-xs">
                <Clock size={14} /> Prazo: {new Date(lista.prazo).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
            {salvando ? <Clock size={16} className="animate-spin" /> : <Check size={18} />}
            {salvando ? 'A guardar...' : 'Guardado automaticamente'}
          </div>
        </div>

        <div className="pt-4 px-7 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-extrabold text-gray-900">Questão {questaoAtual + 1} de {total}</span>
            <span className="text-xs font-bold text-gray-500">{progressoPct}% respondido</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${progressoPct}%` }}></div>
          </div>
        </div>

        <div className="p-7 flex-1 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="pt-5 px-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">{questaoAtual + 1}</div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-gray-50 text-gray-500">{q.tema}</span>
            </div>
            <div className="px-6 pt-4 pb-2 text-base font-bold leading-relaxed text-gray-900">{q.enunciado}</div>
            
            {q.urlImagem && (
              <div className="mx-6 my-3 h-40 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={q.urlImagem} alt="Imagem da questão" className="max-h-full max-w-full object-contain" />
              </div>
            )}

            <div className="px-6 pt-2 pb-6 flex flex-col gap-3">
              {q.alternativas && Object.entries(q.alternativas).filter(([, texto]) => texto && texto.trim() !== '').map(([letra, texto]) => {
                const isSelected = q.respostaMarcada === letra;
                
                const labelVisual = q.tipo === 'CERTO_ERRADO' 
                  ? (letra === 'C' ? 'V' : letra === 'E' ? 'F' : letra) 
                  : letra;

                return (
                  <button 
                    key={letra} 
                    type="button"
                    className={`w-full text-left flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${isSelected ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-teal-500 hover:bg-teal-50'}`}
                    onClick={() => marcarAlternativa(letra)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex shrink-0 items-center justify-center font-extrabold text-sm border-2 ${isSelected ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-200 text-gray-500'}`}>
                      {labelVisual}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 flex-1">{texto}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-7 py-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button 
              className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => setQuestaoAtual(p => Math.max(0, p - 1))} 
              disabled={questaoAtual === 0}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button 
              className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => setQuestaoAtual(p => Math.min(total - 1, p + 1))} 
              disabled={questaoAtual === total - 1}
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
          <button 
            className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-5 py-2.5 bg-teal-500 text-white hover:bg-teal-600 transition-colors cursor-pointer" 
            onClick={() => setShowConfirmModal(true)}
          >
            <Check size={16} /> Confirmar submissão
          </button>
        </div>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Confirmar Submissão</h3>
            <p className="mb-6 text-sm text-gray-500">
              Tem a certeza que deseja submeter esta lista? Após o envio, não poderá alterar as suas respostas.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSubmissao}
                className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600 transition-colors cursor-pointer"
              >
                Sim, submeter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};