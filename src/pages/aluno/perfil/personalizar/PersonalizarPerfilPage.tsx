import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Info, Save, ShoppingBag, X } from 'lucide-react';

import { useAuth } from '../../../../app/providers/AuthProvider';
import { useEquippedCosmeticsStore } from '../../../../features/profile-cosmetics';
import { httpClient } from '../../../../shared/api/httpClient';
import {
  ProfileIdentityCard,
  type SlotsCosmeticos,
} from '../../../../shared/ui/profile-identity-card';
import {
  buscarInventarioCompleto,
  type InventarioItem,
  type ItemInventario,
  type TipoItemLoja,
} from '../../../../features/loja';

const ABAS: { id: TipoItemLoja; label: string; descricao: string }[] = [
  {
    id: 'ICONE_PERFIL',
    label: 'Ícones',
    descricao: 'Selecione um ícone que você já tem — ele aparece no seu avatar.',
  },
  {
    id: 'MOLDURA',
    label: 'Molduras',
    descricao: 'A moldura é aplicada ao redor do seu ícone de perfil.',
  },
  {
    id: 'AVATAR',
    label: 'Avatares',
    descricao: 'Personagem ilustrado exibido na sua página de perfil.',
  },
  {
    id: 'TITULO',
    label: 'Títulos',
    descricao: 'O título escolhido aparece abaixo do seu nome.',
  },
  {
    id: 'PLANO_FUNDO',
    label: 'Fundos',
    descricao: 'Aplicado ao topo da sua página de perfil.',
  },
];

export const PersonalizarPerfilPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cosmeticosEquipados = useEquippedCosmeticsStore((state) => state.cosmeticos);
  const setCosmeticosGlobais = useEquippedCosmeticsStore((state) => state.setCosmeticos);

  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<TipoItemLoja>('ICONE_PERFIL');

  const [stagedCosmetics, setStagedCosmetics] = useState<SlotsCosmeticos>({});
  const [salvando, setSalvando] = useState(false);

  const [modalSucesso, setModalSucesso] = useState(false);

  useEffect(() => {
    let ativo = true;
    const fetchInventario = async () => {
      try {
        const itensDoBackend = await buscarInventarioCompleto();

        if (ativo) {
          setInventario(itensDoBackend);

          const equipadosReais: SlotsCosmeticos = {};

          itensDoBackend.forEach((registro) => {
            if (registro.equipado) {
              equipadosReais[registro.item.tipo] = registro.item;
            }
          });

          setCosmeticosGlobais(equipadosReais);
          setStagedCosmetics(equipadosReais);
        }
      } catch (error) {
        console.error('Erro ao carregar inventário', error);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    void fetchInventario();
    return () => {
      ativo = false;
    };
  }, [setCosmeticosGlobais]);

  const temAlteracoes = useMemo(() => {
    return JSON.stringify(stagedCosmetics) !== JSON.stringify(cosmeticosEquipados);
  }, [stagedCosmetics, cosmeticosEquipados]);

  if (!user) return null;

  const itensDaAbaAtual = inventario.filter((registro) => registro.item.tipo === abaAtiva);
  const abaInfo = ABAS.find((a) => a.id === abaAtiva)!;

  const handleSelectCosmetic = (item: ItemInventario) => {
    setStagedCosmetics((prev) => {
      const novoStage = { ...prev, [item.tipo]: item };
      if (item.tipo === 'AVATAR') delete novoStage.ICONE_PERFIL;
      if (item.tipo === 'ICONE_PERFIL') delete novoStage.AVATAR;
      return novoStage;
    });
  };

  const descartarAlteracoes = () => {
    setStagedCosmetics(cosmeticosEquipados);
  };

  const salvarAlteracoes = async () => {
    setSalvando(true);
    try {
      const promises = Object.values(stagedCosmetics).map(async (item) => {
        if (!item) return;

        const itemOriginal = cosmeticosEquipados[item.tipo];
        if (itemOriginal?.id !== item.id) {
          try {
            await httpClient.patch('/inventario/equipar', {
              itemLojaId: item.id,
            });
          } catch (error) {
            // Correção de lint: aserção de tipo em vez de 'any'
            const err = error as { response?: { status?: number } };
            if (err.response?.status !== 400) {
              throw error;
            }
          }
        }
      });

      await Promise.all(promises);

      setCosmeticosGlobais(stagedCosmetics);
      setModalSucesso(true);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar alterações.');
    } finally {
      setSalvando(false);
    }
  };

  const nickname = user.nickname?.trim();
  const cursoLabel =
    [user.course, user.institution].filter(Boolean).join(' · ') || 'Curso não informado';

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <header>
            <h1 className="text-3xl font-black text-[#00214d]">Personalizar Perfil</h1>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              Use seus itens para montar sua identidade
            </p>
          </header>

          <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
            <div className="sticky top-6 flex flex-col gap-4">
              <div className="rounded-2xl bg-white p-1 text-center shadow-sm">
                <span className="mx-auto mt-3 inline-block rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Pré-visualização
                </span>
                <div className="p-2">
                  <ProfileIdentityCard
                    identidade={{
                      nome: user.name,
                      nickname,
                      curso: cursoLabel,
                    }}
                    cosmeticos={stagedCosmetics}
                    tamanho="lg"
                    readOnly={true}
                  />
                </div>
              </div>
              <p className="text-center text-xs font-medium text-gray-400">
                Aqui aparecem só os itens que <b>você já tem</b>. Faltou algum? Vá à{' '}
                <button
                  onClick={() => navigate('/aluno/loja')}
                  className="font-bold text-[#14b8a6] hover:underline"
                >
                  Loja
                </button>
                .
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-wrap gap-2">
                {ABAS.map((aba) => {
                  const isActive = aba.id === abaAtiva;
                  const count = inventario.filter(
                    (registro) => registro.item.tipo === aba.id,
                  ).length;
                  return (
                    <button
                      key={aba.id}
                      onClick={() => setAbaAtiva(aba.id)}
                      className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-black transition-colors ${
                        isActive
                          ? 'border-[#0A1128] bg-[#0A1128] text-white'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-[#14b8a6] hover:text-[#0d9488]'
                      }`}
                    >
                      {aba.label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#00214d]">{abaInfo.label}</h2>
                  <p className="text-sm font-semibold text-gray-500">{abaInfo.descricao}</p>
                </div>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-500">
                  {itensDaAbaAtual.length} que você tem
                </span>
              </div>

              {carregando ? (
                <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {itensDaAbaAtual.map((registro) => {
                    const item = registro.item;
                    const estaEquipado = stagedCosmetics[abaAtiva]?.id === item.id;

                    return (
                      <button
                        key={registro.id}
                        onClick={() => handleSelectCosmetic(item)}
                        className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 bg-white p-4 transition-all ${
                          estaEquipado
                            ? 'border-[#14b8a6] bg-teal-50/30 shadow-[0_0_0_4px_rgba(20,184,166,0.15)]'
                            : 'border-gray-100 hover:border-[#14b8a6] hover:shadow-md'
                        }`}
                      >
                        {estaEquipado && (
                          <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#14b8a6] text-white">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}

                        <div className="flex h-24 w-full items-center justify-center">
                          {abaAtiva === 'PLANO_FUNDO' && (
                            <div
                              className="h-20 w-20 rounded-2xl border border-black/5 shadow-inner"
                              style={{ background: item.valor || '#e5e7eb' }}
                            />
                          )}

                          {abaAtiva === 'TITULO' && (
                            <div className="flex h-16 w-full items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 px-2 text-center">
                              <span className="text-xs font-black text-[#B45309] uppercase tracking-wide">
                                {item.nome}
                              </span>
                            </div>
                          )}

                          {abaAtiva === 'MOLDURA' && (
                            <div
                              className="flex h-20 w-20 items-center justify-center rounded-full p-[5px] shadow-sm"
                              style={{ background: item.valor || '#e5e7eb' }}
                            >
                              <div className="h-full w-full rounded-full bg-gray-100" />
                            </div>
                          )}

                          {abaAtiva === 'ICONE_PERFIL' && (
                            <div
                              className="flex h-20 w-20 items-center justify-center rounded-2xl p-4 shadow-inner"
                              style={{ background: item.valor || '#0A1128' }}
                            >
                              {item.previewImagemUrl || item.imagemUrl ? (
                                /* Correção de build: fallback com undefined */
                                <img
                                  src={item.previewImagemUrl || item.imagemUrl || undefined}
                                  alt={item.nome}
                                  className="h-full w-full object-contain drop-shadow-sm"
                                />
                              ) : (
                                <span className="text-3xl font-black text-white uppercase">
                                  {item.nome.charAt(0)}
                                </span>
                              )}
                            </div>
                          )}

                          {abaAtiva === 'AVATAR' && (
                            <img
                              src={item.previewImagemUrl || item.imagemUrl || undefined}
                              alt={item.nome}
                              className="h-20 w-20 rounded-2xl border border-gray-200 bg-white object-contain p-1 shadow-sm"
                            />
                          )}
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-[#00214d] text-center leading-tight">
                            {item.nome}
                          </span>
                          {estaEquipado && (
                            <span className="mt-1 text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                              Equipado
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    onClick={() => navigate('/aluno/loja')}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-4 text-center transition-all hover:border-[#F97316] hover:bg-orange-50/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-[#F97316]">
                      <ShoppingBag size={20} />
                    </div>
                    <span className="text-sm font-black text-[#F97316]">Ver mais na Loja</span>
                  </button>
                </div>
              )}

              {temAlteracoes && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                    <Info size={18} /> Você tem alterações não salvas
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={descartarAlteracoes}
                      disabled={salvando}
                      className="rounded-lg px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={salvarAlteracoes}
                      disabled={salvando}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#14b8a6] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0d9488] disabled:opacity-50"
                    >
                      <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalSucesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm transform rounded-3xl bg-white p-8 text-center shadow-2xl transition-all">
            <button
              onClick={() => setModalSucesso(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 shadow-inner">
              <Check size={40} strokeWidth={3.5} />
            </div>

            <h3 className="mb-2 text-2xl font-black text-[#00214d]">Sucesso!</h3>
            <p className="mb-6 text-sm font-semibold text-gray-500">
              Seu perfil foi atualizado e seus novos itens já estão em exibição para os seus amigos.
            </p>

            <button
              onClick={() => setModalSucesso(false)}
              className="w-full rounded-xl bg-[#0A1128] py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#00214d]"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
