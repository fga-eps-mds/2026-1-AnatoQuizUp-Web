import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button 
      className="bg-[#71edc8] text-[#00214d] rounded-lg px-4 py-2 text-sm font-bold transition-colors hover:brightness-95 w-full tracking-wide uppercase shadow-sm"
      {...props}
    >
      {children}
    </button>
  );
};