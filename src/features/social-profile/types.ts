import type { ConquistaDestacada } from '../achievements';
import type { ItemInventario, RespostaPaginada } from '../loja';
import type { ResumoAmigo, ResumoAmizade } from '../friendship';

export type PerfilSocial = {
  usuario: ResumoAmigo;
  cosmeticos: ItemInventario[];
  conquistasDestacadas: ConquistaDestacada[];
};

export type RespostaPerfilSocial = {
  mensagem: string;
  dados: PerfilSocial;
};

export type ResumoAmigoSocial = ResumoAmizade & {
  cosmeticos: ItemInventario[];
  conquistasDestacadas: ConquistaDestacada[];
};

export type RespostaAmigosSociais = RespostaPaginada<ResumoAmigoSocial>;

export type ListarAmigosSociaisParams = {
  nome?: string;
  nickname?: string;
  page?: number;
  limit?: number;
};
