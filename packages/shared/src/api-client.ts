export interface ApiClientConfig {
  baseUrl: string;
  apiKey: string;
}

export type ApiQuery = Record<string, string | number | boolean | undefined>;

export interface ApiClient {
  get<T>(path: string, query?: ApiQuery): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const apiKey = config.apiKey;

  async function request<T>(url: string, init: RequestInit, logTarget: string): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        'x-api-key': apiKey,
        ...init.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${init.method ?? 'GET'} ${logTarget} failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    get<T>(path: string, query?: ApiQuery): Promise<T> {
      const url = new URL(`${baseUrl}${path}`);

      if (query) {
        for (const [key, value] of Object.entries(query)) {
          if (value !== undefined && value !== '') {
            url.searchParams.set(key, String(value));
          }
        }
      }

      return request<T>(url.toString(), { method: 'GET' }, path);
    },

    post<T>(path: string, body: unknown): Promise<T> {
      return request<T>(
        `${baseUrl}${path}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        },
        path,
      );
    },
  };
}
