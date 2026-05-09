export const PROFESSOR_INSTITUTION = 'Universidade de Brasília — UnB';

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

export type RegisterProfessorField =
  | 'fullName'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'institution'
  | 'siape'
  | 'department'
  | 'course';

export type RegisterProfessorFieldErrors = Partial<Record<RegisterProfessorField, string>>;

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
