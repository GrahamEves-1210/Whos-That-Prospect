import { useState, type FormEvent } from 'react';
import { submitProspectRequest } from '../lib/supabase';
import { CheckIcon } from './icons';
import { Button, Panel } from './Panel';

interface Props {
  userId: string | null;
  onClose: () => void;
}

/** Footer form: suggest a prospect for a future day. */
export function RequestPanel({ userId }: Props) {
  const [prospect, setProspect] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const name = prospect.trim();
    if (name.length < 2) return setError('Enter the prospect’s name.');
    setBusy(true);
    setError(null);
    const err = await submitProspectRequest(name, note.trim(), userId);
    setBusy(false);
    if (err) setError(err);
    else {
      setSent(true);
      setProspect('');
      setNote('');
    }
  };

  return (
    <Panel className="sheet profile" aria-label="Request a prospect">
      <h3 className="sheet__title">Request a prospect</h3>
      {sent ? (
        <p className="profile__notice">Request sent. Thanks for the pick.</p>
      ) : (
        <form className="profile__form" onSubmit={submit} noValidate>
          <p>Who should be a future mystery prospect?</p>
          <label className="field-input">
            <span className="eyebrow">Prospect</span>
            <input value={prospect} maxLength={80} placeholder="Full name" onChange={(e) => setProspect(e.target.value)} />
          </label>
          <label className="field-input">
            <span className="eyebrow">Optional</span>
            <input value={note} maxLength={280} placeholder="School, draft year, a good story" onChange={(e) => setNote(e.target.value)} />
          </label>
          <p className="form-error" role="alert">
            {error}
          </p>
          <Button type="submit" variant="primary" icon={<CheckIcon />} label="Send request" disabled={busy} />
        </form>
      )}
    </Panel>
  );
}
