import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";

function sessionFor(slug) {
  const k = `tf_session_${slug}`;
  let s = localStorage.getItem(k);
  if (!s) {
    s = crypto.randomUUID();
    localStorage.setItem(k, s);
  }
  return s;
}

export default function ChatPanel({
  slug,
  name,
  color = "#0F766E",
  className = "",
  onClose,
}) {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content: `Hi! Ask me anything about ${name || "us"}. You can type or use the mic.`,
    },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState(null);
  const [speakOn, setSpeakOn] = useState(false);
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = (t) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(t));
  };

  async function send(message, spoken = false) {
    const m = message.trim();
    if (!m || busy) return;
    setMsgs((x) => [...x, { role: "user", content: m }]);
    setText("");
    setBusy(true);
    try {
      const d = await api(`/public/${slug}/chat`, {
        method: "POST",
        body: { message: m, sessionId: sessionFor(slug) },
      });
      setMsgs((x) => [
        ...x,
        { role: "assistant", content: d.answer, sources: d.sources },
      ]);
      if (speakOn || spoken) speak(d.answer);
    } catch (e) {
      setMsgs((x) => [
        ...x,
        {
          role: "assistant",
          content: `Sorry, ${e.message}. Please try again.`,
        },
      ]);
    }
    setBusy(false);
  }

  async function toggleMic() {
    if (rec) {
      rec.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRec(null);
        const blob = new Blob(chunks, { type: mr.mimeType });
        if (blob.size < 3000) {
          setMsgs((x) => [
            ...x,
            {
              role: "assistant",
              content:
                "That recording was too short. Press Mic, speak for a few seconds, then press Stop.",
            },
          ]);
          return;
        }
        const fd = new FormData();
        fd.append("audio", blob, "audio.webm");
        setBusy(true);
        try {
          const d = await api("/voice/transcribe", {
            method: "POST",
            form: fd,
          });
          setBusy(false);
          if (d.text) send(d.text, true);
        } catch (e) {
          setBusy(false);
          setMsgs((x) => [
            ...x,
            { role: "assistant", content: `Voice failed: ${e.message}` },
          ]);
        }
      };
      mr.start();
      setRec(mr);
    } catch {
      setMsgs((x) => [
        ...x,
        {
          role: "assistant",
          content: "Please allow microphone access to use voice.",
        },
      ]);
    }
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-xl ${className}`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ background: color }}
      >
        <div>
          <div className="font-bold">{name || "Assistant"}</div>
          <div className="text-xs opacity-90">Replies in seconds</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSpeakOn(!speakOn);
              window.speechSynthesis?.cancel();
            }}
            aria-pressed={speakOn}
            className="rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-white/20"
          >
            Voice replies: {speakOn ? "On" : "Off"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="rounded-lg px-2.5 py-1 text-xl hover:bg-white/20"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-paper/60 p-4 text-sm leading-relaxed">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user" ? "flex justify-end" : "flex justify-start"
            }
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${m.role === "user" ? "bg-gray-200" : "border border-line bg-white"}`}
            >
              {m.content}
              {m.sources?.length > 0 && (
                <div className="mt-1.5 text-xs text-gray-500">
                  Source: {m.sources.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="text-xs text-gray-500">Thinking…</div>}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <button
          type="button"
          onClick={toggleMic}
          aria-label={rec ? "Stop recording" : "Start voice input"}
          className={`h-11 w-11 shrink-0 rounded-xl border text-sm font-bold ${rec ? "animate-pulse border-red-500 bg-red-50 text-red-600" : "border-gray-300"}`}
        >
          {rec ? "Stop" : "Mic"}
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message…"
          className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm"
        />
        <button
          disabled={busy || !text.trim()}
          className="h-11 shrink-0 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50"
          style={{ background: color }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
