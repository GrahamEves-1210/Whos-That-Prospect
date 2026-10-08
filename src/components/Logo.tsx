interface Props {
  className?: string;
}

/** The brand logo: card mark + wordmark, from public/logo.png. */
export function Logo({ className = '' }: Props) {
  return <img className={`logo ${className}`.trim()} src="/logo.png" alt="Who’s That Prospect?" draggable={false} />;
}
