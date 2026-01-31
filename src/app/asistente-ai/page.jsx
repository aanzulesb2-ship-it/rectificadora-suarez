"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, Send, Trash2, Mic, MicOff } from "lucide-react";

const SYSTEM_HINT =
  "Eres el asistente técnico de Rectificadora Suárez. Responde claro, corto y útil. " +
  "Cuando hables de motores, sé preciso. Si faltan datos, pregunta 1 cosa a la vez.";

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function AsistenteAIPage() {
  const [expanded, setExpanded] = useState(false);

  // ✅ Un solo input para escribir NORMAL
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content:
        "Hola 👋 Soy el asistente de Rectificadora Suárez. ¿Qué motor estás trabajando hoy?",
    },
  ]);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, expanded]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ SpeechRecognition seguro: NO rompe escritura
  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    const rec = new SR();

    // Importante: si está continuous/interim en true suele pelear con el textarea
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "es-EC";

    rec.onresult = (event) => {
      const text =
        event?.results?.[0]?.[0]?.transcript ? event.results[0][0].transcript : "";
      const clean = String(text || "").trim();
      if (!clean) return;

      // ✅ Agrega lo dictado al final, sin sobrescribir lo que escribes
      setInput((prev) => (prev ? (prev + " " + clean) : clean));
      inputRef.current?.focus();
    };

    rec.onerror = () => {
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      inputRef.current?.focus();
    };

    recogRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {}
      recogRef.current = null;
    };
  }, []);

  const toggleMic = () => {
    const rec = recogRef.current;
    if (!rec) {
      alert("Tu navegador no soporta dictado por micrófono. Usa Chrome o Edge.");
      return;
    }

    // si estaba grabando, detener
    if (listening) {
      try {
        rec.stop();
      } catch {}
      setListening(false);
      inputRef.current?.focus();
      return;
    }

    try {
      setListening(true);
      rec.start(); // ✅ solo 1 frase (estable)
    } catch {
      setListening(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Listo. Empecemos de nuevo. ¿Qué necesitas revisar del motor?",
      },
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setInput("");

    const next = [...messages, { role: "user", content: text }];

    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: SYSTEM_HINT }, ...next],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error consultando asistente");

      setMessages([...next, { role: "assistant", content: data.content }]);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "⚠️ No pude responder ahora.\n\nDetalle: " +
            (e?.message || "Error desconocido"),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send();
  };

  const onKeyDownInput = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const Shell = ({ children }) => (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[9999] bg-stone-100 p-3 md:p-6"
          : "max-w-5xl mx-auto p-4 md:p-8"
      }
    >
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {children}
      </div>
    </div>
  );

  return (
    <Shell>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-stone-200 bg-white">
        <div>
          <div className="text-xs uppercase tracking-widest font-black text-stone-500">
            Asistente AI
          </div>
          <div className="text-xl md:text-2xl font-black text-stone-900">
            Rectificadora <span className="text-red-600">Suárez</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={toggleMic}
            className={
              "inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-semibold " +
              (listening ? "ring-2 ring-red-500" : "")
            }
            title={listening ? "Detener micrófono" : "Hablar por micrófono"}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
            {listening ? "Grabando..." : "Mic"}
          </button>

          <button
            type="button"
            onClick={clearChat}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-semibold"
            title="Limpiar chat"
          >
            <Trash2 size={16} />
            Limpiar
          </button>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 font-semibold"
            title={expanded ? "Salir pantalla completa (Esc)" : "Expandir"}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {expanded ? "Salir" : "Expandir"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 md:p-6">
        <div
          ref={listRef}
          className="h-[55vh] md:h-[60vh] overflow-y-auto mb-4 bg-white rounded-xl p-3 border border-stone-100"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={"mb-3 flex " + (msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={
                  "max-w-[92%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed " +
                  (msg.role === "user"
                    ? "bg-red-600 text-white shadow"
                    : "bg-stone-100 text-stone-900 border border-stone-200")
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading ? (
            <div className="mb-3 flex justify-start">
              <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-stone-100 text-stone-700 border border-stone-200">
                Escribiendo…
              </div>
            </div>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDownInput}
            rows={2}
            className="flex-1 resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
            placeholder={
              listening
                ? "Hablando… (dicta una frase, se agregará aquí)"
                : "Escribe tu pregunta… (Enter envía, Shift+Enter salto de línea)"
            }
          />

          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enviar"
          >
            <Send size={18} />
            Enviar
          </button>
        </form>

        <div className="mt-2 text-xs text-stone-500">
          Tip: Dime el motor + el problema (ej: “1NZ: humo azul al acelerar”).
        </div>
      </div>
    </Shell>
  );
}
