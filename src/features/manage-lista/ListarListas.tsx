import { useState, useEffect } from 'react';
import { Plus, Search, Users, FileText, Pencil, Trash2 } from 'lucide-react';
import type { ListaQuestao } from '../../entities/lista/model/types';
import { listarListas, excluirLista } from '../../entities/lista/api/listaApi';
import { ModalExcluirLista } from './ModalExcluirLista';

export const ListarListas = () => {
  const [listas, setListas] = useState<ListaQuestao[]>([]);
  
  // O estado de loading já começa como TRUE aqui!
  const [isLoading, setIsLoading] = useState(true);
  
  const [listaParaExcluir, setListaParaExcluir] = useState<ListaQuestao | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // 1º: A função agora vive dentro do useEffect (evita problemas de dependência)
    const carregarListas = async () => {
      try {
        // Não precisamos mais do setIsLoading(true) aqui, 
        // evitando a quebra da regra "set-state-in-effect".
        const dados = await listarListas();
        setListas(dados);
      } catch (error) {
        console.error('Erro ao buscar listas', error);
        alert('Erro ao buscar as listas.');
      } finally {
        setIsLoading(false);
      }
    };

    carregarListas();
  }, []);

  const handleAcaoNaoImplementada = (acao: string) => {
    alert(`Ação "${acao}" não implementada nesta etapa.`);
  };

  const handleExcluir = async (id: string) => {
    try {
      setIsDeleting(true);
      await excluirLista(id);
      setListas((prev) => prev.filter((l) => l.id !== id));
      setListaParaExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir', error);
      alert('Erro ao excluir a lista.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Suas listas</h2>
          <p className="text-sm text-gray-500 mt-1">{listas.length} listas criadas</p>
        </div>
        <button 
          onClick={() => handleAcaoNaoImplementada('Nova Lista')}
          className="mt-4 sm:mt-0 bg-teal-500 hover:bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Lista
        </button>
      </div>

      <div className="flex gap-3 items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar lista..." 
            className="w-full py-2 pl-9 pr-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
        <select className="py-2 px-3 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
          <option>Todos os status</option>
          <option>Rascunho</option>
          <option>Publicada</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome da Lista</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Questões</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turmas Vinculadas</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Criada em</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">Carregando listas...</td>
                </tr>
              ) : listas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">Nenhuma lista encontrada.</td>
                </tr>
              ) : (
                listas.map((lista) => (
                  <tr key={lista.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{lista.nome}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{lista.quantidadeQuestoes} questões</td>
                    <td className="py-4 px-4 text-sm">
                      {lista.turmas.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {lista.turmas.map((t) => (
                            <span key={t.id} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              {t.nome}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Nenhuma turma</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {lista.status === 'PUBLICADA' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                          ● Publicada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          ● Rascunho
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{lista.criadoEm}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleAcaoNaoImplementada('Vincular Turma')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                          <Users className="w-3.5 h-3.5" /> Vincular
                        </button>
                        <button onClick={() => handleAcaoNaoImplementada('Exportar PDF')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                          <FileText className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button onClick={() => handleAcaoNaoImplementada('Editar')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                          <Pencil className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button onClick={() => setListaParaExcluir(lista)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalExcluirLista 
        isOpen={!!listaParaExcluir}
        lista={listaParaExcluir}
        onClose={() => setListaParaExcluir(null)}
        onConfirm={handleExcluir}
        isLoading={isDeleting}
      />
    </>
  );
};