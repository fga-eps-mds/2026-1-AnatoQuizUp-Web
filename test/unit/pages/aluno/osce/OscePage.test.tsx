jest.mock('../../../../../src/features/osce/osceService', () => ({
  listarCenariosOsce: jest.fn(),
  enviarMensagemOsce: jest.fn(),
  finalizarOsce: jest.fn(),
}));

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';

import {
  AVISO_DEMORA,
  AVISO_FALHA_FINALIZAR,
  AVISO_IA_INDISPONIVEL,
  criarErroOsce,
} from '../../../../../src/features/osce/erroOsce';

import {
  enviarMensagemOsce,
  finalizarOsce,
  listarCenariosOsce,
  type AvaliacaoOsce,
  type TurnoOsce,
} from '../../../../../src/features/osce/osceService';
import { OscePage } from '../../../../../src/pages/aluno/osce/OscePage';

const listarMock = listarCenariosOsce as jest.Mock;
const enviarMock = enviarMensagemOsce as jest.Mock;
const finalizarMock = finalizarOsce as jest.Mock;

const CENARIOS = [
  {
    id: 'dor-toracica',
    titulo: 'Dor torácica',
    especialidade: 'Cardiologia',
    dificuldade: 'Médio',
    contextoInicial: {
      local: 'Pronto-socorro de um hospital geral',
      papelEstudante: 'Médico(a) responsável pelo primeiro atendimento',
      idade: 58,
      sexo: 'Masculino',
      queixa: 'Dor torácica',
    },
  },
  // Sem contextoInicial: simula o ChatbotOSCE ainda sem o campo novo.
  { id: 'cefaleia-subita', titulo: 'Cefaleia súbita', especialidade: 'Neurologia', dificuldade: 'Difícil' },
];

const AVALIACAO: AvaliacaoOsce = {
  cenarioId: 'dor-toracica',
  titulo: 'Dor torácica',
  diagnosticoEsperado: 'Síndrome coronariana aguda',
  comentarioFinal: 'Faltou investigar fatores de risco.',
  itens: [
    {
      id: 'caracteriza-dor',
      dominio: 'Identificação do problema',
      descricao: 'Caracteriza a dor',
      ancoras: { competente: 'Localização e qualidade' },
      peso: 2,
      permiteParcial: false,
      nivel: 'competente',
      justificativa: 'Perguntou onde doía',
      pontos: 2,
      pontosMaximos: 2,
    },
  ],
  pontuacao: 2,
  pontuacaoMaxima: 2,
  percentual: 100,
  nivelChecklist: 'excelente',
  rotuloChecklist: 'Excelente',
  notaGlobal: 3,
  rotuloNotaGlobal: 'Boa aprovação',
  ancoraNotaGlobal: 'Conduziu bem.',
  justificativaNotaGlobal: 'Raciocínio claro.',
  aprovado: true,
  itensCriticosNaoCumpridos: [],
  divergente: false,
};

// Resposta do ChatbotOSCE so com a fala do paciente, sem cards de exame.
const respostaPaciente = (texto: string): TurnoOsce[] => [{ autor: 'paciente', texto }];

// Promise que o teste resolve na mao, para observar o estado de carregamento.
const promiseControlavel = <T,>() => {
  let resolve!: (valor: T) => void;
  let reject!: (erro: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const escolherCaso = async (titulo = 'Dor torácica') => {
  render(<OscePage />);
  const caso = await screen.findByText(titulo);
  await userEvent.click(caso);
};

// Escolhe o caso e passa pela etapa de cenario ate o chat.
const abrirCaso = async (titulo = 'Dor torácica') => {
  await escolherCaso(titulo);
  await userEvent.click(screen.getByRole('button', { name: /Iniciar atendimento/ }));
};

// Erro como o servico do OSCE lanca para um status HTTP, com a mensagem tecnica
// que o ChatbotOSCE devolve hoje no 503.
const erroDaIa = (status: number) =>
  criarErroOsce(
    new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
      status,
      data: { erro: { mensagem: 'Servico de IA ainda nao foi habilitado nesta release.' } },
    } as AxiosResponse),
  );

const campo = () => screen.getByPlaceholderText(/Pergunte algo ao paciente/);
const atalhoEncerrar = () => screen.getByRole('button', { name: /Encerrar e receber feedback/ });

// Envia uma fala e espera a resposta do paciente aparecer.
const conversar = async (fala: string, resposta: string) => {
  enviarMock.mockResolvedValueOnce(respostaPaciente(resposta));
  await userEvent.type(campo(), `${fala}{Enter}`);
  await screen.findByText(resposta);
};

beforeEach(() => {
  jest.clearAllMocks();
  listarMock.mockResolvedValue(CENARIOS);
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('OscePage', () => {
  it('mostra o carregamento e depois a lista de casos clinicos', async () => {
    const cenarios = promiseControlavel<typeof CENARIOS>();
    listarMock.mockReturnValue(cenarios.promise);

    render(<OscePage />);

    expect(screen.getByText(/Carregando casos clínicos/)).toBeInTheDocument();

    cenarios.resolve(CENARIOS);

    expect(await screen.findByText('Dor torácica')).toBeInTheDocument();
    expect(screen.getByText('Cefaleia súbita')).toBeInTheDocument();
    expect(screen.getByText('Cardiologia')).toBeInTheDocument();
    expect(screen.getByText('Difícil')).toBeInTheDocument();
    expect(screen.queryByText(/Carregando casos clínicos/)).not.toBeInTheDocument();
  });

  it('mostra o contexto inicial do caso quando o BFF devolve', async () => {
    listarMock.mockResolvedValue([
      {
        ...CENARIOS[0],
        contextoInicial: {
          local: 'Pronto-socorro de um hospital geral',
          papelEstudante: 'Médico(a) responsável pelo primeiro atendimento',
          idade: 58,
          sexo: 'Masculino',
          queixa: 'Dor torácica',
        },
      },
    ]);

    render(<OscePage />);

    expect(await screen.findByText(/Pronto-socorro de um hospital geral/)).toBeInTheDocument();
    expect(screen.getByText(/Paciente: 58 anos, Masculino/)).toBeInTheDocument();
  });

  it('avisa quando a lista de casos falha', async () => {
    listarMock.mockRejectedValue(new Error('Serviço de IA indisponível'));

    render(<OscePage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Serviço de IA indisponível');
  });

  it('mostra o cenario do caso antes do chat, sem campo de texto', async () => {
    await escolherCaso();

    expect(screen.getByText('Cenário do caso')).toBeInTheDocument();
    expect(screen.getByText('Pronto-socorro de um hospital geral')).toBeInTheDocument();
    expect(screen.getByText('Médico(a) responsável pelo primeiro atendimento')).toBeInTheDocument();
    expect(screen.getByText('58 anos, sexo masculino')).toBeInTheDocument();
    expect(screen.getByText('Dor torácica', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Pergunte algo ao paciente/)).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Cefaleia súbita')).not.toBeInTheDocument();
  });

  it('mostra um texto padrao quando o caso nao tem contextoInicial', async () => {
    await escolherCaso('Cefaleia súbita');

    expect(screen.getByText(/O cenário detalhado deste caso ainda não está disponível/)).toBeInTheDocument();
    expect(screen.queryByText('Local')).not.toBeInTheDocument();
  });

  it('voltar do cenario retorna para a lista de casos', async () => {
    await escolherCaso();

    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }));

    expect(screen.getByText('Cefaleia súbita')).toBeInTheDocument();
    expect(screen.queryByText('Cenário do caso')).not.toBeInTheDocument();
  });

  it('abre a conversa ao iniciar o atendimento', async () => {
    await abrirCaso();

    expect(campo()).toBeInTheDocument();
    expect(screen.queryByText('Cenário do caso')).not.toBeInTheDocument();
    expect(screen.queryByText(/Inicie a anamnese/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Finalizar e ver feedback/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trocar caso' })).toBeInTheDocument();
  });

  it('envia a fala do aluno e mostra a resposta do paciente', async () => {
    enviarMock.mockResolvedValue(respostaPaciente('Dói desde ontem, **em aperto**.'));
    await abrirCaso();

    await userEvent.type(screen.getByPlaceholderText(/Pergunte algo ao paciente/), 'Desde quando dói?');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar pergunta ao paciente' }));

    expect(await screen.findByText(/Dói desde ontem/)).toBeInTheDocument();
    // O negrito da resposta e renderizado como <strong>.
    expect(screen.getByText('em aperto').tagName).toBe('STRONG');
    expect(enviarMock).toHaveBeenCalledWith('dor-toracica', 'Desde quando dói?', []);
    // O campo volta vazio depois do envio.
    expect(screen.getByPlaceholderText(/Pergunte algo ao paciente/)).toHaveValue('');
  });

  it('envia a fala ao pressionar Enter, mas nao com Shift+Enter', async () => {
    enviarMock.mockResolvedValue(respostaPaciente('Resposta do paciente.'));
    await abrirCaso();

    const campo = screen.getByPlaceholderText(/Pergunte algo ao paciente/);
    await userEvent.type(campo, 'Onde dói?{Shift>}{Enter}{/Shift}');
    expect(enviarMock).not.toHaveBeenCalled();

    await userEvent.type(campo, '{Enter}');
    await waitFor(() => expect(enviarMock).toHaveBeenCalledTimes(1));
  });

  it('manda o historico anterior sem o id interno dos turnos', async () => {
    enviarMock.mockResolvedValueOnce(respostaPaciente('Dor no peito.')).mockResolvedValueOnce(respostaPaciente('Desde ontem.'));
    await abrirCaso();

    const campo = screen.getByPlaceholderText(/Pergunte algo ao paciente/);
    await userEvent.type(campo, 'O que sente?{Enter}');
    await screen.findByText('Dor no peito.');

    await userEvent.type(campo, 'Desde quando?{Enter}');
    await waitFor(() => expect(enviarMock).toHaveBeenCalledTimes(2));

    expect(enviarMock).toHaveBeenLastCalledWith('dor-toracica', 'Desde quando?', [
      { autor: 'aluno', texto: 'O que sente?' },
      { autor: 'paciente', texto: 'Dor no peito.' },
    ]);
  });

  it('mostra os resultados de exame como cards separados da fala do paciente', async () => {
    enviarMock.mockResolvedValueOnce([
      { autor: 'paciente', texto: 'Tudo bem, doutor.' },
      { autor: 'exame', exame: 'Eletrocardiograma', texto: 'Infradesnivelamento de ST em V4–V6.' },
      { autor: 'indisponivel', exame: 'Tomografia de tórax', texto: 'Não disponível neste caso.' },
    ]);
    await abrirCaso();

    await userEvent.type(campo(), 'Solicito um ECG e uma tomografia de tórax.{Enter}');

    const card = await screen.findByRole('region', { name: 'Resultado de exame: Eletrocardiograma' });
    expect(card).toHaveTextContent('Resultado de exame · Eletrocardiograma');
    expect(card).toHaveTextContent('Infradesnivelamento de ST em V4–V6.');
    expect(screen.getByText('Tudo bem, doutor.')).toBeInTheDocument();
    expect(screen.getByText(/Tomografia de tórax: não disponível neste caso/)).toBeInTheDocument();
  });

  it('reenvia os cards de exame no historico, com o nome do exame', async () => {
    enviarMock
      .mockResolvedValueOnce([
        { autor: 'exame', exame: 'Eletrocardiograma', texto: 'Ritmo sinusal.' },
      ])
      .mockResolvedValueOnce(respostaPaciente('Não sei, doutor.'));
    finalizarMock.mockResolvedValue(AVALIACAO);
    await abrirCaso();

    await userEvent.type(campo(), 'Peço um ECG.{Enter}');
    await screen.findByText('Ritmo sinusal.');
    await userEvent.type(campo(), 'O senhor sabe o resultado?{Enter}');
    await screen.findByText('Não sei, doutor.');

    const historicoEsperado = [
      { autor: 'aluno', texto: 'Peço um ECG.' },
      { autor: 'exame', exame: 'Eletrocardiograma', texto: 'Ritmo sinusal.' },
    ];
    expect(enviarMock).toHaveBeenLastCalledWith(
      'dor-toracica',
      'O senhor sabe o resultado?',
      historicoEsperado,
    );

    await userEvent.click(atalhoEncerrar());
    await waitFor(() =>
      expect(finalizarMock).toHaveBeenCalledWith('dor-toracica', [
        ...historicoEsperado,
        { autor: 'aluno', texto: 'O senhor sabe o resultado?' },
        { autor: 'paciente', texto: 'Não sei, doutor.' },
      ]),
    );
  });

  it('nao envia mensagem vazia', async () => {
    await abrirCaso();

    await userEvent.type(screen.getByPlaceholderText(/Pergunte algo ao paciente/), '   {Enter}');

    expect(enviarMock).not.toHaveBeenCalled();
  });

  it('avisa quando a fala do paciente falha', async () => {
    enviarMock.mockRejectedValue(new Error('Erro ao falar com o paciente'));
    await abrirCaso();

    await userEvent.type(screen.getByPlaceholderText(/Pergunte algo ao paciente/), 'Onde dói?{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao falar com o paciente');
  });

  it('mantem o atalho de encerrar sempre presente e so o libera depois da primeira fala', async () => {
    await abrirCaso();

    expect(atalhoEncerrar()).toBeDisabled();

    await conversar('O que sente?', 'Dor no peito.');
    expect(atalhoEncerrar()).toBeEnabled();

    await conversar('Desde quando?', 'Desde cedo.');
    expect(atalhoEncerrar()).toBeEnabled();
  });

  it('pergunta antes de encerrar quando o aluno se despede', async () => {
    await abrirCaso();
    await conversar('O que sente?', 'Dor no peito.');

    enviarMock.mockResolvedValueOnce(respostaPaciente('Obrigado, doutor.'));
    await userEvent.type(campo(), 'Obrigado, era isso. Tchau!{Enter}');

    // O paciente responde uma vez a despedida e entao vem a confirmacao.
    expect(await screen.findByText('Obrigado, doutor.')).toBeInTheDocument();
    const modal = await screen.findByRole('dialog', { name: 'Encerrar e ver avaliação?' });
    expect(enviarMock).toHaveBeenCalledTimes(2);
    // O foco entra no modal.
    expect(within(modal).getByRole('button', { name: 'Continuar atendimento' })).toHaveFocus();
  });

  it('abre a confirmacao mesmo quando o envio da despedida falha', async () => {
    await abrirCaso();
    await conversar('O que sente?', 'Dor no peito.');

    enviarMock.mockRejectedValueOnce(new Error('Erro ao falar com o paciente'));
    await userEvent.type(campo(), 'Tchau{Enter}');

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Erro ao falar com o paciente');
  });

  it('continuar atendimento fecha a confirmacao e devolve o foco ao campo', async () => {
    await abrirCaso();
    await conversar('O que sente?', 'Dor no peito.');
    await conversar('Tchau', 'Até logo, doutor.');

    await userEvent.click(await screen.findByRole('button', { name: 'Continuar atendimento' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(campo()).toHaveFocus();
    expect(screen.getByText('Até logo, doutor.')).toBeInTheDocument();

    // A conversa continua normalmente com uma fala que nao e despedida.
    await conversar('Na verdade, a dor irradia?', 'Vai pro braço.');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('clicar no fundo escurecido fecha a confirmacao', async () => {
    await abrirCaso();
    await conversar('Tchau', 'Até logo.');

    await screen.findByRole('dialog');
    await userEvent.click(screen.getByTestId('osce-encerramento-overlay'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Esc fecha a confirmacao', async () => {
    await abrirCaso();
    await conversar('Tchau', 'Até logo.');

    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uma segunda despedida abre a confirmacao sem chamar a IA de novo', async () => {
    await abrirCaso();
    await conversar('O que sente?', 'Dor no peito.');
    await conversar('Obrigado, tchau', 'Tchau, doutor.');
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar atendimento' }));
    expect(enviarMock).toHaveBeenCalledTimes(2);

    await userEvent.type(campo(), 'tchau{Enter}');

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(enviarMock).toHaveBeenCalledTimes(2);
    expect(screen.queryAllByText('tchau')).toHaveLength(0);
  });

  it('encerrar na confirmacao finaliza a estacao', async () => {
    finalizarMock.mockResolvedValue(AVALIACAO);
    await abrirCaso();
    await conversar('O que sente?', 'Dor no peito.');
    await conversar('Vou encerrar a consulta', 'Tudo bem.');

    await userEvent.click(await screen.findByRole('button', { name: 'Encerrar' }));

    expect(await screen.findByText('Feedback do examinador')).toBeInTheDocument();
    expect(finalizarMock).toHaveBeenCalledWith('dor-toracica', [
      { autor: 'aluno', texto: 'O que sente?' },
      { autor: 'paciente', texto: 'Dor no peito.' },
      { autor: 'aluno', texto: 'Vou encerrar a consulta' },
      { autor: 'paciente', texto: 'Tudo bem.' },
    ]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('desabilita a confirmacao enquanto avalia e mostra o erro no chat se falhar', async () => {
    const avaliacao = promiseControlavel<AvaliacaoOsce>();
    finalizarMock.mockReturnValue(avaliacao.promise);
    await abrirCaso();
    await conversar('Tchau', 'Até logo.');

    await userEvent.click(await screen.findByRole('button', { name: 'Encerrar' }));

    expect(screen.getByRole('button', { name: 'Encerrar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continuar atendimento' })).toBeDisabled();
    // Esc nao fecha durante a avaliacao.
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    avaliacao.reject(erroDaIa(503));

    expect(await screen.findByRole('alert')).toHaveTextContent(AVISO_FALHA_FINALIZAR.texto);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('finaliza a estacao e mostra o feedback do examinador', async () => {
    enviarMock.mockResolvedValue(respostaPaciente('Dor no peito.'));
    finalizarMock.mockResolvedValue(AVALIACAO);
    await abrirCaso();

    await userEvent.type(screen.getByPlaceholderText(/Pergunte algo ao paciente/), 'O que sente?{Enter}');
    await screen.findByText('Dor no peito.');

    await userEvent.click(screen.getByRole('button', { name: /Encerrar e receber feedback/ }));

    expect(await screen.findByText('Feedback do examinador')).toBeInTheDocument();
    expect(screen.getByText('Faltou investigar fatores de risco.')).toBeInTheDocument();
    expect(finalizarMock).toHaveBeenCalledWith('dor-toracica', [
      { autor: 'aluno', texto: 'O que sente?' },
      { autor: 'paciente', texto: 'Dor no peito.' },
    ]);
    // Com a estacao avaliada, nao se conversa mais nem se finaliza de novo.
    expect(screen.getByPlaceholderText(/Pergunte algo ao paciente/)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Encerrar e receber feedback/ })).toBeDisabled();
  });

  it('avisa quando a avaliacao falha', async () => {
    enviarMock.mockResolvedValue(respostaPaciente('Dor no peito.'));
    finalizarMock.mockRejectedValue(new Error('Avaliação indisponível'));
    await abrirCaso();

    await userEvent.type(screen.getByPlaceholderText(/Pergunte algo ao paciente/), 'O que sente?{Enter}');
    await screen.findByText('Dor no peito.');

    await userEvent.click(screen.getByRole('button', { name: /Encerrar e receber feedback/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(AVISO_FALHA_FINALIZAR.texto);
  });

  describe('falhas da IA (T1.9)', () => {
    it('mostra o aviso de IA fora do ar no 503, sem a mensagem tecnica do backend', async () => {
      enviarMock.mockRejectedValueOnce(erroDaIa(503));
      await abrirCaso();

      await userEvent.type(campo(), 'Onde dói?{Enter}');

      const aviso = await screen.findByRole('alert');
      expect(aviso).toHaveTextContent(AVISO_IA_INDISPONIVEL.titulo as string);
      expect(aviso).toHaveTextContent(AVISO_IA_INDISPONIVEL.texto);
      expect(within(aviso).getByRole('button', { name: 'Tentar de novo' })).toHaveAttribute(
        'type',
        'button',
      );
      expect(screen.queryByText(/nesta release/)).not.toBeInTheDocument();
    });

    it('mantem a fala que falhou no chat, marcada como "Nao enviada"', async () => {
      enviarMock.mockRejectedValueOnce(erroDaIa(503));
      await abrirCaso();

      await userEvent.type(campo(), 'Onde dói?{Enter}');

      expect(await screen.findByText('Não enviada')).toBeInTheDocument();
      expect(screen.getByText('Onde dói?')).toHaveClass('border-dashed');
      expect(screen.getByText('Onde dói?')).not.toHaveClass('bg-[#0D9488]');
    });

    it('"Tentar de novo" reenvia a mesma fala sem duplicar e remove a marcacao', async () => {
      await abrirCaso();
      await conversar('O que sente?', 'Dor no peito.');

      enviarMock.mockRejectedValueOnce(erroDaIa(504));
      await userEvent.type(campo(), 'Desde quando?{Enter}');
      expect(await screen.findByRole('alert')).toHaveTextContent(AVISO_DEMORA.titulo as string);

      enviarMock.mockResolvedValueOnce(respostaPaciente('Desde ontem.'));
      await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

      expect(await screen.findByText('Desde ontem.')).toBeInTheDocument();
      expect(screen.getAllByText('Desde quando?')).toHaveLength(1);
      expect(screen.queryByText('Não enviada')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      // O reenvio usa o historico anterior a fala, sem ela mesma.
      expect(enviarMock).toHaveBeenCalledTimes(3);
      expect(enviarMock).toHaveBeenLastCalledWith('dor-toracica', 'Desde quando?', [
        { autor: 'aluno', texto: 'O que sente?' },
        { autor: 'paciente', texto: 'Dor no peito.' },
      ]);
    });

    it('a fala nao enviada fica fora do historico das falas seguintes e da avaliacao', async () => {
      finalizarMock.mockResolvedValue(AVALIACAO);
      await abrirCaso();

      enviarMock.mockRejectedValueOnce(erroDaIa(502));
      await userEvent.type(campo(), 'Onde dói?{Enter}');
      await screen.findByText('Não enviada');
      // So com a fala nao enviada, ainda nao ha o que avaliar.
      expect(atalhoEncerrar()).toBeDisabled();

      await conversar('O que sente?', 'Dor no peito.');
      expect(enviarMock).toHaveBeenLastCalledWith('dor-toracica', 'O que sente?', []);
      // A nova fala tira o aviso, mas a anterior continua marcada.
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('Não enviada')).toBeInTheDocument();

      await userEvent.click(atalhoEncerrar());
      await waitFor(() =>
        expect(finalizarMock).toHaveBeenCalledWith('dor-toracica', [
          { autor: 'aluno', texto: 'O que sente?' },
          { autor: 'paciente', texto: 'Dor no peito.' },
        ]),
      );
    });

    it('reenviar uma despedida que falhou abre a confirmacao de novo', async () => {
      await abrirCaso();
      await conversar('O que sente?', 'Dor no peito.');

      enviarMock.mockRejectedValueOnce(erroDaIa(503));
      await userEvent.type(campo(), 'Tchau{Enter}');
      await userEvent.click(await screen.findByRole('button', { name: 'Continuar atendimento' }));

      enviarMock.mockResolvedValueOnce(respostaPaciente('Até logo, doutor.'));
      await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

      expect(await screen.findByText('Até logo, doutor.')).toBeInTheDocument();
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('falha em /finalizar fecha o modal e "Encerrar de novo" tenta outra vez', async () => {
      finalizarMock.mockRejectedValueOnce(erroDaIa(503)).mockResolvedValueOnce(AVALIACAO);
      await abrirCaso();
      await conversar('Tchau', 'Até logo.');

      await userEvent.click(await screen.findByRole('button', { name: 'Encerrar' }));

      const aviso = await screen.findByRole('alert');
      expect(aviso).toHaveTextContent(AVISO_FALHA_FINALIZAR.titulo as string);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(/nesta release/)).not.toBeInTheDocument();
      // A conversa continua na tela.
      expect(screen.getByText('Até logo.')).toBeInTheDocument();

      await userEvent.click(within(aviso).getByRole('button', { name: 'Encerrar de novo' }));

      expect(await screen.findByText('Feedback do examinador')).toBeInTheDocument();
      expect(finalizarMock).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('trocar caso volta para a lista e descarta a conversa', async () => {
    enviarMock.mockResolvedValue(respostaPaciente('Dor no peito.'));
    await abrirCaso();

    await userEvent.type(screen.getByPlaceholderText(/Pergunte algo ao paciente/), 'O que sente?{Enter}');
    await screen.findByText('Dor no peito.');

    await userEvent.click(screen.getByRole('button', { name: 'Trocar caso' }));

    expect(screen.getByText('Cefaleia súbita')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Dor torácica'));
    await userEvent.click(screen.getByRole('button', { name: /Iniciar atendimento/ }));

    expect(screen.queryByText('Dor no peito.')).not.toBeInTheDocument();
    expect(atalhoEncerrar()).toBeDisabled();
  });
});
