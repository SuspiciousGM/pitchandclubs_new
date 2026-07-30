// Tests for the pitch.cat HTML parsing, against a fixture shaped like the
// federation's results page. The live site cannot be reached from CI, so this
// is what guards the parser when their markup drifts.
//
// Run with: deno test supabase/functions/_shared/

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { parseResultsPage } from "./pitchcat.ts";
import { resolveCard, toGameMode, toGameRow, toHandicapRow } from "./rounds.ts";

interface Entry {
  tr: string;
  detail?: string;
}

/**
 * Builds a results page. The hover cards live outside the results table:
 * a div nested inside a table gets hoisted out and emptied by any HTML
 * parser, so the real page cannot be shaped that way either.
 */
function fixture(entries: Entry[]): string {
  return `<html><body>
    <table class="llistat">${entries.map((e) => e.tr).join("")}</table>
    ${entries.map((e) => e.detail ?? "").join("")}
  </body></html>`;
}

const STROKES = [3, 2, 3, 4, 3, 3, 5, 3, 2, 3, 3, 4, 3, "X", 3, 3, 4, 3];

function scorecardDiv(id: string, strokes: (number | string)[] = STROKES): string {
  const holeNumbers = Array.from({ length: 18 }, (_, i) => `<td>${i + 1}</td>`).join("");
  return `<div id="${id}"><table>
    <tr>${strokes.map((s) => `<td>${s}</td>`).join("")}</tr>
    <tr>${holeNumbers}</tr>
  </table></div>`;
}

function row(opts: {
  date?: string;
  tournament?: string;
  course?: string;
  modality?: string;
  format?: string;
  round?: string;
  hcpBefore?: string;
  hcpAfter?: string;
  gross?: string;
  net?: string;
  tournamentId?: string;
  detailId?: string;
} = {}): Entry {
  const {
    date = "14.06.2025", tournament = "Trofeu Sant Joan", course = "Pitch & Putt Badalona",
    modality = "IN", format = "ST", round = "1", hcpBefore = "12,4", hcpAfter = "11,9",
    // 17 holes add up to 54 and the raya is worth 5, so the card reconciles at 59.
    gross = "59", net = "46", tournamentId = "4821", detailId = "detall_1",
  } = opts;

  const link = `<a href="/jugador/resultats/torneig.php?id=${tournamentId}"
    onmouseover="mostra('${detailId}', event)">${tournament}</a>`;

  return {
    tr: `<tr class="fila">
      <td>${date}</td><td>${link}</td><td>${course}</td><td>${modality}</td><td>${format}</td>
      <td>${round}</td><td>13</td><td>13</td><td>4</td><td>8</td>
      <td>${hcpBefore}</td><td>${hcpAfter}</td><td>-</td><td>${gross}</td><td>${net}</td>
    </tr>`,
    detail: scorecardDiv(detailId),
  };
}

/** A row with no hover card and no tournament link. */
function plainRow(cells: string[]): Entry {
  return { tr: `<tr class="fila">${cells.map((c) => `<td>${c}</td>`).join("")}</tr>` };
}

Deno.test("parses the fields of a results row", () => {
  const [round] = parseResultsPage(fixture([row()]));

  assertExists(round);
  assertEquals(round.date, "2025-06-14");
  assertEquals(round.tournament, "Trofeu Sant Joan");
  assertEquals(round.course, "Pitch & Putt Badalona");
  assertEquals(round.modality, "IN");
  assertEquals(round.format, "ST");
  assertEquals(round.hcpBefore, 12.4);
  assertEquals(round.hcpAfter, 11.9);
  assertEquals(round.grossStrokes, 59);
  assertEquals(round.netStrokes, 46);
  assertEquals(round.tournamentId, "4821");
});

Deno.test("reads 18 holes and reports the raya separately", () => {
  const [round] = parseResultsPage(fixture([row()]));

  assertEquals(round.scorecard?.length, 18);
  assertEquals(round.scorecard?.[0], 3);
  assertEquals(round.scorecard?.[13], null); // the "X"
  assertEquals(round.scorecard?.[17], 3);
  assertEquals(round.rayaHoles, [13]);
});

Deno.test("reads the official result and playing handicap columns", () => {
  const [round] = parseResultsPage(fixture([row()]));

  assertEquals(round.playingHcp, 13);
  assertEquals(round.resultGross, 4);
  assertEquals(round.resultNet, 8);
  assertEquals(round.netStrokes, 46);
});

Deno.test("round id is deterministic and distinguishes rounds of a tournament", () => {
  const [first] = parseResultsPage(fixture([row({ round: "1" })]));
  const [second] = parseResultsPage(fixture([row({ round: "2" })]));
  const [again] = parseResultsPage(fixture([row({ round: "1" })]));

  assertEquals(first.roundId, again.roundId);
  assertEquals(first.roundId === second.roundId, false);
  assertEquals(first.roundId, "2025-06-14_4821_1_IN");
});

Deno.test("falls back to the tournament name when there is no id", () => {
  const html = fixture([plainRow([
    "01.03.2025", "Lliga d'Hivern", "Camp Test", "IN", "ME",
    "1", "13", "13", "4", "8", "12,0", "12,0", "-", "60", "48",
  ])]);

  const [round] = parseResultsPage(html);
  assertEquals(round.tournamentId, null);
  assertEquals(round.roundId, "2025-03-01_lliga-d-hivern_1_IN");
});

Deno.test("skips malformed rows instead of throwing", () => {
  const html = fixture([plainRow(["bad", "too short"]), row()]);

  assertEquals(parseResultsPage(html).length, 1);
});

Deno.test("orders nothing and returns empty when the table is missing", () => {
  assertEquals(parseResultsPage("<html><body>no table</body></html>"), []);
});

Deno.test("maps federation codes onto the app's game modes", () => {
  assertEquals(toGameMode({ modality: "IN", format: "ST" } as never), "stableford");
  assertEquals(toGameMode({ modality: "IN", format: "ME" } as never), "medal");
  assertEquals(toGameMode({ modality: "FB", format: "ST" } as never), "parelles");
  assertEquals(toGameMode({ modality: "GR", format: "ME" } as never), "parelles");
});

Deno.test("builds a games row the app can render", () => {
  const [round] = parseResultsPage(fixture([row()]));
  const game = toGameRow(round, "user-uuid", "Marc");

  assertEquals(game.source, "federation");
  assertEquals(game.holes, 18);
  assertEquals(game.par, 54);
  assertEquals(game.is_live, false);
  assertEquals(game.course_name, "Pitch & Putt Badalona");
  assertEquals(game.score_total, 5); // 59 strokes over a par of 54

  const scores = game.scores as { hole: number; par: number; playerScores: Record<string, number | null> }[];
  assertEquals(scores.length, 18);
  assertEquals(scores[0].playerScores.me, 3);
  assertEquals(scores[13].playerScores.me, 5); // the raya, priced in

  const players = game.players as { isMe: boolean; name: string; diff: number; score: number }[];
  assertEquals(players.length, 1);
  assertEquals(players[0].isMe, true);
  assertEquals(players[0].name, "Marc");
  assertEquals(players[0].score, 59);
  assertEquals(players[0].diff, 5);
});

Deno.test("backdates created_at to the day the round was played", () => {
  const [round] = parseResultsPage(fixture([row()]));
  assertEquals(toGameRow(round, "user-uuid", "Marc").created_at, "2025-06-14");
});

Deno.test("a card that reconciles with the gross total is treated as the player's", () => {
  const [round] = parseResultsPage(fixture([row()]));
  const { holes, reconciled } = resolveCard(round);

  assertEquals(reconciled, true);
  assertEquals(holes?.length, 18);
  assertEquals(holes?.[13], 5);
});

Deno.test("a pairs card that does not add up is not shown as the player's own", () => {
  // Same card, but the player's own gross is lower: this is the team's ball,
  // which is what the federation publishes for FourBall rounds.
  const [round] = parseResultsPage(fixture([row({ modality: "FB", gross: "51" })]));
  const { holes, reconciled } = resolveCard(round);

  assertEquals(reconciled, false);
  assertEquals(holes, null);

  const game = toGameRow(round, "user-uuid", "Marc");
  const scores = game.scores as { playerScores: Record<string, number | null> }[];

  // No misleading hole grid, but the official total is still recorded.
  assertEquals(scores.every((s) => s.playerScores.me === null), true);
  assertEquals(game.score_total, -3);
  assertEquals(game.game_mode, "parelles");

  const meta = game.federation_meta as { scorecard_is_own: boolean; published_scorecard: unknown };
  assertEquals(meta.scorecard_is_own, false);
  assertEquals(Array.isArray(meta.published_scorecard), true);
});

Deno.test("handicap row tracks the exact handicap after the round", () => {
  const [round] = parseResultsPage(fixture([row({ hcpAfter: "10,3" })]));
  const hcp = toHandicapRow(round, "user-uuid");

  assertEquals(hcp?.hcp_exact, 10.3);
  assertEquals(hcp?.date, "2025-06-14");
  assertEquals(hcp?.round_id, round.roundId);
});

Deno.test("no handicap row when the federation publishes no handicap", () => {
  const html = fixture([plainRow([
    "01.03.2025", "Social", "Camp Test", "IN", "ST",
    "1", "13", "13", "4", "8", "-", "-", "-", "60", "48",
  ])]);

  const [round] = parseResultsPage(html);
  assertEquals(round.hcpAfter, null);
  assertEquals(toHandicapRow(round, "user-uuid"), null);
});
