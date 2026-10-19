import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api.js";
import ChatWidget from "../components/ChatWidget.jsx";

export default function PublicSite() {
  const { slug } = useParams();
  const [t, setT] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api(`/public/${slug}`).then(setT).catch((e) => setErr(e.message)); }, [slug]);

  if (err) return <div className="p-10 text-center text-gray-600">{err}</div>;
  if (!t) return <div className="p-10 text-center text-gray-500">Loading…</div>;

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="font-display text-2xl font-bold" style={{ color: t.color }}>{t.name}</span>
        <nav className="hidden gap-6 text-sm font-medium sm:flex"><a href="#about">About</a><a href="#help">Help</a></nav>
      </header>
      <section id="about" className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-sm font-bold" style={{ color: t.color }}>{t.industry}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{t.tagline || `Welcome to ${t.name}`}</h1>
          <p className="mt-4 max-w-md text-lg text-gray-600">Have a question? Our assistant answers right away, by typing or by voice.</p>
        </div>
        <div className="rounded-3xl p-6 sm:p-8" style={{ background: `${t.color}18` }}>
          <p className="text-sm font-bold" style={{ color: t.color }}>Try asking</p>
          <ul className="mt-4 space-y-3">
            {["What are your opening hours?", "What are your prices?", "How can I book?"].map((q) => (
              <li key={q} className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm">{q}</li>
            ))}
          </ul>
        </div>
      </section>
      <section id="help" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl p-6 text-white sm:p-10" style={{ background: t.color }}>
          <h2 className="text-2xl font-bold sm:text-3xl">Ask us anything</h2>
          <p className="mt-2 max-w-lg opacity-90">Opening hours, prices, bookings. Tap "Chat with us" in the corner and the assistant will help.</p>
        </div>
      </section>
      <ChatWidget slug={t.slug} name={t.name} color={t.color} />
    </div>
  );
}