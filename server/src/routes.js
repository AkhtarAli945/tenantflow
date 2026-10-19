import { Router } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Groq from "groq-sdk";
import { toFile } from "groq-sdk/uploads";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { User, Tenant, Conversation, Lead } from "./models.js";
import { ingestText, removeDoc } from "./rag.js";
import { agent } from "./agent.js";

const r = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email });
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => { console.error(e); res.status(500).json({ error: e.message }); });

function auth(req, res, next) {
  try {
    const t = (req.headers.authorization || "").replace("Bearer ", "");
    req.uid = jwt.verify(t, process.env.JWT_SECRET).id;
    next();
  } catch { res.status(401).json({ error: "Please log in again" }); }
}

async function ownTenant(req, res) {
  const t = await Tenant.findOne({ _id: req.params.id, owner: req.uid });
  if (!t) res.status(404).json({ error: "Tenant not found" });
  return t;
}

/* ---------- Auth ---------- */
r.post("/auth/register", wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: "Name, email and a password of 6+ characters are required" });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ error: "This email is already registered" });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.json({ token: sign(user), user: pub(user) });
}));

r.post("/auth/login", wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
    return res.status(401).json({ error: "Wrong email or password" });
  res.json({ token: sign(user), user: pub(user) });
}));

r.get("/auth/me", auth, wrap(async (req, res) => {
  const user = await User.findById(req.uid);
  if (!user) return res.status(401).json({ error: "Please log in again" });
  res.json({ user: pub(user) });
}));

/* ---------- Tenants (admin) ---------- */
r.get("/tenants", auth, wrap(async (req, res) => {
  const list = await Tenant.find({ owner: req.uid }).sort("-createdAt").lean();
  const out = await Promise.all(list.map(async (t) => ({
    ...t,
    chats: await Conversation.countDocuments({ tenant: t._id }),
    leads: await Lead.countDocuments({ tenant: t._id }),
  })));
  res.json(out);
}));

r.post("/tenants", auth, wrap(async (req, res) => {
  const { name, industry, tagline, color } = req.body;
  if (!name) return res.status(400).json({ error: "Business name is required" });
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tenant";
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  res.json(await Tenant.create({ owner: req.uid, name, industry, tagline, color: color || undefined, slug }));
}));

r.get("/tenants/:id", auth, wrap(async (req, res) => {
  const t = await ownTenant(req, res);
  if (t) res.json(t);
}));

r.put("/tenants/:id", auth, wrap(async (req, res) => {
  const t = await ownTenant(req, res);
  if (!t) return;
  for (const k of ["name", "industry", "tagline", "color", "tone"]) if (req.body[k] !== undefined) t[k] = req.body[k];
  await t.save();
  res.json(t);
}));

r.delete("/tenants/:id", auth, wrap(async (req, res) => {
  const t = await ownTenant(req, res);
  if (!t) return;
  for (const d of t.docs) await removeDoc(d.docId);
  await Conversation.deleteMany({ tenant: t._id });
  await Lead.deleteMany({ tenant: t._id });
  await t.deleteOne();
  res.json({ ok: true });
}));

r.post("/tenants/:id/documents", auth, upload.single("file"), wrap(async (req, res) => {
  const t = await ownTenant(req, res);
  if (!t) return;
  if (!req.file) return res.status(400).json({ error: "Choose a .pdf, .txt or .md file" });
  const isPdf = req.file.originalname.toLowerCase().endsWith(".pdf");
  const text = isPdf ? (await pdf(req.file.buffer)).text : req.file.buffer.toString("utf8");
  if (!text.trim()) return res.status(400).json({ error: "No readable text found in this file" });
  const docId = `${t._id}-${Date.now()}`;
  const chunks = await ingestText({ tenantId: String(t._id), docId, filename: req.file.originalname, text });
  t.docs.push({ docId, filename: req.file.originalname, chunks });
  await t.save();
  res.json(t);
}));

r.delete("/tenants/:id/documents/:docId", auth, wrap(async (req, res) => {
  const t = await ownTenant(req, res);
  if (!t) return;
  const d = t.docs.id(req.params.docId);
  if (d) { await removeDoc(d.docId); d.deleteOne(); await t.save(); }
  res.json(t);
}));

r.get("/tenants/:id/conversations", auth, wrap(async (req, res) => {
  const t = await ownTenant(req, res);
  if (t) res.json(await Conversation.find({ tenant: t._id }).sort("-updatedAt").limit(50));
}));

r.get("/tenants/:id/leads", auth, wrap(async (req, res) => {
  const t = await ownTenant(req, res);
  if (t) res.json(await Lead.find({ tenant: t._id }).sort("-createdAt").limit(100));
}));

/* ---------- Public (visitor site + chatbot) ---------- */
r.get("/public/:slug", wrap(async (req, res) => {
  const t = await Tenant.findOne({ slug: req.params.slug }).select("name slug industry tagline color");
  if (!t) return res.status(404).json({ error: "Site not found" });
  res.json(t);
}));

r.post("/public/:slug/chat", wrap(async (req, res) => {
  const t = await Tenant.findOne({ slug: req.params.slug });
  const { message, sessionId } = req.body;
  if (!t) return res.status(404).json({ error: "Site not found" });
  if (!message || !sessionId) return res.status(400).json({ error: "Message is required" });

  let convo = await Conversation.findOne({ tenant: t._id, sessionId });
  if (!convo) convo = await Conversation.create({ tenant: t._id, sessionId, messages: [] });
  const history = convo.messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));

  const out = await agent.invoke({
    tenantId: String(t._id), tenantName: t.name, tone: t.tone, question: message, history,
  });

  convo.messages.push({ role: "user", content: message });
  convo.messages.push({ role: "assistant", content: out.answer, sources: out.sources });
  await convo.save();

  // Simple lead capture: a phone number or email in the visitor's message
  const m = message.match(/[\w.+-]+@[\w-]+\.[\w.]+|\+?\d[\d\s-]{8,}\d/);
  if (m) await Lead.create({ tenant: t._id, contact: m[0], message });

  res.json({ answer: out.answer, sources: out.sources });
}));

/* ---------- Voice: audio -> text with Groq Whisper ---------- */
r.post("/voice/transcribe", upload.single("audio"), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio received" });
  
 const mt = req.file.mimetype || "";
const ext = mt.includes("ogg") ? "ogg" : mt.includes("mp4") ? "mp4" : "webm";
const file = await toFile(req.file.buffer, `audio.${ext}`, { type: mt });
  
  const out = await groq.audio.transcriptions.create({ file, model: "whisper-large-v3-turbo" });
  res.json({ text: out.text });
}));

export default r;
