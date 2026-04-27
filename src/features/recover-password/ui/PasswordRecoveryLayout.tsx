import type { ReactNode } from 'react';
import logo from '../../../shared/assets/image/logo.png';

type PasswordRecoveryLayoutProps = {
  children: ReactNode;
};

export const PasswordRecoveryLayout = ({ children }: PasswordRecoveryLayoutProps) => (
  <main className="relative min-h-screen w-full overflow-x-hidden bg-[#F7F7F7]">
    <div className="absolute inset-y-0 left-0 hidden w-[57vw] bg-[#00214d] [clip-path:polygon(0_0,40%_0,100%_100%,0_100%)] md:block [@media(min-width:768px)_and_(max-width:1100px)]:w-[50vw] [@media(min-width:768px)_and_(max-height:760px)]:w-[52vw] [@media(min-width:768px)_and_(max-width:1100px)]:[clip-path:polygon(0_0,34%_0,100%_100%,0_100%)]" />

    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8 md:py-8 lg:px-16 xl:px-20">
      <section className="mb-10 w-full md:mb-0 md:flex md:h-[calc(100vh-4rem)] md:w-[50%] md:items-center md:justify-start lg:w-[51%]">
        <div className="flex w-full justify-center md:justify-start">
          <img
            src={logo}
            alt="Logo AnatoQuizUp"
            className="h-auto w-full max-w-[260px] md:max-w-[320px] lg:max-w-[430px] xl:max-w-[470px]"
          />
        </div>
      </section>

      <section className="flex w-full justify-center md:w-[50%] md:justify-end lg:w-[49%]">
        {children}
      </section>
    </div>
  </main>
);
