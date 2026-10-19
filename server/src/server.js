import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes.js";

for (const k of ["MONGODB_URI", "JWT_SECRET", "GROQ_API_KEY"])
  if (!process.env[k]) { console.error(`Missing ${k} in .env`); process.exit(1); }

const app = express();

// Allowed websites: localhost (local testing), this project's Vercel links,
// and anything listed in CLIENT_ORIGIN (comma separated, optional)
const extra = (process.env.CLIENT_ORIGIN || "").split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean);
const allowed = (origin) =>
  !origin ||
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
  /^https:\/\/tenantflow[\w-]*\.vercel\.app$/.test(origin) ||
  extra.includes(origin);
app.use(cors({ origin: (origin, cb) => cb(null, allowed(origin)) }));

app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);

// Optional: serve the built React app from the same server (single deploy)
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

await mongoose.connect(process.env.MONGODB_URI);
app.listen(process.env.PORT || 5000, () => console.log("TenantFlow API running"));