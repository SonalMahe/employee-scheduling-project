const BASE = "http://localhost:5000/api";
const KEY = "sg_user";

 // Session management 
export const saveSession = (user) =>
  localStorage.setItem(KEY, JSON.stringify(user));
export const clearSession = () => localStorage.removeItem(KEY);

export const loadSession = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Helper function for API requests
const request = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
};

// Authentication
export const login = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });











