import { useEffect } from 'react';

import { useAuth } from '../../../app/providers/AuthProvider';
import { buscarSaldoMoedas } from '../../random-quiz/randomQuizService';
import { useStudentCoinsStore } from '../model/useStudentCoinsStore';

export const StudentCoinsBootstrap = () => {
  const { user } = useAuth();
  const setSaldoMoedas = useStudentCoinsStore((state) => state.setSaldoMoedas);
  const setLoading = useStudentCoinsStore((state) => state.setLoading);
  const setError = useStudentCoinsStore((state) => state.setError);
  const reset = useStudentCoinsStore((state) => state.reset);

  useEffect(() => {
    if (user?.role !== 'STUDENT') {
      reset();
      return;
    }

    let isMounted = true;

    const carregarSaldo = async () => {
      setLoading(true);
      setError(null);

      try {
        const { saldoMoedas } = await buscarSaldoMoedas();

        if (isMounted) {
          setSaldoMoedas(saldoMoedas);
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Erro ao buscar saldo de moedas.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void carregarSaldo();

    return () => {
      isMounted = false;
    };
  }, [reset, setError, setLoading, setSaldoMoedas, user?.role]);

  return null;
};
