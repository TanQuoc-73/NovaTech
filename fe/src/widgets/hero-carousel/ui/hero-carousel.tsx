"use client";

import { useEffect, useState } from "react";

import type { Dictionary } from "@/shared/i18n";

type HeroCarouselProps = {
  dictionary: Dictionary;
};

const statsKeys = ["products", "brands", "support"] as const;

export function HeroCarousel({ dictionary }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = dictionary.hero.slides;
  const currentSlide = slides[activeSlide];
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
          <div className="h-[430px] overflow-hidden rounded-lg border border-amber-200 bg-[#3b2418] text-amber-50 shadow-xl shadow-amber-950/10 sm:h-[500px] md:h-[520px]">
            <div className="relative h-full p-5 sm:p-7 lg:p-8">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} opacity-95 transition-colors duration-700`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(255,255,255,0.24),transparent_20rem)]" />
              <div className="absolute bottom-0 right-0 h-56 w-56 rounded-tl-full bg-amber-50/10" />

              <div className="relative grid h-full grid-rows-[minmax(0,1fr)_auto_auto] gap-5">
                <div className="min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-amber-100">
                      {currentSlide.label}
                    </p>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-amber-50">
                      {currentSlide.tag}
                    </span>
                  </div>

                  <h2 className="mt-5 line-clamp-3 max-w-2xl text-2xl font-semibold leading-tight sm:mt-6 sm:text-4xl lg:text-5xl">
                    {currentSlide.title}
                  </h2>
                  <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-amber-50/80 sm:text-base sm:leading-7">
                    {currentSlide.description}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-[1fr_0.75fr]">
                      <div className="flex min-h-24 flex-col justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/75">
                          {currentSlide.deviceType}
                        </span>
                        <span className="mt-3 text-xl font-semibold text-white sm:mt-4 sm:text-3xl">
                          {currentSlide.price}
                        </span>
                      </div>
                      <div className="rounded-md bg-amber-50/90 p-4 text-stone-950">
                        <p className="text-xs font-semibold text-stone-500">
                          {currentSlide.highlightLabel}
                        </p>
                        <p className="mt-2 line-clamp-2 text-lg font-semibold leading-tight sm:text-xl">
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
                        <p className="mt-1 text-xs text-amber-100/75">
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
                        onClick={() => setActiveSlide(index)}
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
                className="group h-full overflow-hidden rounded-lg border border-amber-200 bg-[#3b2418] text-left text-amber-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/10"
              >
                <div className="relative h-full p-5">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90 transition group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.18),transparent_12rem)]" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-amber-100">
                          {slide.label}
                        </p>
                        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                          {slide.tag}
                        </span>
                      </div>
                      <h3 className="mt-5 line-clamp-3 text-2xl font-semibold leading-tight">
                        {slide.title}
                      </h3>
                    </div>

                    <div className="mt-6 rounded-md bg-white/12 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-100/75">
                        {slide.deviceType}
                      </p>
                      <p className="mt-2 text-lg font-semibold">{slide.price}</p>
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
