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

export function toGameRow(round: FederationRound, userId: string, playerName: string): GameRow {
  const strokes = round.scorecard ?? [];
  const scores = Array.from({ length: HOLES }, (_, i) => ({
    hole: i + 1,
    par: PAR_HOLE,
    playerScores: { [ME]: strokes[i] ?? null },
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
    points: AWARD_POINTS && gross !== null ? pcPoints(strokes) : 0,
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
    federation_meta: {
      tournament: round.tournament,
      tournament_id: round.tournamentId,
      modality: round.modality,
      format: round.format,
      round: round.round,
      gross_strokes: round.grossStrokes,
      net_strokes: round.netStrokes,
      hcp_before: round.hcpBefore,
      hcp_after: round.hcpAfter,
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
function pcPoints(strokes: (number | null)[]): number {
  let total = 0;
  for (const value of strokes) {
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
