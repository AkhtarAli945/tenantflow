const BASE = import.meta.env.VITE_API_URL || "";

export async function api(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem("tf_token");
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}/api${path}`, {
    method, headers, body: form || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}