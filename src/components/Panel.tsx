import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/** Hard-edged card: 2px ink border with a 4px offset ink shadow. Static: no hover behavior. */
export function Panel({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`panel ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Rendered inside a trailing circular orb, flush with the pill's right edge */
  icon?: ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/** Pill button. Any icon sits in its own nested orb. (Only the nav bar items follow the cursor.) */
export function Button({ icon, label, variant = 'secondary', size = 'md', className = '', type = 'button', children, ...rest }: ButtonProps) {
  const classes = [
    'btn',
    variant !== 'secondary' ? `btn--${variant}` : '',
    size === 'lg' ? 'btn--lg' : size === 'sm' ? 'btn--sm' : '',
    icon ? 'btn--orb' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {label && <span className="btn__label">{label}</span>}
      {children}
      {icon && (
        <span className="btn__orb" aria-hidden>
          {icon}
        </span>
      )}
    </button>
  );
}
