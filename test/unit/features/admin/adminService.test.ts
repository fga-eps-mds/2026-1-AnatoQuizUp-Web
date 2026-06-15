import { listarUsuariosAdmin, alterarStatusUsuarioAdmin } from '../../../../src/features/admin/adminService';
import { httpClient } from '../../../../src/shared/api/httpClient';
import type { AdminUsuario } from '../../../../src/features/admin/types';

jest.mock('../../../../src/shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const usuarioMock: AdminUsuario = {
    id: 'usuario-1',
    nome: 'Professor Teste',
    email: 'professor@unb.br',
    papel: 'PROFESSOR',
    status: 'PENDING',
    criadoEm: '2026-05-25T00:00:00.000Z',
  };

  it('deve listar usuários administrativos com paginação padrão', async () => {
    const respostaMock = {
      dados: [usuarioMock],
      total: 1,
      page: 1,
      limit: 100,
    };

    (httpClient.get as jest.Mock).mockResolvedValue({ data: respostaMock });

    const resultado = await listarUsuariosAdmin();

    expect(httpClient.get).toHaveBeenCalledWith('/admin/usuarios', {
      params: { page: 1, limit: 100 },
    });
    expect(resultado).toEqual(respostaMock);
  });

  it('deve listar usuários administrativos com paginação personalizada', async () => {
    const respostaMock = {
      dados: [usuarioMock],
      total: 1,
      page: 2,
      limit: 10,
    };

    (httpClient.get as jest.Mock).mockResolvedValue({ data: respostaMock });

    const resultado = await listarUsuariosAdmin(2, 10);

    expect(httpClient.get).toHaveBeenCalledWith('/admin/usuarios', {
      params: { page: 2, limit: 10 },
    });
    expect(resultado).toEqual(respostaMock);
  });

  it('deve propagar erro ao falhar na listagem de usuários', async () => {
    (httpClient.get as jest.Mock).mockRejectedValue(new Error('Erro ao listar usuários'));

    await expect(listarUsuariosAdmin()).rejects.toThrow('Erro ao listar usuários');
  });

  it('deve alterar status de usuário administrativo', async () => {
    const respostaMock = {
      mensagem: 'Status atualizado com sucesso',
      dados: {
        ...usuarioMock,
        status: 'ACTIVE' as const,
      },
    };

    (httpClient.patch as jest.Mock).mockResolvedValue({ data: respostaMock });

    const resultado = await alterarStatusUsuarioAdmin('usuario-1', 'ACTIVE');

    expect(httpClient.patch).toHaveBeenCalledWith('/admin/usuarios/usuario-1/status', {
      status: 'ACTIVE',
    });
    expect(resultado).toEqual(respostaMock);
  });

  it('deve propagar erro ao falhar na alteração de status', async () => {
    (httpClient.patch as jest.Mock).mockRejectedValue(new Error('Erro ao alterar status'));

    await expect(alterarStatusUsuarioAdmin('usuario-1', 'INACTIVE')).rejects.toThrow(
      'Erro ao alterar status',
    );
  });
});