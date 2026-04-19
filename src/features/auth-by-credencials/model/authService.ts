import type { User } from "../../../entities/user/userStore";

export interface LoginResponse{
    token: string;
    user: User;
}

const MOCK_USER: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'João José', 
  email: 'aluno@unb.br',
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  course: 'Medicina',
  institution: 'Universidade de Brasília',
  period: 3
};

export const loginWithCredencials = async(email:string, password:string) : Promise<LoginResponse> => {
  if(email === 'aluno@unb.br' && password == '123456'){
    return {
      token: 'token',
      user: MOCK_USER
    }
  }

  throw { status: 401, message: 'Email ou senha inválidos' };
}