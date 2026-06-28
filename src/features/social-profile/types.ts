import type { ConquistaDestacada } from '../achievements';
import type { ItemInventario, RespostaPaginada } from '../loja';
import type { ResumoAmigo, ResumoAmizade } from '../friendship';

// Tipos do perfil social (dados publicos de um usuario + amigos enriquecidos).

// Perfil social exibido a outros: usuario, cosmeticos equipados e conquistas em destaque.
export type PerfilSocial = {
  usuario: ResumoAmigo;
  cosmeticos: ItemInventario[];
  conquistasDestacadas: ConquistaDestacada[];
};

// Envelope da resposta do perfil social.
export type RespostaPerfilSocial = {
  mensagem: string;
  dados: PerfilSocial;
};

// Amizade enriquecida com cosmeticos e conquistas (para a lista de amigos).
export type ResumoAmigoSocial = ResumoAmizade & {
  cosmeticos: ItemInventario[];
  conquistasDestacadas: ConquistaDestacada[];
};

// Resposta paginada da listagem de amigos sociais.
export type RespostaAmigosSociais = RespostaPaginada<ResumoAmigoSocial>;

// Parametros de busca/paginacao da listagem de amigos sociais.
export type ListarAmigosSociaisParams = {
  nome?: string;
  nickname?: string;
  page?: number;
  limit?: number;
};
