import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'answer' | 'ghost' | 'danger' | 'default' | 'white';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; loading?: boolean; children: ReactNode;
}

export function Button({ variant = 'default', loading, disabled, className = '', children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`btn ${variant === 'default' ? '' : variant} ${className}`.trim()} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {children}
    </button>
  );
}
