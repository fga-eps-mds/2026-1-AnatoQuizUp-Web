import { httpClient } from '../../../shared/api/httpClient';
import { listarTurmas, excluirTurma } from './turmaApi'; 
import type { Turma } from '../model/types';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('turmaApi', () => {
  const mockTurmas: Turma[] = [
    {
      id: 'turma-1',
      codigo: 'ANAT-01',
      nome: 'Anatomia Sistêmica',
      semestre: '1',
      ano: 2026,
      descricao: 'Turma de teste',
      status: 'ATIVA',
      quantidadeAlunos: 20,
      criadoEm: '2026-05-16T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarTurmas', () => {
    it('deve fazer um GET para /turmas e retornar apenas o array de dados', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        data: {
          mensagem: 'Turmas listadas com sucesso',
          dados: mockTurmas,
        },
      });

      const resultado = await listarTurmas();

      expect(httpClient.get).toHaveBeenCalledWith('/turmas', { params: undefined });
      
      expect(resultado).toEqual(mockTurmas);
    });

    it('deve repassar os filtros (busca e status) como query params', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        data: { mensagem: 'OK', dados: [] },
      });

      const filtros = { busca: 'Neuro', status: 'INATIVA' as const };
      
      await listarTurmas(filtros);

      expect(httpClient.get).toHaveBeenCalledWith('/turmas', {
        params: { busca: 'Neuro', status: 'INATIVA' },
      });
    });
  });

  describe('excluirTurma', () => {
    it('deve fazer um DELETE para a rota de turmas passando o ID na URL', async () => {
      (httpClient.delete as jest.Mock).mockResolvedValue({});

      await excluirTurma('turma-123');

      expect(httpClient.delete).toHaveBeenCalledWith('/turmas/turma-123');
    });
  });
});