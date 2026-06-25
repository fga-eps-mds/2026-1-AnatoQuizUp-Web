import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('../../../../../src/entities/turmas/api/turmaApi', () => ({
  listarTurmas: jest.fn(),
}));

jest.mock('../../../../../src/features/profile-cosmetics', () => ({
  converterItensEquipadosParaSlots: jest.fn(() => ({})),
}));

jest.mock('../../../../../src/features/ranking', () => ({
  obterRankingGeral: jest.fn(),
  obterRankingTurma: jest.fn(),
  obterRankingLista: jest.fn(),
  obterListasDaTurma: jest.fn(),
  RankingBoard: ({ linhas }: { linhas: Array<{ nome: string }> }) => (
    <div data-testid="board">{linhas.map((l) => l.nome).join(',')}</div>
  ),
}));

import { listarTurmas } from '../../../../../src/entities/turmas/api/turmaApi';
import {
  obterListasDaTurma,
  obterRankingGeral,
  obterRankingLista,
  obterRankingTurma,
} from '../../../../../src/features/ranking';
import { RankingProfessorPage } from '../../../../../src/pages/professor/ranking/ui/RankingProfessorPage';

const turmasMock = listarTurmas as jest.Mock;
const geralMock = obterRankingGeral as jest.Mock;
const turmaMock = obterRankingTurma as jest.Mock;
const listaMock = obterRankingLista as jest.Mock;
const listasMock = obterListasDaTurma as jest.Mock;

describe('RankingProfessorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    turmasMock.mockResolvedValue([{ id: 't1', nome: 'Turma A', codigo: 'TA' }]);
    geralMock.mockResolvedValue({ dados: [], usuarioAtual: null, totalParticipantes: 0 });
  });

  test('carrega o ranking geral por padrao', async () => {
    geralMock.mockResolvedValue({
      dados: [
        {
          posicao: 1,
          usuarioId: 'x',
          nome: 'Geral Aluno',
          nickname: null,
          curso: null,
          semestre: null,
          totalAcertos: 1,
          totalRespondidas: 2,
          taxaAcerto: 50,
          ehUsuarioAtual: false,
          cosmeticos: [],
        },
      ],
      usuarioAtual: null,
      totalParticipantes: 1,
    });

    render(<RankingProfessorPage />);

    expect(await screen.findByText('Geral Aluno')).toBeInTheDocument();
  });

  test('na aba por turma seleciona a turma e carrega o ranking', async () => {
    turmaMock.mockResolvedValue({
      turmaId: 't1',
      totalAlunos: 1,
      dados: [
        {
          posicao: 1,
          alunoId: 'a1',
          nome: 'Ana',
          nickname: null,
          totalAcertos: 3,
          totalRespondidas: 4,
          taxaAcerto: 75,
          cosmeticos: [],
        },
      ],
    });

    render(<RankingProfessorPage />);
    fireEvent.click(screen.getByText('Por turma'));

    await waitFor(() => expect(turmasMock).toHaveBeenCalled());

    const seletorTurma = screen.getByRole('combobox');
    fireEvent.change(seletorTurma, { target: { value: 't1' } });

    await waitFor(() => expect(turmaMock).toHaveBeenCalledWith('t1'));
    expect(await screen.findByText('Ana')).toBeInTheDocument();
  });

  test('na aba por lista escolhe turma e lista', async () => {
    listasMock.mockResolvedValue([{ listaTurmaId: 'lt1', nomeLista: 'Lista 1' }]);
    listaMock.mockResolvedValue({
      turmaId: 't1',
      listaTurmaId: 'lt1',
      nomeLista: 'Lista 1',
      totalQuestoes: 5,
      dados: [
        {
          posicao: 1,
          alunoId: 'a1',
          nome: 'Beatriz',
          nickname: null,
          status: 'SUBMETIDA',
          totalAcertos: 4,
          taxaAcerto: 80,
          submissaoEm: null,
          cosmeticos: [],
        },
      ],
    });

    render(<RankingProfessorPage />);
    fireEvent.click(screen.getByText('Por lista'));

    await waitFor(() => expect(turmasMock).toHaveBeenCalled());

    const seletorTurma = screen.getAllByRole('combobox')[0];
    fireEvent.change(seletorTurma, { target: { value: 't1' } });

    await waitFor(() => expect(listasMock).toHaveBeenCalledWith('t1'));

    const seletorLista = screen.getAllByRole('combobox')[1];
    fireEvent.change(seletorLista, { target: { value: 'lt1' } });

    await waitFor(() => expect(listaMock).toHaveBeenCalledWith('t1', 'lt1'));
    expect(await screen.findByText('Beatriz')).toBeInTheDocument();
  });

  test('indica quando a turma selecionada nao tem listas', async () => {
    listasMock.mockResolvedValue([]);

    render(<RankingProfessorPage />);
    fireEvent.click(screen.getByText('Por lista'));

    await waitFor(() => expect(turmasMock).toHaveBeenCalled());

    const seletorTurma = screen.getAllByRole('combobox')[0];
    fireEvent.change(seletorTurma, { target: { value: 't1' } });

    await waitFor(() => expect(listasMock).toHaveBeenCalledWith('t1'));
    expect(await screen.findByText('Nenhuma lista publicada')).toBeInTheDocument();
  });
});
