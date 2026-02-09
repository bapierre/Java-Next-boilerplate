const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const DEFAULT_TIMEOUT = 30000;

function createAbortSignal(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

export const apiClient = {
  async post<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
      signal: createAbortSignal(DEFAULT_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(getErrorMessage(response.status));
    }

    return response.json();
  },

  async get<T = unknown>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal: createAbortSignal(DEFAULT_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(getErrorMessage(response.status));
    }

    return response.json();
  },

  async put<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
      signal: createAbortSignal(DEFAULT_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(getErrorMessage(response.status));
    }

    return response.json();
  },

  async delete<T = unknown>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal: createAbortSignal(DEFAULT_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(getErrorMessage(response.status));
    }

    return response.json();
  },
};

function getErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Please sign in to continue.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 429:
      return "Too many requests. Please try again later.";
    default:
      if (status >= 500) {
        return "Something went wrong. Please try again later.";
      }
      return "An unexpected error occurred.";
  }
}
