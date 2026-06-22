import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import logoAnatoQuizUp from '../../../shared/assets/image/logo.png';

export const NotFoundPage = () => {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-white text-[#0A1128]">
      {/* Fundo diagonal exibido apenas no desktop */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 hidden w-[68%] bg-[#062D5C] md:block"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 43% 100%, 0 100%)',
        }}
      />

      <div className="relative z-10 grid min-h-[100dvh] md:grid-cols-[58%_42%]">
        {/* Área visual do desktop */}
        <section className="hidden items-center justify-center md:flex">
          <img
            src={logoAnatoQuizUp}
            alt="AnatoQuizUp"
            className="w-[62%] max-w-[560px] -translate-x-[7%] object-contain"
          />
        </section>

        {/* Conteúdo da página */}
        <section className="flex items-center justify-center px-6 py-12 md:px-12">
          <div className="w-full max-w-md text-center md:text-left">
            {/* Logo exibida somente no mobile */}
            <img
              src={logoAnatoQuizUp}
              alt="AnatoQuizUp"
              className="mx-auto mb-14 w-52 object-contain md:hidden"
            />

            <p className="text-6xl font-black leading-none tracking-tight text-[#0A1744] md:text-7xl">
              404
            </p>

            <h1 className="mt-2 text-2xl font-black text-[#0A1744] md:text-3xl">
              Página não encontrada
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm font-medium leading-relaxed text-[#0A1128]/65 md:mx-0 md:text-base">
              Ops! Parece que você se perdeu no caminho. A página que você procura não existe ou foi
              movida.
            </p>

            <Link
              to="/home"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-md border border-[#062D5C] px-5 py-3 text-sm font-bold text-[#062D5C] transition-colors hover:bg-[#062D5C] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14D5C2] focus-visible:ring-offset-2"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Voltar ao início
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};