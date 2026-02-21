import type { Tool } from "@anthropic-ai/sdk/resources";
import { cfbdFetch } from "./cfbd";

export const cfbdTools: Tool[] = [
  {
    name: "cfbd_get_teams",
    description:
      "Get a list of FBS college football teams. Optionally filter by conference. Use this to look up team names or get a full conference roster.",
    input_schema: {
      type: "object" as const,
      properties: {
        conference: {
          type: "string",
          description:
            "Conference abbreviation (e.g., 'SEC', 'Big Ten', 'ACC', 'Big 12', 'Pac-12', 'AAC', 'Mountain West')",
        },
      },
    },
  },
  {
    name: "cfbd_get_team_stats",
    description:
      "Get season team statistics for offense and defense. Includes rushing yards, passing yards, points scored, points allowed, turnovers, and many other stats. Requires a year.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (required, e.g., 2023)" },
        team: { type: "string", description: "Team name filter" },
        conference: { type: "string", description: "Conference abbreviation filter" },
        startWeek: { type: "integer", description: "Start week for partial-season stats" },
        endWeek: { type: "integer", description: "End week for partial-season stats" },
      },
      required: ["year"],
    },
  },
  {
    name: "cfbd_get_games",
    description:
      "Get game results and schedules. Returns scores, home/away teams, venue, and other game details. Requires a year. Use seasonType 'postseason' for bowl games and playoffs.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (required, e.g., 2023)" },
        week: { type: "integer", description: "Week number" },
        seasonType: {
          type: "string",
          description: "'regular', 'postseason', or 'both'. Defaults to regular.",
        },
        team: { type: "string", description: "Filter by either team name" },
        home: { type: "string", description: "Filter by home team name" },
        away: { type: "string", description: "Filter by away team name" },
        conference: { type: "string", description: "Filter by conference abbreviation" },
      },
      required: ["year"],
    },
  },
  {
    name: "cfbd_get_rankings",
    description:
      "Get AP Poll, Coaches Poll, and CFP rankings for a given week and season. Returns top-25 teams with their rank and points.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (required, e.g., 2023)" },
        week: { type: "integer", description: "Week number (omit for final rankings)" },
        seasonType: {
          type: "string",
          description: "'regular' or 'postseason'. Defaults to regular.",
        },
      },
      required: ["year"],
    },
  },
  {
    name: "cfbd_get_recruiting_teams",
    description:
      "Get team recruiting class rankings by year. Returns composite recruiting score and national rank. Good for tracking recruiting trends over time.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: {
          type: "integer",
          description: "Recruiting class year (e.g., 2023 = class of 2023)",
        },
        team: { type: "string", description: "Filter by team name" },
      },
    },
  },

  // ── Phase 5: Expanded tool coverage ────────────────────────────────────────

  {
    name: "cfbd_get_player_season_stats",
    description:
      "Get season-level player statistics (rushing yards, passing yards, receiving yards, tackles, sacks, interceptions, etc.) for individual players. Use when asked about individual player performance over a full season, top statistical leaders, or comparing players by stat category. Requires a year.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (required, e.g., 2023)" },
        team: { type: "string", description: "Filter by team name" },
        conference: { type: "string", description: "Conference abbreviation filter" },
        startWeek: { type: "integer", description: "Start week for partial-season stats" },
        endWeek: { type: "integer", description: "End week for partial-season stats" },
        seasonType: {
          type: "string",
          description: "'regular', 'postseason', or 'both'. Defaults to regular.",
        },
        category: {
          type: "string",
          description:
            "Stat category: 'passing', 'rushing', 'receiving', 'fumbles', 'defensive', 'interceptions', 'punting', 'kicking', 'kickReturns', 'puntReturns'",
        },
      },
      required: ["year"],
    },
  },
  {
    name: "cfbd_get_player_game_stats",
    description:
      "Get individual player statistics for specific games. Returns per-game box score stats for players (passing, rushing, receiving, defense, etc.). Use when asked how a player performed in a particular game or week.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (required, e.g., 2023)" },
        week: { type: "integer", description: "Week number" },
        team: { type: "string", description: "Filter by team name" },
        conference: { type: "string", description: "Conference abbreviation filter" },
        category: {
          type: "string",
          description:
            "Stat category: 'passing', 'rushing', 'receiving', 'fumbles', 'defensive', 'interceptions', 'punting', 'kicking', 'kickReturns', 'puntReturns'",
        },
        seasonType: {
          type: "string",
          description: "'regular' or 'postseason'. Defaults to regular.",
        },
        gameId: { type: "integer", description: "Specific game ID to retrieve player stats for" },
      },
      required: ["year"],
    },
  },
  {
    name: "cfbd_get_ppa_teams",
    description:
      "Get team-level Predicted Points Added (PPA) advanced efficiency metrics. PPA measures how much a team's plays increase or decrease expected points. Includes overall, passing, and rushing PPA for offense and defense. Use when asked about team efficiency, advanced metrics, or expected points.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (e.g., 2023)" },
        team: { type: "string", description: "Filter by team name" },
        conference: { type: "string", description: "Conference abbreviation filter" },
        excludeGarbageTime: {
          type: "boolean",
          description: "Exclude garbage time plays from calculations (default false)",
        },
      },
    },
  },
  {
    name: "cfbd_get_betting_lines",
    description:
      "Get betting lines, spreads, and over/unders for games. Returns point spreads, money lines, and totals from multiple sportsbooks. Use when asked about betting lines, point spreads, favorites/underdogs, over/unders, or ATS performance.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (e.g., 2023)" },
        week: { type: "integer", description: "Week number" },
        seasonType: {
          type: "string",
          description: "'regular' or 'postseason'. Defaults to regular.",
        },
        team: { type: "string", description: "Filter by team name (home or away)" },
        home: { type: "string", description: "Filter by home team name" },
        away: { type: "string", description: "Filter by away team name" },
        conference: { type: "string", description: "Conference abbreviation filter" },
      },
    },
  },
  {
    name: "cfbd_get_matchup_history",
    description:
      "Get head-to-head historical matchup records between two specific teams. Returns all historical games played between the two teams including scores, outcomes, and overall series record. Use when asked about historical rivalry records, all-time series, or head-to-head history.",
    input_schema: {
      type: "object" as const,
      properties: {
        team1: {
          type: "string",
          description: "First team name (required, e.g., 'Alabama')",
        },
        team2: {
          type: "string",
          description: "Second team name (required, e.g., 'Auburn')",
        },
        minYear: { type: "integer", description: "Earliest year to include in history" },
        maxYear: { type: "integer", description: "Latest year to include in history" },
      },
      required: ["team1", "team2"],
    },
  },
  {
    name: "cfbd_get_transfer_portal",
    description:
      "Get transfer portal entries for a given year. Returns players who entered the transfer portal including their origin school, destination school, position, and transfer rating. Use when asked about transfers, portal activity, or players who transferred.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: {
          type: "integer",
          description: "Year of transfer portal activity (required, e.g., 2023)",
        },
      },
      required: ["year"],
    },
  },
  {
    name: "cfbd_get_draft_picks",
    description:
      "Get NFL draft picks from college football players. Returns draft selections with round, pick number, NFL team, college, position, and player name. Use when asked about NFL draft picks, draft history, how many players a school has sent to the NFL, or draft production by school/conference.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "NFL draft year (e.g., 2023)" },
        nflTeam: { type: "string", description: "Filter by NFL team name" },
        college: { type: "string", description: "Filter by college/university name" },
        conference: { type: "string", description: "Filter by college conference abbreviation" },
        position: {
          type: "string",
          description: "Filter by position (e.g., 'QB', 'RB', 'WR', 'CB', 'DE')",
        },
      },
    },
  },
  {
    name: "cfbd_get_coaches",
    description:
      "Get coaching history and records for college football coaches. Returns coaches with their seasons, schools, win/loss records, and years. Use when asked about a coach's career record, coaching history, who coached a team in a given year, or which coaches have the best records.",
    input_schema: {
      type: "object" as const,
      properties: {
        firstName: { type: "string", description: "Coach's first name" },
        lastName: { type: "string", description: "Coach's last name" },
        team: { type: "string", description: "Filter by team the coach worked at" },
        year: { type: "integer", description: "Filter by a specific year" },
        minYear: { type: "integer", description: "Earliest year to include" },
        maxYear: { type: "integer", description: "Latest year to include" },
      },
    },
  },
  {
    name: "cfbd_get_roster",
    description:
      "Get the roster for a team in a given year. Returns players with name, position, height, weight, year in school (freshman/sophomore/etc.), hometown, and home state. Use when asked about a team's roster, player details, positional depth, or where players are from.",
    input_schema: {
      type: "object" as const,
      properties: {
        team: {
          type: "string",
          description: "Team name (required, e.g., 'Alabama')",
        },
        year: { type: "integer", description: "Season year (e.g., 2023)" },
      },
      required: ["team"],
    },
  },
  {
    name: "cfbd_get_recruiting_players",
    description:
      "Get individual player recruiting rankings and ratings. Returns recruit name, star rating, composite score, position, hometown, state, and committed school. Use when asked about top recruits, player recruiting rankings, recruiting classes by position, or specific recruiting prospects.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Recruiting class year (e.g., 2023 = class of 2023)" },
        classification: {
          type: "string",
          description: "Recruit type: 'HighSchool', 'JUCO', or 'PrepSchool'",
        },
        position: {
          type: "string",
          description: "Position filter (e.g., 'QB', 'RB', 'WR', 'OT', 'CB', 'DE')",
        },
        team: { type: "string", description: "Filter by committed school" },
        state: { type: "string", description: "Filter by home state (e.g., 'TX', 'FL', 'CA')" },
      },
    },
  },
  {
    name: "cfbd_get_venues",
    description:
      "Get a list of all college football stadium and venue information. Returns venue name, capacity, city, state, grass/turf surface, dome/outdoor status, and GPS coordinates. Use when asked about stadiums, venues, arena capacity, or where teams play.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "cfbd_get_conferences",
    description:
      "Get a list of all college football conferences with their names, short names, and abbreviations. Use when asked about conference listings, conference names, or to look up how a conference is abbreviated.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "cfbd_get_ratings_sp",
    description:
      "Get SP+ ratings for teams. SP+ is an advanced efficiency rating system that accounts for opponent strength. Higher is better. Use when asked about SP+ ratings, advanced team efficiency, predictive ratings, or Bill Connelly's ratings.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (e.g., 2023)" },
        team: { type: "string", description: "Filter by team name" },
      },
    },
  },
  {
    name: "cfbd_get_ratings_elo",
    description:
      "Get Elo ratings for teams. Elo is a relative ranking system where teams gain/lose points based on game results and opponent strength. Use when asked about Elo ratings, historical team strength over time, or relative team rankings.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (e.g., 2023)" },
        team: { type: "string", description: "Filter by team name" },
        week: { type: "integer", description: "Week number for mid-season Elo snapshot" },
        seasonType: {
          type: "string",
          description: "'regular' or 'postseason'",
        },
      },
    },
  },
  {
    name: "cfbd_get_ratings_srs",
    description:
      "Get SRS (Simple Rating System) ratings for teams. SRS is a rating that accounts for strength of schedule and margin of victory. Use when asked about SRS ratings, strength of schedule-adjusted performance, or margin-based team ratings.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (e.g., 2023)" },
        team: { type: "string", description: "Filter by team name" },
        conference: { type: "string", description: "Conference abbreviation filter" },
        seasonType: {
          type: "string",
          description: "'regular' or 'postseason'",
        },
      },
    },
  },
  {
    name: "cfbd_get_ratings_fpi",
    description:
      "Get FPI (Football Power Index) ratings for teams. FPI is ESPN's predictive rating system measuring team strength. Use when asked about FPI ratings, ESPN's power index, or predictive team strength ratings.",
    input_schema: {
      type: "object" as const,
      properties: {
        year: { type: "integer", description: "Season year (e.g., 2023)" },
        team: { type: "string", description: "Filter by team name" },
        conference: { type: "string", description: "Conference abbreviation filter" },
      },
    },
  },
];

type ToolInput = Record<string, string | number | boolean | undefined>;

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  const params = input as ToolInput;

  switch (name) {
    case "cfbd_get_teams":
      return cfbdFetch("/teams", params);

    case "cfbd_get_team_stats":
      return cfbdFetch("/stats/season", params);

    case "cfbd_get_games":
      return cfbdFetch("/games", params);

    case "cfbd_get_rankings":
      return cfbdFetch("/rankings", params);

    case "cfbd_get_recruiting_teams":
      return cfbdFetch("/recruiting/teams", params);

    // ── Phase 5: Expanded tool coverage ──────────────────────────────────────

    case "cfbd_get_player_season_stats":
      return cfbdFetch("/stats/player/season", params);

    case "cfbd_get_player_game_stats":
      return cfbdFetch("/games/players", params);

    case "cfbd_get_ppa_teams":
      return cfbdFetch("/ppa/season", params);

    case "cfbd_get_betting_lines":
      return cfbdFetch("/betting", params);

    case "cfbd_get_matchup_history":
      return cfbdFetch("/teams/matchup", params);

    case "cfbd_get_transfer_portal":
      return cfbdFetch("/portal", params);

    case "cfbd_get_draft_picks":
      return cfbdFetch("/draft", params);

    case "cfbd_get_coaches":
      return cfbdFetch("/coaches", params);

    case "cfbd_get_roster":
      return cfbdFetch("/roster", params);

    case "cfbd_get_recruiting_players":
      return cfbdFetch("/recruiting/players", params);

    case "cfbd_get_venues":
      return cfbdFetch("/venues", params);

    case "cfbd_get_conferences":
      return cfbdFetch("/conferences", params);

    case "cfbd_get_ratings_sp":
      return cfbdFetch("/ratings/sp", params);

    case "cfbd_get_ratings_elo":
      return cfbdFetch("/ratings/elo", params);

    case "cfbd_get_ratings_srs":
      return cfbdFetch("/ratings/srs", params);

    case "cfbd_get_ratings_fpi":
      return cfbdFetch("/ratings/fpi", params);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
