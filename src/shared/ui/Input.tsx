import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div className="flex flex-col mb-1 max-w-[340px] w-full">
      
      <label className="text-[#fffffe] text-[10px] font-bold mb-1 tracking-wide uppercase opacity-80">
        {label}
      </label>
      
      <input 
        className="appearance-none bg-[#00214d] text-[#fffffe] border border-[#fffffe] placeholder:text-[#fffffe]/40 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#00E5FF] transition-colors" 
        {...props} 
      />
      
      {error && <span className="text-red-500 text-[10px] mt-0.5 font-medium">{error}</span>}
    
    </div>
  );
};