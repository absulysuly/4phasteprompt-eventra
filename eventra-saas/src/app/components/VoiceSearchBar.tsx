"use client";

import React, { useRef, useState } from "react";
import SearchSuggest from "./SearchSuggest";
import { useLanguage } from "./LanguageProvider";

export default function VoiceSearchBar({
  value,
  onChange,
  onInterpret,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onInterpret?: (result: any) => void;
  placeholder?: string;
  className?: string;
}) {
  const { language } = useLanguage();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribe(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch (e: any) {
      setError(e?.message || "Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function transcribe(blob: Blob) {
    try {
      const form = new FormData();
      form.append("file", new File([blob], "audio.webm", { type: "audio/webm" }));
      // Pass BCP-47 codes; ar-IQ / ckb-IQ are preferred
      const lang = language === 'ar' ? 'ar-IQ' : language === 'ku' ? 'ckb-IQ' : 'en';
      form.append("lang", lang);
      const resp = await fetch("/api/speech/recognize", { method: "POST", body: form });
      const data = await resp.json();
      if (data?.text) {
        onChange(data.text);
        // Try interpret
        const interp = await fetch("/api/search/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: data.text, lang: language }),
        });
        const interpJson = await interp.json();
        onInterpret?.(interpJson);
      } else if (data?.error) {
        setError("Speech not recognized. Please try again.");
      }
    } catch (e) {
      setError("Failed to process audio");
    }
  }

  return (
    <div className={`relative ${className || ''}`}>
      <SearchSuggest value={value} onChange={onChange} placeholder={placeholder} />
      <button
        type="button"
        className={`absolute ${language === 'ar' || language === 'ku' ? 'left-2' : 'right-2'} top-2 bg-black/60 text-white px-3 py-2 rounded-full hover:bg-black/80 transition`}
        onClick={() => recording ? stopRecording() : startRecording()}
        aria-label="Voice search"
        title="Voice search"
      >
        {recording ? "■" : "🎙️"}
      </button>
      {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
    </div>
  );
}
