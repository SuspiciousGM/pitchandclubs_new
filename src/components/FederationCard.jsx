import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { t } from '../data/i18n.js';
import { getConnection, sync, disconnect, errorKey, lastSyncLabel } from '../utils/federation.js';

/* ─── FEDERATION STATUS (profile section) ─────────────────────
   Shows whether the pitch.cat account is linked, when it last synced,
   and offers a manual sync plus disconnect.
──────────────────────────────────────────────────────────────── */

export default function FederationCard({ user, lang, onConnect, showToast, onSynced }) {
  const tl = (k, v = {}) => t(lang, k, v);

  // undefined while unknown, null when there is no connection.
  const [connection, setConnection] = useState(undefined);
  const [syncing, setSyncing] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const [alsoDeleteData, setAlsoDeleteData] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getConnection();
    setConnection(data ?? null);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getConnection().then(data => { if (!cancelled) setConnection(data ?? null); });
    return () => { cancelled = true; };
  }, [user]);

  const handleSync = async () => {
    setSyncing(true);
    const { data, code } = await sync();
    setSyncing(false);

    if (code) {
      showToast?.(tl(errorKey(code)));
      refresh();
      return;
    }

    const imported = data?.imported ?? 0;
    showToast?.(imported > 0 ? tl('fed_new_rounds', { n: imported }) : tl('fed_up_to_date'));
    refresh();
    if (imported > 0) onSynced?.();
  };

  const handleDisconnect = async () => {
    const { code } = await disconnect(alsoDeleteData);
    setConfirmOff(false);
    if (code) { showToast?.(tl(errorKey(code))); return; }
    setConnection(null);
    setAlsoDeleteData(false);
    showToast?.(tl('fed_disconnect'));
    onSynced?.();
  };

  if (!user || connection === undefined) return null;

  const label = tl('fed_title').toUpperCase();

  // Not linked yet: invite the player to connect.
  if (!connection) {
    return (
      <div className="card" style={{ marginBottom: 12, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} style={{ color: '#CAFF4D' }} /> {tl('fed_title')}
            </div>
            <div style={{ fontSize: 11, color: '#555761', marginTop: 3, lineHeight: 1.45 }}>
              {tl('fed_not_connected_desc')}
            </div>
          </div>
          <button
            onClick={onConnect}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(202,255,77,.3)',
              background: 'rgba(202,255,77,.07)', color: '#CAFF4D', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            {tl('fed_connect')}
          </button>
        </div>
      </div>
    );
  }

  const needsPassword = connection.status === 'auth_error';
  const syncLabel = lastSyncLabel(connection.last_sync_at, lang);

  return (
    <>
      <div className="card" style={{ marginBottom: 12, padding: 14 }}>
        <div style={{ fontSize: 10, color: '#555761', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          {label}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <ShieldCheck size={18} style={{ color: needsPassword ? '#EF4444' : '#CAFF4D', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{connection.licencia}</div>
            <div style={{ fontSize: 10.5, color: '#555761', marginTop: 2 }}>
              {syncLabel ? `${tl('fed_last_sync')}: ${syncLabel}` : tl('fed_never_synced')}
            </div>
          </div>
          {!needsPassword && (
            <span style={{
              fontSize: 10, color: '#CAFF4D', background: 'rgba(202,255,77,.1)',
              border: '1px solid rgba(202,255,77,.3)', borderRadius: 6, padding: '3px 8px', fontWeight: 700, flexShrink: 0,
            }}>
              {connection.rounds_imported || 0}
            </span>
          )}
        </div>

        {needsPassword && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(239,68,68,.08)',
            border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '9px 11px', marginBottom: 12,
          }}>
            <AlertTriangle size={14} style={{ color: '#FCA5A5', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11.5, color: '#FCA5A5', lineHeight: 1.45 }}>{tl('fed_auth_error')}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {needsPassword ? (
            <button className="btn btn-sm" onClick={onConnect} style={{ flex: 1, background: '#CAFF4D', color: '#0A0A0B' }}>
              {tl('fed_reconnect')}
            </button>
          ) : (
            <button
              className="btn btn-sm"
              onClick={handleSync}
              disabled={syncing}
              style={{
                flex: 1, border: '1px solid rgba(202,255,77,.3)', background: 'rgba(202,255,77,.07)',
                color: '#CAFF4D', opacity: syncing ? .6 : 1,
              }}
            >
              <RefreshCw size={12} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? tl('fed_syncing') : tl('fed_sync_now')}
            </button>
          )}
          <button
            className="btn btn-sm"
            onClick={() => setConfirmOff(true)}
            style={{ border: '1px solid rgba(239,68,68,.3)', background: 'none', color: '#EF4444' }}
          >
            {tl('fed_disconnect')}
          </button>
        </div>
      </div>

      {confirmOff && (
        <div className="modal-bg" onClick={() => setConfirmOff(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="bb" style={{ fontSize: 22, marginBottom: 8 }}>{tl('fed_disconnect_title')}</div>
            <div style={{ fontSize: 12.5, color: '#787C8A', lineHeight: 1.5, marginBottom: 16 }}>
              {tl('fed_disconnect_desc')}
            </div>

            <button
              type="button"
              onClick={() => setAlsoDeleteData(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none',
                border: 'none', padding: '0 0 18px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                border: `1.5px solid ${alsoDeleteData ? '#EF4444' : '#2A2B30'}`,
                background: alsoDeleteData ? '#EF4444' : 'transparent',
              }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: alsoDeleteData ? '#fff' : '#787C8A' }}>
                {tl('fed_delete_data')}
              </span>
            </button>

            <button
              className="btn btn-primary"
              onClick={handleDisconnect}
              style={{ background: '#EF4444', color: '#fff', marginBottom: 8 }}
            >
              {tl('fed_disconnect_confirm')}
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirmOff(false)} style={{ fontSize: 13 }}>
              {tl('fed_cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
