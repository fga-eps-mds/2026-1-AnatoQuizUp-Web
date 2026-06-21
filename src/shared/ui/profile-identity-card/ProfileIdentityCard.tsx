import type { ItemInventario, TipoItemLoja } from '../../../features/loja';
import logoAnatoQuiz from '../../assets/image/logo.png';
import { montarIniciais } from '../../utils/iniciais';
import { CODIGO_LOGO_PREMIUM, GRADIENTE_OURO } from '../cosmetics';

export type IdentidadePerfil = {
  nome: string;
  nickname?: string | null;
  curso?: string | null;
};

export type SlotsCosmeticos = Partial<Record<TipoItemLoja, ItemInventario>>;

export type ProfileIdentityCardProps = {
  identidade: IdentidadePerfil;
  cosmeticos?: SlotsCosmeticos;
  tamanho?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onPersonalizar?: () => void;
};

type TamanhoCard = NonNullable<ProfileIdentityCardProps['tamanho']>;

const TAMANHO_CIRCULO: Record<TamanhoCard, string> = {
  sm: 'h-10 w-10',
  md: 'h-20 w-20',
  lg: 'h-24 w-24',
};
const TAMANHO_BANNER: Record<Exclude<TamanhoCard, 'sm'>, string> = {
  md: 'h-16',
  lg: 'h-20',
};
const TAMANHO_TEXTO: Record<TamanhoCard, string> = {
  sm: 'text-sm',
  md: 'text-2xl',
  lg: 'text-3xl',
};
const GRADIENTE_TEAL = 'linear-gradient(to right, #71edc8, #14b8a6)';

type CirculoProps = {
  identidade: IdentidadePerfil;
  cosmeticos: SlotsCosmeticos;
  tamanho: TamanhoCard;
};

const Circulo = ({ identidade, cosmeticos, tamanho }: CirculoProps) => {
  const moldura = cosmeticos.MOLDURA;
  const avatar = cosmeticos.AVATAR;
  const icone = cosmeticos.ICONE_PERFIL;
  const dimensao = TAMANHO_CIRCULO[tamanho];
  const avatarSrc = avatar?.previewImagemUrl ?? avatar?.imagemUrl;
  const iconeSrc = icone?.previewImagemUrl ?? icone?.imagemUrl;

  let conteudo;

  if (avatar && avatarSrc) {
    conteudo = (
      <img
        src={avatarSrc}
        alt={avatar.nome}
        className={`${dimensao} rounded-full bg-white object-cover`}
      />
    );
  } else if (icone) {
    const ehLogoPremium = icone.codigo === CODIGO_LOGO_PREMIUM;
    conteudo = (
      <div
        className={`${dimensao} flex items-center justify-center rounded-full p-2`}
        style={{ background: icone.valor ?? (ehLogoPremium ? GRADIENTE_OURO : '#0A1128') }}
      >
        {ehLogoPremium ? (
          <img
            src={logoAnatoQuiz}
            alt={icone.nome}
            className="h-3/4 w-3/4 object-contain drop-shadow"
          />
        ) : iconeSrc ? (
          <img src={iconeSrc} alt={icone.nome} className="h-3/4 w-3/4 object-contain" />
        ) : (
          <span className={`font-black text-white ${TAMANHO_TEXTO[tamanho]}`}>
            {montarIniciais(identidade.nome)}
          </span>
        )}
      </div>
    );
  } else {
    conteudo = (
      <div
        className={`${dimensao} flex items-center justify-center rounded-full bg-gradient-to-br from-[#0A1128] to-[#0d9488] font-black text-[#71edc8] ${TAMANHO_TEXTO[tamanho]}`}
      >
        {montarIniciais(identidade.nome)}
      </div>
    );
  }

  if (moldura) {
    return (
      <div
        aria-label={`Moldura ${moldura.nome}`}
        className="rounded-full p-[5px] shadow-sm"
        style={{ background: moldura.valor ?? GRADIENTE_OURO }}
      >
        {conteudo}
      </div>
    );
  }

  return <div className="rounded-full border-2 border-[#71edc8] shadow-sm">{conteudo}</div>;
};

export const ProfileIdentityCard = ({
  identidade,
  cosmeticos = {},
  tamanho = 'md',
  readOnly = true,
  onPersonalizar,
}: ProfileIdentityCardProps) => {
  const titulo = cosmeticos.TITULO;

  if (tamanho === 'sm') {
    return (
      <div className="flex flex-col items-center gap-1">
        <Circulo identidade={identidade} cosmeticos={cosmeticos} tamanho="sm" />
        {titulo && (
          <span className="max-w-20 truncate text-[10px] font-black text-[#B45309]">
            {titulo.nome}
          </span>
        )}
      </div>
    );
  }

  const fundo = cosmeticos.PLANO_FUNDO;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div
        aria-label="Plano de fundo do perfil"
        className={TAMANHO_BANNER[tamanho]}
        style={{ background: fundo?.valor ?? GRADIENTE_TEAL }}
      />

      <div className="-mt-10 flex flex-col items-center gap-2 px-6 pb-6">
        <Circulo identidade={identidade} cosmeticos={cosmeticos} tamanho={tamanho} />

        <h2 className={`mt-2 truncate font-black text-[#00214d] ${TAMANHO_TEXTO[tamanho]}`}>
          {identidade.nome}
        </h2>

        {identidade.nickname && (
          <p className="text-sm font-bold text-gray-500">@{identidade.nickname}</p>
        )}

        {titulo && (
          <span className="inline-block rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3 py-0.5 text-xs font-black text-[#B45309]">
            {titulo.nome}
          </span>
        )}

        {identidade.curso && (
          <p className="text-sm font-semibold text-gray-500">{identidade.curso}</p>
        )}

        {!readOnly && onPersonalizar && (
          <button
            type="button"
            onClick={onPersonalizar}
            className="mt-2 rounded-full bg-[#0A1128] px-4 py-2 text-sm font-bold text-white hover:bg-[#00214d]"
          >
            Personalizar perfil
          </button>
        )}
      </div>
    </div>
  );
};
