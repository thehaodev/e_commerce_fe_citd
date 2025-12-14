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
      className="relative mx-auto mt-4 max-w-7xl px-4"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div className="relative overflow-hidden rounded-3xl border border-amber-50 bg-gradient-to-br from-amber-50 via-white to-yellow-50 shadow-lg">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`grid grid-cols-1 items-center gap-8 px-6 pb-24 pt-10 transition duration-500 sm:px-10 sm:pt-12 lg:grid-cols-2 lg:gap-12 ${
              index === activeIndex ? "opacity-100" : "hidden opacity-0"
            }`}
          >
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-amber-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {slide.badge}
              </div>
              <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                {slide.title}
              </h1>
              <p className="text-base text-gray-600 sm:text-lg">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-amber-200 transition hover:-translate-y-0.5 hover:bg-amber-500">
                  {slide.cta}
                </button>
                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-amber-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {slide.accent}
                </div>
              </div>
            </div>
            <div className="relative h-full w-full overflow-hidden rounded-3xl">
              <div className="absolute inset-3 sm:inset-4 rounded-3xl bg-gradient-to-br from-white/60 to-white/20 shadow-inner" />
              <img
                src={slide.image}
                alt={slide.title}
                className="relative z-10 h-full w-full object-cover"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-5 sm:flex-row sm:justify-between sm:gap-4 sm:px-6">
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => handleDotClick(idx)}
                className={`h-2.5 rounded-full transition ${
                  idx === activeIndex
                    ? "w-8 bg-amber-500"
                    : "w-2.5 bg-gray-300 hover:bg-amber-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:bg-amber-50"
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
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:bg-amber-50"
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
