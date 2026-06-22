import { montarIniciais } from '../../../../src/shared/utils/iniciais';

describe('montarIniciais', () => {
  it('usa a primeira letra do primeiro e do ultimo nome', () => {
    expect(montarIniciais('João Silva')).toBe('JS');
  });

  it('usa somente a primeira letra quando ha um nome', () => {
    expect(montarIniciais('João')).toBe('J');
  });

  it.each([null, undefined, ''])('retorna A como fallback para %p', (nome) => {
    expect(montarIniciais(nome)).toBe('A');
  });

  it('ignora espacos extras', () => {
    expect(montarIniciais('  maria   de   souza  ')).toBe('MS');
  });
});
