import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HistoricoDetalhesPage } from '../../../../../src/pages/historicoAluno/ui/HistoricoDetalhesPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HistoricoDetalhesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sessaoMock = {
    id: 'sessao-1',
    data: '2026-05-23',
    tema: 'Tórax',
    dificuldade: 'MEDIA',
    itens: [
      {
        id: '1',
        criadoEm: '2026-05-23T15:00:00.000Z',
        respostaMarcada: 'A',
        questaoId: 'questao-1',
        tentativas: 1,
        distribuicao: { A: 1 },
        questao: {
          tema: {
            id: 'tema-1',
            nome: 'Tórax',
          },
          enunciado: 'Qual estrutura reveste diretamente os pulmões?',
          tipoQuestao: 'MULTIPLA_ESCOLHA',
          respostaCorreta: 'A',
          dificuldade: 'MEDIA',
          saibaMais: 'A pleura visceral reveste diretamente os pulmões.',
          alternativas: {
            alternativaA: 'Pleura visceral',
            alternativaB: 'Pleura parietal',
            alternativaC: 'Pericárdio',
            alternativaD: '',
            alternativaE: null,
          },
        },
      },
      {
        id: '2',
        criadoEm: '2026-05-23T15:05:00.000Z',
        respostaMarcada: 'B',
        questaoId: 'questao-1',
        tentativas: 2,
        distribuicao: { B: 1 },
        questao: {
          tema: {
            id: 'tema-1',
            nome: 'Tórax',
          },
          enunciado: 'Qual estrutura reveste diretamente os pulmões?',
          tipoQuestao: 'MULTIPLA_ESCOLHA',
          respostaCorreta: 'A',
          dificuldade: 'MEDIA',
          saibaMais: 'A pleura visceral reveste diretamente os pulmões.',
          alternativas: {
            alternativaA: 'Pleura visceral',
            alternativaB: 'Pleura parietal',
            alternativaC: 'Pericárdio',
            alternativaD: '',
            alternativaE: null,
          },
        },
      },
    ],
  };

  it('deve renderizar os detalhes da sessão com estatísticas e alternativas', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/aluno/historico/detalhes',
            state: { sessao: sessaoMock },
          },
        ]}
      >
        <Routes>
          <Route path="/aluno/historico/detalhes" element={<HistoricoDetalhesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Tórax')).toBeInTheDocument();
    expect(screen.getByText('Revisão da Questão')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getAllByText('50%')).toHaveLength(2);
    expect(screen.getByText('Qual estrutura reveste diretamente os pulmões?')).toBeInTheDocument();
    expect(screen.getByText('Pleura visceral')).toBeInTheDocument();
    expect(screen.getByText('Pleura parietal')).toBeInTheDocument();
    expect(screen.getByText('Pericárdio')).toBeInTheDocument();
    expect(screen.getByText('Resposta Correta')).toBeInTheDocument();
    expect(screen.getByText('Escolhida 1x')).toBeInTheDocument();
    expect(screen.getByText('A pleura visceral reveste diretamente os pulmões.')).toBeInTheDocument();
  });

  it('deve voltar para a tela de histórico ao clicar em voltar', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/aluno/historico/detalhes',
            state: { sessao: sessaoMock },
          },
        ]}
      >
        <Routes>
          <Route path="/aluno/historico/detalhes" element={<HistoricoDetalhesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Voltar às Sessões/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/aluno/historico');
  });

  it('deve redirecionar para o histórico quando não houver sessão no state', () => {
    render(
      <MemoryRouter initialEntries={['/aluno/historico/detalhes']}>
        <Routes>
          <Route path="/aluno/historico/detalhes" element={<HistoricoDetalhesPage />} />
          <Route path="/aluno/historico" element={<span>Histórico redirecionado</span>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Histórico redirecionado')).toBeInTheDocument();
  });
});