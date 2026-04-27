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

export type RegisterStudentFieldErrors = Partial<Record<RegisterStudentField, string>>;

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
