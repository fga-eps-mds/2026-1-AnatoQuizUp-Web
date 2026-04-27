import type { SelectHTMLAttributes } from 'react';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

const baseSelectClassName =
  'h-10 w-full cursor-pointer rounded-[7px] border px-3.5 text-sm text-[#0A1128] outline-none transition-colors ' +
  'focus:border-[#14D5C2] bg-white disabled:cursor-not-allowed disabled:border-[#BBD7D3] disabled:bg-[#F3F6FA] disabled:text-[#0A1128]/55';

export const Select = ({
  label,
  options,
  placeholder = 'Selecione uma opção',
  error,
  id,
  ...props
}: SelectProps) => {
  const inputId = id ?? props.name ?? label;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-xs font-medium text-[#0A1128]">
        {label}
      </label>
      <select
        id={inputId}
        className={`${baseSelectClassName} ${error ? 'border-red-400' : 'border-[#14D5C2]'}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
    </div>
  );
};
