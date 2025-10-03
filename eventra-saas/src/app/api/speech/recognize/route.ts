import { NextResponse } from "next/server";

const PROVIDER = process.env.SPEECH_PROVIDER || "none"; // google|azure|whisper|none

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    // Support multipart/form-data (blob) and audio/* raw
    let audioBlob: Blob | null = null;
    let lang = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      lang = (form.get("lang") as string) || "";
      if (file && file instanceof File) {
        audioBlob = file;
      }
    } else {
      const buf = Buffer.from(await req.arrayBuffer());
      audioBlob = new Blob([buf], { type: contentType || "audio/webm" });
    }

    if (!audioBlob) return NextResponse.json({ error: "No audio provided" }, { status: 400 });

    switch (PROVIDER.toLowerCase()) {
      case "whisper":
        return NextResponse.json(await recognizeWithWhisper(audioBlob, lang));
      case "google":
        return NextResponse.json(await recognizeWithGoogle(audioBlob, lang));
      case "azure":
        return NextResponse.json(await recognizeWithAzure(audioBlob, lang));
      default:
        return NextResponse.json({ error: "Speech provider not configured" }, { status: 400 });
    }
  } catch (e) {
    console.error("speech recognize error", e);
    return NextResponse.json({ error: "Failed to transcribe" }, { status: 500 });
  }
}

async function recognizeWithWhisper(audio: Blob, lang: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { error: "Whisper not configured" };
  // Whisper requires multipart form
  const form = new FormData();
  const file = new File([await audio.arrayBuffer()], `audio.${mimeToExt(audio.type) || "webm"}`, { type: audio.type || "audio/webm" });
  form.append("file", file);
  form.append("model", "whisper-1");
  if (lang) form.append("language", lang);

  const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form as any,
  });
  if (!resp.ok) {
    return { error: `whisper_http_${resp.status}` };
  }
  const data: any = await resp.json();
  return { text: data.text || "", provider: "whisper" };
}

async function recognizeWithGoogle(audio: Blob, lang: string) {
  const key = process.env.GOOGLE_SPEECH_API_KEY;
  if (!key) return { error: "Google STT not configured" };
  const arrayBuf = await audio.arrayBuffer();
  const b64 = Buffer.from(arrayBuf).toString("base64");
  // Map language with sensible defaults
  const languageCode = mapLangToGoogle(lang);
  const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${key}`;
  const body = {
    config: {
      encoding: "WEBM_OPUS",
      enableAutomaticPunctuation: true,
      languageCode,
      alternativeLanguageCodes: ["ar-IQ", "en-US"],
      profanityFilter: false,
      model: "default",
    },
    audio: { content: b64 },
  };
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) return { error: `google_stt_http_${resp.status}` };
  const data: any = await resp.json();
  const text = (data.results || []).map((r: any) => r.alternatives?.[0]?.transcript || "").join(" ").trim();
  return { text, provider: "google" };
}

function mapLangToGoogle(lang: string) {
  const l = (lang || '').toLowerCase();
  if (l.startsWith('ar')) return 'ar-IQ';
  if (l.startsWith('ku') || l.startsWith('ckb')) return 'ckb-IQ'; // may fall back if unsupported
  return 'en-US';
}

async function recognizeWithAzure(audio: Blob, lang: string) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return { error: "Azure STT not configured" };
  const language = mapLangToAzure(lang);
  const endpoint = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(language)}`;
  const arrayBuf = await audio.arrayBuffer();
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": audio.type || "audio/webm; codecs=opus",
      "Accept": "application/json"
    },
    body: Buffer.from(arrayBuf)
  });
  if (!resp.ok) return { error: `azure_stt_http_${resp.status}` };
  const data: any = await resp.json().catch(() => ({}));
  const text = data?.DisplayText || data?.NBest?.[0]?.Display || "";
  return { text, provider: "azure" };
}

function mapLangToAzure(lang: string) {
  const l = (lang || '').toLowerCase();
  if (l.startsWith('ar')) return 'ar-IQ';
  if (l.startsWith('ku') || l.startsWith('ckb')) return 'ckb-IQ';
  return 'en-US';
}

function mimeToExt(mime?: string) {
  if (!mime) return "";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("wav")) return "wav";
  return "";
}
