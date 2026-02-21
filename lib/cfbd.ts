const CFBD_BASE_URL = "https://api.collegefootballdata.com";

function getApiKey(): string {
  const key = process.env.CFBD_API_KEY;
  if (!key) throw new Error("CFBD_API_KEY environment variable is not set");
  return key;
}

export async function cfbdFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = new URL(`${CFBD_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "application/json",
    },
    // Next.js fetch cache: revalidate frequently-changing data every hour,
    // old seasons can stay cached longer (caller can override via next option)
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `CFBD API error: ${response.status} ${response.statusText} — ${url.toString()}`
    );
  }

  return response.json() as Promise<T>;
}
