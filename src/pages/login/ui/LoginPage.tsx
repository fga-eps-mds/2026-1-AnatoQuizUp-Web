import { LoginForm } from '../../../features/auth-by-credencials/ui/LoginForm';
import mascotImg from '../../../shared/assets/image/logo.png';
import { Link } from 'react-router-dom';

export const LoginPage = () => {
  return (
    <main className="min-h-screen md:h-screen w-full bg-white relative overflow-y-auto overflow-x-hidden md:overflow-hidden z-0 flex items-center justify-center">
      
      <div 
        className="absolute hidden md:block bg-[#00214d] w-[90vw] h-[150vh] z-0 rotate-[32deg] -left-[0%] -top-[25%]"
      ></div>

      <div className="z-10 w-full h-full flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-32">
          
          <div className="w-full md:hidden pt-4 pb-2">
            <div className="flex justify-center gap-16 text-2xl font-bold">
              <Link to="/login" className="text-[#0A1128] border-b-[5px] border-[#0A1128] pb-1.5 focus:outline-none">
                Logar
              </Link>
              <Link to="/home" className="text-[#0A1128]/50 focus:outline-none hover:text-[#0A1128] transition-colors">
                Cadastre-se
              </Link>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <img src={mascotImg} alt="Mascote Cérebro" className="h-auto w-full max-w-[200px] md:max-w-[330px]" />
          </div>

          <div className="flex-1 flex justify-center items-center">
            <div className="w-full max-w-[340px]">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};