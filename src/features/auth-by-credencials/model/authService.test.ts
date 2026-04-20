import { loginWithCredencials } from './authService';

describe('Features/authService', () => {
  
  it('deve retornar o token e o usuário em caso de sucesso', async () => {
    const response = await loginWithCredencials('aluno@unb.br', '123456');

    expect(response).toHaveProperty('token', 'token');
    expect(response.user).toHaveProperty('name', 'João José');
    expect(response.user).toHaveProperty('role', 'STUDENT');
  });

  it('deve lançar um erro 403 se o usuário estiver desativado', async () => {
    await expect(loginWithCredencials('desativado@unb.br', 'qualquersenha'))
      .rejects
      .toEqual({ 
        status: 403, 
        message: 'Conta desativada. Entre em contato com o administrador.' 
      });
  });

  it('deve lançar um erro 401 para email ou senha inválidos', async () => {
    await expect(loginWithCredencials('errado@unb.br', '000000'))
      .rejects
      .toEqual({ 
        status: 401, 
        message: 'Email ou senha inválidos' 
      });

    await expect(loginWithCredencials('aluno@unb.br', 'senhaerrada'))
      .rejects
      .toEqual({ 
        status: 401, 
        message: 'Email ou senha inválidos' 
      });
  });

});