import { isPending } from '@/lib/content';

// Calendario de contribuciones (API GraphQL de GitHub, token de solo lectura, caché de 24 h).
// Sin token, con usuario [pendiente] o si la API falla devuelve null y la tarjeta se oculta.

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

type Level = keyof typeof LEVELS;

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { weekday contributionLevel } }
      }
    }
  }
}`;

export type Contributions = {
  total: number;
  /** Semanas recientes; cada una con los niveles (0–4) de lunes a viernes. */
  weeks: number[][];
};

export async function getContributions(
  username: string,
  weeks = 17,
): Promise<Contributions | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token || isPending(username)) return null;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { login: username } }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: number;
              weeks: { contributionDays: { weekday: number; contributionLevel: Level }[] }[];
            };
          };
        };
      };
    };
    const calendar = json.data?.user?.contributionsCollection.contributionCalendar;
    if (!calendar) return null;

    return {
      total: calendar.totalContributions,
      // La maqueta dibuja 5 filas: de lunes (1) a viernes (5).
      weeks: calendar.weeks.slice(-weeks).map((week) =>
        [1, 2, 3, 4, 5].map((weekday) => {
          const day = week.contributionDays.find((d) => d.weekday === weekday);
          return day ? LEVELS[day.contributionLevel] : 0;
        }),
      ),
    };
  } catch {
    return null;
  }
}
