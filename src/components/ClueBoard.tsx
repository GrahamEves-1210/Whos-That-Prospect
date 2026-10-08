import { Fragment, useMemo } from 'react';
import type { Prospect } from '../data/types';
import { CARD_GROUP_LABELS, getCardRows } from '../game/columns';
import { ClueReveal } from './ClueReveal';

interface Props {
  prospect: Prospect;
  wrongGuesses: number;
  revealAll: boolean;
  newStep: number | 'all' | null;
}

/** The prospect card: measurables, workout, background and draft rows, each locked until its step unlocks. */
export function ClueBoard({ prospect, wrongGuesses, revealAll, newStep }: Props) {
  const rows = useMemo(() => getCardRows(prospect), [prospect]);
  let order = 0;

  return (
    <section className="dossier" aria-label="Prospect card">
      <h4 className="dossier__title">Prospect card</h4>
      <ol>
        {rows.map((row, i) => {
          const unlocked = revealAll || row.step <= wrongGuesses;
          const isNew = unlocked && newStep != null && (newStep === 'all' ? row.step > wrongGuesses : row.step === newStep);
          const firstOfGroup = i === 0 || rows[i - 1].group !== row.group;
          return (
            <Fragment key={row.id}>
              {firstOfGroup && (
                <li className="field-group" aria-hidden>
                  {CARD_GROUP_LABELS[row.group]}
                </li>
              )}
              <ClueReveal
                id={row.id}
                label={row.label}
                value={row.value}
                unlocked={unlocked}
                isNew={isNew}
                order={isNew ? ++order : 0}
                redactWidth={row.redactWidth}
              />
            </Fragment>
          );
        })}
      </ol>
    </section>
  );
}
