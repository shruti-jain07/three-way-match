const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
 
const TOKEN_STORAGE_KEY = "twm_auth_token";
 
export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};
 
export const setStoredToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};
 
class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
 

const request = async (path, options = {}) => {
  const token = getStoredToken();
 
  const headers = new Headers(options.headers || {});
 
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
 
  
  const isFormData = options.body instanceof FormData;
 
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
 
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
 

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json().catch(() => null) : null;
 
  if (!response.ok) {
    const message = body?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, body);
  }
 
  return body;
};
 
export const apiClient = {
  get: (path) => request(path, { method: "GET" }),
 
  post: (path, data) =>
    request(path, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
 
  patch: (path, data) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
 
  delete: (path) => request(path, { method: "DELETE" }),
 
 
  fetchFile: async (path) => {
    const token = getStoredToken();
    const headers = new Headers();
 
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
 
    const response = await fetch(`${API_BASE_URL}${path}`, { headers });
 
    if (!response.ok) {
      throw new ApiError(`Failed to load file (${response.status})`, response.status, null);
    }
 
    return response.blob();
  },
};
 
export { ApiError, API_BASE_URL };