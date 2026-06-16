import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { MinhasTurmas } from '../../../../../src/features/minhas-turmas/ui/MinhasTurmas';
import { listarTurmas } from '../../../../../src/entities/turmas/api/turmaApi';
import type { Turma } from '../../../../../src/entities/turmas/model/types';

jest.mock('../../../../../src/entities/turmas/api/turmaApi', () => ({
  listarTurmas: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

const turmasMock: Turma[] = [
  {
    id: 'turma-1',
    codigo: 'ANAT-01',
    nome: 'Anatomia Sistemica',
    semestre: '1',
    ano: 2026,
    descricao: 'Turma matutina',
    status: 'ATIVA',
    quantidadeAlunos: 0,
    criadoEm: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'turma-2',
    codigo: 'NEURO-02',
    nome: 'Neuroanatomia',
    semestre: '2',
    ano: 2025,
    descricao: 'Turma noturna',
    status: 'ATIVA',
    quantidadeAlunos: 0,
    criadoEm: '2025-08-01T10:00:00.000Z',
  },
];

const renderComponente = () =>
  render(
    <MemoryRouter>
      <MinhasTurmas />
    </MemoryRouter>,
  );

describe('MinhasTurmas Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir estado de carregamento enquanto busca turmas', () => {
    (listarTurmas as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderComponente();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando turmas...');
  });

  it('deve renderizar lista de turmas em formato de cards', async () => {
    (listarTurmas as jest.Mock).mockResolvedValue(turmasMock);

    renderComponente();

    expect(await screen.findByText('Anatomia Sistemica')).toBeInTheDocument();
    expect(screen.getByText('Neuroanatomia')).toBeInTheDocument();
    expect(screen.getByText('2026.1')).toBeInTheDocument();
    expect(screen.getByText('2025.2')).toBeInTheDocument();
  });

  it('deve exibir estado vazio quando aluno nao estiver em nenhuma turma', async () => {
    (listarTurmas as jest.Mock).mockResolvedValue([]);

    renderComponente();

    expect(
      await screen.findByText('Você ainda não foi adicionado a nenhuma turma.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Aguarde o convite do seu professor/i),
    ).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando a chamada falhar', async () => {
    (listarTurmas as jest.Mock).mockRejectedValue(new Error('falha'));

    renderComponente();

    expect(
      await screen.findByText('Não foi possível carregar suas turmas.'),
    ).toBeInTheDocument();
  });

  it('deve navegar para o detalhe ao clicar em um card de turma', async () => {
    const user = userEvent.setup();
    (listarTurmas as jest.Mock).mockResolvedValue(turmasMock);

    renderComponente();

    const card = (await screen.findByText('Anatomia Sistemica')).closest('button');
    expect(card).not.toBeNull();

    await user.click(card!);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/turma-1');
    });
  });
});
