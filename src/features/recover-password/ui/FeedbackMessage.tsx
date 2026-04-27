import { Check, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

type FeedbackMessageProps = {
  children: ReactNode;
  variant: 'error' | 'success';
};

export const FeedbackMessage = ({ children, variant }: FeedbackMessageProps) => {
  const isSuccess = variant === 'success';
  const Icon = isSuccess ? Check : TriangleAlert;

  return (
    <div
      role="status"
      className={
        'flex w-full items-start gap-2 rounded-[7px] border px-3 py-2 text-xs font-bold leading-relaxed ' +
        (isSuccess
          ? 'border-[#14D5C2] bg-[#14D5C2]/10 text-[#007B6E]'
          : 'border-red-400 bg-red-50 text-red-500')
      }
    >
      <Icon size={14} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
};
