import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useStudentCoinsStore } from '../../student-coins/model/useStudentCoinsStore';
import logo from '../../../shared/assets/image/logo.png';
import { useAchievementStore } from '../model/useAchievementStore';
import { AchievementMedal } from './AchievementMedal';
import { AchievementReward } from './AchievementReward';
import { AchievementTierBadge } from './AchievementTierBadge';

const CHAVE_SOM = 'achievement_sound_enabled';

const CORES_CONFETE = ['#14B8A6', '#F59E0B', '#F43F5E', '#6366F1', '#22C55E'];

const tocarSomConquista = () => {
  try {
    const AudioContextClass = window.AudioContext;
    const contexto = new AudioContextClass();
    const inicio = contexto.currentTime;

    [523.25, 659.25, 783.99].forEach((frequencia, indice) => {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      const comeco = inicio + indice * 0.09;

      oscilador.type = 'sine';
      oscilador.frequency.setValueAtTime(frequencia, comeco);
      ganho.gain.setValueAtTime(0.0001, comeco);
      ganho.gain.exponentialRampToValueAtTime(0.12, comeco + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.0001, comeco + 0.24);

      oscilador.connect(ganho);
      ganho.connect(contexto.destination);
      oscilador.start(comeco);
      oscilador.stop(comeco + 0.26);
    });

    window.setTimeout(() => void contexto.close(), 700);
  } catch {
    // O modal continua funcional quando a API de áudio não está disponível.
  }
};

export const AchievementUnlockModal = () => {
  const navigate = useNavigate();
  const conquista = useAchievementStore((state) => state.conquistaAtual);
  const quantidadeNaFila = useAchievementStore((state) => state.filaDesbloqueios.length);
  const avancarFila = useAchievementStore((state) => state.avancarFila);
  const setSaldoMoedas = useStudentCoinsStore((state) => state.setSaldoMoedas);
  const [somAtivo, setSomAtivo] = useState(
    () => localStorage.getItem(CHAVE_SOM) !== 'false',
  );

  const confetes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, indice) => ({
        id: indice,
        left: `${4 + ((indice * 19) % 92)}%`,
        delay: `${(indice % 7) * 70}ms`,
        duration: `${900 + (indice % 5) * 140}ms`,
        color: CORES_CONFETE[indice % CORES_CONFETE.length],
        rotate: `${(indice * 47) % 180}deg`,
      })),
    [],
  );

  useEffect(() => {
    if (!conquista) return;

    setSaldoMoedas(conquista.saldoMoedas);

    if (somAtivo) {
      tocarSomConquista();
    }
  }, [conquista, setSaldoMoedas, somAtivo]);

  useEffect(() => {
    if (!conquista) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [conquista]);

  if (!conquista) return null;

  const alternarSom = () => {
    const novoValor = !somAtivo;
    setSomAtivo(novoValor);
    localStorage.setItem(CHAVE_SOM, String(novoValor));
  };

  const verConquista = () => {
    const conquistaId = conquista.conquistaId;
    avancarFila();
    navigate('/aluno/conquistas', {
      state: { abrirConquistaId: conquistaId },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0A1128]/65 p-4 backdrop-blur-[3px]"
      role="presentation"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {confetes.map((confete) => (
          <span
            key={confete.id}
            className="achievement-confetti absolute -top-6 h-3 w-2 rounded-sm"
            style={{
              left: confete.left,
              backgroundColor: confete.color,
              animationDelay: confete.delay,
              animationDuration: confete.duration,
              rotate: confete.rotate,
            }}
          />
        ))}
      </div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-unlock-title"
        className="achievement-unlock-pop relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-2xl"
      >
        <div className="absolute right-3 top-3 z-10 flex gap-1">
          <button
            type="button"
            onClick={alternarSom}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/85 text-[#64748B] shadow-sm hover:text-[#0A1128]"
            aria-label={somAtivo ? 'Desativar som' : 'Ativar som'}
          >
            {somAtivo ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            onClick={avancarFila}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/85 text-[#64748B] shadow-sm hover:text-[#0A1128]"
            aria-label="Fechar notificação de conquista"
          >
            <X size={19} />
          </button>
        </div>

        <header className="relative overflow-hidden border-b border-[#E2E8F0] bg-[#ECFDF8] px-6 pb-5 pt-8 text-center">
          <img
            src={logo}
            alt=""
            className="mx-auto h-16 w-24 object-contain"
            aria-hidden="true"
          />
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-[#0D9488] shadow-sm">
            <CheckCircle2 size={15} />
            Conquista registrada
          </div>
          <h2
            id="achievement-unlock-title"
            className="mt-3 text-2xl font-black text-[#0A1128]"
          >
            Nova conquista desbloqueada!
          </h2>
        </header>

        <div className="p-6">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5 text-center sm:flex-row sm:text-left">
            <AchievementMedal
              tipo={conquista.tipoConquista}
              tier={conquista.tier}
              tamanho="md"
              nome={conquista.nome}
            />
            <div className="min-w-0 flex-1">
              <AchievementTierBadge tier={conquista.tier} />
              <h3 className="mt-2 text-xl font-black text-[#0A1128]">{conquista.nome}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-[#475569]">
                {conquista.descricao}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-center text-xs font-black uppercase text-[#64748B]">
              Recompensas recebidas
            </p>
            <AchievementReward
              moedas={conquista.moedasConcedidas}
              item={conquista.itemConcedido}
            />
          </div>

          {quantidadeNaFila > 0 && (
            <p className="mt-4 text-center text-xs font-bold text-[#0D9488]">
              Mais {quantidadeNaFila}{' '}
              {quantidadeNaFila === 1 ? 'conquista aguardando' : 'conquistas aguardando'}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={verConquista}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#14B8A6] bg-white px-4 text-sm font-black text-[#0D9488] hover:bg-[#ECFDF8]"
            >
              Ver conquista
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              onClick={avancarFila}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#14B8A6] px-4 text-sm font-black text-white hover:bg-[#0D9488]"
            >
              <BookOpen size={17} />
              Continuar estudando
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
