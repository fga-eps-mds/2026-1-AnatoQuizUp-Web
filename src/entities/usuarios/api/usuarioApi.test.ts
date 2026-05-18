import { httpClient } from '../../../shared/api/httpClient';
import { buscarAlunos, buscarUsuariosPorIds } from './usuarioApi';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

describe('usuarioApi', () => {
  const aluno = {
    id: 'aluno-1',
    nome: 'Joao Silva',
    nickname: 'joao',
    email: 'joao@example.com',
    perfil: 'ALUNO',
    status: 'ATIVO',
    instituicao: 'UnB',
    curso: 'Medicina',
    semestre: '2026.1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar alunos por texto', async () => {
    const resposta = {
      dados: [aluno],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    (httpClient.get as jest.Mock).mockResolvedValue({ data: resposta });

    const resultado = await buscarAlunos({ busca: 'joao', limit: 10 });

    expect(httpClient.get).toHaveBeenCalledWith('/usuarios/alunos', {
      params: { busca: 'joao', limit: 10 },
    });
    expect(resultado).toBe(resposta);
  });

  it('deve buscar usuarios por ids', async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { mensagem: 'Usuarios encontrados', dados: [aluno] },
    });

    const resultado = await buscarUsuariosPorIds(['aluno-1', 'aluno-2']);

    expect(httpClient.get).toHaveBeenCalledWith('/usuarios', {
      params: { ids: 'aluno-1,aluno-2' },
    });
    expect(resultado).toEqual([aluno]);
  });

  it('deve evitar chamada quando a lista de ids estiver vazia', async () => {
    const resultado = await buscarUsuariosPorIds([]);

    expect(httpClient.get).not.toHaveBeenCalled();
    expect(resultado).toEqual([]);
  });
});
