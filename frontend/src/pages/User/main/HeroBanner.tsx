import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BannerSlide } from "../../../types/features/product";
import { THEME_STYLES } from "../../../libs/constance";

interface HeroBannerProps {
  slides: BannerSlide[];
  autoPlayMs?: number;
}

export default function HeroBanner({
  slides,
  autoPlayMs = 5000,
}: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (i: number) => setIndex((i + slides.length) % slides.length),
    [slides.length],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    timerRef.current = setInterval(next, autoPlayMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next, autoPlayMs, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="group relative h-55 w-full overflow-hidden rounded-3xl sm:h-80 lg:h-105"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, i) => {
        const theme = THEME_STYLES[slide.theme];
        return (
          <div
            key={slide.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 px-6 sm:px-10 lg:px-14">
              <span
                className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${theme.badge}`}
              >
                {slide.eyebrow}
              </span>
              <h2 className="max-w-lg text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                {slide.title}
              </h2>
              <p className="max-w-md text-sm text-slate-200 sm:text-base">
                {slide.subtitle}
              </p>
              <a
                href={slide.ctaHref}
                className={`mt-2 w-fit rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors ${theme.button}`}
              >
                {slide.ctaLabel}
              </a>
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-opacity hover:bg-white/25 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-opacity hover:bg-white/25 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === index
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
