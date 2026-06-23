import { render, waitFor } from '@testing-library/react';

import { CosmeticsBootstrap } from '../../../../../src/features/profile-cosmetics/ui/CosmeticsBootstrap';
import { buscarEquipados } from '../../../../../src/features/profile-cosmetics/cosmeticsService';
import { useEquippedCosmeticsStore } from '../../../../../src/features/profile-cosmetics/model/useEquippedCosmeticsStore';
import { useAuth } from '../../../../../src/app/providers/AuthProvider';

jest.mock('../../../../../src/features/profile-cosmetics/cosmeticsService', () => ({
  buscarEquipados: jest.fn(),
}));

jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../../src/features/profile-cosmetics/model/useEquippedCosmeticsStore', () => ({
  useEquippedCosmeticsStore: jest.fn(),
}));

const mockedBuscar = jest.mocked(buscarEquipados);
const mockedUseAuth = jest.mocked(useAuth);
const mockedStore = jest.mocked(useEquippedCosmeticsStore);

const setCosmeticos = jest.fn();
const setLoading = jest.fn();
const setError = jest.fn();
const reset = jest.fn();

type MockState = {
  setCosmeticos: jest.Mock;
  setLoading: jest.Mock;
  setError: jest.Mock;
  reset: jest.Mock;
};

const comoAluno = () =>
  mockedUseAuth.mockReturnValue({
    user: { id: 'user-1', role: 'STUDENT' },
  } as unknown as ReturnType<typeof useAuth>);

describe('CosmeticsBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedStore.mockImplementation((selector: unknown) => {
      const state: MockState = { setCosmeticos, setLoading, setError, reset };
      return (selector as (s: MockState) => unknown)(state);
    });
  });

  it('carrega os cosméticos equipados do aluno ao montar', async () => {
    comoAluno();
    const slots = { ICONE_PERFIL: { id: 'item-1' } } as unknown as Awaited<
      ReturnType<typeof buscarEquipados>
    >;
    mockedBuscar.mockResolvedValue(slots);

    render(<CosmeticsBootstrap />);

    await waitFor(() => expect(setCosmeticos).toHaveBeenCalledWith(slots));
    expect(reset).not.toHaveBeenCalled();
  });

  it('não reseta os cosméticos ao desmontar (evita o flash ao trocar de página)', async () => {
    comoAluno();
    mockedBuscar.mockResolvedValue({} as Awaited<ReturnType<typeof buscarEquipados>>);

    const { unmount } = render(<CosmeticsBootstrap />);
    await waitFor(() => expect(setCosmeticos).toHaveBeenCalled());
    reset.mockClear();

    unmount();

    expect(reset).not.toHaveBeenCalled();
  });

  it('reseta e não busca cosméticos quando o usuário não é aluno', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'prof-1', role: 'PROFESSOR' },
    } as unknown as ReturnType<typeof useAuth>);

    render(<CosmeticsBootstrap />);

    expect(reset).toHaveBeenCalled();
    expect(mockedBuscar).not.toHaveBeenCalled();
  });
});
