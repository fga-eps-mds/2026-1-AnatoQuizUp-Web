jest.mock('../../../shared/config/env', () => ({
  API_BASE_URL: 'http://localhost:4000/api/v1',
  USE_MOCKS: false,
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  atualizarVinculoListaTurma,
  desvincularTurmaLista,
  listarListas,
  listarVinculosDaTurma,
  vincularListaTurma,
} from '../../../entities/lista/api/listaApi';
import type { ListaQuestao, VinculoListaTurma } from '../../../entities/lista/model/types';
import type { Turma } from '../../../entities/turmas/model/types';
import { ModalVincularLista } from './ModalVincularLista';

jest.mock('../../../entities/lista/api/listaApi');

const mockedListarListas = jest.mocked(listarListas);
const mockedListarVinculosDaTurma = jest.mocked(listarVinculosDaTurma);
const mockedVincularListaTurma = jest.mocked(vincularListaTurma);
const mockedAtualizarVinculoListaTurma = jest.mocked(atualizarVinculoListaTurma);
const mockedDesvincularTurmaLista = jest.mocked(desvincularTurmaLista);

const turma: Turma = {
  id: 'turma-1',
  codigo: 'ANAT-01',
  nome: 'Anatomia Sistemica',
  semestre: '1',
  ano: 2026,
  descricao: 'Turma matutina',
  status: 'ATIVA',
  quantidadeAlunos: 20,
  criadoEm: '2026-05-20T10:00:00.000Z',
};

const listas: ListaQuestao[] = [
  {
    id: 'lista-1',
    nome: 'Lista Vinculada',
    quantidadeQuestoes: 4,
    status: 'PUBLICADA',
    turmas: [{ id: 'turma-1', nome: 'Anatomia Sistemica' }],
    criadoEm: '20/05/2026',
  },
  {
    id: 'lista-2',
    nome: 'Lista Disponivel',
    quantidadeQuestoes: 3,
    status: 'RASCUNHO',
    turmas: [],
    criadoEm: '20/05/2026',
  },
];

const vinculos: VinculoListaTurma[] = [
  {
    id: 'vinculo-1',
    listaQuestaoId: 'lista-1',
    nome: 'Lista Vinculada',
    quantidadeQuestoes: 4,
    prazo: '2026-06-10T23:59:00.000Z',
    gabaritoLiberado: true,
  },
];

describe('ModalVincularLista', () => {
  const onClose = jest.fn();
  const onAfterChange = jest.fn();
  const onFeedback = jest.fn();

  const renderizar = (isOpen = true, turmaSelecionada: Turma | null = turma) =>
    render(
      <ModalVincularLista
        isOpen={isOpen}
        turma={turmaSelecionada}
        onClose={onClose}
        onAfterChange={onAfterChange}
        onFeedback={onFeedback}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockedListarListas.mockResolvedValue(listas);
    mockedListarVinculosDaTurma.mockResolvedValue(vinculos);
  });

  it('nao deve renderizar fechado ou sem turma', () => {
    const { container } = renderizar(false);
    expect(container.firstChild).toBeNull();

    const { container: containerSemTurma } = renderizar(true, null);
    expect(containerSemTurma.firstChild).toBeNull();
  });

  it('deve carregar listas e vinculos da turma', async () => {
    renderizar();

    await waitFor(() => {
      expect(mockedListarListas).toHaveBeenCalledTimes(1);
      expect(mockedListarVinculosDaTurma).toHaveBeenCalledWith('turma-1');
    });

    expect(screen.getByText('Lista Vinculada')).toBeInTheDocument();
    expect(screen.getByText('Lista Disponivel')).toBeInTheDocument();
    expect(screen.getByText(/Anatomia Sistemica - 1 lista/)).toBeInTheDocument();
  });

  it('deve filtrar listas disponiveis por nome', async () => {
    const user = userEvent.setup();
    renderizar();

    await screen.findByText('Lista Disponivel');

    await user.type(screen.getByPlaceholderText('Buscar por nome da lista'), 'outra');

    expect(screen.queryByText('Lista Disponivel')).not.toBeInTheDocument();
    expect(screen.getByText('Nenhuma lista disponivel para vincular.')).toBeInTheDocument();
  });

  it('deve vincular uma lista com prazo e gabarito', async () => {
    const user = userEvent.setup();
    mockedVincularListaTurma.mockResolvedValue({
      id: 'vinculo-2',
      listaQuestaoId: 'lista-2',
      nome: 'Lista Disponivel',
      quantidadeQuestoes: 3,
      prazo: '2026-06-12T23:59:00.000Z',
      gabaritoLiberado: true,
    });

    renderizar();
    await screen.findByText('Lista Disponivel');

    fireEvent.change(screen.getByLabelText('Prazo para Lista Disponivel'), {
      target: { value: '2026-06-12T20:59' },
    });
    await user.click(screen.getByRole('checkbox', { name: /Liberar gabarito/i }));
    await user.click(screen.getByRole('button', { name: /^Vincular$/i }));

    await waitFor(() => {
      expect(mockedVincularListaTurma).toHaveBeenCalledWith('lista-2', 'turma-1', {
        prazo: expect.any(String),
        gabaritoLiberado: true,
      });
    });
    expect(onAfterChange).toHaveBeenCalledTimes(1);
    expect(onFeedback).toHaveBeenCalledWith('Lista vinculada com sucesso.', 'success');
  });

  it('deve atualizar prazo e gabarito de vinculo existente', async () => {
    const user = userEvent.setup();
    mockedAtualizarVinculoListaTurma.mockResolvedValue({
      ...vinculos[0],
      prazo: null,
      gabaritoLiberado: false,
    });

    renderizar();
    await screen.findByText('Lista Vinculada');

    fireEvent.change(screen.getByLabelText('Prazo para Lista Vinculada'), {
      target: { value: '' },
    });
    await user.click(screen.getByRole('checkbox', { name: /Gabarito liberado/i }));
    await user.click(screen.getByRole('button', { name: /Salvar configuracao/i }));

    await waitFor(() => {
      expect(mockedAtualizarVinculoListaTurma).toHaveBeenCalledWith('lista-1', 'turma-1', {
        prazo: null,
        gabaritoLiberado: false,
      });
    });
    expect(onAfterChange).toHaveBeenCalledTimes(1);
    expect(onFeedback).toHaveBeenCalledWith('Vinculo atualizado com sucesso.', 'success');
  });

  it('deve desvincular lista da turma', async () => {
    const user = userEvent.setup();
    mockedDesvincularTurmaLista.mockResolvedValue(listas[0]);

    renderizar();
    await screen.findByText('Lista Vinculada');

    await user.click(screen.getByRole('button', { name: /Remover/i }));

    await waitFor(() => {
      expect(mockedDesvincularTurmaLista).toHaveBeenCalledWith('lista-1', 'turma-1');
    });
    expect(onAfterChange).toHaveBeenCalledTimes(1);
    expect(onFeedback).toHaveBeenCalledWith('Lista desvinculada da turma.', 'success');
  });

  it('deve avisar erro ao falhar no carregamento inicial', async () => {
    mockedListarListas.mockRejectedValueOnce(new Error('Falha na API'));

    renderizar();

    await waitFor(() => {
      expect(onFeedback).toHaveBeenCalledWith(
        'Nao foi possivel carregar as listas da turma.',
        'error',
      );
    });
  });
});
