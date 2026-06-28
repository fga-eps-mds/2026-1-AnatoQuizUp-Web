// Servico do painel de administracao. Lista usuarios (paginado) e altera o
// status de um usuario (ex.: aprovar/recusar professores, ativar/inativar contas).
import { httpClient } from '../../shared/api/httpClient';
import type { RespostaListarUsuarios, UsuarioStatus, AdminUsuario } from './types';

// GET /admin/usuarios — lista os usuarios para gestao (paginado).
export const listarUsuariosAdmin = async (page = 1, limit = 100): Promise<RespostaListarUsuarios> => {
  const response = await httpClient.get<RespostaListarUsuarios>('/admin/usuarios', {
    params: { page, limit }
  });
  return response.data;
};

// PATCH /admin/usuarios/:id/status — altera o status de um usuario.
export const alterarStatusUsuarioAdmin = async (
  id: string,
  status: UsuarioStatus
): Promise<{ mensagem: string; dados: AdminUsuario }> => {
  const response = await httpClient.patch<{ mensagem: string; dados: AdminUsuario }>(
    `/admin/usuarios/${id}/status`,
    { status }
  );
  return response.data;
};