import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";

const features = [
  ["Branded site for every client", "Each business gets its own public page and link, with its own colours and tagline."],
  ["A chatbot that knows the business", "Upload menus, FAQs and policies. Answers come only from that client's files, with the source shown."],
  ["Voice in and out", "Visitors can talk to the chatbot and hear the answer back."],
  ["Leads and conversations", "Phone numbers and emails shared in chat land in one admin panel."],
];
const flow = [
  ["Visitor", "Opens a tenant site and asks a question"],
  ["Express API", "Finds the tenant from the site link"],
  ["LangGraph agent", "Retrieves the right chunks and answers"],
  ["Tenant data", "Vectors and records stay separate per client"],
];

export default function Landing() {
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 py-5">
          <Logo />
          <div className="flex gap-2">
            <Link to="/login" className="btn-outline !py-2.5">Log in</Link>
            <Link to="/register" className="btn-primary !py-2.5">Start free</Link>
          </div>
        </header>

        <section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-2 lg:gap-14">
          <div>
            <span className="pill">Multi-tenant · RAG chatbots · Voice</span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Launch a client's website and AI agent in minutes.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              Every business gets its own page and a chatbot trained on its own documents. You manage all of them from one dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">Create your first tenant</Link>
              <Link to="/login" className="btn-outline">Log in</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="card shadow-xl">
              <div className="flex items-center justify-between"><b>Overview</b><span className="pill">4 live tenants</span></div>
              <div className="mt-5 flex h-28 items-end gap-2.5">
                {[40, 58, 50, 78, 68, 95].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t-md ${i === 5 ? "bg-brand" : "bg-teal-200"}`} style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-sm text-gray-600"><span>Chats this month</span><b className="text-ink">3,284</b></div>
            </div>
            <div className="-mt-3 ml-auto w-[85%] rounded-2xl bg-ink p-4 text-sm leading-relaxed text-white shadow-xl">
              <span className="font-bold text-teal-300">Agent · Bella Trattoria</span><br />
              Yes, our Family package serves 20 to 60 guests. Shall I note your date?
            </div>
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything an agency needs</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([t, d]) => (
              <div key={t} className="card"><h3 className="text-xl font-bold">{t}</h3><p className="mt-2 leading-relaxed text-gray-600">{d}</p></div>
            ))}
          </div>
        </section>

        <section className="my-10 rounded-3xl bg-ink p-6 text-white sm:p-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Isolated by design</h2>
          <p className="mt-3 max-w-xl text-gray-400">One codebase, many clients. Every request is scoped by tenant from the site link down to the vector search.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
                <b className="text-teal-300">{t}</b><div className="mt-1.5 text-sm text-gray-400">{d}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold sm:text-5xl">Ready to ship your next client site?</h2>
          <Link to="/register" className="btn-primary mt-7">Create your free account</Link>
        </section>
        <footer className="border-t border-line py-6 text-sm text-gray-500">TenantFlow · Built with MongoDB, Express, React, Node and LangGraph</footer>
      </div>
    </div>
  );
}
