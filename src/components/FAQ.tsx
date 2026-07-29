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
      "No. You keep 100% of your property and its title, start to finish. Pauzible never takes a stake. We sit behind your existing mortgage and are repaid when you exit.",
  },
  {
    question: "How much can I release, and how fast?",
    answer:
      "Up to £500,000 per property subject to total LTV limits. You usually get a key-facts summary within 24 hours and the cash in about three weeks.",
  },
  {
    question: "What does it cost?",
    answer:
      "Two parts. Each month you pay a small share of your rent, matching the share of the property value you release. Release a fifth, pay about a fifth of the rent.You choose whether to pay the financing cost monthly or defer it to the end of your term. The repayment is made at the end of your term: the cash you released, with any deferred financing cost growing at the applicable rate, compounded monthly.On the property value-linked option, that payment also moves with your property's value.",
  },
  {
    question: "What's the difference between Fixed and Property value-linked options?",
    answer:
      "It's your choice. Fixed locks the end figure up front, so you know it exactly. Property value-linked repayment amount moves with your home: pay more if it rises, less if it falls.",
  },
  {
    question: "Will it affect my existing mortgage?",
    answer:
      "No. Pauzible sits behind your main mortgage, so your current rate and deal stay exactly as they are. No remortgage, no repricing on your existing mortgage.",
  },
  {
    question: "What's the term, and can I repay early?",
    answer:
      "Choose 2, 3 or 5 years. You can repay early at any time by paying the applicable repayment amount, and your monthly rent payments to Pauzible will stop. Just talk the timing through with us so the end figure is clear.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="flex flex-col items-center gap-8 bg-white px-5 pb-16 sm:px-8 md:gap-12 md:px-20 md:pb-24">
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
                  <span className="font-heading text-base font-semibold leading-6 tracking-[-0.24px] text-dark">
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
                    <p className="pb-5 text-base font-medium leading-6 tracking-[-0.16px] text-[#6b6d6b]">
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
