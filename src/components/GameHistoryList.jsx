import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { t } from '../data/i18n.js';
import { fmtScore, scoreColor } from '../utils/helpers.js';

/* ─── GAME HISTORY ────────────────────────────────────────────
   One list for both sources of rounds: entered by hand in the app and
   imported from the federation, filterable by origin.
──────────────────────────────────────────────────────────────── */

const FILTERS = [
  { id: 'all', key: 'hist_all' },
  { id: 'federation', key: 'hist_official' },
  { id: 'manual', key: 'hist_friendly' },
];

export default function GameHistoryList({ history, lang, limit = 20 }) {
  const tl = (k, v = {}) => t(lang, k, v);
  const [filter, setFilter] = useState('all');

  const mine = (history || []).filter(g => g.players?.some(p => p.isMe));
  const officialCount = mine.filter(g => g.source === 'federation').length;

  const rounds = (filter === 'all' ? mine : mine.filter(g => (g.source || 'manual') === filter)).slice(0, limit);

  return (
    <div className="card" style={{ marginBottom: 12, padding: 14 }}>
      <div style={{ fontSize: 10, color: '#555761', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        {tl('hist_title')}
      </div>

      {/* The origin filter is only meaningful once official rounds exist */}
      {officialCount > 0 && (
        <div className="live-tab-bar" style={{ marginBottom: 12 }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`live-tab${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {tl(f.key)}
            </button>
          ))}
        </div>
      )}

      {rounds.length === 0 ? (
        <div style={{ fontSize: 11, color: '#555761', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
          {tl('hist_empty')}
        </div>
      ) : (
        rounds.map(game => <HistoryRow key={game.id} game={game} lang={lang} />)
      )}
    </div>
  );
}

function HistoryRow({ game, lang }) {
  const me = game.players.find(p => p.isMe);
  const isOfficial = game.source === 'federation';
  const diff = me?.diff;
  const hasScore = diff !== null && diff !== undefined && !isNaN(parseFloat(diff));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #111214' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 12.5, fontWeight: 600, color: '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {game.course}
          </span>
          {isOfficial && <ShieldCheck size={12} style={{ color: '#CAFF4D', flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: 10.5, color: '#555761', marginTop: 2 }}>
          {formatDate(game.date, lang)}
          {isOfficial && game.federationMeta?.tournament ? ` · ${game.federationMeta.tournament}` : ''}
        </div>
      </div>

      {hasScore && (
        <div className="bb" style={{ fontSize: 19, color: scoreColor(parseFloat(diff)), flexShrink: 0 }}>
          {fmtScore(parseFloat(diff))}
        </div>
      )}
    </div>
  );
}

function formatDate(value, lang) {
  if (!value) return '';
  const date = new Date(value.includes('/') ? value.split('/').reverse().join('-') : value);
  if (isNaN(date)) return value;
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : lang === 'es' ? 'es-ES' : 'ca-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
