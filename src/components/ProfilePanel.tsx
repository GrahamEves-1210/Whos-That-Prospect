import { useEffect, useState, type FormEvent } from 'react';
import type { UseAuth } from '../hooks/useAuth';
import { CheckIcon, SignOutIcon, UserIcon } from './icons';
import { Button, Panel } from './Panel';

interface Props {
  auth: UseAuth;
  onClose: () => void;
}

/** Sign in / create account with email + password; once signed in, edit the username. */
export function ProfilePanel({ auth }: Props) {
  return (
    <Panel className="sheet profile" aria-label="Profile">
      <h3 className="sheet__title">Profile</h3>
      {!auth.userId && (
        <ul className="profile__why">
          <li>
            <strong>Compete on the leaderboard.</strong> Every daily prospect you finish counts toward your correct guesses and
            streak.
          </li>
          <li>
            <strong>Keep your stats on every device.</strong> Your record and streak follow you from your phone to your laptop.
          </li>
        </ul>
      )}
      {!auth.enabled ? (
        <p>Profiles aren’t switched on yet. Your stats are still saved on this device.</p>
      ) : !auth.ready ? null : auth.userId ? (
        <SignedIn auth={auth} />
      ) : (
        <SignInForm auth={auth} />
      )}
      <div className="sheet__actions">
        {auth.userId && <Button icon={<SignOutIcon />} label="Sign out" onClick={() => void auth.signOut()} />}
      </div>
    </Panel>
  );
}

function SignInForm({ auth }: { auth: UseAuth }) {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.includes('@')) return setError('Enter a valid email.');
    if (password.length < 6) return setError('Password needs at least 6 characters.');
    setBusy(true);
    if (mode === 'in') {
      const err = await auth.signIn(email.trim(), password);
      if (err) setError(err);
    } else {
      const { error: err, needsConfirm } = await auth.signUp(email.trim(), password);
      if (err) setError(err);
      else if (needsConfirm) setNotice('Check your email to confirm your account, then sign in.');
    }
    setBusy(false);
  };

  return (
    <form className="profile__form" onSubmit={submit} noValidate>
      <div className="seg" role="tablist" aria-label="Account">
        <button type="button" role="tab" aria-selected={mode === 'in'} className="seg__btn" onClick={() => setMode('in')}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === 'up'} className="seg__btn" onClick={() => setMode('up')}>
          Create account
        </button>
      </div>
      <label className="field-input">
        <span className="eyebrow">Email</span>
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="field-input">
        <span className="eyebrow">Password</span>
        <input
          type="password"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {mode === 'up' && <p className="profile__hint">Your username starts as the part of your email before the @. You can change it after.</p>}
      <p className="form-error" role="alert">
        {error}
      </p>
      {notice && <p className="profile__notice">{notice}</p>}
      <Button type="submit" variant="primary" icon={<UserIcon />} label={mode === 'in' ? 'Sign in' : 'Create account'} disabled={busy} />
    </form>
  );
}

function SignedIn({ auth }: { auth: UseAuth }) {
  const [name, setName] = useState(auth.profile?.username ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (auth.profile) setName(auth.profile.username);
  }, [auth.profile]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    const err = await auth.updateUsername(name);
    setBusy(false);
    if (err) setError(err);
    else setSaved(true);
  };

  const unchanged = name.trim() === (auth.profile?.username ?? '');

  return (
    <form className="profile__form" onSubmit={save} noValidate>
      <div className="kv">
        <span className="eyebrow">Signed in as</span>
        <span>{auth.email}</span>
      </div>
      <p className="profile__hint">You’re on the leaderboard, and your stats sync to every device you sign in on.</p>
      <label className="field-input">
        <span className="eyebrow">Username</span>
        <input
          value={name}
          maxLength={24}
          autoComplete="username"
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
      </label>
      <p className="form-error" role="alert">
        {error}
      </p>
      {saved && <p className="profile__notice">Username saved.</p>}
      <Button type="submit" variant="primary" icon={<CheckIcon />} label="Save username" disabled={busy || unchanged} />
    </form>
  );
}
