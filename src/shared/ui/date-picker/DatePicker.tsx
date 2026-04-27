import type { InputHTMLAttributes } from 'react';

type DatePickerProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const baseInputClassName =
  'h-10 w-full rounded-[7px] border px-3.5 text-sm text-[#0A1128] outline-none transition-colors ' +
  'focus:border-[#14D5C2] bg-white';

export const DatePicker = ({ label, error, id, ...props }: DatePickerProps) => {
  const inputId = id ?? props.name ?? label;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-xs font-medium text-[#0A1128]">
        {label}
      </label>
      <input
        id={inputId}
        type="date"
        className={`${baseInputClassName} ${error ? 'border-red-400' : 'border-[#14D5C2]'}`}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
    </div>
  );
};
