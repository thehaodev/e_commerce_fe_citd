import { useEffect, useRef, useState } from "react";
import { heroSlides } from "../../../data/buyerHomeMock";

const HeroBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = heroSlides.length;
  const autoplayRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const AUTOPLAY_INTERVAL = 4500;
  const RESUME_DELAY = 6500;

  const clearAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const clearResumeTimeout = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const pauseAutoplay = () => {
    setIsPaused(true);
    clearAutoplay();
    clearResumeTimeout();
  };

  const resumeAutoplay = () => {
    clearResumeTimeout();
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, RESUME_DELAY);
  };

  const handlePrev = () => {
    pauseAutoplay();
    setActiveIndex((prev) => (prev - 1 + total) % total);
    resumeAutoplay();
  };

  const handleNext = () => {
    pauseAutoplay();
    setActiveIndex((prev) => (prev + 1) % total);
    resumeAutoplay();
  };

  const handleDotClick = (idx) => {
    pauseAutoplay();
    setActiveIndex(idx);
    resumeAutoplay();
  };

  useEffect(() => {
    if (isPaused || total <= 1) return undefined;
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL);
    return clearAutoplay;
  }, [isPaused, total]);

  useEffect(
    () => () => {
      clearAutoplay();
      clearResumeTimeout();
    },
    []
  );

  return (
    <section
      className="relative mx-auto mt-6 max-w-7xl px-4"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div className="relative min-h-[340px] overflow-hidden rounded-[32px] bg-[#0b1b34] text-white shadow-2xl sm:min-h-[380px] lg:min-h-[480px]">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#13294c]" />
        <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[#122642]" />
        <div className="pointer-events-none absolute inset-y-0 right-12 w-40 bg-gradient-to-b from-[#17345b]/60 to-transparent blur-3xl" />
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`grid grid-cols-1 items-center gap-8 px-6 pb-14 pt-7 transition duration-500 sm:px-8 lg:grid-cols-[1.05fr,0.95fr] lg:gap-10 lg:pb-14 lg:pt-9 ${
              index === activeIndex ? "opacity-100 translate-y-0" : "pointer-events-none absolute left-0 top-0 -translate-y-4 opacity-0"
            }`}
          >
            <div className="space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-yellow-200 shadow-sm ring-1 ring-white/10">
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                {slide.badge}
              </div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                {slide.title}
              </h1>
              <p className="text-base text-slate-200 sm:text-lg">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className="rounded-full bg-yellow-300 px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-yellow-200 transition hover:-translate-y-0.5 hover:shadow-xl">
                  {slide.cta}
                </button>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-yellow-200 shadow-sm ring-1 ring-white/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {slide.accent}
                </div>
              </div>
            </div>
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#10284a] via-[#0c1f3a] to-[#0f2847]" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#112743] p-4 shadow-xl">
                <div className="absolute -left-10 top-6 h-40 w-32 rotate-6 rounded-full bg-[#133055]/60 blur-2xl" />
                <div className="absolute -right-8 -bottom-10 h-48 w-32 rounded-full bg-[#153867]/40 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl bg-[#0d203b] p-3">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-[200px] w-full rounded-xl object-cover sm:h-[220px] lg:h-[220px]"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-6 pb-5 sm:flex-row sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 shadow-sm backdrop-blur">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => handleDotClick(idx)}
                className={`h-2.5 rounded-full transition ${
                  idx === activeIndex
                    ? "w-8 bg-yellow-300"
                    : "w-2.5 bg-white/50 hover:bg-yellow-200/80"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-lg ring-1 ring-white/15 transition hover:bg-white/25"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-lg ring-1 ring-white/15 transition hover:bg-white/25"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
