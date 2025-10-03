"use client";

import React, { useEffect, useRef, useState } from "react";
import type { StoryItem } from "./StoriesStrip";

export default function StoryPlayer({ stories, startIndex, onClose }: { stories: StoryItem[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const story = stories[index];

  useEffect(() => {
    setMuted(true);
  }, [index]);

  useEffect(() => {
    if (story?.mediaType === "IMAGE") {
      const t = setTimeout(() => next(), 5000);
      return () => clearTimeout(t);
    }
  }, [index, story]);

  function next() {
    setIndex((i) => (i + 1) % stories.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + stories.length) % stories.length);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button className="absolute top-6 right-6 text-white text-xl" onClick={onClose} aria-label="Close">✕</button>
      <button className="absolute left-4 md:left-10 text-white/80 text-3xl" onClick={prev} aria-label="Prev">‹</button>
      <button className="absolute right-4 md:right-10 text-white/80 text-3xl" onClick={next} aria-label="Next">›</button>

      <div className="w-full max-w-sm md:max-w-lg aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl relative">
        {story.mediaType === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.mediaUrl} alt={story.caption || "story"} className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={story.mediaUrl}
            autoPlay
            playsInline
            muted={muted}
            onEnded={next}
            controls={false}
          />
        )}
        {story.mediaType === "VIDEO" && (
          <button
            className="absolute bottom-4 right-4 bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur"
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        )}
        {story.caption && (
          <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow-lg">
            {story.caption}
          </div>
        )}
      </div>
    </div>
  );
}
