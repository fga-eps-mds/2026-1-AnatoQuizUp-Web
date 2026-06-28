import { useEffect } from 'react';

import { useAuth } from '../../../app/providers/AuthProvider';
import { buscarSaldoMoedas } from '../../random-quiz/randomQuizService';
import { useStudentCoinsStore } from '../model/useStudentCoinsStore';

/**
 * Componente "bootstrap" sem UI: ao logar como aluno, carrega o saldo de moedas (ATP)
 * para a store global; para outros papeis, limpa o estado. Renderiza null.
 */
export const StudentCoinsBootstrap = () => {
  const { user } = useAuth();
  const setSaldoMoedas = useStudentCoinsStore((state) => state.setSaldoMoedas);
  const setLoading = useStudentCoinsStore((state) => state.setLoading);
  const setError = useStudentCoinsStore((state) => state.setError);
  const reset = useStudentCoinsStore((state) => state.reset);

  // Carrega o saldo do aluno; demais papeis nao tem moedas (reset).
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
          setError(error instanceof Error ? error.message : 'Erro ao buscar saldo de ATP.');
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
