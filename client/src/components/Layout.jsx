import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import Logo from "./Logo.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo to="/app" />
            <Link to="/app" className="hidden text-sm font-bold text-gray-600 hover:text-ink sm:block">Tenants</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[10rem] truncate text-sm text-gray-600 sm:block">{user?.name}</span>
            <button className="btn-outline !px-4 !py-2" onClick={() => { logout(); nav("/"); }}>Sign out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"><Outlet /></main>
    </div>
  );
}
