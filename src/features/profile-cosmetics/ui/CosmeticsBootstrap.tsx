import { useEffect } from 'react';

import { useAuth } from '../../../app/providers/AuthProvider';
import { buscarEquipados } from '../cosmeticsService';
import { useEquippedCosmeticsStore } from '../model/useEquippedCosmeticsStore';

/**
 * Componente "bootstrap" sem UI: ao logar como aluno, carrega os cosmeticos equipados
 * para a store global; para outros papeis, limpa o estado. Renderiza null.
 */
export const CosmeticsBootstrap = () => {
  const { user } = useAuth();
  const setCosmeticos = useEquippedCosmeticsStore((state) => state.setCosmeticos);
  const setLoading = useEquippedCosmeticsStore((state) => state.setLoading);
  const setError = useEquippedCosmeticsStore((state) => state.setError);
  const reset = useEquippedCosmeticsStore((state) => state.reset);

  // Carrega os cosmeticos do aluno; demais papeis nao tem cosmeticos (reset).
  useEffect(() => {
    if (user?.role !== 'STUDENT') {
      reset();
      return;
    }

    let isMounted = true;

    const carregarCosmeticos = async () => {
      setLoading(true);
      setError(null);

      try {
        const cosmeticos = await buscarEquipados();

        if (isMounted) {
          setCosmeticos(cosmeticos);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : 'Erro ao buscar cosméticos equipados.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void carregarCosmeticos();

    return () => {
      isMounted = false;
    };
  }, [reset, setCosmeticos, setError, setLoading, user?.id, user?.role]);

  return null;
};
