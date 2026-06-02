import { httpClient } from '../../shared/api/httpClient';
import type { RespostaListarUsuarios, UsuarioStatus, AdminUsuario } from './types';

export const listarUsuariosAdmin = async (page = 1, limit = 100): Promise<RespostaListarUsuarios> => {
  const response = await httpClient.get<RespostaListarUsuarios>('/admin/usuarios', {
    params: { page, limit }
  });
  return response.data;
};

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