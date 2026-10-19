import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import ChatPanel from "../components/ChatPanel.jsx";

const tabs = ["Knowledge", "Settings", "Conversations", "Leads"];

export default function TenantDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [t, setT] = useState(null);
  const [tab, setTab] = useState("Knowledge");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [convos, setConvos] = useState([]);
  const [leads, setLeads] = useState([]);
  const file = useRef();

  useEffect(() => { api(`/tenants/${id}`).then(setT).catch((e) => setMsg(e.message)); }, [id]);
  useEffect(() => {
    if (tab === "Conversations") api(`/tenants/${id}/conversations`).then(setConvos).catch(() => {});
    if (tab === "Leads") api(`/tenants/${id}/leads`).then(setLeads).catch(() => {});
  }, [tab, id]);

  async function upload(e) {
    const f = e.target.files[0];
    if (!f) return;
    const form = new FormData(); form.append("file", f);
    setBusy(true); setMsg("Indexing document… the first upload can take a minute while the embedding model downloads.");
    try { setT(await api(`/tenants/${id}/documents`, { method: "POST", form })); setMsg("Document indexed."); }
    catch (x) { setMsg(x.message); }
    setBusy(false); file.current.value = "";
  }
  async function removeDoc(docId) {
    setT(await api(`/tenants/${id}/documents/${docId}`, { method: "DELETE" }));
  }
  async function save(e) {
    e.preventDefault();
    try { setT(await api(`/tenants/${id}`, { method: "PUT", body: t })); setMsg("Changes saved."); }
    catch (x) { setMsg(x.message); }
  }
  async function del() {
    if (!confirm(`Delete ${t.name} and all its data?`)) return;
    await api(`/tenants/${id}`, { method: "DELETE" }); nav("/app");
  }

  if (!t) return <p className="text-gray-500">{msg || "Loading…"}</p>;
  const set = (k) => (e) => setT({ ...t, [k]: e.target.value });
  const site = `${location.origin}/s/${t.slug}`;

  return (
    <div>
      <Link to="/app" className="text-sm text-gray-600 hover:text-ink">Back to tenants</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="h-10 w-10 rounded-xl" style={{ background: t.color }} /><h1 className="text-3xl font-bold">{t.name}</h1></div>
        <a href={site} target="_blank" rel="noreferrer" className="btn-outline">Open public site</a>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
            {tabs.map((x) => (
              <button key={x} role="tab" aria-selected={tab === x} onClick={() => setTab(x)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-bold ${tab === x ? "border-brand text-brand" : "border-transparent text-gray-600"}`}>{x}</button>
            ))}
          </div>
          {msg && <p className="mt-4 rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark" role="status">{msg}</p>}

          <div className="mt-4">
            {tab === "Knowledge" && (
              <div className="card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h3 className="text-xl font-bold">Knowledge base</h3><p className="text-sm text-gray-600">The chatbot answers only from these files (.pdf, .txt, .md).</p></div>
                  <label className={`btn-primary cursor-pointer ${busy ? "opacity-50" : ""}`}>
                    {busy ? "Indexing…" : "Upload file"}
                    <input ref={file} type="file" accept=".pdf,.txt,.md" className="sr-only" onChange={upload} disabled={busy} />
                  </label>
                </div>
                <ul className="mt-4 divide-y divide-line">
                  {t.docs.length === 0 && <li className="py-6 text-center text-gray-500">No files yet. Upload a menu, FAQ or policy to teach the chatbot.</li>}
                  {t.docs.map((d) => (
                    <li key={d.docId} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="min-w-0 truncate">{d.filename}</span>
                      <span className="flex shrink-0 items-center gap-3"><span className="pill">{d.chunks} chunks</span>
                        <button onClick={() => removeDoc(d._id)} className="font-bold text-red-600">Remove</button></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "Settings" && (
              <form onSubmit={save} className="card space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="a">Business name</label><input id="a" className="input" value={t.name} onChange={set("name")} /></div>
                  <div><label className="label" htmlFor="b">Industry</label><input id="b" className="input" value={t.industry || ""} onChange={set("industry")} /></div>
                </div>
                <div><label className="label" htmlFor="c">Tagline</label><input id="c" className="input" value={t.tagline || ""} onChange={set("tagline")} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="d">Brand colour</label><input id="d" type="color" className="mt-1.5 h-11 w-full rounded-xl border border-gray-300" value={t.color} onChange={set("color")} /></div>
                  <div><label className="label" htmlFor="e">Chatbot tone</label>
                    <select id="e" className="input" value={t.tone} onChange={set("tone")}><option>Friendly</option><option>Professional</option><option>Playful</option></select></div>
                </div>
                <div className="text-sm text-gray-600">Public link: <a className="font-bold text-brand" href={site} target="_blank" rel="noreferrer">{site}</a></div>
                <div className="flex flex-wrap justify-between gap-3"><button className="btn-primary">Save changes</button><button type="button" onClick={del} className="btn-outline !text-red-600">Delete tenant</button></div>
              </form>
            )}

            {tab === "Conversations" && (
              <div className="space-y-3">
                {convos.length === 0 && <div className="card text-center text-gray-500">No conversations yet. Open the public site and say hello.</div>}
                {convos.map((c) => (
                  <details key={c._id} className="card">
                    <summary className="cursor-pointer text-sm font-bold">{c.messages[0]?.content.slice(0, 70) || "Conversation"} <span className="font-normal text-gray-500">· {c.messages.length} messages</span></summary>
                    <div className="mt-3 space-y-2 text-sm">
                      {c.messages.map((m, i) => <p key={i}><b>{m.role === "user" ? "Visitor" : "Agent"}:</b> {m.content}</p>)}
                    </div>
                  </details>
                ))}
              </div>
            )}

            {tab === "Leads" && (
              <div className="card overflow-x-auto">
                {leads.length === 0 ? <p className="text-center text-gray-500">No leads yet. They appear when a visitor shares a phone number or email in chat.</p> : (
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead className="text-xs text-gray-500"><tr><th className="py-2">Contact</th><th>Message</th><th>Date</th></tr></thead>
                    <tbody>{leads.map((l) => (
                      <tr key={l._id} className="border-t border-line"><td className="py-3 font-bold">{l.contact}</td><td className="max-w-xs truncate">{l.message}</td><td>{new Date(l.createdAt).toLocaleDateString()}</td></tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-lg font-bold">Test your agent</h3>
          <ChatPanel slug={t.slug} name={t.name} color={t.color} className="h-[30rem] lg:sticky lg:top-20" />
        </div>
      </div>
    </div>
  );
}
