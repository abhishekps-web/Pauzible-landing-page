"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function BenefitCard({
  icon,
  video,
  isActive,
  onVideoEnded,
  badge,
  title,
  description,
}: {
  icon?: string;
  video?: string;
  isActive?: boolean;
  onVideoEnded?: () => void;
  badge: string;
  title: string;
  description: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<SVGRectElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const setProgress = (fraction: number) => {
      const stroke = strokeRef.current;
      if (stroke) stroke.style.strokeDashoffset = String(1 - fraction);
    };

    let rafId: number;
    let startTime: number | null = null;
    const tick = (now: number) => {
      const duration = el.duration;
      if (duration) {
        if (startTime === null) startTime = now;
        const elapsed = (now - startTime) / 1000;
        setProgress(Math.min(elapsed / duration, 1));
      }
      rafId = requestAnimationFrame(tick);
    };

    if (isActive) {
      el.currentTime = 0;
      setProgress(0);
      el.play().catch(() => {});
      rafId = requestAnimationFrame(tick);
    } else {
      el.pause();
      el.currentTime = 0;
    }

    return () => cancelAnimationFrame(rafId);
  }, [isActive]);

  return (
    <div ref={cardRef} className="relative flex w-full flex-col items-start gap-4 rounded-3xl border border-[#e8e9e8] bg-white p-4 shadow-[0_2px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:gap-5 sm:p-[21px]">
      {size.width > 0 && size.height > 0 && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{ opacity: isActive ? 1 : 0 }}
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          <rect
            ref={strokeRef}
            x={1}
            y={1}
            width={size.width - 2}
            height={size.height - 2}
            rx={23}
            fill="none"
            stroke="#E990B7"
            strokeWidth={2}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
          />
        </svg>
      )}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl sm:size-[158px]">
        {video ? (
          <video
            ref={videoRef}
            src={video}
            muted
            playsInline
            onEnded={onVideoEnded}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <Image src={icon!} alt="" fill className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col items-start gap-2.5">
        <div className="flex h-[34px] items-center justify-center border-b-2 border-[#d6f39f]">
          <p className="font-heading text-xs font-bold uppercase tracking-[2px] text-dark">
            {badge}
          </p>
        </div>
        <p className="font-heading text-xl font-bold leading-7 tracking-[-1.5px] text-dark">
          {title}
        </p>
        <p className="text-base font-medium leading-6 tracking-[-0.24px] text-[#6b6d6b]">
          {description}
        </p>
      </div>
    </div>
  );
}

const BENEFITS = [
  {
    video: "/BTL.mp4",
    badge: "Expand",
    title: "Buy another BTL property",
    description: "Use it as the deposit on your next buy-to-let and grow your portfolio.",
  },
  {
    video: "/renovate.mp4",
    badge: "Improve",
    title: "Renovate & add value",
    description: "Fund refurbishments and EPC upgrades that lift both your rent and resale value.",
  },
  {
    video: "/cashflow.mp4",
    badge: "Strengthen",
    title: "Boost your cash flow",
    description:
      "Free up working capital to reinvest in your business, cover rising costs, or steady your finances.",
  },
];

export default function GrowYourWealth() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="flex flex-col items-start gap-10 bg-white px-5 pb-16 sm:px-8 lg:flex-row lg:gap-25 lg:px-20 lg:pb-28">
      <div className="flex w-full shrink-0 flex-col gap-6 py-8 sm:gap-8 lg:sticky lg:top-8 lg:w-[571px] lg:max-w-full lg:py-18">
        <p className="w-full font-heading text-3xl font-bold leading-tight tracking-tight text-dark sm:text-4xl lg:text-[48px] lg:leading-[56px] lg:tracking-[-1.5px]">
          Grow your wealth with Pauzible
        </p>

        <div className="flex w-full max-w-[465px] shrink-0 flex-col items-start gap-2 rounded-3xl border-2 border-white bg-gradient-to-b from-[rgba(254,219,236,0.7)] to-[rgba(254,202,227,0.7)] px-6 py-8 shadow-[0px_8px_12px_0px_rgba(56,56,56,0.1)] sm:px-9 sm:py-10">
          <p className="w-full font-fira text-base font-bold uppercase tracking-[0.8px] text-dark">
            You release upto
          </p>
          <p className="w-full font-fira text-4xl font-extrabold leading-tight tracking-tight text-brand sm:text-[56px] sm:leading-[60px] sm:tracking-[-1px]">
            £500,000
          </p>
          <p className="w-full font-fira text-base font-medium text-[#6b6d6b]">
            Per property in cash
          </p>
        </div>

        <p className="text-base font-medium leading-[26px] tracking-[-0.24px] text-[#6b6d6b] lg:text-lg">
          Pauzible partnership unlocks capital from your property, empowering you to invest in
          your business, seize opportunities, and grow your wealth.
        </p>
      </div>

      <div className="flex w-full flex-1 flex-col items-center gap-5 lg:py-18">
        {BENEFITS.map((benefit, index) => (
          <BenefitCard
            key={benefit.title}
            video={benefit.video}
            badge={benefit.badge}
            title={benefit.title}
            description={benefit.description}
            isActive={index === activeIndex}
            onVideoEnded={() => setActiveIndex((i) => (i + 1) % BENEFITS.length)}
          />
        ))}
      </div>
    </section>
  );
}
