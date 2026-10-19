# TenantFlow: multi-tenant website + AI agent SaaS

Every client business gets its own public page and a chatbot (text + voice) that answers only from that client's documents. One admin panel manages all clients.

**Stack:** React + Vite + Tailwind · Node + Express · MongoDB Atlas (+ Atlas Vector Search) · LangChain + LangGraph · Groq (LLM + Whisper) · local embeddings (transformers.js) · browser speech synthesis. Everything runs on free tiers.

## Features
- Register, log in, sign out (JWT, bcrypt)
- Create tenants, upload .pdf/.txt/.md, chunk with `RecursiveCharacterTextSplitter`, embed, store with `tenantId`
- LangGraph agent: retrieve (tenant-filtered vector search) then answer, with sources
- Public site per tenant at `/s/<slug>` with floating chat widget
- Voice: mic -> Groq Whisper (speech to text), spoken replies via browser speech synthesis
- Conversations and auto-captured leads (phone/email in chat)
- Fully responsive: mobile, tablet, laptop, desktop

## Setup (about 10 minutes)

### 1. Free accounts and keys
1. **Groq key:** https://console.groq.com -> API Keys (free, no card)
2. **MongoDB Atlas:** https://www.mongodb.com/atlas -> create a free M0 cluster, add a database user, allow your IP (Network Access), copy the connection string

### 2. Atlas vector index (once)
Atlas -> your cluster -> Search -> Create Search Index -> *Atlas Vector Search* -> JSON editor.
Database `tenantflow`, collection `chunks` (create it if it does not exist), index name `vector_index`:
```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 384, "similarity": "cosine" },
    { "type": "filter", "path": "tenantId" }
  ]
}
```

### 3. Run the backend
```bash
cd server
cp .env.example .env     # then fill MONGODB_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev              # http://localhost:5000
```
The first document upload downloads a small embedding model (about 25 MB). That is normal.

### 4. Run the frontend
```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

### 5. Try it
Register -> New tenant -> upload a menu/FAQ file -> chat in the "Test your agent" panel -> open the public site link. Say a phone number in chat and check the Leads tab.

## Deploy for free
- **Single deploy:** run `npm run build` in `client`, then start `server`. It serves `client/dist` automatically. Host on Render or Koyeb (free tiers sleep when idle).
- Set the same env vars on the host. Voice input needs HTTPS (any free host provides it).

## Notes
- Never commit `.env`. Rotate the key if it leaks.
- Free-tier limits (Groq, Atlas M0) change; check each provider's page.
- Speech replies use the browser voice; Urdu voice quality depends on the device.

## Structure
```
server/src  models.js  routes.js  agent.js (LangGraph)  rag.js (split/embed/search)  server.js
client/src  pages/ (Landing, AuthPage, Dashboard, TenantDetail, PublicSite)  components/ (ChatPanel, ChatWidget, Layout)
```
