import { useState, useRef, useEffect } from "react";
import { TypingAnimation } from "@/components/vendored/TypingAnimation";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setVideoReady(true);
    video.addEventListener("canplay", handleCanPlay);

    // If already ready (cached)
    if (video.readyState >= 3) setVideoReady(true);

    return () => video.removeEventListener("canplay", handleCanPlay);
  }, []);

  return (
    <section className="relative isolate flex flex-col items-center justify-center overflow-hidden h-[85svh] min-h-[520px] md:h-[100svh] md:min-h-[600px]">
      {/* Video background — edge-to-edge, full-bleed, no letterboxing */}
      <video
        ref={videoRef}
        src="/hero-loop.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className={`absolute inset-0 -z-20 h-full w-full object-cover object-center transition-opacity duration-700 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Ken Burns poster fallback (shows while video loads / if video fails / reduced motion) */}
      <img
        src="/hero-poster.jpg"
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 -z-20 h-full w-full object-cover object-center ken-burns ${
          videoReady ? "opacity-0" : "opacity-100"
        } transition-opacity duration-700`}
        loading="eager"
        fetchPriority="high"
      />

      {/* Ultra-light uniform neutral scrim (8% black) for headline legibility without dimming footage */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-black/[0.08]"
        aria-hidden="true"
      />

      {/* Bottom-anchored neutral separation gradient: to-top, rgba(0,0,0,0.45) at bottom -> transparent by 40% height */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 40%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center text-primary-foreground sm:px-6">
        <p
          className="eyebrow text-sm text-accent font-semibold tracking-wider font-crow"
          style={{
            textShadow: "0 2px 16px rgba(0, 0, 0, 0.45)",
            fontFamily: "'Crow Inline Grunge', 'Halenoir Compact', sans-serif",
          }}
        >
          Handpicked journeys since 2011
        </p>
        <h1
          className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl text-white font-bold font-tropikal"
          style={{
            textShadow: "0 2px 24px rgba(0, 0, 0, 0.45)",
            fontFamily: "'Tropikal', 'Tropikal Bold', serif",
          }}
        >
          Every great trip begins with a single search
        </h1>
        <TypingAnimation
          as="p"
          className="mx-auto mt-5 max-w-2xl text-base text-white/90 sm:text-lg italic font-alga"
          style={{
            textShadow: "0 2px 24px rgba(0, 0, 0, 0.45)",
            fontFamily: "'Alga', 'Halenoir Compact', serif",
          }}
          duration={2800}
          delay={400}
          fontFamily="Alga"
        >
          Discover destinations, compare tour packages, book hotels and flights, and plan each day
          of your itinerary — all in one place.
        </TypingAnimation>
      </div>
    </section>
  );
}
