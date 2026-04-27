import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      className="w-full cursor-pointer rounded-lg bg-[#71edc8] px-4 py-2 text-sm font-bold uppercase tracking-wide text-[#00214d] shadow-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed"
      {...props}
    >
      {children}
    </button>
  );
};