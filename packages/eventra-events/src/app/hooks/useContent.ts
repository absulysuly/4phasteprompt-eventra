"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

export function useContentOverride(key: string) {
  const { language } = useLanguage();
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`/api/content?key=${encodeURIComponent(key)}&locale=${encodeURIComponent(language)}`);
        const json = await res.json();
        if (!active) return;
        setValue(json?.content?.data ?? null);
      } catch {
        if (!active) return;
        setValue(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [key, language]);

  return { value, loading };
}