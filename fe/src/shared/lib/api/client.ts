import { getSupabaseClient } from "@/shared/lib/supabase/client";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type ApiFetchOptions = RequestInit & {
  authenticated?: boolean;
};

export async function apiFetch<T>(
  path: string,
  { authenticated = false, headers, ...options }: ApiFetchOptions = {},
) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");

  if (authenticated) {
    const {
      data: { session },
    } = await getSupabaseClient().auth.getSession();

    if (session?.access_token) {
      requestHeaders.set("Authorization", `Bearer ${session.access_token}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: requestHeaders,
    });
  } catch {
    throw new Error(
      `Cannot connect to API at ${apiBaseUrl}. Make sure the NestJS backend is running and NEXT_PUBLIC_API_BASE_URL is correct.`,
    );
  }

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;

    try {
      const errorBody: unknown = await response.json();

      if (
        errorBody &&
        typeof errorBody === "object" &&
        "message" in errorBody
      ) {
        const message = errorBody.message;

        if (Array.isArray(message)) {
          errorMessage = message.join(", ");
        } else if (typeof message === "string") {
          errorMessage = message;
        }
      }
    } catch {
      const text = await response.text().catch(() => "");

      if (text) {
        errorMessage = text;
      }
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
