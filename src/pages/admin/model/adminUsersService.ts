import axios from 'axios';
import { httpClient } from '../../../shared/api/httpClient';
import type { AdminUser, Role, UserStatus } from '../../../entities/user/model/types';

type BackendRole = 'ALUNO' | 'PROFESSOR' | 'ADMIN' | 'ADMINISTRADOR' | 'STUDENT';
type BackendStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'ATIVO'
  | 'INATIVO'
  | 'PENDENTE'
  | 'RECUSADO';

type BackendAdminUser = {
  id: string | number;
  nome?: string;
  name?: string;
  email: string;
  papel?: BackendRole;
  role?: BackendRole;
  status: BackendStatus;
  codigo?: string;
  department?: string;
  departamento?: string;
  course?: string;
  curso?: string;
  createdAt?: string;
  dataCadastro?: string;
  authProvider?: 'LOCAL' | 'MICROSOFT';
  ultimoAcesso?: string | null;
  lastAccess?: string | null;
};

type BackendPaginatedUsersData = {
  usuarios?: BackendAdminUser[];
  users?: BackendAdminUser[];
  itens?: BackendAdminUser[];
  items?: BackendAdminUser[];
  total?: number;
  pagina?: number;
  page?: number;
  limite?: number;
  limit?: number;
};

type BackendPaginatedUsersResponse = {
  dados: BackendPaginatedUsersData | BackendAdminUser[];
};

type BackendUserByIdResponse = {
  dados: BackendAdminUser;
};

export type AdminUsersListResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

const mapRole = (role?: BackendRole): Role => {
  if (role === 'ALUNO' || role === 'STUDENT') return 'STUDENT';
  if (role === 'PROFESSOR') return 'PROFESSOR';
  return 'ADMIN';
};

const mapStatus = (status: BackendStatus): UserStatus => {
  if (status === 'ACTIVE' || status === 'ATIVO') return 'ACTIVE';
  if (status === 'INACTIVE' || status === 'INATIVO' || status === 'RECUSADO') return 'INACTIVE';
  return 'PENDING';
};

const formatDate = (dateValue?: string): string => {
  if (!dateValue) return '-';

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
};

const mapBackendUser = (user: BackendAdminUser): AdminUser => ({
  id: String(user.id),
  name: user.nome ?? user.name ?? '-',
  email: user.email,
  role: mapRole(user.papel ?? user.role),
  status: mapStatus(user.status),
  authProvider: user.authProvider ?? 'LOCAL',
  codigo: user.codigo ?? '-',
  department: user.departamento ?? user.department ?? '-',
  course: user.curso ?? user.course ?? '-',
  createdAt: formatDate(user.createdAt ?? user.dataCadastro),
  lastAccess: user.ultimoAcesso ?? user.lastAccess ?? '-',
});

const extractErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error) || !error.response) {
    return 'Nao foi possivel conectar ao servidor. Tente novamente.';
  }

  const responseData = error.response.data as {
    mensagem?: string;
    message?: string;
    erro?: { mensagem?: string };
  };

  return responseData.erro?.mensagem
    ?? responseData.mensagem
    ?? responseData.message
    ?? 'Nao foi possivel processar a solicitacao.';
};

export const fetchAdminUsers = async (page = 1, limit = 10): Promise<AdminUsersListResponse> => {
  try {
    const { data } = await httpClient.get<BackendPaginatedUsersResponse>('/admin/users', {
      params: { page, limit },
    });

    if (Array.isArray(data.dados)) {
      const mappedUsers = data.dados.map(mapBackendUser);

      return {
        users: mappedUsers,
        total: mappedUsers.length,
        page,
        limit,
      };
    }

    const usersData = data.dados.users
      ?? data.dados.usuarios
      ?? data.dados.items
      ?? data.dados.itens
      ?? [];

    return {
      users: usersData.map(mapBackendUser),
      total: data.dados.total ?? usersData.length,
      page: data.dados.page ?? data.dados.pagina ?? page,
      limit: data.dados.limit ?? data.dados.limite ?? limit,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchAdminUserById = async (userId: string): Promise<AdminUser> => {
  try {
    const { data } = await httpClient.get<BackendUserByIdResponse>(`/admin/users/${userId}`);

    return mapBackendUser(data.dados);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const updateAdminUserStatus = async (
  userId: string,
  status: UserStatus,
): Promise<void> => {
  try {
    await httpClient.patch(`/admin/users/${userId}/status`, { status });
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
