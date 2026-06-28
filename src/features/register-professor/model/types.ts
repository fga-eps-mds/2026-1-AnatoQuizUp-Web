// Tipos do formulario de cadastro de professor.

// Instituicao padrao pre-preenchida no cadastro de professor.
export const PROFESSOR_INSTITUTION = 'Universidade de Brasília — UnB';

// Valores dos campos do formulario (nomes em ingles, como na UI).
export type RegisterProfessorFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  institution: string;
  siape: string;
  department: string;
  course: string;
};

// Uniao das chaves de campo, usada para indexar erros por campo.
export type RegisterProfessorField =
  | 'fullName'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'institution'
  | 'siape'
  | 'department'
  | 'course';

// Mapa de mensagens de erro por campo (todos opcionais).
export type RegisterProfessorFieldErrors = Partial<Record<RegisterProfessorField, string>>;

// Payload enviado a API (campos em PT-BR, incluindo SIAPE e departamento).
export type RegisterProfessorApiPayload = {
  nome: string;
  email: string;
  siape: string;
  instituicao: string;
  departamento: string;
  curso: string;
  senha: string;
  confirmacaoSenha: string;
};
