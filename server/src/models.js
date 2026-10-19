import mongoose from "mongoose";
const { Schema, model } = mongoose;

export const User = model("User", new Schema(
  { name: String, email: { type: String, unique: true, lowercase: true }, password: String },
  { timestamps: true }
));

export const Tenant = model("Tenant", new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: String,
    slug: { type: String, unique: true },
    industry: String,
    tagline: String,
    color: { type: String, default: "#0F766E" },
    tone: { type: String, default: "Friendly" },
    docs: [{ docId: String, filename: String, chunks: Number, createdAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
));

export const Conversation = model("Conversation", new Schema(
  {
    tenant: { type: Schema.Types.ObjectId, index: true },
    sessionId: String,
    messages: [{ role: String, content: String, sources: [String], at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
));

export const Lead = model("Lead", new Schema(
  { tenant: { type: Schema.Types.ObjectId, index: true }, contact: String, message: String },
  { timestamps: true }
));
