import { useEffect, useSyncExternalStore } from 'react';
import { buscarAparenciaRemota } from './avatarApi';
import { APARENCIA_PADRAO, type AparenciaAvatar } from './aparencia';

const EVENTO = 'anatoquizup:avatar-atualizado';
const ID_AVATAR_VALIDO = /^[A-Za-z0-9_-]{1,128}$/;
const chaveAvatar = (id: string) =>
  ID_AVATAR_VALIDO.test(id) ? `anatoquizup:avatar:${id}` : null;
const requisicoes = new Map<string, Promise<void>>();
const versoes = new Map<string, number>();

const normalizarCorCerebro = (valor: unknown): AparenciaAvatar['corCerebro'] => {
  switch (valor) {
    case 'roxo': return 'roxo';
    case 'azul': return 'azul';
    case 'verde': return 'verde';
    case 'laranja': return 'laranja';
    case 'amarelo': return 'amarelo';
    default: return 'rosa';
  }
};

const normalizarCabelo = (valor: unknown): AparenciaAvatar['cabelo'] => {
  switch (valor) {
    case 'loiro': return 'loiro';
    case 'cacheado': return 'cacheado';
    case 'moicano': return 'moicano';
    default: return null;
  }
};

const normalizarAcessorio = (valor: unknown): AparenciaAvatar['acessorio'] => {
  switch (valor) {
    case 'coroa': return 'coroa';
    case 'oculos': return 'oculos';
    case 'chapeu-formatura': return 'chapeu-formatura';
    default: return null;
  }
};

const normalizarLuva = (valor: unknown): AparenciaAvatar['luva'] => {
  switch (valor) {
    case 'luva-boxe': return 'luva-boxe';
    case 'luva-cirurgica': return 'luva-cirurgica';
    case 'luva-la': return 'luva-la';
    default: return null;
  }
};

const normalizarCalcado = (valor: unknown): AparenciaAvatar['calcado'] => {
  switch (valor) {
    case 'sapato-plantao': return 'sapato-plantao';
    case 'tenis-cano-alto': return 'tenis-cano-alto';
    case 'tenis-esportivo': return 'tenis-esportivo';
    default: return null;
  }
};

const normalizarAparencia = (dados: unknown): AparenciaAvatar => {
  if (!dados || typeof dados !== 'object') return APARENCIA_PADRAO;
  const valor = dados as Record<string, unknown>;
  return {
    corCerebro: normalizarCorCerebro(valor.corCerebro),
    cabelo: normalizarCabelo(valor.cabelo),
    acessorio: normalizarAcessorio(valor.acessorio),
    luva: normalizarLuva(valor.luva),
    calcado: normalizarCalcado(valor.calcado),
  };
};

export const sincronizarAparencia = (id: string) => {
  if (!ID_AVATAR_VALIDO.test(id)) return Promise.resolve();
  const existente = requisicoes.get(id);
  if (existente) return existente;
  const versao = versoes.get(id) ?? 0;
  const requisicao = buscarAparenciaRemota(id)
    .then((aparencia) => {
      if ((versoes.get(id) ?? 0) === versao && JSON.stringify(carregarAparencia(id)) !== JSON.stringify(aparencia)) {
        salvarAparencia(id, aparencia);
      }
    })
    .catch(() => {})
    .finally(() => { requisicoes.delete(id); });
  requisicoes.set(id, requisicao);
  return requisicao;
};

const lerRegistro = (id?: string) => {
  try {
    const chave = id ? chaveAvatar(id) : null;
    return chave ? localStorage.getItem(chave) : null;
  } catch {
    return null;
  }
};

export const carregarAparencia = (id?: string): AparenciaAvatar => {
  try {
    return normalizarAparencia(JSON.parse(lerRegistro(id) ?? 'null'));
  } catch {
    return APARENCIA_PADRAO;
  }
};

export const salvarAparencia = (id: string, aparencia: AparenciaAvatar | null) => {
  const chave = chaveAvatar(id);
  if (!chave) return;
  versoes.set(id, (versoes.get(id) ?? 0) + 1);
  if (aparencia) {
    const aparenciaValidada = normalizarAparencia(aparencia);
    localStorage.setItem(chave, JSON.stringify(aparenciaValidada));
  } else {
    localStorage.removeItem(chave);
  }
  window.dispatchEvent(new Event(EVENTO));
};

const subscribe = (notificar: () => void) => {
  window.addEventListener(EVENTO, notificar);
  window.addEventListener('storage', notificar);
  return () => {
    window.removeEventListener(EVENTO, notificar);
    window.removeEventListener('storage', notificar);
  };
};

export const useAparenciaAvatar = (id?: string) => {
  useSyncExternalStore(subscribe, () => lerRegistro(id), () => null);
  useEffect(() => {
    if (id) void sincronizarAparencia(id);
  }, [id]);
  return carregarAparencia(id);
};
