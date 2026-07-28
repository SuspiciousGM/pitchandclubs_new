import { supabase } from '../supabaseClient.js';

/* ─── FEDERATION (FCPP / pitch.cat) ──────────────────────────── */
// Thin client over the federation Edge Functions. Passwords are sent once,
// straight to the function, and never stored in the browser.

/** Maps an error code from the functions onto an i18n key. */
const ERROR_KEYS = {
  invalid_credentials: 'fed_err_credentials',
  federation_unavailable: 'fed_err_unavailable',
  consent_required: 'fed_err_consent',
  missing_credentials: 'fed_err_fields',
  not_connected: 'fed_err_generic',
};

export const errorKey = (code) => ERROR_KEYS[code] || 'fed_err_generic';

/**
 * Invokes an Edge Function and normalises failures into a code, since
 * invoke() hides the response body inside the error object.
 */
async function callFunction(name, body = {}) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return { data };

  let code = 'generic';
  try {
    const parsed = await error.context?.json?.();
    if (parsed?.error) code = parsed.error;
  } catch {
    // Network level failure, keep the generic code.
  }
  console.warn(`P&C: ${name} failed:`, code);
  return { code };
}

/** Current connection for the signed in user, or null. */
export async function getConnection() {
  const { data, error } = await supabase
    .from('federation_connections')
    .select('licencia, player_name, status, last_sync_at, last_error, rounds_imported')
    .maybeSingle();
  if (error) {
    console.warn('P&C: federation connection lookup failed:', error.message);
    return null;
  }
  return data;
}

/** Verifies the credentials against the federation and stores them. */
export const connect = ({ licencia, password, consent }) =>
  callFunction('federation-connect', { licencia, password, consent });

/** Imports every official round. Returns { total, imported, updated }. */
export const sync = () => callFunction('federation-sync');

export const disconnect = (deleteData = false) =>
  callFunction('federation-disconnect', { deleteData });

/** "fa 5m" style label for the last sync, in the active language. */
export function lastSyncLabel(isoDate, lang = 'ca') {
  if (!isoDate) return null;
  const minutes = Math.floor((Date.now() - new Date(isoDate)) / 60000);
  const units = {
    ca: { now: 'ara mateix', m: 'fa {n}m', h: 'fa {n}h', d: 'fa {n}d' },
    es: { now: 'ahora mismo', m: 'hace {n}m', h: 'hace {n}h', d: 'hace {n}d' },
    en: { now: 'just now', m: '{n}m ago', h: '{n}h ago', d: '{n}d ago' },
  }[lang] || { now: 'ara mateix', m: 'fa {n}m', h: 'fa {n}h', d: 'fa {n}d' };

  if (minutes < 1) return units.now;
  if (minutes < 60) return units.m.replace('{n}', minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return units.h.replace('{n}', hours);
  return units.d.replace('{n}', Math.floor(hours / 24));
}
