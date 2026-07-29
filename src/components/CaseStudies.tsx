"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type CaseStudy = {
  image: string;
  alt: string;
  badge: string;
  heading: string;
  body: React.ReactNode;
};

function CardBody({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <div className="flex flex-col gap-3 py-5 md:px-[22px]">
      <p className="font-heading text-xl font-bold leading-8 tracking-[-1px] text-dark md:text-2xl">
        {caseStudy.heading}
      </p>
      <p className="text-base leading-6 tracking-[-0.16px] text-dark">{caseStudy.body}</p>
    </div>
  );
}

function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <>
      <div className="relative h-[280px] w-full shrink-0 md:h-[457px] md:w-[609px]">
        <Image src={caseStudy.image} alt={caseStudy.alt} fill className="object-cover" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(164.62deg, rgba(30,30,30,0.55) 2%, rgba(0,0,0,0) 34%)",
          }}
        />
        <div className="absolute left-6 top-6 flex items-center gap-1 rounded-xl bg-white/25 px-2 py-2 text-white backdrop-blur-md">
          <span className="text-xl leading-5">·</span>
          <span className="whitespace-nowrap text-base font-semibold leading-6 tracking-[-0.44px]">
            {caseStudy.badge}
          </span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center border border-black/10 bg-[#f5f5f5] p-5 md:p-6">
        <CardBody caseStudy={caseStudy} />
      </div>
    </>
  );
}

const caseStudies: CaseStudy[] = [
  {
    image: "/sam and joe.png",
    alt: "Sam and Jo standing outside their buy-to-let property",
    badge: "Low rate kept",
    heading: "Sam & Jo funded a refurb and held their low rate",
    body: (
      <>
        They had locked in a low, long-term rate to protect their returns. Pauzible released
        £100K against their equity. Their original mortgage stayed untouched. That paid for a
        loft conversion. Higher rent. Higher value. <span className="font-semibold">Same low rate.</span>
      </>
    ),
  },
  {
    image: "/testimonial-image.png",
    alt: "Landlord reviewing paperwork for their buy-to-let portfolio",
    badge: "Liquidity freed",
    heading: "Ellie kept the upside when her sale fell through",
    body: (
      <>
        A renovation ran over budget. To cover it, she put a rental on the market. A sale was agreed. At the last minute, the buyer pulled out. Pauzible released funds fast. A panic sale was avoided. She kept the property and any future upside.{" "}
        <span className="font-semibold">No rate reset, no early repayment charges.</span>
      </>
    ),
  },
  {
    image: "/landlord-couple.png",
    alt: "Retired landlord couple discussing their equity release plan",
    badge: "Deal secured",
    heading: "Jack & Mary moved fast on a rare opportunity",
    body: (
      <>
        Self-made build-to-rent landlords. A below-market buying opportunity came up. The window was closing. Pauzible released £250K against their equity. Cash ready. Deal done.{" "}
        <span className="font-semibold">Property kept. Income kept.</span>
      </>
    ),
  },
];

const TRANSITION_MS = 250;
const SWIPE_THRESHOLD_PX = 50;

export default function CaseStudies() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const isFading = activeIndex !== displayIndex;
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === caseStudies.length - 1;

  useEffect(() => {
    if (!isFading) return;
    const timeout = setTimeout(() => setDisplayIndex(activeIndex), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [activeIndex, isFading]);

  const goToPrevious = () => {
    if (isFirst) return;
    setActiveIndex((current) => current - 1);
  };

  const goToNext = () => {
    if (isLast) return;
    setActiveIndex((current) => current + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current <= -SWIPE_THRESHOLD_PX) {
      goToNext();
    } else if (touchDeltaX.current >= SWIPE_THRESHOLD_PX) {
      goToPrevious();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section className="flex flex-col items-center gap-8 bg-white px-5 pb-16 sm:px-8 md:gap-12 md:px-20 md:pb-24">
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex h-[34px] items-center justify-center border-b-2 border-[#d6f39f]">
          <p className="font-heading text-xs font-bold uppercase tracking-[2px] text-dark">
            In practice
          </p>
        </div>
        <p className="text-center font-heading text-3xl font-bold leading-tight tracking-tight text-dark sm:text-4xl md:text-[48px] md:leading-[56px] md:tracking-[-1.5px]">
          How real landlords use Pauzible
        </p>
      </div>

      <div className="flex w-[1188px] max-w-full flex-col items-center gap-6 md:gap-8">
        <div className="relative w-full">
          {/* Grid-stack: every case study is mounted at once, occupying the same cell, so the
              row's height is always the tallest card among them — the card never resizes when
              the slide changes, and stays in sync automatically if copy is edited later. */}
          <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl">
            {caseStudies.map((caseStudy, index) => {
              const isVisible = index === displayIndex;
              const isSettled = isVisible && !isFading;
              return (
                <div
                  key={caseStudy.heading}
                  className={`col-start-1 row-start-1 flex touch-pan-y flex-col transition-all ease-in-out md:flex-row ${
                    isVisible ? "" : "pointer-events-none"
                  }`}
                  style={{
                    transitionDuration: `${TRANSITION_MS}ms`,
                    opacity: isSettled ? 1 : 0,
                    transform: isSettled ? "translateX(0)" : "translateX(8px)",
                  }}
                  aria-hidden={!isVisible}
                  onTouchStart={isVisible ? handleTouchStart : undefined}
                  onTouchMove={isVisible ? handleTouchMove : undefined}
                  onTouchEnd={isVisible ? handleTouchEnd : undefined}
                >
                  <CaseStudyCard caseStudy={caseStudy} />
                </div>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Previous case study"
            onClick={goToPrevious}
            disabled={isFirst}
            className={
              isFirst
                ? "absolute left-2 top-[140px] hidden size-9 -translate-y-1/2 cursor-not-allowed items-center justify-center rounded-[22px] bg-brand/30 shadow-[0px_4px_8px_0px_rgba(56,56,56,0.1)] md:left-[-56px] md:top-1/2 md:flex md:size-11"
                : "absolute left-2 top-[140px] hidden size-9 -translate-y-1/2 items-center justify-center rounded-[22px] border border-[#e5e7eb] bg-brand shadow-[0px_4px_4px_0px_rgba(56,56,56,0.1)] transition-colors md:left-[-56px] md:top-1/2 md:flex md:size-11"
            }
          >
            <Image src="/case-studies/prev-arrow.svg" alt="" width={20} height={20} />
          </button>
          <button
            type="button"
            aria-label="Next case study"
            onClick={goToNext}
            disabled={isLast}
            className={
              isLast
                ? "absolute right-2 top-[140px] hidden size-9 -translate-y-1/2 cursor-not-allowed items-center justify-center rounded-[22px] bg-brand/30 shadow-[0px_4px_8px_0px_rgba(56,56,56,0.1)] md:right-[-56px] md:top-1/2 md:flex md:size-11"
                : "absolute right-2 top-[140px] hidden size-9 -translate-y-1/2 items-center justify-center rounded-[22px] border border-[#e5e7eb] bg-brand shadow-[0px_4px_4px_0px_rgba(56,56,56,0.1)] transition-colors md:right-[-56px] md:top-1/2 md:flex md:size-11"
            }
          >
            <Image src="/case-studies/next-arrow.svg" alt="" width={20} height={20} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {caseStudies.map((caseStudy, index) => (
            <button
              key={caseStudy.heading}
              type="button"
              aria-label={`Go to case study ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={
                index === activeIndex
                  ? "h-[7px] w-[24.5px] rounded-full bg-brand transition-all"
                  : "size-[7px] rounded-full bg-[#d9d9d9] transition-all"
              }
            />
          ))}
        </div>

        <p className="text-center text-xs font-medium leading-[18px] tracking-[-0.24px] text-[#6b6d6b]">
          Case studies are based on real Pauzible customers. Images are illustrative and posed by
          models to protect their identity.
        </p>
      </div>
    </section>
  );
}
