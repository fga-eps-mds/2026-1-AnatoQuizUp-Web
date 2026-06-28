import { RegisterProfessorForm } from '../../../features/register-professor';
import mascotImg from '../../../shared/assets/image/logo.png';

// Classes Tailwind extraidas para constantes por causa do tamanho (layout responsivo com clip-path).
const pageClassName = 'relative min-h-screen w-full overflow-x-hidden bg-[#F7F7F7]';
const backgroundShapeClassName =
  'absolute inset-y-0 left-0 hidden w-[57vw] bg-[#00214d] md:block ' +
  '[clip-path:polygon(0_0,40%_0,100%_100%,0_100%)] ' +
  '[@media(min-width:768px)_and_(max-width:1100px)]:w-[50vw] ' +
  '[@media(min-width:768px)_and_(max-height:760px)]:w-[52vw] ' +
  '[@media(min-width:768px)_and_(max-width:1100px)]:[clip-path:polygon(0_0,34%_0,100%_100%,0_100%)]';
const contentClassName =
  'relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 ' +
  'md:flex-row md:items-center md:justify-between md:px-8 md:py-8 lg:px-16 xl:px-20 ' +
  '[@media(min-width:768px)_and_(max-height:760px)]:items-start ' +
  '[@media(min-width:768px)_and_(max-height:760px)]:py-5';
const brandSectionClassName =
  'mb-10 w-full md:sticky md:top-0 md:mb-0 md:flex md:h-[calc(100vh-4rem)] ' +
  'md:w-[50%] md:items-center md:justify-start lg:w-[51%] ' +
  '[@media(min-width:768px)_and_(max-height:760px)]:h-[calc(100vh-2.5rem)]';
const formSectionClassName =
  'flex w-full justify-center md:h-[calc(100vh-4rem)] md:w-[50%] md:items-center ' +
  'md:justify-end lg:w-[49%] [@media(min-width:768px)_and_(max-height:760px)]:h-[calc(100vh-2.5rem)]';

/**
 * Pagina de cadastro de professor: layout em duas colunas (marca a esquerda,
 * formulario a direita) sobre um fundo diagonal, hospedando o RegisterProfessorForm.
 */
export const ProfessorRegisterPage = () => {
  return (
    <main className={pageClassName}>
      <div className={backgroundShapeClassName} />

      <div className={contentClassName}>
        <section className={brandSectionClassName}>
          <div className="mb-16 md:hidden">
            <h1 className="text-4xl font-bold text-[#0A1128]">Cadastro</h1>
            <span className="mt-2 block h-1 w-32 rounded bg-[#0A1128]" />
          </div>

          <div className="flex w-full justify-center md:justify-start">
            <img
              src={mascotImg}
              alt="Logo AnatoQuizUp"
              className="h-auto w-full max-w-[260px] md:max-w-[290px] lg:max-w-[370px] xl:max-w-[410px] [@media(min-width:768px)_and_(max-height:760px)]:max-w-[300px]"
            />
          </div>
        </section>

        <section className={formSectionClassName}>
          <RegisterProfessorForm />
        </section>
      </div>
    </main>
  );
};
