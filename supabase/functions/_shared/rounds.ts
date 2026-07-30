// Translates federation rounds into the shape the app already uses for
// games, so imported rounds render with the same components as manual ones.

import type { FederationRound } from "./pitchcat.ts";

/** Federation courses are 18 holes of par 3. */
const HOLES = 18;
const PAR_HOLE = 3;
const PAR_TOTAL = HOLES * PAR_HOLE;

/** Id used inside the players/scores blobs for the owner of the card. */
const ME = "me";

/**
 * What a raya (X on the card) is worth in gross strokes.
 *
 * Verified against a full history: for individual rounds, the sum of the card
 * with each raya counted as 5 matches the federation's own gross total (CB)
 * exactly. The handicap of the hole decides when a player may stop, not what
 * the stroke count ends up being.
 */
const RAYA_STROKES = 5;

/**
 * Whether imported rounds award P&C points.
 *
 * Off for now: importing a long history would otherwise reshuffle the
 * ranking the moment someone connects their account. How official rounds
 * should score is a product decision of its own (see docs/plan-integracio-federacio.md).
 */
const AWARD_POINTS = false;

export interface GameRow {
  user_id: string;
  source: "federation";
  federation_round_id: string;
  course_name: string;
  player_name: string;
  date: string;
  game_mode: string;
  holes: number;
  par: number;
  players: unknown;
  scores: unknown;
  score_total: number | null;
  is_live: false;
  federation_meta: unknown;
  /** Backdated to the day it was played so the feed stays chronological. */
  created_at: string;
}

export interface HandicapRow {
  user_id: string;
  date: string;
  hcp_exact: number;
  source: "federation";
  round_id: string;
}

/** Maps the federation modality/format codes onto the app's game modes. */
export function toGameMode(round: FederationRound): string {
  if (round.modality && round.modality !== "IN") return "parelles";
  return round.format === "ME" ? "medal" : "stableford";
}

interface ResolvedCard {
  /** Strokes per hole once rayas are priced in, or null when unusable. */
  holes: (number | null)[] | null;
  /** True when the card adds up to the federation's own gross total. */
  reconciled: boolean;
}

/**
 * Decides whether the hole by hole card can be shown as the player's own.
 *
 * In pairs formats the card published next to a result is the team's ball, not
 * the player's, so it does not add up to their individual gross. Rather than
 * guessing from the modality code, this checks the arithmetic: a card is only
 * used when it reconciles with the official total, which keeps the hole grid
 * and the score in the app consistent by construction.
 */
export function resolveCard(round: FederationRound): ResolvedCard {
  if (!round.scorecard) return { holes: null, reconciled: false };

  const rayas = new Set(round.rayaHoles);
  const holes = round.scorecard.map((strokes, i) =>
    strokes ?? (rayas.has(i) ? RAYA_STROKES : null)
  );

  const total = holes.reduce((sum: number, value) => sum + (value ?? 0), 0);
  const reconciled = round.grossStrokes !== null && total === round.grossStrokes;

  return { holes: reconciled ? holes : null, reconciled };
}

export function toGameRow(round: FederationRound, userId: string, playerName: string): GameRow {
  const { holes, reconciled } = resolveCard(round);

  const scores = Array.from({ length: HOLES }, (_, i) => ({
    hole: i + 1,
    par: PAR_HOLE,
    playerScores: { [ME]: holes?.[i] ?? null },
  }));

  const gross = round.grossStrokes;
  const diff = gross === null ? null : gross - PAR_TOTAL;

  const player = {
    id: ME,
    name: playerName,
    isMe: true,
    userId,
    score: gross,
    diff,
    points: AWARD_POINTS && holes ? pcPoints(holes) : 0,
    hcp: round.hcpAfter,
  };

  return {
    user_id: userId,
    source: "federation",
    federation_round_id: round.roundId,
    course_name: round.course || round.tournament,
    player_name: playerName,
    date: round.date,
    game_mode: toGameMode(round),
    holes: HOLES,
    par: PAR_TOTAL,
    players: [player],
    scores,
    // The app stores the difference to par here, not the raw stroke count.
    score_total: diff === null ? null : clamp(diff, -PAR_TOTAL, 300),
    is_live: false,
    created_at: round.date,
    federation_meta: {
      tournament: round.tournament,
      tournament_id: round.tournamentId,
      modality: round.modality,
      format: round.format,
      round: round.round,
      gross_strokes: round.grossStrokes,
      net_strokes: round.netStrokes,
      // Official result: stableford points when format is ST, strokes when ME.
      result_gross: round.resultGross,
      result_net: round.resultNet,
      playing_hcp: round.playingHcp,
      hcp_before: round.hcpBefore,
      hcp_after: round.hcpAfter,
      raya_holes: round.rayaHoles,
      /** False when the published card belongs to the pair, not the player. */
      scorecard_is_own: reconciled,
      /** Kept even when unusable as an own card, for the pairs views to come. */
      published_scorecard: round.scorecard,
    },
  };
}

export function toHandicapRow(round: FederationRound, userId: string): HandicapRow | null {
  if (round.hcpAfter === null) return null;
  return {
    user_id: userId,
    date: round.date,
    hcp_exact: round.hcpAfter,
    source: "federation",
    round_id: round.roundId,
  };
}

/** Same scale as utils/helpers.js calcPCPoints, kept in sync by hand. */
function pcPoints(holes: (number | null)[]): number {
  let total = 0;
  for (const value of holes) {
    if (value === null) continue;
    const diff = value - PAR_HOLE;
    if (diff <= -2) total += 25;
    else if (diff === -1) total += 12;
    else if (diff === 0) total += 6;
    else if (diff === 1) total += 2;
    else if (diff === 2) total -= 3;
    else total -= 8;
  }
  return total;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
