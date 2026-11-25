import { AxiosError, type AxiosResponse } from 'axios';

import {
  AVISO_DEMORA,
  AVISO_IA_INDISPONIVEL,
  AVISO_RESPOSTA_INVALIDA,
  ErroOsce,
  avisoDaFalhaDeEnvio,
  classificarErroOsce,
  criarErroOsce,
} from '../../../../src/features/osce/erroOsce';

const MENSAGEM_TECNICA = 'Servico de IA ainda nao foi habilitado nesta release.';

// Erro do axios com resposta do backend no formato padronizado ({ erro: { mensagem } }).
const erroHttp = (status: number, mensagem = MENSAGEM_TECNICA) =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    data: { erro: { mensagem } },
  } as AxiosResponse);

describe('classificarErroOsce', () => {
  it('503: a IA esta fora do ar', () => {
    expect(classificarErroOsce(erroHttp(503))).toEqual(AVISO_IA_INDISPONIVEL);
  });

  it('502: a IA nao conseguiu responder', () => {
    expect(classificarErroOsce(erroHttp(502))).toEqual(AVISO_RESPOSTA_INVALIDA);
  });

  it('504: a IA demorou para responder', () => {
    expect(classificarErroOsce(erroHttp(504))).toEqual(AVISO_DEMORA);
  });

  it('timeout do axios (ECONNABORTED) conta como demora', () => {
    expect(classificarErroOsce(new AxiosError('timeout of 0ms exceeded', 'ECONNABORTED'))).toEqual(
      AVISO_DEMORA,
    );
  });

  it('sem resposta do servidor (rede fora) conta como demora', () => {
    expect(classificarErroOsce(new AxiosError('Network Error', 'ERR_NETWORK'))).toEqual(AVISO_DEMORA);
  });

  it('outros status nao sao classificados', () => {
    expect(classificarErroOsce(erroHttp(400, 'Mensagem obrigatória'))).toBeNull();
    expect(classificarErroOsce(erroHttp(401, 'Token inválido'))).toBeNull();
  });

  it('erro que nao e do axios nao e classificado', () => {
    expect(classificarErroOsce(new Error('falha qualquer'))).toBeNull();
  });

  it('as gravidades seguem a tabela: fora do ar e erro, falhas passageiras sao alerta', () => {
    expect(AVISO_IA_INDISPONIVEL.gravidade).toBe('erro');
    expect(AVISO_RESPOSTA_INVALIDA.gravidade).toBe('alerta');
    expect(AVISO_DEMORA.gravidade).toBe('alerta');
  });
});

describe('criarErroOsce', () => {
  it('troca a mensagem tecnica do backend pelo texto do aviso', () => {
    const erro = criarErroOsce(erroHttp(503));

    expect(erro).toBeInstanceOf(ErroOsce);
    expect(erro.aviso).toEqual(AVISO_IA_INDISPONIVEL);
    expect(erro.message).toBe(AVISO_IA_INDISPONIVEL.texto);
    expect(erro.message).not.toMatch(/nesta release/);
  });

  it('mantem a mensagem atual para os status nao classificados', () => {
    const erro = criarErroOsce(erroHttp(400, 'Mensagem obrigatória'));

    expect(erro.aviso).toBeNull();
    expect(erro.message).toBe('Mensagem obrigatória');
  });
});

describe('avisoDaFalhaDeEnvio', () => {
  it('usa o aviso classificado', () => {
    expect(avisoDaFalhaDeEnvio(criarErroOsce(erroHttp(502)))).toEqual(AVISO_RESPOSTA_INVALIDA);
  });

  it('sem classificacao, mostra a mensagem do erro sem titulo', () => {
    expect(avisoDaFalhaDeEnvio(new Error('Token inválido'))).toEqual({
      texto: 'Token inválido',
      gravidade: 'erro',
    });
  });
});
