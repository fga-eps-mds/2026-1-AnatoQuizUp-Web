import type { CSSProperties } from 'react';
import avatarBase from '../assets/avatar/avatar-base.png';
import loiro from '../assets/avatar/cabelo/cabelo-loiro.png';
import cacheado from '../assets/avatar/cabelo/cabelo-cacheado.png';
import moicano from '../assets/avatar/cabelo/cabelo-moicano.png';
import loiroCastanho from '../assets/avatar/cabelo/cabelo-loiro-castanho.png';
import loiroRuivo from '../assets/avatar/cabelo/cabelo-loiro-ruivo.png';
import cacheadoLoiro from '../assets/avatar/cabelo/cabelo-cacheado-loiro.png';
import cacheadoCastanho from '../assets/avatar/cabelo/cabelo-cacheado-castanho.png';
import moicanoLoiro from '../assets/avatar/cabelo/cabelo-moicano-loiro.png';
import moicanoRuivo from '../assets/avatar/cabelo/cabelo-moicano-ruivo.png';
import curtoCacheado from '../assets/avatar/cabelo/cabelo-curto-cacheado.png';
import trancas from '../assets/avatar/cabelo/cabelo-trancas.png';
import curtoGrisalho from '../assets/avatar/cabelo/cabelo-curto-grisalho.png';
import curtoCacheadoLoiro from '../assets/avatar/cabelo/cabelo-curto-cacheado-loiro.png';
import coroa from '../assets/avatar/acessorios/coroa.png';
import oculos from '../assets/avatar/acessorios/oculos.png';
import chapeu from '../assets/avatar/acessorios/chapeu_formatura.png';
import luvaBoxe from '../assets/avatar/luvas/luva-boxe-posicao.png';
import luvaCirurgica from '../assets/avatar/luvas/luva-cirurgica-posicao.png';
import luvaLa from '../assets/avatar/luvas/luva-la-posicao.png';
import sapatoPlantao from '../assets/avatar/calcados/sapato-plantao-posicao.png';
import tenisCanoAlto from '../assets/avatar/calcados/tenis-cano-alto-posicao.png';
import tenisEsportivo from '../assets/avatar/calcados/tenis-esportivo-posicao.png';
import tenisEsportivoVermelho from '../assets/avatar/calcados/tenis-esportivo-vermelho-posicao.png';
import tenisEsportivoVerde from '../assets/avatar/calcados/tenis-esportivo-verde-posicao.png';
import tenisEsportivoAmarelo from '../assets/avatar/calcados/tenis-esportivo-amarelo-posicao.png';
import tenisEsportivoPreto from '../assets/avatar/calcados/tenis-esportivo-preto-posicao.png';
import tenisCanoAltoAzul from '../assets/avatar/calcados/tenis-cano-alto-azul-posicao.png';
import tenisCanoAltoVerde from '../assets/avatar/calcados/tenis-cano-alto-verde-posicao.png';
import tenisCanoAltoAmarelo from '../assets/avatar/calcados/tenis-cano-alto-amarelo-posicao.png';
import tenisCanoAltoPreto from '../assets/avatar/calcados/tenis-cano-alto-preto-posicao.png';
import tenisSkate from '../assets/avatar/calcados/tenis-skate-posicao.png';
import botaCoturno from '../assets/avatar/calcados/bota-coturno-posicao.png';
import { HUE_ROTATE_COR, type AparenciaAvatar } from './aparencia';

const cabelos = {
  loiro: { src: loiro, top: '40%', left: '50%', width: '100%' },
  cacheado: { src: cacheado, top: '40%', left: '46%', width: '82%' },
  moicano: { src: moicano, top: '30%', left: '50%', width: '82%' },
  // Recolors herdam exatamente a posicao do estilo-base.
  'loiro-castanho': { src: loiroCastanho, top: '40%', left: '50%', width: '100%' },
  'loiro-ruivo': { src: loiroRuivo, top: '40%', left: '50%', width: '100%' },
  'cacheado-loiro': { src: cacheadoLoiro, top: '40%', left: '46%', width: '82%' },
  'cacheado-castanho': { src: cacheadoCastanho, top: '40%', left: '46%', width: '82%' },
  'moicano-loiro': { src: moicanoLoiro, top: '30%', left: '50%', width: '82%' },
  'moicano-ruivo': { src: moicanoRuivo, top: '30%', left: '50%', width: '82%' },
  // Estimativa inicial (cortes novos, sem base pra herdar posicao) — calibrar visualmente.
  // Mesma escala do moicano (mesma familia de corte, sem repartiçao central).
  'curto-cacheado': { src: curtoCacheado, top: '28%', left: '50%', width: '68%' },
  // top calculado a partir da estrutura real da imagem: a touca ocupa so os
  // primeiros ~34% da altura (o resto sao as trancas penduradas), entao o
  // centro da imagem (ponto usado pelo top/left) precisa ficar bem mais
  // abaixo do que o de um corte comum pra touca sentar na altura certa.
  trancas: { src: trancas, top: '40%', left: '50%', width: '55%' },
  // Reusa o anchor do moicano (mesma familia: corte varrido, sem repartição
  // central), em vez de recalcular do zero — moicano ja funciona nessa mesma
  // faixa de top/width.
  'curto-grisalho': { src: curtoGrisalho, top: '30%', left: '52%', width: '68%' },
  'curto-cacheado-loiro': { src: curtoCacheadoLoiro, top: '28%', left: '50%', width: '68%' },
};
const acessorios = {
  coroa: { src: coroa, top: '17%', width: '18%' },
  oculos: { src: oculos, top: '46%', width: '50%' },
  'chapeu-formatura': { src: chapeu, top: '20.5%', width: '25.5%' },
};
const luvas = {
  'luva-boxe': { src: luvaBoxe, top: '68.76%', width: '71.46%' },
  'luva-cirurgica': { src: luvaCirurgica, top: '70.37%', width: '70.65%' },
  'luva-la': { src: luvaLa, top: '68.72%', width: '70.57%' },
};
const calcados = {
  'sapato-plantao': { src: sapatoPlantao, top: '76.07%', width: '39.80%' },
  'tenis-cano-alto': { src: tenisCanoAlto, top: '74.96%', width: '46.48%' },
  'tenis-esportivo': { src: tenisEsportivo, top: '75.79%', width: '40.91%' },
  'tenis-esportivo-vermelho': { src: tenisEsportivoVermelho, top: '75.79%', width: '40.91%' },
  'tenis-esportivo-verde': { src: tenisEsportivoVerde, top: '75.79%', width: '40.91%' },
  'tenis-esportivo-amarelo': { src: tenisEsportivoAmarelo, top: '75.79%', width: '40.91%' },
  'tenis-esportivo-preto': { src: tenisEsportivoPreto, top: '75.79%', width: '40.91%' },
  'tenis-cano-alto-azul': { src: tenisCanoAltoAzul, top: '74.96%', width: '46.48%' },
  'tenis-cano-alto-verde': { src: tenisCanoAltoVerde, top: '74.96%', width: '46.48%' },
  'tenis-cano-alto-amarelo': { src: tenisCanoAltoAmarelo, top: '74.96%', width: '46.48%' },
  'tenis-cano-alto-preto': { src: tenisCanoAltoPreto, top: '74.96%', width: '46.48%' },
  // Estimativa inicial (modelo novo, sem base pra herdar top/width) — calibrar visualmente.
  'tenis-skate': { src: tenisSkate, top: '75.79%', width: '41%' },
  'bota-coturno': { src: botaCoturno, top: '74.5%', width: '44%' },
};
const overlay: CSSProperties = { position: 'absolute', transform: 'translate(-50%, -50%)', height: 'auto' };

export function AvatarCerebro({ aparencia, nome, className = '' }: {
  aparencia: AparenciaAvatar;
  nome?: string;
  className?: string;
}) {
  const cabelo = aparencia.cabelo ? cabelos[aparencia.cabelo] : null;
  const acessorio = aparencia.acessorio ? acessorios[aparencia.acessorio] : null;
  const luva = aparencia.luva ? luvas[aparencia.luva] : null;
  const calcado = aparencia.calcado ? calcados[aparencia.calcado] : null;
  const topAcessorio = cabelo && aparencia.acessorio !== 'oculos'
    ? aparencia.acessorio === 'coroa' ? '8.5%' : '10%'
    : acessorio?.top;
  return (
    <div className={`relative isolate overflow-hidden rounded-full bg-[#e5fbf8] ${className}`}>
      <img src={avatarBase} alt={nome ? `Avatar de ${nome}` : 'Cérebro do AnatoQuizUp'}
        className="h-full w-full object-contain"
        style={{ filter: `hue-rotate(${HUE_ROTATE_COR[aparencia.corCerebro]}deg)` }} />
      {cabelo && <img src={cabelo.src} alt="" aria-hidden="true"
        style={{ ...overlay, top: cabelo.top, left: cabelo.left, width: cabelo.width, zIndex: 2 }} />}
      {acessorio && <img src={acessorio.src} alt="" aria-hidden="true"
        style={{ ...overlay, top: topAcessorio, left: '50%', width: acessorio.width, zIndex: aparencia.acessorio === 'oculos' ? 1 : 3 }} />}
      {calcado && <img src={calcado.src} alt="" aria-hidden="true"
        style={{ ...overlay, top: calcado.top, left: '50.12%', width: calcado.width, zIndex: 1 }} />}
      {luva && <img src={luva.src} alt="" aria-hidden="true"
        style={{ ...overlay, top: luva.top, left: '50.12%', width: luva.width, zIndex: 3 }} />}
    </div>
  );
}
