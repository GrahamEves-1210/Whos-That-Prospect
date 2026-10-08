interface Props {
  id: string;
  label: string;
  value: string;
  unlocked: boolean;
  /** Animate the bar sliding away and the value appearing */
  isNew: boolean;
  /** Stagger index */
  order?: number;
  /** Width of the locked bar, e.g. "42%" */
  redactWidth: string;
}

/** One prospect-card row: a black bar until unlocked, then the value. */
export function ClueReveal({ id, label, value, unlocked, isNew, order = 0, redactWidth }: Props) {
  const classes = ['field', unlocked ? 'field--open' : 'field--locked', isNew ? 'field--new' : ''].filter(Boolean).join(' ');
  return (
    <li className={classes} data-field={id} style={{ ['--i' as string]: order }} aria-label={unlocked ? `${label}: ${value}` : `${label}: locked`}>
      <span className="field__label eyebrow">{label}</span>
      <span className="field__cell">
        {(!unlocked || isNew) && <span className="redaction" style={{ ['--w' as string]: redactWidth }} aria-hidden />}
        {unlocked && <span className="field__value">{value}</span>}
      </span>
    </li>
  );
}
