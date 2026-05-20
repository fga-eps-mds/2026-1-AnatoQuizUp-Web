export type PerfilUsuario = 'ALUNO' | 'PROFESSOR' | 'ADMINISTRADOR';
export type StatusUsuario = 'ATIVO' | 'INATIVO';

export interface UsuarioResumo {
  id: string;
  nome: string;
  nickname: string | null;
  email: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  instituicao: string | null;
  curso: string | null;
  semestre: string | null;
}

export interface MetadadosPaginacao {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResultadoBuscaAlunos {
  dados: UsuarioResumo[];
  metadados: MetadadosPaginacao;
}

export interface UsuarioPublico {
  id: string;
  nome: string;
  papel: PerfilUsuario;
}
