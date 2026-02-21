const CFBD_BASE_URL = "https://apinext.collegefootballdata.com";

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

  console.log(`[cfbd] --> GET ${url.toString()}`);
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "application/json",
    },
    // TODO: restore caching (next: { revalidate: 3600 }) after confirming response logs work
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    console.error(`[cfbd] HTML response (not JSON) — ${url.toString()}`);
    throw new Error(`CFBD API returned HTML — endpoint may not exist: ${url.toString()}`);
  }

  if (!response.ok) {
    console.error(`[cfbd] ${response.status} ${response.statusText} — ${url.toString()}`);
    throw new Error(
      `CFBD API error: ${response.status} ${response.statusText} — ${url.toString()}`
    );
  }

  let text: string;
  try {
    text = await response.text();
  } catch (err) {
    console.error(`[cfbd] <-- ${response.status} body read error — ${url.toString()}`, err);
    throw err;
  }

  console.log(`[cfbd] <-- ${response.status} ${url.toString()} ${text}`);

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error(`[cfbd] JSON parse error — ${url.toString()}`, err, text);
    throw err;
  }
}
