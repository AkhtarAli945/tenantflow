import { useState } from "react";
import ChatPanel from "./ChatPanel.jsx";

export default function ChatWidget({ slug, name, color }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-40 sm:inset-x-auto sm:bottom-24 sm:right-6">
          <ChatPanel slug={slug} name={name} color={color} onClose={() => setOpen(false)}
            className="h-[85vh] w-full rounded-b-none sm:h-[34rem] sm:w-96 sm:rounded-2xl" />
        </div>
      )}
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 rounded-full px-5 py-3.5 text-sm font-bold text-white shadow-xl sm:bottom-6 sm:right-6"
          style={{ background: color }}>
          Chat with us
        </button>
      )}
    </>
  );
}
