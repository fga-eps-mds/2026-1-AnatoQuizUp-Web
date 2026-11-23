import { APARENCIA_PADRAO, type AparenciaAvatar } from './aparencia';
import { carregarAparencia, salvarAparencia } from './useAparenciaAvatar';

describe('armazenamento da aparência do avatar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('valida todos os campos antes de gravar dados externos no localStorage', () => {
    const aparenciaExterna = {
      corCerebro: '<script>',
      cabelo: 'valor-invalido',
      acessorio: { nome: 'coroa' },
      luva: 'luva-boxe',
      calcado: 'tenis-esportivo',
      campoInesperado: 'nao deve ser persistido',
    } as unknown as AparenciaAvatar;

    salvarAparencia('aluna-1', aparenciaExterna);

    expect(JSON.parse(localStorage.getItem('anatoquizup:avatar:aluna-1') ?? '{}')).toEqual({
      ...APARENCIA_PADRAO,
      luva: 'luva-boxe',
      calcado: 'tenis-esportivo',
    });
    expect(carregarAparencia('aluna-1')).toEqual({
      ...APARENCIA_PADRAO,
      luva: 'luva-boxe',
      calcado: 'tenis-esportivo',
    });
  });

  it('recusa identificadores inválidos antes de acessar o localStorage', () => {
    salvarAparencia('../outro-registro', APARENCIA_PADRAO);

    expect(localStorage).toHaveLength(0);
    expect(carregarAparencia('../outro-registro')).toEqual(APARENCIA_PADRAO);
  });
});
