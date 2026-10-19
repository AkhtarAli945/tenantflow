import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Dashboard() {
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", industry: "", tagline: "", color: "#0F766E" });
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => { api("/tenants").then(setList).catch((e) => setErr(e.message)); }, []);

  async function create(e) {
    e.preventDefault(); setErr("");
    try { const t = await api("/tenants", { method: "POST", body: f }); nav(`/app/tenants/${t._id}`); }
    catch (x) { setErr(x.message); }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const sum = (k) => (list || []).reduce((a, t) => a + (t[k] || 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Tenants</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>New tenant</button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[["Tenants", list?.length ?? 0], ["Conversations", sum("chats")], ["Leads captured", sum("leads")]].map(([k, v]) => (
          <div key={k} className="card"><div className="text-sm text-gray-600">{k}</div><div className="mt-1 font-display text-4xl font-bold">{v}</div></div>
        ))}
      </div>
      {err && <p role="alert" className="mt-4 text-sm text-red-700">{err}</p>}

      {list && list.length === 0 && (
        <div className="card mt-6 text-center">
          <h3 className="text-xl font-bold">Create your first tenant</h3>
          <p className="mx-auto mt-2 max-w-md text-gray-600">A tenant is one client business with its own public page and chatbot.</p>
          <button className="btn-primary mt-5" onClick={() => setOpen(true)}>New tenant</button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(list || []).map((t) => (
          <Link key={t._id} to={`/app/tenants/${t._id}`} className="card block hover:border-brand">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg" style={{ background: t.color }} />
              <div className="min-w-0"><div className="truncate font-bold">{t.name}</div><div className="truncate text-sm text-gray-500">{t.industry || "Business"}</div></div>
            </div>
            <div className="mt-4 flex gap-4 text-sm text-gray-600"><span>{t.docs.length} files</span><span>{t.chats} chats</span><span>{t.leads} leads</span></div>
          </Link>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <form onSubmit={create} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-t-2xl bg-white p-6 sm:rounded-2xl">
            <h2 className="text-2xl font-bold">New tenant</h2>
            <div><label className="label" htmlFor="tn">Business name</label><input id="tn" className="input" required value={f.name} onChange={set("name")} placeholder="Bella Trattoria" /></div>
            <div><label className="label" htmlFor="ti">Industry</label><input id="ti" className="input" value={f.industry} onChange={set("industry")} placeholder="Restaurant" /></div>
            <div><label className="label" htmlFor="tt">Tagline</label><input id="tt" className="input" value={f.tagline} onChange={set("tagline")} placeholder="Handmade pasta, warm evenings" /></div>
            <div><label className="label" htmlFor="tc">Brand colour</label><input id="tc" type="color" className="mt-1.5 h-11 w-full rounded-xl border border-gray-300" value={f.color} onChange={set("color")} /></div>
            {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
            <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary">Create tenant</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
