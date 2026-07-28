import React, { useState } from 'react';
import { ShieldCheck, Lock, Check } from 'lucide-react';
import { t } from '../data/i18n.js';
import { connect, sync, errorKey } from '../utils/federation.js';

/* ─── CONNECT THE FEDERATION ──────────────────────────────────
   Asks for the pitch.cat licence and password, records the explicit
   authorisation, and runs the first import. The password lives in this
   component's state only for as long as the request takes.
──────────────────────────────────────────────────────────────── */

export default function FederationConnectScreen({ lang, onDone, onCancel, showToast }) {
  const tl = (k, v = {}) => t(lang, k, v);

  const [licencia, setLicencia] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | connecting | importing
  const [error, setError] = useState(null);

  const busy = phase !== 'idle';

  const handleConnect = async () => {
    setError(null);

    if (!licencia.trim() || !password) { setError(tl('fed_err_fields')); return; }
    if (!consent) { setError(tl('fed_err_consent')); return; }

    setPhase('connecting');
    const { data, code } = await connect({ licencia: licencia.trim(), password, consent: true });
    if (code) {
      setError(tl(errorKey(code)));
      setPhase('idle');
      return;
    }

    // Credentials are verified and stored: drop the password from state
    // before the import, which no longer needs it.
    setPassword('');
    setPhase('importing');

    const result = await sync();
    setPhase('idle');

    if (result.code) {
      setError(tl(errorKey(result.code)));
      return;
    }

    const imported = result.data?.total ?? 0;
    showToast?.(imported > 0 ? tl('fed_rounds_imported', { n: imported }) : tl('fed_no_rounds'));
    onDone?.({ ...result.data, playerName: data?.playerName });
  };

  const benefits = [tl('fed_benefit_1'), tl('fed_benefit_2'), tl('fed_benefit_3')];

  return (
    <div className="page-scroll">
      <div style={{ marginBottom: 18 }}>
        <div className="bb" style={{ fontSize: 30, lineHeight: 1 }}>{tl('fed_connect_title')}</div>
        <div style={{ fontSize: 12, color: '#787C8A', marginTop: 5 }}>{tl('fed_connect_sub')}</div>
      </div>

      <div className="card card-lime" style={{ marginBottom: 14 }}>
        {benefits.map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: i < 2 ? 9 : 0 }}>
            <Check size={14} style={{ color: '#CAFF4D', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12.5, color: '#D5D8E0', lineHeight: 1.45 }}>{text}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <label className="label" htmlFor="fed-licencia">{tl('fed_licencia')}</label>
        <input
          id="fed-licencia"
          className="inp"
          value={licencia}
          onChange={e => setLicencia(e.target.value.toUpperCase())}
          placeholder={tl('fed_licencia_ph')}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={busy}
          style={{ marginBottom: 14 }}
        />

        <label className="label" htmlFor="fed-password">{tl('fed_password')}</label>
        <input
          id="fed-password"
          className="inp"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={busy}
        />
      </div>

      {/* Explicit authorisation, recorded server side with a timestamp */}
      <div className="card" style={{ marginBottom: 12, borderColor: 'rgba(202,255,77,.16)' }}>
        <div style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
          <ShieldCheck size={16} style={{ color: '#CAFF4D', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 11.5, color: '#787C8A', lineHeight: 1.5 }}>{tl('fed_consent')}</div>
        </div>
        <button
          type="button"
          onClick={() => setConsent(c => !c)}
          disabled={busy}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            background: 'none', border: 'none', padding: 0, cursor: busy ? 'default' : 'pointer', textAlign: 'left',
          }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
            border: `1.5px solid ${consent ? '#CAFF4D' : '#2A2B30'}`,
            background: consent ? '#CAFF4D' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {consent && <Check size={13} style={{ color: '#0A0A0B' }} strokeWidth={3} />}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: consent ? '#FFFFFF' : '#787C8A' }}>
            {tl('fed_consent_check')}
          </span>
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8,
          padding: '10px 12px', fontSize: 12, color: '#FCA5A5', marginBottom: 12, lineHeight: 1.45,
        }}>
          {error}
        </div>
      )}

      <button className="btn btn-primary" onClick={handleConnect} disabled={busy} style={{ marginBottom: 10 }}>
        {phase === 'connecting' ? tl('fed_connecting') : phase === 'importing' ? tl('fed_importing') : tl('fed_connect_btn')}
      </button>

      <button className="btn btn-ghost" onClick={onCancel} disabled={busy} style={{ fontSize: 13 }}>
        {tl('fed_cancel')}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 14 }}>
        <Lock size={11} style={{ color: '#555761' }} />
        <span style={{ fontSize: 10.5, color: '#555761' }}>pitch.cat</span>
      </div>
    </div>
  );
}
