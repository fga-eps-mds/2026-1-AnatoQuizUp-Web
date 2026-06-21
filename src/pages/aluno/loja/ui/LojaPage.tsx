import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Backpack,
  BadgeCheck,
  Check,
  Coins,
  Frame,
  LayoutGrid,
  Lock,
  Palette,
  ShoppingBag,
  Smile,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';

import {
  comprarItem,
  listarCatalogo,
  listarInventario,
} from '../../../../features/loja';
import type {
  InventarioItem,
  ItemLoja,
  TipoItemLoja,
} from '../../../../features/loja';
import { useStudentCoinsStore } from '../../../../features/student-coins/model/useStudentCoinsStore';
import { CosmeticPreview } from '../../../../shared/ui/cosmetics';

type Aba = 'TODOS' | TipoItemLoja | 'INVENTARIO';
type Ordenacao = 'asc' | 'desc';

const CATEGORIAS: { key: Aba; label: string; icon: LucideIcon }[] = [
  { key: 'TODOS', label: 'Todos', icon: LayoutGrid },
  { key: 'ICONE_PERFIL', label: 'Ícones', icon: Smile },
  { key: 'MOLDURA', label: 'Molduras', icon: Frame },
  { key: 'AVATAR', label: 'Avatares', icon: UserRound },
  { key: 'TITULO', label: 'Títulos', icon: BadgeCheck },
  { key: 'PLANO_FUNDO', label: 'Fundos', icon: Palette },
  { key: 'INVENTARIO', label: 'Meu Inventário', icon: Backpack },
];

type Feedback = { tipo: 'sucesso' | 'erro'; texto: string };

const PrecoEtiqueta = ({ preco }: { preco: number }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B]/15 px-3 py-1 text-sm font-black text-[#B45309]">
    <Coins size={15} />
    {preco} ATP
  </span>
);

export const LojaPage = () => {
  const saldoMoedas = useStudentCoinsStore((estado) => estado.saldoMoedas);
  const setSaldoMoedas = useStudentCoinsStore((estado) => estado.setSaldoMoedas);

  const [itens, setItens] = useState<ItemLoja[]>([]);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<Aba>('TODOS');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('asc');
  const [itemPreview, setItemPreview] = useState<ItemLoja | null>(null);
  const [comprandoId, setComprandoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    let ativo = true;

    const buscarDados = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const [catalogo, meuInventario] = await Promise.all([
          listarCatalogo({ limit: 100 }),
          listarInventario({ limit: 100 }),
        ]);

        if (ativo) {
          setItens(catalogo.dados);
          setInventario(meuInventario.dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : 'Erro ao carregar a loja.');
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void buscarDados();

    return () => {
      ativo = false;
    };
  }, [recarregar]);

  const handleTentarNovamente = () => setRecarregar((valor) => valor + 1);

  useEffect(() => {
    if (!feedback) return;

    const temporizador = setTimeout(() => setFeedback(null), 4500);

    return () => clearTimeout(temporizador);
  }, [feedback]);

  const contagemPorTipo = useMemo(() => {
    const contagem: Record<string, number> = {};

    for (const item of itens) {
      contagem[item.tipo] = (contagem[item.tipo] ?? 0) + 1;
    }

    return contagem;
  }, [itens]);

  const itensVisiveis = useMemo(() => {
    const base = abaAtiva === 'TODOS' ? itens : itens.filter((item) => item.tipo === abaAtiva);

    return [...base].sort((a, b) =>
      ordenacao === 'asc' ? a.precoMoedas - b.precoMoedas : b.precoMoedas - a.precoMoedas,
    );
  }, [itens, abaAtiva, ordenacao]);

  const handleComprar = async (item: ItemLoja) => {
    setComprandoId(item.id);
    setFeedback(null);

    try {
      const resposta = await comprarItem(item.id);

      setSaldoMoedas(resposta.saldoMoedas);
      setItens((anteriores) =>
        anteriores.map((atual) =>
          atual.id === item.id ? { ...atual, adquirido: true } : atual,
        ),
      );
      setInventario((anteriores) => [resposta.item, ...anteriores]);
      setItemPreview(null);
      setFeedback({
        tipo: 'sucesso',
        texto: `"${item.nome}" comprado! Saldo: ${resposta.saldoMoedas} ATP.`,
      });
    } catch (error) {
      setFeedback({
        tipo: 'erro',
        texto: error instanceof Error ? error.message : 'Não foi possível comprar o item.',
      });
    } finally {
      setComprandoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F97316] text-white">
              <ShoppingBag size={26} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-[#0A1128]">Loja Virtual</h1>
              <p className="text-sm font-medium text-[#0A1128]/55">
                Use suas moedas ATP para personalizar o seu perfil.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-5 py-3 sm:self-auto">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B] text-[#0A1128]">
              <Coins size={18} />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0A1128]/50">
                Seu saldo
              </p>
              <p className="text-lg font-black tabular-nums text-[#0A1128]">{saldoMoedas} ATP</p>
            </div>
          </div>
        </header>

        {feedback && (
          <div
            role="status"
            className={`mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${
              feedback.tipo === 'sucesso'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.tipo === 'sucesso' ? <Check size={18} /> : <X size={18} />}
            {feedback.texto}
          </div>
        )}

        <nav className="mt-6 flex flex-wrap gap-2">
          {CATEGORIAS.map((categoria) => {
            const Icon = categoria.icon;
            const ativa = abaAtiva === categoria.key;
            const contagem =
              categoria.key === 'INVENTARIO'
                ? inventario.length
                : categoria.key === 'TODOS'
                  ? itens.length
                  : contagemPorTipo[categoria.key] ?? 0;

            return (
              <button
                key={categoria.key}
                type="button"
                onClick={() => setAbaAtiva(categoria.key)}
                aria-current={ativa ? 'page' : undefined}
                className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
                  ativa
                    ? 'bg-[#0A1128] text-white shadow-md'
                    : 'border border-[#0A1128]/10 bg-white text-[#0A1128]/70 hover:bg-[#0A1128]/5'
                }`}
              >
                <Icon size={18} />
                {categoria.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-black tabular-nums ${
                    ativa ? 'bg-white/20 text-white' : 'bg-[#0A1128]/5 text-[#0A1128]/50'
                  }`}
                >
                  {contagem}
                </span>
              </button>
            );
          })}
        </nav>

        {!carregando && !erro && abaAtiva !== 'INVENTARIO' && itensVisiveis.length > 0 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm font-bold text-[#0A1128]/50">
              {itensVisiveis.length} {itensVisiveis.length === 1 ? 'item' : 'itens'}
            </p>
            <button
              type="button"
              onClick={() => setOrdenacao((atual) => (atual === 'asc' ? 'desc' : 'asc'))}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-[#0A1128]/10 bg-white px-4 py-2 text-sm font-bold text-[#0A1128]/70 transition-colors hover:bg-[#0A1128]/5"
            >
              {ordenacao === 'asc' ? (
                <ArrowUpNarrowWide size={16} />
              ) : (
                <ArrowDownWideNarrow size={16} />
              )}
              Preço: {ordenacao === 'asc' ? 'mais baratos' : 'mais caros'}
            </button>
          </div>
        )}

        <section className="mt-6">
          {carregando ? (
            <p className="py-16 text-center text-sm font-bold text-[#0A1128]/40">
              Carregando a loja...
            </p>
          ) : erro ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <p className="text-sm font-bold text-rose-600">{erro}</p>
              <button
                type="button"
                onClick={handleTentarNovamente}
                className="cursor-pointer rounded-full bg-[#0A1128] px-5 py-2 text-sm font-bold text-white"
              >
                Tentar novamente
              </button>
            </div>
          ) : abaAtiva === 'INVENTARIO' ? (
            <InventarioGrid inventario={inventario} />
          ) : (
            <CatalogoGrid
              itens={itensVisiveis}
              saldoMoedas={saldoMoedas}
              comprandoId={comprandoId}
              onPreview={setItemPreview}
              onComprar={handleComprar}
            />
          )}
        </section>
      </div>

      {itemPreview && (
        <ModalPreview
          item={itemPreview}
          saldoMoedas={saldoMoedas}
          comprando={comprandoId === itemPreview.id}
          onFechar={() => setItemPreview(null)}
          onComprar={() => void handleComprar(itemPreview)}
        />
      )}
    </div>
  );
};

const CatalogoGrid = ({
  itens,
  saldoMoedas,
  comprandoId,
  onPreview,
  onComprar,
}: {
  itens: ItemLoja[];
  saldoMoedas: number;
  comprandoId: string | null;
  onPreview: (item: ItemLoja) => void;
  onComprar: (item: ItemLoja) => void;
}) => {
  if (itens.length === 0) {
    return (
      <p className="py-16 text-center text-sm font-bold text-[#0A1128]/40">
        Nenhum item disponível nesta categoria.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {itens.map((item) => {
        const semSaldo = saldoMoedas < item.precoMoedas;

        return (
          <article
            key={item.id}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[#0A1128]/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => onPreview(item)}
              className="flex h-32 cursor-pointer items-center justify-center"
              aria-label={`Pré-visualizar ${item.nome}`}
            >
              <CosmeticPreview item={item} />
            </button>

            <div className="flex w-full flex-1 flex-col items-center gap-2 text-center">
              <h3 className="line-clamp-2 text-sm font-black text-[#0A1128]">{item.nome}</h3>
              <PrecoEtiqueta preco={item.precoMoedas} />
            </div>

            {item.adquirido ? (
              <span className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600">
                <Check size={16} />
                Adquirido
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onComprar(item)}
                disabled={semSaldo || comprandoId === item.id}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#F97316] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#ea670c] disabled:cursor-not-allowed disabled:bg-[#0A1128]/15 disabled:text-[#0A1128]/40"
              >
                {comprandoId === item.id ? (
                  'Comprando...'
                ) : semSaldo ? (
                  <>
                    <Lock size={15} />
                    Sem saldo
                  </>
                ) : (
                  'Comprar'
                )}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
};

const InventarioGrid = ({ inventario }: { inventario: InventarioItem[] }) => {
  if (inventario.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <Sparkles size={32} className="text-[#0A1128]/20" />
        <p className="text-sm font-bold text-[#0A1128]/40">
          Você ainda não possui itens. Compre algo na loja!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {inventario.map((registro) => (
        <article
          key={registro.id}
          className="flex flex-col items-center gap-3 rounded-2xl border border-[#0A1128]/10 bg-white p-4 shadow-sm"
        >
          <div className="flex h-32 items-center justify-center">
            <CosmeticPreview item={registro.item} />
          </div>
          <h3 className="line-clamp-2 text-center text-sm font-black text-[#0A1128]">
            {registro.item.nome}
          </h3>
          <span className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600">
            <Check size={16} />
            Adquirido
          </span>
        </article>
      ))}
    </div>
  );
};

const ModalPreview = ({
  item,
  saldoMoedas,
  comprando,
  onFechar,
  onComprar,
}: {
  item: ItemLoja;
  saldoMoedas: number;
  comprando: boolean;
  onFechar: () => void;
  onComprar: () => void;
}) => {
  const semSaldo = saldoMoedas < item.precoMoedas;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onFechar}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(evento) => evento.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Pré-visualização de ${item.nome}`}
      >
        <button
          type="button"
          onClick={onFechar}
          className="absolute right-4 top-4 cursor-pointer text-[#0A1128]/40 transition-colors hover:text-[#0A1128]"
          aria-label="Fechar pré-visualização"
        >
          <X size={22} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0A1128]/40">
            Pré-visualização
          </span>

          <CosmeticPreview item={item} grande />

          <h2 className="text-xl font-black text-[#0A1128]">{item.nome}</h2>

          {item.descricao && (
            <p className="text-sm font-medium text-[#0A1128]/60">{item.descricao}</p>
          )}

          <PrecoEtiqueta preco={item.precoMoedas} />

          {item.adquirido ? (
            <span className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
              <Check size={18} />
              Você já possui este item
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={onComprar}
                disabled={semSaldo || comprando}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#F97316] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#ea670c] disabled:cursor-not-allowed disabled:bg-[#0A1128]/15 disabled:text-[#0A1128]/40"
              >
                {comprando ? (
                  'Comprando...'
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    Confirmar compra
                  </>
                )}
              </button>
              {semSaldo && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                  <Lock size={14} />
                  Moedas insuficientes para esta compra.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
