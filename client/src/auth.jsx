import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("tf_token"));

  useEffect(() => {
    if (!localStorage.getItem("tf_token")) return;
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem("tf_token"))
      .finally(() => setLoading(false));
  }, []);

  const finish = (d) => { localStorage.setItem("tf_token", d.token); setUser(d.user); };
  const login = async (email, password) => finish(await api("/auth/login", { method: "POST", body: { email, password } }));
  const register = async (name, email, password) => finish(await api("/auth/register", { method: "POST", body: { name, email, password } }));
  const logout = () => { localStorage.removeItem("tf_token"); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
