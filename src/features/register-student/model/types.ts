// Tipos do formulario de cadastro de aluno.

// Valores dos campos do formulario (nomes em ingles, como na UI).
export type RegisterStudentFormValues = {
  fullName: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  nationality: string;
  state: string;
  city: string;
  education: string;
  institution: string;
  course: string;
  period: string;
};

// Uniao das chaves de campo, usada para indexar erros por campo.
export type RegisterStudentField =
  | 'fullName'
  | 'nickname'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'birthDate'
  | 'nationality'
  | 'state'
  | 'city'
  | 'education'
  | 'institution'
  | 'course'
  | 'period';

// Mapa de mensagens de erro por campo (todos opcionais).
export type RegisterStudentFieldErrors = Partial<Record<RegisterStudentField, string>>;

// Payload enviado a API (campos em PT-BR, com escolaridade enumerada).
export type RegisterStudentApiPayload = {
  nome: string;
  nickname: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
  dataNascimento: string;
  nacionalidade: string;
  estado: string;
  cidade: string;
  escolaridade: 'ENSINO_FUNDAMENTAL' | 'ENSINO_MEDIO' | 'GRADUACAO' | 'POS_GRADUACAO' | 'OUTRO';
  instituicao: string;
  curso: string;
  periodo: string;
};
