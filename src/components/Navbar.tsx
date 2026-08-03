"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useUnlockEquityDialog } from "@/components/UnlockEquityDialog";

type DropdownKey = "resources" | "company";

const DROPDOWNS: Record<
  DropdownKey,
  { label: string; items: { label: string; href: string }[] }
> = {
  resources: {
    label: "Resources",
    items: [
      { label: "Knowledge hub", href: "#" },
      { label: "Insights", href: "#" },
    ],
  },
  company: {
    label: "Company",
    items: [
      { label: "About Us", href: "#" },
      { label: "FAQ", href: "#faq" },
    ],
  },
};

export default function Navbar() {
  const { openUnlockEquityDialog } = useUnlockEquityDialog();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] =
    useState<DropdownKey | null>(null);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledDown = currentScrollY > lastScrollY.current;
      const pastThreshold = currentScrollY > 80;
      const shouldHide = scrolledDown && pastThreshold;

      setIsHidden(shouldHide);
      if (shouldHide) {
        setIsMenuOpen(false);
        setOpenDropdown(null);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white px-5 pb-6 pt-4 transition-transform duration-300 ease-in-out sm:px-8 md:px-20 lg:pb-12 lg:pt-12 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav
        ref={navRef}
        className="relative z-10 mx-auto w-[1280px] max-w-full rounded-2xl border border-[#fce7f3] bg-gradient-to-r from-[#fff5f7] via-[#fde2e8] to-[rgba(251,207,232,0.3)] px-4 py-2.5 shadow-[0_4px_6px_rgba(252,206,232,0.4),0_2px_4px_rgba(252,206,232,0.4)] lg:px-[25px] lg:py-[13px]"
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
              href="#what-is-pauzible"
              className="cursor-pointer whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
            >
              What is Pauzible
            </a>
            <a
              href="#equity-calculator"
              className="cursor-pointer whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
            >
              Calculator
            </a>
            {(Object.keys(DROPDOWNS) as DropdownKey[]).map((key) => {
              const dropdown = DROPDOWNS[key];
              const isOpen = openDropdown === key;
              return (
                <div key={key} className="relative">
                  <div
                    className="flex cursor-pointer items-center gap-1"
                    role="button"
                    tabIndex={0}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenDropdown((prev) => (prev === key ? null : key))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenDropdown((prev) => (prev === key ? null : key));
                      }
                    }}
                  >
                    <span className="whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark">
                      {dropdown.label}
                    </span>
                    <Image
                      className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      src="/chevron-down.svg"
                      width={12}
                      height={12}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-2 flex min-w-[180px] flex-col gap-1 rounded-2xl border border-[#fce7f3] bg-white p-2 shadow-[0_10px_24px_rgba(131,13,65,0.12)]">
                      {dropdown.items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline hover:bg-[#fff5f7]"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <a
              href="#"
              className="cursor-pointer whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
            >
              Partners
            </a>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={openUnlockEquityDialog}
            className="hidden shrink-0 items-center gap-2 rounded-full bg-brand py-1 pl-3 pr-1 lg:inline-flex lg:gap-3 lg:pl-4"
          >
            <span className="whitespace-nowrap text-sm font-semibold leading-6 tracking-[-0.24px] text-brand-btn-text lg:text-base">
              Unlock Equity
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-btn-text">
              <Image
                className="block"
                src="/arrow-right.svg"
                width={16}
                height={16}
                alt=""
                aria-hidden="true"
              />
            </span>
          </button>

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
              href="#what-is-pauzible"
              onClick={() => setIsMenuOpen(false)}
              className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
            >
              What is Pauzible
            </a>
            <a
              href="#equity-calculator"
              onClick={() => setIsMenuOpen(false)}
              className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium leading-5 tracking-[-0.24px] text-dark no-underline"
            >
              Calculator
            </a>
            {(Object.keys(DROPDOWNS) as DropdownKey[]).map((key) => {
              const dropdown = DROPDOWNS[key];
              const isOpen = openMobileDropdown === key;
              return (
                <div key={key} className="flex flex-col">
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5"
                    role="button"
                    tabIndex={0}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenMobileDropdown((prev) =>
                        prev === key ? null : key,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenMobileDropdown((prev) =>
                          prev === key ? null : key,
                        );
                      }
                    }}
                  >
                    <span className="whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.24px] text-dark">
                      {dropdown.label}
                    </span>
                    <Image
                      className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      src="/chevron-down.svg"
                      width={12}
                      height={12}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>
                  {isOpen && (
                    <div className="flex flex-col gap-1 py-1 pl-6">
                      {dropdown.items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={() => {
                            setOpenMobileDropdown(null);
                            setIsMenuOpen(false);
                          }}
                          className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium leading-5 tracking-[-0.24px] text-[#6b6d6b] no-underline"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
                <Image
                  className="block"
                  src="/arrow-right.svg"
                  width={16}
                  height={16}
                  alt=""
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
