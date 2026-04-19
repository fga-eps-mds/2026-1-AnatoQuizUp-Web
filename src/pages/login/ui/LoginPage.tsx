import { LoginForm } from '../../../features/auth-by-credencials/ui/LoginForm';
import mascotImg from '../../../shared/assets/image/logo.png'

export const LoginPage = () => {
  return (
    <main className="h-screen w-full bg-white relative overflow-hidden z-0 flex items-center justify-center">
      
      <div 
        className="absolute bg-[#00214d] w-[1200px] h-[1000px] shadow-2xl z-0 rotate-[35deg] -translate-x-[5%] translate-y-[0%]"
      ></div>

      <div className="z-10 w-full h-full flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-32">
          
          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <img src={mascotImg} alt="Mascote Cérebro"/>
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