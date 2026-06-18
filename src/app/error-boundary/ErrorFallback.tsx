import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

import logoAnatoQuizUp from '../../shared/assets/image/logo.png';

type ErrorFallbackProps = {
  onRetry: () => void;
};

export const ErrorFallback = ({ onRetry }: ErrorFallbackProps) => {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-white px-6 py-12 text-[#0A1128]">
      <div className="w-full max-w-lg text-center">
        <img
          src={logoAnatoQuizUp}
          alt="AnatoQuizUp"
          className="mx-auto mb-10 w-56 object-contain"
        />

        <p className="text-5xl font-black text-[#0A1744]">Ops!</p>

        <h1 className="mt-3 text-2xl font-black text-[#0A1744]">
          Algo deu errado
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-[#0A1128]/65 md:text-base">
          Não foi possível carregar esta página. Tente novamente ou volte para o início.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#062D5C] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0A1744] sm:w-auto"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Tentar novamente
          </button>

          <Link
            to="/home"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#062D5C] px-5 py-3 text-sm font-bold text-[#062D5C] transition-colors hover:bg-[#062D5C] hover:text-white sm:w-auto"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
};