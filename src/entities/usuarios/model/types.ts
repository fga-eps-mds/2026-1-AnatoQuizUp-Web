// Tipos de dominio da entidade Usuarios (resumo, paginacao e perfil publico).

// Perfil do usuario conforme nomeado pelo backend (PT-BR).
export type PerfilUsuario = 'ALUNO' | 'PROFESSOR' | 'ADMINISTRADOR';
// Situacao da conta no backend.
export type StatusUsuario = 'ATIVO' | 'INATIVO';

// Resumo de um usuario usado em buscas e listagens.
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

// Metadados de paginacao retornados pelas listagens.
export interface MetadadosPaginacao {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Resultado paginado da busca de alunos (dados + metadados).
export interface ResultadoBuscaAlunos {
  dados: UsuarioResumo[];
  metadados: MetadadosPaginacao;
}

// Dados publicos minimos de um usuario (id, nome e papel).
export interface UsuarioPublico {
  id: string;
  nome: string;
  papel: PerfilUsuario;
}
