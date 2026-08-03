"use client";

import Image from "next/image";
import { useUnlockEquityDialog } from "@/components/UnlockEquityDialog";

export default function Hero() {
  const { openUnlockEquityDialog } = useUnlockEquityDialog();

  return (
    <section className="flex w-full flex-col bg-white px-5 sm:px-8 md:px-20">
      <div className="relative flex w-full flex-col overflow-hidden rounded-3xl lg:h-[580px]">
        {/* Background image */}
        <div
          className="pointer-events-none absolute inset-0 left-[-12.5%] top-0 h-[139.03%] w-[125%]"
          aria-hidden="true"
        >
          <Image src="/hero-bg.jpg" alt="" fill priority className="object-cover" />
        </div>

        {/* Dark overlay gradients */}
        {/* Mobile: uniform full-coverage tint so the whole section stays readable regardless of content height */}
        <div className="pointer-events-none absolute inset-0 bg-black/60 lg:hidden" aria-hidden="true" />
        {/* Desktop: directional fade, tuned for the wide layout where text sits on the left */}
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.54) 35.709%, rgba(0,0,0,0.408) 57.161%, rgba(0,0,0,0.216) 73.668%, rgba(0,0,0,0) 91.109%), linear-gradient(90deg, rgba(0,0,0,0.61) 0%, rgba(0,0,0,0.61) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative flex w-full flex-1 flex-col px-5 pb-12 pt-28 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:px-14 lg:pb-16 lg:pt-20">
          {/* Hero content */}
          <div className="flex w-full flex-col items-start gap-8 lg:w-auto lg:gap-12">
            <div className="flex w-full flex-col gap-6 lg:w-[600px]">
              <div className="flex w-full flex-col gap-2">
                <p className="font-heading text-xl font-semibold leading-8 tracking-[-0.75px] text-white lg:whitespace-nowrap lg:text-2xl">
                  For you landlords,
                </p>
                <h1 className="w-full font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[64px] lg:leading-[72px] lg:tracking-[-3px]">
                  Release Equity from your buy-to-lets
                </h1>
              </div>
              <p className="text-base font-medium leading-[26px] tracking-[-0.24px] text-white/85 lg:text-lg">
                Pauzible turns your property wealth into cash while you keep 100% ownership. A partner that shares
                the downside as well as the upside for 2, 3 or 5y terms.
              </p>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-3.5">
              <button
                type="button"
                onClick={openUnlockEquityDialog}
                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-brand py-2 pl-6 pr-2"
              >
                <span className="whitespace-nowrap text-lg font-semibold leading-[26px] tracking-[-0.24px] text-brand-btn-text">
                  Get started
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-btn-text">
                  <Image className="block" src="/arrow-white.svg" width={16} height={16} alt="" aria-hidden="true" />
                </span>
              </button>
              <a
                href="#equity-calculator"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-white px-[25px] py-[9px] no-underline"
              >
                <span className="whitespace-nowrap text-base font-semibold leading-[26px] tracking-[-0.24px] text-white lg:text-lg">
                  Calculate amount
                </span>
              </a>
            </div>
          </div>

          {/* Stats card */}
          <div
            className="relative z-[1] mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/20 px-2 backdrop-blur-[6.85px] lg:mt-0 lg:w-auto"
            aria-label="Key terms"
          >
            <div className="flex flex-col items-start justify-center gap-0.5 px-2 py-4">
              <span className="whitespace-nowrap text-xs font-medium leading-4 tracking-[-0.24px] text-white/90">
                Terms of
              </span>
              <span className="whitespace-nowrap font-heading text-base font-bold leading-[25px] tracking-[-0.24px] text-white/90">
                2, 3 or 5 years
              </span>
            </div>
            <div className="flex items-center self-stretch py-3.5">
              <div className="h-[45px] w-px bg-white/20" />
            </div>
            <div className="flex flex-col items-start justify-center gap-0.5 px-2 py-4">
              <span className="whitespace-nowrap text-xs font-medium leading-4 tracking-[-0.24px] text-white/90">
                Per property
              </span>
              <span className="whitespace-nowrap font-heading text-base font-bold leading-[25px] tracking-[-0.24px] text-white/90">
                <span className="font-semibold">Up to </span>£500K
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
