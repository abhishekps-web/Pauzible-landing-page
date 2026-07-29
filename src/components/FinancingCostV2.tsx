"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type InterestTab = "full" | "partial" | "rent";
type RepaymentTab = "downside" | "base" | "upside";

function TabSwitcher<T extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [thumbRect, setThumbRect] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === active);
    const activeButton = buttonRefs.current[activeIndex];
    if (activeButton) {
      setThumbRect({ left: activeButton.offsetLeft, width: activeButton.offsetWidth });
    }
  }, [active, tabs]);

  return (
    <div
      className={`relative flex w-full items-stretch justify-center gap-1 rounded-full border border-[rgba(131,13,65,0.15)] bg-[#f9eef2] p-1 ${className}`}
    >
      {thumbRect && (
        <div
          className="absolute top-1 bottom-1 rounded-full border border-[#e8e9e8] bg-brand drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out"
          style={{ left: thumbRect.left, width: thumbRect.width }}
        />
      )}
      {tabs.map((tab, index) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative z-10 flex flex-1 items-center justify-center whitespace-normal rounded-full px-2 py-1.5 text-center text-xs font-semibold leading-tight tracking-[-0.24px] transition-colors duration-300 ease-out sm:whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm sm:leading-normal ${
              isActive ? "text-white" : "text-[#4f514f]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

const INTEREST_ASSETS: Record<InterestTab, { src: string; alt: string }> = {
  full: {
    src: "/financing-cost/interest-cost-chart.png",
    alt: "Diagram showing full monthly payment covering the entire interest cost",
  },
  partial: {
    src: "/financing-cost/interest-cost-chart-partial.png",
    alt: "Diagram showing £400 Pauzible rent share plus £400 interest cost equals £800 monthly payment",
  },
  rent: {
    src: "/interest-cost-chart-rent -2.png",
    alt: "Diagram showing rent share only, with interest cost deferred to the end of term",
  },
};

const REPAYMENT_ASSETS: Record<RepaymentTab, { src: string; alt: string }> = {
  downside: {
    src: "/financing-cost/repayment-chart-downside.png",
    alt: "Diagram showing final repayment reduced by a 10% property value downside adjustment",
  },
  base: {
    src: "/financing-cost/repayment-chart.png",
    alt: "Diagram showing £100K principal plus £41K interest and adjustment equals £141K final repayment",
  },
  upside: {
    src: "/repayment-chart-upside.png",
    alt: "Diagram showing final repayment increased by a 10% property value upside adjustment",
  },
};

type CardShellProps<T extends string> = {
  children: React.ReactNode;
} & (
  | { variant: "tabbed"; tabs: { value: T; label: string }[]; active: T; onChange: (value: T) => void; tabClassName?: string }
  | { variant: "plain" }
);

function CardShell<T extends string>(props: CardShellProps<T>) {
  const { children } = props;
  return (
    <div className="relative flex h-auto min-h-[420px] w-full flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-[#e4e4e4] p-6 sm:h-[520px]">
      <Image
        src="/financing-cost/card-bg-texture.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 420px, 100vw"
        className="pointer-events-none rounded-3xl object-cover opacity-25"
      />
      {props.variant === "tabbed" && (
        <TabSwitcher active={props.active} onChange={props.onChange} tabs={props.tabs} className={props.tabClassName} />
      )}
      {children}
    </div>
  );
}

export default function FinancingCostV2() {
  const [interestTab, setInterestTab] = useState<InterestTab>("full");
  const [repaymentTab, setRepaymentTab] = useState<RepaymentTab>("base");

  return (
    <section className="flex flex-col items-start gap-10 bg-white px-5 pb-16 pt-10 sm:px-8 lg:gap-16 lg:px-20 lg:pb-24 lg:pt-16">
      <div className="flex w-full flex-col items-center gap-4 text-center">
        <p className="font-heading text-3xl font-bold leading-tight tracking-tight text-dark sm:text-4xl lg:text-[48px] lg:leading-[56px] lg:tracking-[-1.5px]">
          Financing cost, your way
        </p>
        <p className="w-full max-w-[958px] text-base font-medium leading-[26px] tracking-[-0.24px] text-[#6b6d6b] lg:text-lg lg:leading-[29px]">
          Pay monthly to save overall, or defer it to the end to protect cash flow today. Link your
          final repayment to your property&apos;s value and share the ups and downs, or fix it upfront.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
        {/* Rent Share Card */}
        <CardShell variant="plain">
          <div className="relative mx-auto h-[270px] w-[220px] shrink-0 sm:h-[296px] sm:w-[241px]">
            <Image
              src="/financing-cost/rent-share-illustration.png"
              alt="Diagram showing £2,000 rent split into your £1,600 share and Pauzible's £400 share"
              fill
              sizes="(min-width: 640px) 274px, 200px"
              className="object-cover"
            />
          </div>
          <div className="relative flex w-full flex-col items-start gap-2 tracking-[-0.24px]">
            <p className="font-heading text-xl font-bold text-dark">
              Rent Share <span className="font-heading text-base font-semibold text-[#6b6d6b]">(Monthly)</span>
            </p>
            <p className="text-base font-medium leading-6 text-[#6b6d6b] sm:h-[72px]">
              In return for unlocking your equity, Pauzible receives a small share of your rent.</p>
          </div>
        </CardShell>

        {/* Interest Cost Card */}
        <CardShell
          variant="tabbed"
          active={interestTab}
          onChange={setInterestTab}
          tabs={[
            { value: "full", label: "Full monthly" },
            { value: "partial", label: "Partial" },
            { value: "rent", label: "Rent share only" },
          ]}
        >
          <div className="relative h-[190px] w-full shrink-0">
            <Image
              key={INTEREST_ASSETS[interestTab].src}
              src={INTEREST_ASSETS[interestTab].src}
              alt={INTEREST_ASSETS[interestTab].alt}
              fill
              sizes="(min-width: 1024px) 400px, 90vw"
              className="scale-[1.03] object-contain"
            />
          </div>
          <div className="relative flex w-full flex-col items-start gap-2 tracking-[-0.24px]">
            <p className="font-heading text-xl font-bold text-dark">Interest Cost</p>
            <p className="text-base font-medium leading-6 text-[#6b6d6b] sm:h-[72px]">
              Choose to pay financing costs monthly or at the end of the financing term with monthly compounding.
            </p>
          </div>
        </CardShell>

        {/* Final Repayment Card */}
        <CardShell
          variant="tabbed"
          active={repaymentTab}
          onChange={setRepaymentTab}
          tabClassName="max-w-[364px]"
          tabs={[
            { value: "downside", label: "Downside −10%" },
            { value: "base", label: "Base" },
            { value: "upside", label: "Upside +10%" },
          ]}
        >
          <div className={`relative w-full shrink-0 ${repaymentTab === "base" ? "h-[157px]" : "h-[195px]"}`}>
            <Image
              key={REPAYMENT_ASSETS[repaymentTab].src}
              src={REPAYMENT_ASSETS[repaymentTab].src}
              alt={REPAYMENT_ASSETS[repaymentTab].alt}
              fill
              sizes="(min-width: 1024px) 400px, 90vw"
              className={`object-contain ${repaymentTab === "base" ? "scale-[1.053]" : "scale-[1.125]"}`}
            />
          </div>
          <div className="relative flex w-full flex-col items-start gap-2 tracking-[-0.24px]">
            <p className="font-heading text-xl font-bold text-dark">
              Final Repayment{" "}
              <span className="font-heading text-base font-semibold text-[#6b6d6b]">
                (Property Value-Linked) 
              </span>
            </p>
            <p className="text-base font-medium leading-6 text-[#6b6d6b] sm:h-[72px]">
              At the end of the financing term, repayment reflects your property&apos;s market value.
              Pauzible shares in both upside and downside.
            </p>
          </div>
        </CardShell>
      </div>
    </section>
  );
}
