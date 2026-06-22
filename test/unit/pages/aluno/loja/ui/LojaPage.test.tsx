import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  comprarItem,
  listarCatalogo,
  listarInventario,
} from '../../../../../../src/features/loja';
import { LojaPage } from '../../../../../../src/pages/aluno/loja/ui/LojaPage';
import { useStudentCoinsStore } from '../../../../../../src/features/student-coins/model/useStudentCoinsStore';

jest.mock('../../../../../../src/features/loja', () => ({
  listarCatalogo: jest.fn(),
  listarInventario: jest.fn(),
  comprarItem: jest.fn(),
}));

const listarCatalogoMock = listarCatalogo as jest.Mock;
const listarInventarioMock = listarInventario as jest.Mock;
const comprarItemMock = comprarItem as jest.Mock;

const item = (over: Record<string, unknown>) => ({
  id: 'id',
  codigo: 'cod',
  nome: 'Item',
  descricao: 'Descrição',
  precoMoedas: 100,
  valor: null,
  imagemUrl: null,
  previewImagemUrl: null,
  ativo: true,
  adquirido: false,
  ...over,
});

const catalogo = {
  dados: [
    item({ id: 'icone-1', codigo: 'icone-coruja', nome: 'Coruja', tipo: 'ICONE_PERFIL', precoMoedas: 60 }),
    item({ id: 'fundo-1', nome: 'Azul Noturno', tipo: 'PLANO_FUNDO', precoMoedas: 80, valor: '#0A1128' }),
    item({ id: 'avatar-1', nome: 'O Estudioso', tipo: 'AVATAR', precoMoedas: 100 }),
    item({ id: 'moldura-1', nome: 'Dourada', tipo: 'MOLDURA', precoMoedas: 220, valor: '#FCD34D' }),
    item({ id: 'titulo-1', nome: 'Mestre da Anatomia', tipo: 'TITULO', precoMoedas: 250 }),
  ],
  metadados: { page: 1, limit: 100, total: 5, totalPages: 1 },
};

const inventarioVazio = {
  dados: [],
  metadados: { page: 1, limit: 100, total: 0, totalPages: 0 },
};

const nomesDosCards = () =>
  screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

describe('LojaPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStudentCoinsStore.setState({ saldoMoedas: 1000 });
    listarCatalogoMock.mockResolvedValue(catalogo);
    listarInventarioMock.mockResolvedValue(inventarioVazio);
  });

  it('abre na aba Todos mostrando itens de todas as categorias', async () => {
    render(<LojaPage />);

    expect(await screen.findByText('Coruja')).toBeInTheDocument();
    expect(screen.getByText('1000 ATP')).toBeInTheDocument();
    // itens de categorias diferentes aparecem juntos na aba Todos
    expect(screen.getByText('O Estudioso')).toBeInTheDocument();
    expect(screen.getAllByText('Mestre da Anatomia').length).toBeGreaterThan(0);
  });

  it('ordena por preço (mais baratos por padrão) e inverte ao alternar', async () => {
    render(<LojaPage />);
    await screen.findByText('Coruja');

    // padrão asc: o mais barato (Coruja, 60) vem primeiro
    expect(nomesDosCards()[0]).toBe('Coruja');

    await userEvent.click(screen.getByRole('button', { name: /Preço:/i }));

    // desc: o mais caro (Mestre da Anatomia, 250) vem primeiro
    expect(nomesDosCards()[0]).toBe('Mestre da Anatomia');
  });

  it('troca de categoria ao clicar na aba Molduras', async () => {
    render(<LojaPage />);
    await screen.findByText('Coruja');

    await userEvent.click(screen.getByRole('button', { name: /Molduras/i }));

    expect(await screen.findByText('Dourada')).toBeInTheDocument();
    expect(screen.queryByText('Coruja')).not.toBeInTheDocument();
  });

  it('compra um item, chama o serviço e atualiza o saldo', async () => {
    comprarItemMock.mockResolvedValue({
      mensagem: 'Item comprado com sucesso.',
      saldoMoedas: 940,
      item: {
        id: 'inv-1',
        equipado: false,
        adquiridoEm: '2026-06-18T00:00:00.000Z',
        item: item({ id: 'icone-1', codigo: 'icone-coruja', nome: 'Coruja', tipo: 'ICONE_PERFIL', precoMoedas: 60 }),
      },
    });

    render(<LojaPage />);
    const card = (await screen.findByText('Coruja')).closest('article') as HTMLElement;

    await userEvent.click(within(card).getByRole('button', { name: 'Comprar' }));

    await waitFor(() => expect(comprarItemMock).toHaveBeenCalledWith('icone-1'));
    expect(await screen.findByText(/comprado/i)).toBeInTheDocument();
    expect(screen.getByText('940 ATP')).toBeInTheDocument();
  });

  it('abre o modal de pré-visualização e confirma a compra', async () => {
    comprarItemMock.mockResolvedValue({
      mensagem: 'Item comprado com sucesso.',
      saldoMoedas: 940,
      item: {
        id: 'inv-1',
        equipado: false,
        adquiridoEm: '2026-06-18T00:00:00.000Z',
        item: item({ id: 'icone-1', codigo: 'icone-coruja', nome: 'Coruja', tipo: 'ICONE_PERFIL', precoMoedas: 60 }),
      },
    });

    render(<LojaPage />);
    await screen.findByText('Coruja');

    await userEvent.click(screen.getByRole('button', { name: /Pré-visualizar Coruja/i }));

    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /Confirmar compra/i }));

    await waitFor(() => expect(comprarItemMock).toHaveBeenCalledWith('icone-1'));
  });

  it('fecha a pré-visualização somente ao interagir com o fundo', async () => {
    render(<LojaPage />);
    await screen.findByText('Coruja');

    await userEvent.click(
      screen.getByRole('button', { name: /Pré-visualizar Coruja/i }),
    );

    const dialog = await screen.findByRole('dialog');
    const backdrop = dialog.parentElement as HTMLElement;

    fireEvent.mouseDown(dialog);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(backdrop);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mostra os itens adquiridos na aba de inventário', async () => {
    listarInventarioMock.mockResolvedValue({
      dados: [
        {
          id: 'inv-1',
          equipado: false,
          adquiridoEm: '2026-06-18T00:00:00.000Z',
          item: item({ id: 'fundo-1', nome: 'Azul Noturno', tipo: 'PLANO_FUNDO', valor: '#0A1128' }),
        },
      ],
      metadados: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    render(<LojaPage />);
    await screen.findByText('Coruja');

    await userEvent.click(screen.getByRole('button', { name: /Meu Inventário/i }));

    expect(await screen.findByText('Azul Noturno')).toBeInTheDocument();
  });

  it('exibe o inventário vazio', async () => {
    render(<LojaPage />);
    await screen.findByText('Coruja');

    await userEvent.click(
      screen.getByRole('button', { name: /Meu Inventário/i }),
    );

    expect(
      screen.getByText('Você ainda não possui itens. Compre algo na loja!'),
    ).toBeInTheDocument();
  });

  it('exibe erro de carregamento e tenta novamente', async () => {
    listarCatalogoMock.mockRejectedValueOnce(new Error('Loja indisponível'));
    render(<LojaPage />);

    expect(await screen.findByText('Loja indisponível')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );

    expect(await screen.findByText('Coruja')).toBeInTheDocument();
    expect(listarCatalogoMock).toHaveBeenCalledTimes(2);
  });

  it('usa mensagem padrão para falha de carregamento não tipada', async () => {
    listarCatalogoMock.mockRejectedValueOnce('falha');
    render(<LojaPage />);

    expect(await screen.findByText('Erro ao carregar a loja.')).toBeInTheDocument();
  });

  it('informa falha não tipada ao comprar um item', async () => {
    comprarItemMock.mockRejectedValueOnce('falha');
    render(<LojaPage />);
    const card = (await screen.findByText('Coruja')).closest(
      'article',
    ) as HTMLElement;

    await userEvent.click(
      within(card).getByRole('button', { name: 'Comprar' }),
    );

    expect(
      await screen.findByText('Não foi possível comprar o item.'),
    ).toBeInTheDocument();
  });

  it('exibe item já adquirido e categoria sem itens', async () => {
    listarCatalogoMock.mockResolvedValueOnce({
      ...catalogo,
      dados: [
        item({
          id: 'icone-1',
          nome: 'Coruja',
          tipo: 'ICONE_PERFIL',
          adquirido: true,
        }),
      ],
    });
    render(<LojaPage />);

    expect(await screen.findByText('Adquirido')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Molduras/i }));
    expect(
      screen.getByText('Nenhum item disponível nesta categoria.'),
    ).toBeInTheDocument();
  });

  it('bloqueia a compra quando o saldo é insuficiente', async () => {
    useStudentCoinsStore.setState({ saldoMoedas: 0 });

    render(<LojaPage />);
    const card = (await screen.findByText('Coruja')).closest('article') as HTMLElement;

    expect(within(card).getByRole('button', { name: /Sem saldo/i })).toBeDisabled();
    expect(comprarItemMock).not.toHaveBeenCalled();
  });
});
