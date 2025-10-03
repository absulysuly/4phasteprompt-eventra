"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "./LanguageProvider";

export type StoryItem = {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  user?: { name?: string | null };
  venue?: { publicId: string; category?: string | null; translations?: any } | null;
};

export default function StoriesStrip({ onOpen }: { onOpen: (stories: StoryItem[], startIndex: number) => void }) {
  const { language } = useLanguage();
  const [stories, setStories] = useState<StoryItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/stories?lang=${language}`);
        const json = await res.json();
        const mapped: StoryItem[] = (json.stories || []).map((s: any) => ({
          id: s.id,
          mediaType: s.mediaType,
          mediaUrl: s.mediaUrl,
          thumbnailUrl: s.thumbnailUrl,
          caption: s.caption,
          user: { name: s.user?.name || s.user?.email?.split("@")[0] },
          venue: s.venue ? { publicId: s.venue.publicId, category: s.venue.category, translations: s.venue.translations } : null,
        }));
        setStories(mapped);
      } catch {
        setStories([]);
      }
    };
    load();
  }, [language]);

  if (!stories.length) return null;

  return (
    <div className="w-full bg-white/5 backdrop-blur-sm py-4">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <div className="flex gap-4">
          {stories.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onOpen(stories, i)}
              className="flex-shrink-0 w-20 focus:outline-none"
              aria-label="Open story"
            >
              <div className="relative w-20 h-20 rounded-full ring-2 ring-pink-400/70 p-1 bg-gradient-to-tr from-pink-500 to-yellow-400">
                <div className="w-full h-full rounded-full overflow-hidden bg-black">
                  {s.mediaType === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.thumbnailUrl || s.mediaUrl} alt={s.caption || "story"} className="w-full h-full object-cover" />
                  ) : (
                    <video
                      className="w-full h-full object-cover"
                      src={s.mediaUrl}
                      muted
                      playsInline
                      preload="metadata"
                      // Poster frame if provided
                      poster={s.thumbnailUrl || undefined}
                    />
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-white/90 truncate text-center w-20">
                {s.user?.name || (s.venue ? "Venue" : "Story")}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
