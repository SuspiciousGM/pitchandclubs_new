// Client for the Catalan federation site (pitch.cat).
//
// The site has no API, so this reads the player area over plain HTTP and
// parses the HTML. Two things make it awkward and are handled here:
//   1. Responses are latin-1, not UTF-8. Decoding as UTF-8 mangles accents.
//   2. The session lives in a cookie that fetch() does not persist on its
//      own, so redirects are followed by hand while keeping the jar.
//
// Ported from the Python reporting script (pitch_stats.py).

import { DOMParser, type Element } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

const BASE = "https://www.pitch.cat";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
const TIMEOUT_MS = 30_000;

/**
 * Columns of the results table, as published by the federation:
 * Data | Torneig | Camp | Mod. | For. | V. | HPJ | HPP | RB | RN | HPEI | HPEF | . | CB | CN |
 */
const COL = {
  date: 0,
  tournament: 1,
  course: 2,
  modality: 3,
  format: 4,
  round: 5,
  playingHcp: 6, // HPJ, handicap de joc
  pairHcp: 7, // HPP
  resultGross: 8, // RB, stableford points in ST, strokes in ME
  resultNet: 9, // RN
  hcpBefore: 10, // HPEI, handicap exacte inicial
  hcpAfter: 11, // HPEF, handicap exacte final
  grossStrokes: 13, // CB, cops bruts
  netStrokes: 14, // CN, cops nets
} as const;

/** Round as published by the federation. Strokes are per hole, par is always 3. */
export interface FederationRound {
  /** Stable identity used to deduplicate across syncs. */
  roundId: string;
  date: string; // ISO yyyy-mm-dd
  tournament: string;
  course: string;
  /** Modality code: IN individual, FB/FS/GR/GH/CC pairs. */
  modality: string;
  /** Format code: ST stableford, ME medal. */
  format: string;
  round: string;
  /** Gross strokes for the round, null when the federation does not publish them. */
  grossStrokes: number | null;
  netStrokes: number | null;
  /** Official result: stableford points when format is ST, strokes when ME. */
  resultGross: number | null;
  resultNet: number | null;
  /** Playing handicap for this round. */
  playingHcp: number | null;
  /** Exact handicap before and after the round. */
  hcpBefore: number | null;
  hcpAfter: number | null;
  /**
   * 18 entries: strokes per hole. A hole the player gave up on ("raya", shown
   * as X) is null here and listed in rayaHoles instead.
   */
  scorecard: (number | null)[] | null;
  /** Indices (0 based) of the holes marked as raya. */
  rayaHoles: number[];
  tournamentId: string | null;
}

export class PitchCatError extends Error {
  constructor(message: string, readonly code: "auth" | "unavailable" | "parse") {
    super(message);
    this.name = "PitchCatError";
  }
}

const decoder = new TextDecoder("iso-8859-1");

export class PitchCatClient {
  #cookies = new Map<string, string>();
  #firstPage: string | null = null;

  constructor(private licencia: string, private password: string) {}

  /** Logs in and confirms the player area is reachable. */
  async login(): Promise<void> {
    const body = new URLSearchParams({
      accio: "entrar",
      LOGIN: this.licencia,
      PASSWD: this.password,
      action: "entrar",
      url: "",
    });

    await this.#request("/login.php", {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });

    const results = await this.#request("/jugador/resultats/resultats.php");

    // The player area always renders the results table. Getting the login
    // form back instead means the credentials were rejected.
    if (!results.includes("llistat")) {
      if (results.includes("PASSWD") && results.includes("LOGIN")) {
        throw new PitchCatError("Credencials incorrectes", "auth");
      }
      throw new PitchCatError("Resposta inesperada de la federacio", "parse");
    }

    this.#firstPage = results;
  }

  /** Player name as shown by the federation, falling back to the licence. */
  playerName(): string {
    if (!this.#firstPage) return this.licencia;
    const doc = parse(this.#firstPage);
    const option = doc?.querySelector("select option");
    const name = option?.textContent?.trim();
    return name || this.licencia;
  }

  /**
   * Every round in the player's history, oldest first.
   *
   * Scorecards are embedded in the same pages as the result rows, so this
   * needs one request per page of results and nothing else.
   */
  async fetchRounds(): Promise<FederationRound[]> {
    if (!this.#firstPage) throw new PitchCatError("login() must run first", "parse");

    const pageNumbers = [...this.#firstPage.matchAll(/pag=(\d+)/g)].map((m) => Number(m[1]));
    const lastPage = pageNumbers.length ? Math.max(...pageNumbers) : 1;

    const rounds: FederationRound[] = [];
    for (let page = 1; page <= lastPage; page++) {
      const html = page === 1
        ? this.#firstPage
        : await this.#request(`/jugador/resultats/resultats.php?pag=${page}`);

      rounds.push(...parseResultsPage(html));
    }

    rounds.sort((a, b) => a.date.localeCompare(b.date));
    return rounds;
  }

  async #request(path: string, init?: RequestInit): Promise<string> {
    let url = path.startsWith("http") ? path : BASE + path;
    let response: Response | null = null;

    // Follow redirects by hand: fetch() drops our cookie jar otherwise.
    for (let hop = 0; hop < 5; hop++) {
      const headers = new Headers(init?.headers);
      headers.set("user-agent", UA);
      if (this.#cookies.size) headers.set("cookie", this.#cookieHeader());

      const signal = AbortSignal.timeout(TIMEOUT_MS);
      try {
        response = await fetch(url, {
          ...(hop === 0 ? init : {}),
          headers,
          redirect: "manual",
          signal,
        });
      } catch (cause) {
        throw new PitchCatError(`No s'ha pogut connectar amb pitch.cat: ${cause}`, "unavailable");
      }

      this.#storeCookies(response);

      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        url = new URL(location, url).toString();
        continue;
      }
      break;
    }

    if (!response) throw new PitchCatError("Sense resposta de pitch.cat", "unavailable");
    if (response.status >= 500) {
      throw new PitchCatError(`La federacio ha respost ${response.status}`, "unavailable");
    }

    return decoder.decode(await response.arrayBuffer());
  }

  #cookieHeader(): string {
    return [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; ");
  }

  #storeCookies(response: Response): void {
    for (const raw of response.headers.getSetCookie()) {
      const [pair] = raw.split(";");
      const separator = pair.indexOf("=");
      if (separator < 1) continue;
      this.#cookies.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
    }
  }
}

// ── Parsing ───────────────────────────────────────────────────

function parse(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

export function parseResultsPage(html: string): FederationRound[] {
  const doc = parse(html);
  if (!doc) return [];

  const table = doc.querySelector("table.llistat");
  if (!table) return [];

  const rounds: FederationRound[] = [];
  for (const row of table.querySelectorAll("tr.fila")) {
    const round = parseRow(row as unknown as Element, doc as unknown as Element);
    if (round) rounds.push(round);
  }
  return rounds;
}

function parseRow(row: Element, doc: Element): FederationRound | null {
  const cells = [...row.querySelectorAll("td")] as unknown as Element[];
  if (cells.length < 15) return null;

  const text = (i: number) => cells[i]?.textContent?.replace(/\s+/g, " ").trim() ?? "";

  const date = parseDate(text(COL.date));
  if (!date) return null;

  const link = cells[COL.tournament].querySelector("a");
  const tournamentId = link?.getAttribute("href")?.match(/id=(\d+)/)?.[1] ?? null;

  // The hole by hole card sits in a hidden div, revealed on hover.
  const detailId = link?.getAttribute("onmouseover")?.match(/mostra\('(detall_\d+)'/)?.[1] ?? null;
  const detail = detailId ? doc.querySelector(`#${detailId}`) : null;
  const card = detail ? parseScorecard(detail as unknown as Element) : null;

  const tournament = text(COL.tournament);
  const modality = text(COL.modality);
  const round = text(COL.round);

  return {
    roundId: buildRoundId(date, tournamentId, tournament, round, modality),
    date,
    tournament,
    course: text(COL.course),
    modality,
    format: text(COL.format),
    round,
    playingHcp: toInt(text(COL.playingHcp)),
    resultGross: toInt(text(COL.resultGross)),
    resultNet: toInt(text(COL.resultNet)),
    hcpBefore: toFloat(text(COL.hcpBefore)),
    hcpAfter: toFloat(text(COL.hcpAfter)),
    grossStrokes: toInt(text(COL.grossStrokes)),
    netStrokes: toInt(text(COL.netStrokes)),
    scorecard: card?.strokes ?? null,
    rayaHoles: card?.rayaHoles ?? [],
    tournamentId,
  };
}

/**
 * The federation exposes no round id, so identity is derived from the
 * fields that cannot change for a played round.
 */
function buildRoundId(
  date: string,
  tournamentId: string | null,
  tournament: string,
  round: string,
  modality: string,
): string {
  const tournamentKey = tournamentId ?? slug(tournament);
  return [date, tournamentKey, round || "1", modality || "IN"].join("_");
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "torneig";
}

export interface ParsedCard {
  /** Strokes per hole; null where the player drew a raya. */
  strokes: (number | null)[];
  rayaHoles: number[];
}

/**
 * Reads the 18 hole strokes out of a scorecard table. The strokes row sits
 * directly above the row of hole numbers ("1", "2", "3", ...).
 *
 * An "X" means raya: the player stopped playing the hole because they could
 * no longer score a stableford point. It is kept separate from a real stroke
 * count, and the caller decides what it is worth.
 */
export function parseScorecard(container: Element): ParsedCard | null {
  const table = container.querySelector("table");
  if (!table) return null;

  const rows = [...table.querySelectorAll("tr")] as unknown as Element[];
  const cellsOf = (row: Element) =>
    ([...row.querySelectorAll("td, th")] as unknown as Element[])
      .map((c) => c.textContent?.trim() ?? "");

  const headerIndex = rows.findIndex((row) => {
    const [a, b, c] = cellsOf(row);
    return a === "1" && b === "2" && c === "3";
  });

  const strokesRow = headerIndex > 0 ? rows[headerIndex - 1] : rows[0];
  if (!strokesRow) return null;

  const strokes: (number | null)[] = [];
  const rayaHoles: number[] = [];

  for (const cell of cellsOf(strokesRow)) {
    if (/^\d+$/.test(cell)) {
      strokes.push(Number(cell));
    } else if (cell.toUpperCase() === "X") {
      rayaHoles.push(strokes.length);
      strokes.push(null);
    }
  }

  if (!strokes.length) return null;
  return {
    strokes: strokes.length >= 18 ? strokes.slice(0, 18) : strokes,
    rayaHoles: rayaHoles.filter((i) => i < 18),
  };
}

function parseDate(value: string): string | null {
  const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function toInt(value: string): number | null {
  const match = value.replace(/\./g, "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function toFloat(value: string): number | null {
  const match = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}
