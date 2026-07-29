"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledDown = currentScrollY > lastScrollY.current;
      const pastThreshold = currentScrollY > 80;
      const shouldHide = scrolledDown && pastThreshold;

      setIsHidden(shouldHide);
      if (shouldHide) setIsMenuOpen(false);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-1/2 top-4 z-50 w-[1280px] max-w-[calc(100%-24px)] -translate-x-1/2 rounded-2xl border border-[#fce7f3] bg-gradient-to-r from-[#fff5f7] via-[#fde2e8] to-[rgba(251,207,232,0.3)] px-4 py-2.5 shadow-[0_4px_6px_rgba(252,206,232,0.4),0_2px_4px_rgba(252,206,232,0.4)] transition-transform duration-300 ease-in-out lg:top-12 lg:max-w-[calc(100%-40px)] lg:px-[25px] lg:py-[13px] ${
        isHidden ? "-translate-y-[calc(100%+32px)] lg:-translate-y-[calc(100%+64px)]" : "translate-y-0"
      }`}
      aria-label="Main navigation"
    >
      <div className="flex w-full items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 no-underline">
          <div
            className="size-7 shrink-0 bg-brand [mask-image:url(/logo-mask.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:28px_28px] [-webkit-mask-image:url(/logo-mask.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:28px_28px]"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap font-heading text-xl font-bold leading-8 tracking-[-0.6px] text-dark lg:text-2xl">
            Pauzible
          </span>
        </a>

        {/* Nav links */}
        <div className="hidden items-center gap-6 lg:flex">
          <a
            href="#"
            className="cursor-pointer whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
          >
            Calculator
          </a>
          <div
            className="flex cursor-pointer items-center gap-1"
            role="button"
            tabIndex={0}
            aria-haspopup="true"
          >
            <span className="whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark">
              Resources
            </span>
            <Image
              className="shrink-0"
              src="/chevron-down.svg"
              width={12}
              height={12}
              alt=""
              aria-hidden="true"
            />
          </div>
          <div
            className="flex cursor-pointer items-center gap-1"
            role="button"
            tabIndex={0}
            aria-haspopup="true"
          >
            <span className="whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark">
              Company
            </span>
            <Image
              className="shrink-0"
              src="/chevron-down.svg"
              width={12}
              height={12}
              alt=""
              aria-hidden="true"
            />
          </div>
          <a
            href="#"
            className="cursor-pointer whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
          >
            Partners
          </a>
        </div>

        {/* CTA */}
        <a
          href="#"
          className="hidden shrink-0 items-center gap-2 rounded-full bg-brand py-1 pl-3 pr-1 no-underline lg:inline-flex lg:gap-3 lg:pl-4"
        >
          <span className="whitespace-nowrap text-sm font-semibold leading-6 tracking-[-0.24px] text-brand-btn-text lg:text-base">
            Unlock Equity
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-btn-text">
            <Image className="block" src="/arrow-right.svg" width={16} height={16} alt="" aria-hidden="true" />
          </span>
        </a>

        {/* Hamburger toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 lg:hidden"
        >
          <span className="relative flex h-3 w-4 flex-col justify-between">
            <span
              className={`block h-0.5 w-full rounded-full bg-dark transition-transform duration-200 ${
                isMenuOpen ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full rounded-full bg-dark transition-opacity duration-200 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-full rounded-full bg-dark transition-transform duration-200 ${
                isMenuOpen ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="mt-4 flex flex-col items-stretch gap-1 border-t border-[#fce7f3] pt-4 lg:hidden">
          <a
            href="#"
            className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
          >
            Calculator
          </a>
          <div
            className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5"
            role="button"
            tabIndex={0}
            aria-haspopup="true"
          >
            <span className="whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark">
              Resources
            </span>
            <Image
              className="shrink-0"
              src="/chevron-down.svg"
              width={12}
              height={12}
              alt=""
              aria-hidden="true"
            />
          </div>
          <div
            className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5"
            role="button"
            tabIndex={0}
            aria-haspopup="true"
          >
            <span className="whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark">
              Company
            </span>
            <Image
              className="shrink-0"
              src="/chevron-down.svg"
              width={12}
              height={12}
              alt=""
              aria-hidden="true"
            />
          </div>
          <a
            href="#"
            className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
          >
            Partners
          </a>
          <a
            href="#"
            className="mt-2 inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-brand py-2 pl-4 pr-1 no-underline"
          >
            <span className="whitespace-nowrap text-sm font-semibold leading-6 tracking-[-0.24px] text-brand-btn-text">
              Unlock Equity
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-btn-text">
              <Image className="block" src="/arrow-right.svg" width={16} height={16} alt="" aria-hidden="true" />
            </span>
          </a>
        </div>
      )}
    </nav>
  );
}
