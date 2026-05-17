import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalTurma } from './ModalTurma';
import type { Turma } from '../../../entities/turmas/model/types';

const turma: Turma = {
  id: 'turma-1',
  codigo: 'ANAT-01',
  nome: 'Anatomia Sistemica',
  semestre: '1',
  ano: 2026,
  descricao: 'Turma matutina',
  status: 'ATIVA',
  quantidadeAlunos: 15,
  criadoEm: '2026-05-14T10:00:00.000Z',
};

describe('ModalTurma', () => {
  const onClose = jest.fn();
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('nao deve renderizar quando estiver fechado', () => {
    const { container } = render(
      <ModalTurma
        isOpen={false}
        mode="create"
        turma={null}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('deve manter botao de criar desabilitado ate preencher campos obrigatorios', async () => {
    const user = userEvent.setup();
    render(
      <ModalTurma
        isOpen={true}
        mode="create"
        turma={null}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    const botaoSalvar = screen.getByRole('button', { name: /Criar turma/i });
    expect(botaoSalvar).toBeDisabled();

    await user.type(screen.getByLabelText('Codigo'), 'ANAT-01');
    await user.type(screen.getByLabelText('Nome'), 'Anatomia Sistemica');
    await user.type(screen.getByLabelText('Descricao'), 'Turma matutina');

    expect(botaoSalvar).toBeEnabled();
  });

  it('deve enviar payload preenchido ao submeter criacao', async () => {
    const user = userEvent.setup();
    render(
      <ModalTurma
        isOpen={true}
        mode="create"
        turma={null}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Codigo'), 'ANAT-01');
    await user.type(screen.getByLabelText('Nome'), 'Anatomia Sistemica');
    await user.clear(screen.getByLabelText('Ano'));
    await user.type(screen.getByLabelText('Ano'), '2026');
    await user.selectOptions(screen.getByLabelText('Semestre'), '2');
    await user.type(screen.getByLabelText('Descricao'), 'Turma noturna');

    await user.click(screen.getByRole('button', { name: /Criar turma/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      codigo: 'ANAT-01',
      nome: 'Anatomia Sistemica',
      ano: 2026,
      semestre: '2',
      descricao: 'Turma noturna',
      status: 'ATIVA',
    });
  });

  it('deve preencher os campos ao editar turma', () => {
    render(
      <ModalTurma
        isOpen={true}
        mode="edit"
        turma={turma}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByLabelText('Codigo')).toHaveValue('ANAT-01');
    expect(screen.getByLabelText('Nome')).toHaveValue('Anatomia Sistemica');
    expect(screen.getByLabelText('Ano')).toHaveValue(2026);
    expect(screen.getByLabelText('Semestre')).toHaveValue('1');
    expect(screen.getByLabelText('Descricao')).toHaveValue('Turma matutina');
    expect(screen.getByLabelText('Status')).toHaveValue('ATIVA');
  });

  it('deve chamar onClose ao clicar em cancelar', async () => {
    const user = userEvent.setup();
    render(
      <ModalTurma
        isOpen={true}
        mode="edit"
        turma={turma}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
