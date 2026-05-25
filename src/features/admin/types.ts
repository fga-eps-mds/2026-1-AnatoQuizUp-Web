export type UsuarioStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type UsuarioPapel = 'ALUNO' | 'PROFESSOR' | 'ADMINISTRADOR';

export interface AdminUsuario {
  id: string;
  nome: string;
  email: string;
  papel: UsuarioPapel;
  status: UsuarioStatus;
  criadoEm: string;
}

export interface RespostaListarUsuarios {
  dados: AdminUsuario[];
  total: number;
  page: number;
  limit: number;
}