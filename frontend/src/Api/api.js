const BASE = "http://localhost:5050/api/v1";
const KEY = "sg_user";

// ================================
// SESSION MANAGEMENT
// ================================
export const saveSession = (user) =>
  localStorage.setItem(KEY, JSON.stringify(user));

export const clearSession = () =>
  localStorage.removeItem(KEY);

export const loadSession = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ================================
// REQUEST HELPER
// ================================
const request = async (path, options = {}) => {
  const session = loadSession();

  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(session?.token && {
        Authorization: `Bearer ${session.token}`,
      }),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

// ================================
// AUTH
// ================================
export const login = async (email, password) => {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  saveSession(data); // store token + user
  return data;
};

// ================================
// EMPLOYEES
// ================================
export const getEmployees = () =>
  request("/employees");

export const getEmployeeById = (id) =>
  request(`/employees/${id}`);

export const createEmployee = (payload) =>
  request("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ================================
// AVAILABILITY
// ================================
export const getAvailability = (employeeId) =>
  request(`/availability/${employeeId}`);

export const updateAvailability = (employeeId, payload) =>
  request(`/availability/${employeeId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// ================================
// SCHEDULE
// ================================
export const getSchedule = () =>
  request("/schedule");

export const updateSchedule = (payload) =>
  request("/schedule", {
    method: "PUT",
    body: JSON.stringify(payload),
  });