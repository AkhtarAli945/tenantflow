import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import Logo from "../components/Logo.jsx";

export default function AuthPage({ mode }) {
  const isReg = mode === "register";
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/app" replace />;

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (isReg) await register(f.name, f.email, f.password);
      else await login(f.email, f.password);
      nav("/app");
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Logo light />
        <div>
          <h1 className="text-5xl font-bold leading-tight">Run every client site and agent from one place.</h1>
          <p className="mt-4 max-w-md text-lg text-gray-400">Create tenants, upload their documents and watch conversations and leads arrive.</p>
        </div>
        <div className="text-sm text-gray-500">Free to start</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-bold">{isReg ? "Create your account" : "Welcome back"}</h2>
          <p className="mb-7 mt-2 text-gray-600">{isReg ? "Start managing your clients' sites." : "Log in to manage your tenants."}</p>
          <form onSubmit={submit} className="space-y-4">
            {isReg && <div><label className="label" htmlFor="n">Your name</label><input id="n" className="input" required value={f.name} onChange={set("name")} /></div>}
            <div><label className="label" htmlFor="e">Work email</label><input id="e" type="email" className="input" required value={f.email} onChange={set("email")} /></div>
            <div><label className="label" htmlFor="p">Password</label><input id="p" type="password" minLength={6} className="input" required value={f.password} onChange={set("password")} /></div>
            {err && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : isReg ? "Create account" : "Log in"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            {isReg ? "Already registered?" : "New here?"}{" "}
            <Link to={isReg ? "/login" : "/register"} className="font-bold text-brand">{isReg ? "Log in" : "Create an account"}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
