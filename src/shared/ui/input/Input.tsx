import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div className="flex flex-col mb-1 max-w-[340px] w-full">
      
      <label className="text-[#00214d] md:text-[#fffffe] text-[10px] font-bold mb-1 tracking-wide uppercase opacity-80 transition-colors">
        {label}
      </label>
      
      <input 
        className="appearance-none bg-[#fffffe] md:bg-[#00214d] text-[#00214d] md:text-[#fffffe] border border-[#00214d] md:border-[#fffffe] placeholder:text-[#00214d]/50 md:placeholder:text-[#fffffe]/40 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#00E5FF] transition-colors" 
        {...props} 
      />
      
      {error && <span className="text-red-500 text-[10px] mt-0.5 font-medium">{error}</span>}
    
    </div>
  );
};