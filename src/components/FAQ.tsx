"use client";

import { useState } from "react";
import Image from "next/image";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "Do I give up any ownership of my property?",
    answer:
      "No. You keep full ownership and control of your property throughout. Pauzible releases equity against the property; it doesn't buy a stake in it.",
  },
  {
    question: "How much can I release, and how fast?",
    answer:
      "The amount depends on your property value, existing mortgage, and rental income. Most landlords get an indicative offer within days and funds released shortly after.",
  },
  {
    question: "What does it cost?",
    answer:
      "Pauzible charges a rate on the equity released, agreed upfront with no hidden fees. Your existing mortgage rate and terms stay untouched.",
  },
  {
    question: "What's the difference between Fixed and Property value-linked options?",
    answer:
      "Fixed keeps your cost predictable regardless of how the property performs. Property value-linked ties the cost to the property's value, which can mean a lower cost if growth is modest.",
  },
  {
    question: "Will it affect my existing mortgage?",
    answer:
      "No. Your existing mortgage stays in place with its current rate and terms. Pauzible sits alongside it, secured against your remaining equity.",
  },
  {
    question: "What's the term, and can I repay early?",
    answer:
      "Terms are flexible and agreed based on your plans for the property. You can repay early, typically without penalty — details are confirmed before you commit.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="flex flex-col items-center gap-8 bg-white px-5 pb-16 sm:px-8 md:gap-12 md:px-20 md:pb-24">
      <div className="flex w-[1280px] max-w-full flex-col items-center gap-4">
        <div className="flex h-[34px] items-center justify-center border-b-2 border-[#d6f39f]">
          <p className="font-heading text-xs font-bold uppercase tracking-[1.2px] text-[#6b6d6b]">
            Frequently Asked Questions
          </p>
        </div>
        <p className="text-center font-heading text-3xl font-bold leading-tight tracking-tight text-dark sm:text-4xl md:text-[48px] md:leading-[56px] md:tracking-[-1.5px]">
          Your questions, answered
        </p>
      </div>

      <div className="flex w-[831px] max-w-full flex-col items-center">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className={index === 0 ? "w-full" : "w-full pt-3"}>
              <div className="w-full rounded-2xl border border-[#e8e9e8] bg-white px-4 sm:px-[25px]">
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-heading text-base font-medium tracking-[-0.24px] text-dark">
                    {item.question}
                  </span>
                  <span
                    className="relative flex size-4 shrink-0 items-center justify-center transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <Image src="/faq/chevron-down.svg" alt="" width={16} height={16} />
                  </span>
                </button>
                <div
                  className="grid overflow-hidden transition-all duration-200 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-6 tracking-[-0.16px] text-[#6b6d6b]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
