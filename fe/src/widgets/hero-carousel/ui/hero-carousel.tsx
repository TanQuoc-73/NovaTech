"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Dictionary, Locale } from "@/shared/i18n";

type HeroCarouselProps = {
  dictionary: Dictionary;
  locale: Locale;
};

const statsKeys = ["products", "brands", "support"] as const;

export function HeroCarousel({ dictionary, locale }: HeroCarouselProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = dictionary.hero.slides;
  const currentSlide = slides[activeSlide];
  const newsHref = `/news?lang=${locale}`;
  const sideSlides = slides
    .map((slide, index) => ({ slide, index }))
    .filter((item) => item.index !== activeSlide)
    .slice(0, 2);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((slide) => (slide + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="border-b border-amber-900/10 bg-[#fff8ed]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <div
            role="link"
            tabIndex={0}
            aria-label={currentSlide.title}
            onClick={() => router.push(newsHref)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(newsHref);
              }
            }}
            className="h-[430px] cursor-pointer overflow-hidden rounded-lg border border-amber-200 bg-[#111827] text-[#f8fafc] shadow-xl shadow-amber-950/10 outline-none transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ed] sm:h-[500px] md:h-[520px]"
          >
            <div className="relative h-full p-5 sm:p-7 lg:p-8">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} opacity-95 transition-colors duration-700`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.18),transparent_18rem)]" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />

              <div className="relative grid h-full grid-rows-[minmax(0,1fr)_auto_auto] gap-5">
                <div className="min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/15 text-sm font-black tracking-tight text-white">
                        N
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfdbfe]">
                          NovaTech
                        </p>
                        <p className="truncate text-sm font-semibold text-[#f8fafc]">
                          {currentSlide.label}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-[#f8fafc]">
                      {currentSlide.tag}
                    </span>
                  </div>

                  <h2 className="mt-5 line-clamp-3 max-w-2xl text-2xl font-semibold leading-tight text-[#f8fafc] sm:mt-6 sm:text-4xl lg:text-5xl">
                    {currentSlide.title}
                  </h2>
                  <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-[#dbeafe] sm:text-base sm:leading-7">
                    {currentSlide.description}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-[1fr_0.75fr]">
                      <div className="flex min-h-24 flex-col justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bfdbfe]">
                          {currentSlide.deviceType}
                        </span>
                        <span className="mt-3 text-xl font-semibold text-[#ffffff] sm:mt-4 sm:text-3xl">
                          {currentSlide.price}
                        </span>
                      </div>
                      <div className="rounded-md bg-white/90 p-4 text-[#0f172a]">
                        <p className="text-xs font-semibold text-[#475569]">
                          {currentSlide.highlightLabel}
                        </p>
                        <p className="mt-2 line-clamp-2 text-lg font-semibold leading-tight text-[#0f172a] sm:text-xl">
                          {currentSlide.highlight}
                        </p>
                      </div>
                    </div>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {statsKeys.map((key) => (
                      <div key={key} className="rounded-md bg-black/15 p-3 sm:p-4">
                        <p className="text-xl font-semibold sm:text-2xl">
                          {dictionary.hero.stats[key].value}
                        </p>
                        <p className="mt-1 text-xs text-[#bfdbfe]">
                          {dictionary.hero.stats[key].label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        aria-label={`${dictionary.hero.goToSlide} ${index + 1}`}
                        aria-current={activeSlide === index ? "true" : undefined}
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveSlide(index);
                        }}
                        className={`h-2.5 rounded-full transition-all ${
                          activeSlide === index
                            ? "w-9 bg-amber-200"
                            : "w-2.5 bg-white/35 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden h-[580px] gap-5 md:h-[520px] lg:grid">
            {sideSlides.map(({ slide, index }) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActiveSlide(index)}
                className="group h-full overflow-hidden rounded-lg border border-amber-200 bg-[#111827] text-left text-[#f8fafc] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/10"
              >
                <div className="relative h-full p-5">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90 transition group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.14),transparent_38%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.14),transparent_12rem)]" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#bfdbfe]">
                            NovaTech
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#f8fafc]">
                            {slide.label}
                          </p>
                        </div>
                        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                          {slide.tag}
                        </span>
                      </div>
                      <h3 className="mt-5 line-clamp-3 text-2xl font-semibold leading-tight text-[#f8fafc]">
                        {slide.title}
                      </h3>
                    </div>

                    <div className="mt-6 rounded-md bg-white/12 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#bfdbfe]">
                        {slide.deviceType}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#ffffff]">{slide.price}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
