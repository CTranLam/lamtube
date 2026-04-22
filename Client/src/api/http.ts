const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type HttpFetchOptions = {
  retryOn401?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function shouldSkipRefresh(url: string): boolean {
  return (
    url.includes("/login") ||
    url.includes("/register") ||
    url.includes("/refresh")
  );
}

async function refreshAccessToken(): Promise<string | null> {
  if (!API_BASE_URL?.trim()) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    localStorage.removeItem("access_token");
    return null;
  }

  const body = (await response.json()) as unknown;
  const token =
    isRecord(body) &&
    isRecord(body.data) &&
    typeof body.data.token === "string" &&
    body.data.token.trim()
      ? body.data.token
      : null;

  if (!token) {
    localStorage.removeItem("access_token");
    return null;
  }

  localStorage.setItem("access_token", token);
  return token;
}

function withCredentials(init?: RequestInit): RequestInit {
  return {
    ...init,
    credentials: init?.credentials ?? "include",
  };
}

function withBearerToken(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers ?? undefined);
  headers.set("Authorization", `Bearer ${token}`);
  return {
    ...(init ?? {}),
    headers,
  };
}

export async function httpFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: HttpFetchOptions,
): Promise<Response> {
  const requestUrl = typeof input === "string" ? input : input.toString();
  const retryOn401 = options?.retryOn401 ?? true;

  const response = await fetch(input, withCredentials(init));
  if (!retryOn401 || response.status !== 401 || shouldSkipRefresh(requestUrl)) {
    return response;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const nextAccessToken = await refreshPromise;
  if (!nextAccessToken) {
    return response;
  }

  const retryInit = withCredentials(withBearerToken(init, nextAccessToken));
  return fetch(input, retryInit);
}

export async function logoutWithCookie(): Promise<void> {
  if (!API_BASE_URL?.trim()) return;

  await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => undefined);
}
