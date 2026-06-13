jest.mock('../../../shared/config/env', () => ({
  API_BASE_URL: 'http://localhost:4000/api/v1',
  USE_MOCKS: false,
}));

import { httpClient } from '../../../shared/api/httpClient';
import {
  atualizarVinculoListaTurma,
  atualizarLista,
  buscarLista,
  criarLista,
  desvincularQuestaoLista,
  desvincularTurmaLista,
  excluirLista,
  listarListas,
  listarVinculosDaTurma,
  reordenarQuestoesLista,
  vincularListaTurma,
  vincularQuestoesLista,
  vincularTurmasLista,
  baixarPdfLista,
} from './listaApi';

jest.mock('../../../shared/api/httpClient');
const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('listaApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarListas', () => {
    it('deve buscar e normalizar as listas corretamente', async () => {
      mockedHttpClient.get.mockResolvedValueOnce({
        data: {
          mensagem: 'Listas recuperadas com sucesso.',
          dados: [
            {
              id: '1',
              nome: 'Lista Teste',
              quantidadeQuestoes: 10,
              status: 'PUBLICADA',
              turmas: [{ id: 't1', nome: 'Turma A' }],
              criadoEm: '2026-05-22T19:57:18.617Z',
              atualizadoEm: '2026-05-22T19:57:18.617Z',
            },
          ],
        },
      });

      const resultado = await listarListas({ status: 'PUBLICADA' });

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/lista', {
        params: { status: 'PUBLICADA' },
      });
      expect(resultado).toEqual([
        {
          id: '1',
          nome: 'Lista Teste',
          quantidadeQuestoes: 10,
          status: 'PUBLICADA',
          turmas: [{ id: 't1', nome: 'Turma A' }],
          criadoEm: new Date('2026-05-22T19:57:18.617Z').toLocaleDateString('pt-BR'),
          atualizadoEm: new Date('2026-05-22T19:57:18.617Z').toLocaleDateString('pt-BR'),
          questoes: [],
        },
      ]);
    });
  });

  describe('buscarLista', () => {
    it('deve normalizar questoes e turmas detalhadas da lista', async () => {
      mockedHttpClient.get.mockResolvedValueOnce({
        data: {
          dados: {
            id: '1',
            nome: 'Simulado Anatomia',
            criadoEm: '2026-05-22T19:57:18.617Z',
            turmas: [
              {
                id: 'v1',
                turmaId: 't1',
                turma: { id: 't1', nome: 'Turma A' },
              },
            ],
            itens: [
              {
                id: 'i2',
                questaoId: 'q2',
                ordem: 2,
                questao: {
                  id: 'q2',
                  enunciado: 'Segunda questao',
                  tipoQuestao: 'CERTO_ERRADO',
                  dificuldade: 'FACIL',
                  tema: { id: 'tema1', nome: 'Torax' },
                },
              },
              {
                id: 'i1',
                questaoId: 'q1',
                ordem: 1,
                questao: {
                  id: 'q1',
                  enunciado: 'Primeira questao',
                  tipoQuestao: 'MULTIPLA_ESCOLHA',
                  dificuldade: 'MEDIA',
                  tema: { id: 'tema2', nome: 'Abdome' },
                },
              },
            ],
          },
        },
      });

      const resultado = await buscarLista('1');

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/lista/1');
      expect(resultado).toMatchObject({
        id: '1',
        nome: 'Simulado Anatomia',
        quantidadeQuestoes: 2,
        status: 'PUBLICADA',
        turmas: [{ id: 't1', nome: 'Turma A' }],
      });
      expect(resultado.questoes).toEqual([
        {
          id: 'q1',
          enunciado: 'Primeira questao',
          tema: 'Abdome',
          tipo: 'MULTIPLA_ESCOLHA',
          dificuldade: 'MEDIA',
          ordem: 1,
        },
        {
          id: 'q2',
          enunciado: 'Segunda questao',
          tema: 'Torax',
          tipo: 'CERTO_ERRADO',
          dificuldade: 'FACIL',
          ordem: 2,
        },
      ]);
    });
  });

  it('deve criar uma lista', async () => {
    mockedHttpClient.post.mockResolvedValueOnce({
      data: { dados: { id: '1', nome: 'Nova Lista', criadoEm: '2026-05-22T19:57:18.617Z' } },
    });

    await criarLista({ nome: 'Nova Lista' });

    expect(mockedHttpClient.post).toHaveBeenCalledWith('/lista', { nome: 'Nova Lista' });
  });

  it('deve atualizar uma lista', async () => {
    mockedHttpClient.patch.mockResolvedValueOnce({
      data: { dados: { id: '1', nome: 'Lista Editada', criadoEm: '2026-05-22T19:57:18.617Z' } },
    });

    await atualizarLista('1', { nome: 'Lista Editada' });

    expect(mockedHttpClient.patch).toHaveBeenCalledWith('/lista/1', { nome: 'Lista Editada' });
  });

  it('deve excluir uma lista', async () => {
    mockedHttpClient.delete.mockResolvedValueOnce({});

    await excluirLista('123');

    expect(mockedHttpClient.delete).toHaveBeenCalledWith('/lista/123');
  });

  it('deve vincular questoes a lista', async () => {
    mockedHttpClient.post.mockResolvedValueOnce({
      data: { dados: { id: '1', nome: 'Lista', criadoEm: '2026-05-22T19:57:18.617Z' } },
    });

    await vincularQuestoesLista('1', ['q1', 'q2']);

    expect(mockedHttpClient.post).toHaveBeenCalledWith('/lista/1/questoes', {
      questoesIds: ['q1', 'q2'],
    });
  });

  it('deve desvincular uma questao da lista', async () => {
    mockedHttpClient.delete.mockResolvedValueOnce({
      data: { dados: { id: '1', nome: 'Lista', criadoEm: '2026-05-22T19:57:18.617Z' } },
    });

    await desvincularQuestaoLista('1', 'q1');

    expect(mockedHttpClient.delete).toHaveBeenCalledWith('/lista/1/questoes/q1');
  });

  it('deve reordenar questoes da lista', async () => {
    mockedHttpClient.patch.mockResolvedValueOnce({
      data: { dados: { id: '1', nome: 'Lista', criadoEm: '2026-05-22T19:57:18.617Z' } },
    });

    await reordenarQuestoesLista('1', ['q2', 'q1']);

    expect(mockedHttpClient.patch).toHaveBeenCalledWith('/lista/1/questoes/ordem', {
      questoesIds: ['q2', 'q1'],
    });
  });

  it('deve vincular turmas a lista', async () => {
    mockedHttpClient.post.mockResolvedValueOnce({
      data: { dados: { id: '1', nome: 'Lista', criadoEm: '2026-05-22T19:57:18.617Z' } },
    });

    await vincularTurmasLista('1', ['t1']);

    expect(mockedHttpClient.post).toHaveBeenCalledWith('/lista/1/turmas', {
      turmasIds: ['t1'],
    });
  });

  it('deve vincular uma lista a uma turma com configuracao', async () => {
    mockedHttpClient.post.mockResolvedValueOnce({
      data: {
        dados: {
          id: 'lista-1',
          nome: 'Lista',
          criadoEm: '2026-05-22T19:57:18.617Z',
          itens: [{ id: 'item-1', questaoId: 'q1', ordem: 1 }],
          turmas: [
            {
              id: 'vinculo-1',
              listaQuestaoId: 'lista-1',
              turmaId: 't1',
              prazo: '2026-06-10T23:59:00.000Z',
              gabaritoLiberado: true,
            },
          ],
        },
      },
    });

    const resultado = await vincularListaTurma('lista-1', 't1', {
      prazo: '2026-06-10T23:59:00.000Z',
      gabaritoLiberado: true,
    });

    expect(mockedHttpClient.post).toHaveBeenCalledWith('/lista/lista-1/turmas', {
      turmaId: 't1',
      prazo: '2026-06-10T23:59:00.000Z',
      gabaritoLiberado: true,
    });
    expect(resultado).toEqual({
      id: 'vinculo-1',
      listaQuestaoId: 'lista-1',
      nome: 'Lista',
      quantidadeQuestoes: 1,
      prazo: '2026-06-10T23:59:00.000Z',
      gabaritoLiberado: true,
    });
  });

  it('deve listar vinculos de uma turma', async () => {
    mockedHttpClient.get.mockResolvedValueOnce({
      data: {
        dados: [
          {
            id: 'vinculo-1',
            listaQuestaoId: 'lista-1',
            nome: 'Lista',
            quantidadeQuestoes: 3,
            prazo: null,
            gabaritoLiberado: false,
          },
        ],
      },
    });

    const resultado = await listarVinculosDaTurma('t1');

    expect(mockedHttpClient.get).toHaveBeenCalledWith('/lista/turma/t1/vinculos');
    expect(resultado).toEqual([
      {
        id: 'vinculo-1',
        listaQuestaoId: 'lista-1',
        nome: 'Lista',
        quantidadeQuestoes: 3,
        prazo: null,
        gabaritoLiberado: false,
      },
    ]);
  });

  it('deve atualizar prazo e gabarito de um vinculo lista-turma', async () => {
    mockedHttpClient.patch.mockResolvedValueOnce({
      data: {
        dados: {
          id: 'vinculo-1',
          listaQuestaoId: 'lista-1',
          nome: 'Lista',
          quantidadeQuestoes: 3,
          prazo: '2026-06-10T23:59:00.000Z',
          gabaritoLiberado: true,
        },
      },
    });

    const resultado = await atualizarVinculoListaTurma('lista-1', 't1', {
      prazo: '2026-06-10T23:59:00.000Z',
      gabaritoLiberado: true,
    });

    expect(mockedHttpClient.patch).toHaveBeenCalledWith('/lista/lista-1/turmas/t1', {
      prazo: '2026-06-10T23:59:00.000Z',
      gabaritoLiberado: true,
    });
    expect(resultado).toEqual({
      id: 'vinculo-1',
      listaQuestaoId: 'lista-1',
      nome: 'Lista',
      quantidadeQuestoes: 3,
      prazo: '2026-06-10T23:59:00.000Z',
      gabaritoLiberado: true,
    });
  });

  it('deve desvincular uma turma da lista', async () => {
    mockedHttpClient.delete.mockResolvedValueOnce({
      data: { dados: { id: '1', nome: 'Lista', criadoEm: '2026-05-22T19:57:18.617Z' } },
    });

    await desvincularTurmaLista('1', 't1');

    expect(mockedHttpClient.delete).toHaveBeenCalledWith('/lista/1/turmas/t1');
  });

  it('deve lançar erro ao vincular lista se o vínculo não for retornado pela API (linha 130)', async () => {
    mockedHttpClient.post.mockResolvedValueOnce({
      data: {
        dados: {
          id: 'lista-1',
          nome: 'Lista Defeituosa',
          criadoEm: '2026-05-22T19:57:18.617Z',
          turmas: [], 
        },
      },
    });

    await expect(vincularListaTurma('lista-1', 't1')).rejects.toThrow(
      'Vinculo lista-turma nao encontrado na resposta da API.'
    );
  });

  it('deve baixar o PDF da lista (linhas 254-255)', async () => {
   mockedHttpClient.get.mockResolvedValueOnce({
      data: { base64: 'conteudo-em-base64-pdf-fake' },
    });

    const resultado = await baixarPdfLista('lista-123');

    expect(mockedHttpClient.get).toHaveBeenCalledWith('/lista/lista-123/pdf');
    expect(resultado).toBe('conteudo-em-base64-pdf-fake');
  });

  it('deve usar fallbacks ao normalizar lista com dados incompletos ou invalidos (linhas 80, 93)', async () => {
    mockedHttpClient.get.mockResolvedValueOnce({
      data: {
        dados: {
          id: 'lista-fallback',
          nome: 'Lista com Fallbacks',
          criadoEm: 'data-invalida', 
          atualizadoEm: '', 
          turmas: [
            { id: 'v1', turmaId: 't1' } 
          ],
          itens: [
            { id: 'i1', questaoId: 'q1', ordem: 1, questao: { id: 'q1' } as never } 
          ]
        }
      }
    });

    const resultado = await buscarLista('lista-fallback');

    expect(resultado.status).toBe('PUBLICADA'); 
    expect(resultado.quantidadeQuestoes).toBe(1);
    expect(resultado.criadoEm).toBe('data-invalida'); 
    expect(resultado.atualizadoEm).toBe(''); 
    expect(resultado.turmas[0].nome).toBe('Turma sem nome');
    expect(resultado.questoes[0].enunciado).toBe('Questao sem enunciado');
  });

  it('deve testar fallback para RASCUNHO quando nao ha turmas', async () => {
     mockedHttpClient.get.mockResolvedValueOnce({
      data: {
        dados: {
          id: 'lista-rascunho',
          nome: 'Lista sem turmas',
          criadoEm: '2026-05-22T19:57:18.617Z',
        }
      }
    });
    const resultado = await buscarLista('lista-rascunho');
    expect(resultado.status).toBe('RASCUNHO');
  });

  it('deve usar fallbacks completos no normalizarVinculoDaLista (linhas 127, 135-139)', async () => {
    mockedHttpClient.post.mockResolvedValueOnce({
      data: {
        dados: {
          id: 'lista-fallback-vinculo',
          nome: 'Lista Fallback Vinculo',
          criadoEm: '2026-05-22T19:57:18.617Z',
          turmas: [
            {
              id: 'vinculo-novo',
              turma: { id: 't-match', nome: 'Turma Match' },
            }
          ]
        }
      }
    });

    const resultado = await vincularListaTurma('lista-fallback-vinculo', 't-match');

    expect(resultado).toEqual({
      id: 'vinculo-novo',
      listaQuestaoId: 'lista-fallback-vinculo', 
      nome: 'Lista Fallback Vinculo',
      quantidadeQuestoes: 0, 
      prazo: null, 
      gabaritoLiberado: false, 
    });
  });
});
