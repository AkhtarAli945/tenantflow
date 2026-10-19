import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { retrieve } from "./rag.js";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  temperature: 0.2,
});

const State = Annotation.Root({
  tenantId: Annotation(),
  tenantName: Annotation(),
  tone: Annotation(),
  question: Annotation(),
  history: Annotation(),
  context: Annotation(),
  sources: Annotation(),
  answer: Annotation(),
});

async function retrieveNode(state) {
  const docs = await retrieve(state.tenantId, state.question);
  return {
    context: docs.map((d) => d.pageContent).join("\n---\n"),
    sources: [...new Set(docs.map((d) => d.metadata.filename))],
  };
}

async function answerNode(state) {
  const system =
    `You are the ${state.tone || "friendly"} assistant of ${state.tenantName}. ` +
    `Answer ONLY from the context below. If the answer is not there, say you are not sure and ask ` +
    `for the visitor's name and phone or email so the team can follow up. ` +
    `Reply in the visitor's language, in 1-3 short sentences.\n\nContext:\n${state.context || "(no documents yet)"}`;
  const past = (state.history || []).map((m) => [m.role === "user" ? "human" : "ai", m.content]);
  const res = await llm.invoke([["system", system], ...past, ["human", state.question]]);
  return { answer: res.content };
}

export const agent = new StateGraph(State)
  .addNode("retrieve", retrieveNode)
  .addNode("generate", answerNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END)
  .compile();
