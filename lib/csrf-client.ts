/**
 * Client-side CSRF utilities
 * 
 * Helper functions for including CSRF tokens in client-side requests
 */

'use client';

/**
 * CSRF configuration
 */
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Get CSRF token from cookies
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

/**
 * Create headers object with CSRF token
 * 
 * @example
 * ```ts
 * fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     ...getCsrfHeaders(),
 *   },
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { [CSRF_HEADER_NAME]: token } : {};
}

/**
 * Enhanced fetch with automatic CSRF token injection
 * 
 * @example
 * ```ts
 * const response = await fetchWithCsrf('/api/endpoint', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfHeaders = getCsrfHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...csrfHeaders,
    },
  });
}

/**
 * Wrapper for common HTTP methods with CSRF protection
 */
export const api = {
  /**
   * POST request with CSRF token
   */
  post: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const response = await fetchWithCsrf(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * PATCH request with CSRF token
   */
  patch: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const response = await fetchWithCsrf(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * PUT request with CSRF token
   */
  put: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const response = await fetchWithCsrf(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * DELETE request with CSRF token
   */
  delete: async <T = unknown>(url: string): Promise<T> => {
    const response = await fetchWithCsrf(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * GET request (no CSRF needed)
   */
  get: async <T = unknown>(url: string): Promise<T> => {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },
};

/**
 * Hook-like function to check if CSRF token exists
 * Useful for displaying warnings to users
 */
export function hasCsrfToken(): boolean {
  return getCsrfToken() !== null;
}

/**
 * Constants for export
 */
export const CSRF = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
  getToken: getCsrfToken,
  getHeaders: getCsrfHeaders,
} as const;
