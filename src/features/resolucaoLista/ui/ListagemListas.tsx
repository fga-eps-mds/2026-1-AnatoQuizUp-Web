import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertCircle, FileText, Clock, ListOrdered, CheckCircle, Lock, Eye, Loader2, Download } from 'lucide-react';
import { resolucaoListaApi } from '../../../entities/resolucaoLista/api/resolucaoListaApi';
import type { ResumoListaAluno } from '../../../entities/resolucaoLista/model/types';

export const ListagemListas = ({ turmaId }: { turmaId: string }) => {
  const navigate = useNavigate();
  const [listas, setListas] = useState<ResumoListaAluno[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'sucesso' | 'erro'>('carregando');
  const [busca, setBusca] = useState('');
  const [tentativas, setTentativas] = useState(0);
  
  const [pdfCarregandoId, setPdfCarregandoId] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    resolucaoListaApi.listar(turmaId, undefined, busca)
      .then(dados => {
        if (!cancelado) {
          setListas(dados);
          setEstado('sucesso');
        }
      })
      .catch(() => {
        if (!cancelado) {
          setEstado('erro');
        }
      });

    return () => {
      cancelado = true;
    };
  }, [busca, tentativas]);

  const handleBaixarPdf = async (listaTurmaId: string, nomeLista: string) => {
    try {
      setPdfCarregandoId(listaTurmaId);
      const base64Data = await resolucaoListaApi.baixarPdfAluno(listaTurmaId);
      
      const pdfUrl = `data:application/pdf;base64,${base64Data}`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${nomeLista.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar o PDF da lista. Tente novamente mais tarde.');
    } finally {
      setPdfCarregandoId(null);
    }
  };

  const renderInfoRodape = (lista: ResumoListaAluno) => {
    const temPrazo = !!lista.prazo;
    const dataPrazo = temPrazo ? new Date(lista.prazo!) : null;
    let textoPrazo = 'Sem prazo';
    let isUrgente = false;

    if (dataPrazo) {
      const diffDias = Math.ceil((dataPrazo.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      const dataStr = dataPrazo.toLocaleDateString('pt-BR');

      if (lista.status === 'EXPIRADA') {
        textoPrazo = `Expirou em ${dataStr}`;
      } else if (lista.status === 'RESPONDIDA') {
        textoPrazo = `Prazo: ${dataStr}`;
      } else {
        if (diffDias < 0) {
          textoPrazo = `Expirou em ${dataStr}`;
        } else if (diffDias <= 3) {
          textoPrazo = `Prazo: ${dataStr} (${diffDias} dias restantes)`;
          isUrgente = true;
        } else {
          textoPrazo = `Prazo: ${dataStr}`;
        }
      }
    }

    return (
      <div className="flex flex-wrap items-center gap-4 text-[12px] text-gray-500 mt-2.5">
        <span className="flex items-center gap-1.5">
          <ListOrdered size={14} /> {lista.quantidadeQuestoes} questões
        </span>
        <span className={`flex items-center gap-1.5 ${isUrgente ? 'text-red-500 font-bold' : ''}`}>
          <Clock size={14} /> {textoPrazo}
        </span>
      </div>
    );
  };

  if (estado === 'erro') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-red-100 text-red-700">
          <AlertCircle size={32} />
        </div>
        <div className="font-bold text-lg mb-2 text-gray-900">Não foi possível carregar as listas</div>
        <div className="text-sm text-gray-500 max-w-md mb-6">Tivemos um problema ao buscar as listas. Verifique sua conexão.</div>
        <button 
          className="inline-flex items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 bg-teal-500 text-white hover:bg-teal-600 transition-colors cursor-pointer" 
          onClick={() => {
            setEstado('carregando');
            setTentativas(t => t + 1);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (estado === 'sucesso' && listas.length === 0 && !busca) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 text-gray-400">
          <FileText size={32} />
        </div>
        <div className="font-bold text-lg mb-2 text-gray-900">Ainda não há listas por aqui</div>
        <div className="text-sm text-gray-500 max-w-md">O professor ainda não publicou nenhuma lista.</div>
      </div>
    );
  }

  const pendentes = listas.filter(l => l.status === 'PENDENTE' || l.status === 'EM_ANDAMENTO');
  const respondidas = listas.filter(l => l.status === 'RESPONDIDA');
  const expiradas = listas.filter(l => l.status === 'EXPIRADA');

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-7">
        <div className="flex-1 w-full relative flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-4 py-2.5">
          <Search size={17} className="text-gray-400" />
          <input 
            type="text" 
            className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-gray-900 placeholder-gray-400"
            placeholder="Buscar por título ou tema" 
            value={busca}
            onChange={(e) => {
              setEstado('carregando');
              setBusca(e.target.value);
            }}
          />
        </div>
        <div className="inline-flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
          <Filter size={15} /> Filtros
        </div>
      </div>

      {pendentes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-bold text-sm text-gray-900">Pendentes</span>
            <span className="text-[11px] font-extrabold text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
              {pendentes.length}
            </span>
          </div>
          {pendentes.map(lista => (
            <div key={lista.listaTurmaId} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100">
                <FileText size={21} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold mb-1.5 text-gray-900 truncate">{lista.nome}</div>
                <div className="flex flex-wrap gap-1.5">
                  {lista.temas.map(t => (
                    <span key={t} className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                      {t}
                    </span>
                  ))}
                </div>
                {renderInfoRodape(lista)}
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
                <button 
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 font-bold text-sm rounded-lg px-5 py-2.5 bg-teal-500 text-white hover:bg-teal-600 transition-colors cursor-pointer shadow-sm"
                  onClick={() => navigate(`/aluno/turmas/${turmaId}/listas/${lista.listaTurmaId}`)}
                >
                  Responder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {respondidas.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="font-bold text-sm text-gray-900">Respondidas</span>
            <span className="text-[11px] font-extrabold text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
              {respondidas.length}
            </span>
          </div>
          {respondidas.map(lista => (
            <div key={lista.listaTurmaId} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-green-50 text-green-600 border border-green-100">
                <CheckCircle size={21} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold mb-1.5 text-gray-900 truncate">{lista.nome}</div>
                <div className="flex flex-wrap gap-1.5">
                  {lista.temas.map(t => (
                    <span key={t} className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                      {t}
                    </span>
                  ))}
                </div>
                {renderInfoRodape(lista)}
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
                {lista.gabaritoLiberado ? (
                  <button 
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/aluno/turmas/${turmaId}/listas/${lista.listaTurmaId}`)}
                  >
                    <Eye size={16} /> Ver Gabarito
                  </button>
                ) : (
                  <button 
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    onClick={() => navigate(`/aluno/turmas/${turmaId}/listas/${lista.listaTurmaId}`)}
                  >
                    <Lock size={16} /> Gabarito Bloqueado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {expiradas.length > 0 && (
        <div className="mb-8 opacity-75">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="font-bold text-sm text-gray-900">Expiradas</span>
            <span className="text-[11px] font-extrabold text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
              {expiradas.length}
            </span>
          </div>
          {expiradas.map(lista => (
            <div key={lista.listaTurmaId} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 grayscale-[0.3]">
              <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-500 border border-gray-200">
                <Clock size={21} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold mb-1.5 text-gray-900 truncate">{lista.nome}</div>
                <div className="flex flex-wrap gap-1.5">
                  {lista.temas.map(t => (
                    <span key={t} className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-md bg-gray-200 text-gray-700">
                      {t}
                    </span>
                  ))}
                </div>
                {renderInfoRodape(lista)}
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
                 <button 
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 font-bold text-sm rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                  onClick={() => handleBaixarPdf(lista.listaTurmaId, lista.nome)}
                  disabled={pdfCarregandoId === lista.listaTurmaId}
                >
                  {pdfCarregandoId === lista.listaTurmaId ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {pdfCarregandoId === lista.listaTurmaId ? 'Gerando...' : 'Baixar PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};