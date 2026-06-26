import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Loader2, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
import { listarUsuariosAdmin, alterarStatusUsuarioAdmin } from '../../../features/admin/adminService';
import type { AdminUsuario, UsuarioStatus } from '../../../features/admin/types';
import { useAuth } from '../../../app/providers/AuthProvider';

type RespostaListarUsuariosCompat = {
  dados?: AdminUsuario[];
  resultados?: AdminUsuario[];
};

type AdminUsuarioCompat = AdminUsuario & {
  role?: string;
  perfil?: string;
};

const extrairUsuariosResposta = (resposta: RespostaListarUsuariosCompat): AdminUsuario[] => {
  if (Array.isArray(resposta.dados)) return resposta.dados;
  if (Array.isArray(resposta.resultados)) return resposta.resultados;
  return [];
};

const obterPapelUsuario = (usuario: AdminUsuarioCompat): string => {
  return usuario.papel || usuario.role || usuario.perfil || 'INDEFINIDO';
};

export const AdminDashboardPage = () => {
  const { user: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [abaAtual, setAbaAtual] = useState<'ALL' | UsuarioStatus>('ALL');
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [notificacao, setNotificacao] = useState<{ texto: string; erro: boolean } | null>(null);

  useEffect(() => {
    let deveAtualizarEstado = true;

    listarUsuariosAdmin(1, 100)
      .then((resposta) => {
        if (!deveAtualizarEstado) return;

        setUsuarios(extrairUsuariosResposta(resposta));
      })
      .catch((err) => {
        if (!deveAtualizarEstado) return;

        console.error('Erro ao carregar usuários administrativamente:', err);
        setNotificacao({ texto: 'Falha ao sincronizar lista de usuários com o servidor.', erro: true });
      })
      .finally(() => {
        if (!deveAtualizarEstado) return;

        setIsLoading(false);
      });

    return () => {
      deveAtualizarEstado = false;
    };
  }, []);

  const handleAlterarStatus = async (id: string, novoStatus: UsuarioStatus) => {
    try {
      setProcessandoId(id);

      await alterarStatusUsuarioAdmin(id, novoStatus);

      setNotificacao({
        texto: 'Status do usuário atualizado com sucesso.',
        erro: false,
      });

      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: novoStatus } : u));
    } catch (err) {
      console.error('Erro ao mudar status do usuário:', err);
      setNotificacao({ texto: 'Não foi possível alterar o status do usuário.', erro: true });
    } finally {
      setProcessandoId(null);
    }
  };

  const normalizeStatus = (status: string | undefined): UsuarioStatus => {
    if (!status) return 'INACTIVE';

    const statusNormalizado = String(status).toUpperCase();

    if (statusNormalizado === 'ATIVO' || statusNormalizado === 'ACTIVE') return 'ACTIVE';
    if (statusNormalizado === 'PENDENTE' || statusNormalizado === 'PENDING') return 'PENDING';

    return 'INACTIVE';
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const statusReal = normalizeStatus(usuario.status);
    const correspondeAba = abaAtual === 'ALL' || statusReal === abaAtual;
    const textoBusca = filtroTexto.toLowerCase();

    const correspondeTexto =
      (usuario.nome || '').toLowerCase().includes(textoBusca) ||
      (usuario.email || '').toLowerCase().includes(textoBusca);

    return correspondeAba && correspondeTexto;
  });

  const totalPendentes = usuarios.filter(u => normalizeStatus(u.status) === 'PENDING').length;

  const totalAtivos = usuarios.filter(u => {
    const isAtivo = normalizeStatus(u.status) === 'ACTIVE';
    const papel = obterPapelUsuario(u).toUpperCase();

    return isAtivo && (papel === 'ALUNO' || papel === 'PROFESSOR');
  }).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0A1128]">Painel de Administração</h1>
          <p className="text-sm text-[#0A1128]/60">Gerencie permissões, aprove cadastros de professores e monitore contas.</p>
        </div>

        {notificacao && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-bold animate-fade-in ${notificacao.erro ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-[#E6FCFA] border-[#14D5C2] text-[#0E9384]'
            }`}>
            {notificacao.erro ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span>{notificacao.texto}</span>
            <button className="ml-auto text-xs underline" onClick={() => setNotificacao(null)}>Fechar</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-black text-[#0A1128]/50 uppercase tracking-wider">Aprovações Pendentes</p>
            <p className="text-3xl font-black text-amber-500 mt-2">{totalPendentes}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-black text-[#0A1128]/50 uppercase tracking-wider">Professores/Alunos Ativos</p>
            <p className="text-3xl font-black text-[#14D5C2] mt-2">{totalAtivos}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-black text-[#0A1128]/50 uppercase tracking-wider">Total de Contas</p>
            <p className="text-3xl font-black text-[#0A1128] mt-2">{usuarios.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:gap-0 sm:rounded-lg sm:bg-gray-100 sm:p-1">
  <button
    type="button"
    onClick={() => setAbaAtual('ALL')}
    className={`rounded-md px-4 py-2 text-xs font-black transition-all ${
      abaAtual === 'ALL'
        ? 'bg-white text-[#0A1128] shadow-sm'
        : 'bg-gray-100 text-[#0A1128]/60 sm:bg-transparent'
    }`}
  >
    Todos
  </button>

  <button
    type="button"
    onClick={() => setAbaAtual('PENDING')}
    className={`rounded-md px-4 py-2 text-xs font-black transition-all ${
      abaAtual === 'PENDING'
        ? 'bg-white text-amber-500 shadow-sm'
        : 'bg-gray-100 text-[#0A1128]/60 sm:bg-transparent'
    }`}
  >
    Pendentes ({totalPendentes})
  </button>

  <button
    type="button"
    onClick={() => setAbaAtual('ACTIVE')}
    className={`rounded-md px-4 py-2 text-xs font-black transition-all ${
      abaAtual === 'ACTIVE'
        ? 'bg-white text-[#14D5C2] shadow-sm'
        : 'bg-gray-100 text-[#0A1128]/60 sm:bg-transparent'
    }`}
  >
    Ativos
  </button>

  <button
    type="button"
    onClick={() => setAbaAtual('INACTIVE')}
    className={`rounded-md px-4 py-2 text-xs font-black transition-all ${
      abaAtual === 'INACTIVE'
        ? 'bg-white text-rose-500 shadow-sm'
        : 'bg-gray-100 text-[#0A1128]/60 sm:bg-transparent'
    }`}
  >
    Inativos
  </button>
</div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-[#0A1128] focus:outline-none focus:border-[#14D5C2] transition-colors"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#14D5C2] animate-spin mb-2" />
              <p className="text-xs font-bold text-[#0A1128]/60">Sincronizando contas...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm font-black text-[#0A1128]">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto overscroll-x-contain">
<table className="min-w-[760px] w-full border-collapse text-left md:min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-[#0A1128]/50 uppercase tracking-wider">
                    <th className="p-4 pl-6">Nome</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Vínculo</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Ações de Moderação</th>
                  </tr>
                </thead>

                <tbody className="text-xs font-bold text-[#0A1128]/80 divide-y divide-gray-50">
                  {usuariosFiltrados.map((usuario) => {
                    const vinculoExibicao = obterPapelUsuario(usuario);
                    const statusReal = normalizeStatus(usuario.status);
                    const isMe = usuarioLogado?.email === usuario.email;

                    return (
                      <tr key={usuario.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6 font-black text-[#0A1128]">{usuario.nome}</td>
                        <td className="p-4 text-gray-500">{usuario.email}</td>

                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            {vinculoExibicao}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${statusReal === 'ACTIVE' ? 'bg-[#E6FCFA] text-[#14D5C2] border-[#14D5C2]/20' :
                              statusReal === 'PENDING' ? 'bg-amber-50 text-amber-500 border-amber-200' :
                                'bg-rose-50 text-rose-500 border-rose-200'
                            }`}>
                            {statusReal === 'ACTIVE' ? 'Ativo' : statusReal === 'PENDING' ? 'Pendente' : 'Inativo'}
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          {isMe ? (
                            <span className="inline-block bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-gray-200">
                              Sua Conta
                            </span>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              {statusReal !== 'ACTIVE' && (
                                <button
                                  disabled={processandoId === usuario.id}
                                  onClick={() => handleAlterarStatus(usuario.id, 'ACTIVE')}
                                  className="bg-[#14D5C2] hover:brightness-95 text-white p-2 rounded-lg flex items-center gap-1 text-[11px] font-black transition-all disabled:opacity-50 shadow-sm"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Ativar</span>
                                </button>
                              )}

                              {statusReal !== 'INACTIVE' && (
                                <button
                                  disabled={processandoId === usuario.id}
                                  onClick={() => handleAlterarStatus(usuario.id, 'INACTIVE')}
                                  className="bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 p-2 rounded-lg flex items-center gap-1 text-[11px] font-black transition-all disabled:opacity-50"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Bloquear</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};