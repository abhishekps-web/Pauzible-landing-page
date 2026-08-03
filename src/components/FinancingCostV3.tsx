"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type InterestTab = "rent" | "partial" | "full";
type RepaymentTab = "downside" | "base" | "upside";

const PINK_CREAM_GRADIENT =
  "linear-gradient(90deg, rgb(253, 226, 232) 0%, rgb(253, 226, 232) 100%), linear-gradient(90deg, rgb(241, 245, 242) 0%, rgb(248, 240, 231) 50%, rgb(244, 233, 222) 100%), linear-gradient(90deg, rgb(244, 233, 222) 0%, rgb(251, 245, 239) 50%, rgb(255, 245, 247) 100%), linear-gradient(270deg, rgb(251, 207, 232) 0%, rgb(255, 245, 247) 50%, rgb(248, 240, 231) 100%)";

const MULTI_STOP_GRADIENT =
  "linear-gradient(90deg, rgb(255, 245, 247) 0%, rgb(255, 245, 247) 100%), linear-gradient(90deg, rgb(241, 245, 242) 0%, rgb(248, 240, 231) 50%, rgb(244, 233, 222) 100%), linear-gradient(90deg, rgb(244, 233, 222) 0%, rgb(251, 245, 239) 50%, rgb(255, 245, 247) 100%), linear-gradient(90deg, rgb(251, 207, 232) 0%, rgb(255, 245, 247) 50%, rgb(248, 240, 231) 100%), linear-gradient(90deg, rgb(251, 245, 239) 0%, rgb(253, 226, 232) 50%, rgb(244, 233, 222) 100%), linear-gradient(90deg, rgb(255, 214, 239) 0%, rgb(255, 214, 239) 100%)";

const RENT_SHARE = 400;
const MAX_INTEREST_COST = 400;

function interestTabFromPercent(percent: number): InterestTab {
  if (percent <= 0) return "rent";
  if (percent >= 100) return "full";
  return "partial";
}

// baseAdjustment is the fully-deferred interest adjustment (i.e. Rent share only, 0% paid monthly).
// It scales down toward £0 as more of the interest is paid monthly (see adjustmentAmount below).
// baseTakeAmount is Pauzible's share of the property value swing at Rent share only (0% paid monthly);
// it scales down toward MIN_TAKE_AMOUNT as more of the interest is paid monthly (see takeAmount below).
const MIN_TAKE_AMOUNT = 10000;

const REPAYMENT_DATA: Record<
  RepaymentTab,
  { principal: number; baseAdjustment: number; take?: { label: string; baseTakeAmount: number; kind: "gain" | "lose" } }
> = {
  downside: {
    principal: 100000,
    baseAdjustment: 27000,
    take: { label: "Takes Lose", baseTakeAmount: 14000, kind: "lose" },
  },
  base: { principal: 100000, baseAdjustment: 41000 },
  upside: {
    principal: 100000,
    baseAdjustment: 55000,
    take: { label: "Takes Gain", baseTakeAmount: 14000, kind: "gain" },
  },
};

function formatMoneyK(amount: number) {
  const rounded = Math.round(amount);
  return rounded >= 1000 ? `£${Math.round(rounded / 1000)}K` : `£${rounded}`;
}

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

function StatCircle({
  value,
  suffix,
  label,
  background,
  valueClassName = "text-[#320707]",
  labelClassName = "text-[#320707]",
}: {
  value: string;
  suffix?: string;
  label: React.ReactNode;
  background: string;
  valueClassName?: string;
  labelClassName?: string;
}) {
  return (
    <div className="relative flex size-[92px] shrink-0 items-center justify-center rounded-full p-2 drop-shadow-[0px_0px_6px_rgba(56,56,56,0.08)] sm:size-[119px] sm:p-[9.52px]">
      <div aria-hidden className="absolute inset-0 rounded-full" style={{ background }} />
      <div className="relative flex flex-col items-center gap-0.5 text-center">
        <p className={`font-heading text-base font-extrabold leading-[1.2] sm:text-xl sm:leading-[1.5] ${valueClassName}`}>
          {value}
          {suffix && <span className="font-heading text-sm font-semibold sm:text-base">{suffix}</span>}
        </p>
        <p className={`font-heading text-[9px] font-bold uppercase leading-[1.2] sm:text-[11px] ${labelClassName}`}>
          {label}
        </p>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0px_-3.656px_3.656px_0px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}

function OperatorBadge({ symbol }: { symbol: string }) {
  return (
    <div className="relative z-10 flex size-[20px] shrink-0 -mx-3 items-center justify-center rounded-full border border-[#f1f5f2] bg-white drop-shadow-[0px_2.604px_2.604px_rgba(15,38,76,0.07)] sm:size-[26px]">
      <span className="font-sans text-xs font-bold text-[#1d2a44] sm:text-sm">{symbol}</span>
    </div>
  );
}

function TakeBadge({ label, value, kind }: { label: string; value: string; kind: "gain" | "lose" }) {
  return (
    <div
      className={`flex w-[220px] items-center justify-between rounded-lg px-2.5 py-2 text-center drop-shadow-[0px_0px_6px_rgba(56,56,56,0.08)] ${
        kind === "gain" ? "bg-[#f1f5f2]" : "bg-[#fff5f7]"
      }`}
    >
      <p className="font-heading text-[11px] font-bold uppercase leading-[16px] text-[#320707]">{label}</p>
      <p className={`font-heading text-base font-extrabold leading-6 ${kind === "gain" ? "text-[#1f8a5b]" : "text-[#cf5249]"}`}>
        {value}
      </p>
    </div>
  );
}

type CardShellProps<T extends string> = {
  illustration: React.ReactNode;
  description: React.ReactNode;
} & (
  | { variant: "tabbed"; tabs: { value: T; label: string }[]; active: T; onChange: (value: T) => void; tabClassName?: string }
  | { variant: "plain" }
);

function CardShell<T extends string>(props: CardShellProps<T>) {
  const { illustration, description } = props;
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-[#e4e4e4]">
      <div className="relative flex h-auto w-full flex-col items-center gap-6 p-6 sm:h-[386px]">
        <Image
          src="/financing-cost/card-bg-texture.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          className="pointer-events-none rounded-t-3xl object-cover opacity-25"
        />
        {props.variant === "tabbed" && (
          <TabSwitcher active={props.active} onChange={props.onChange} tabs={props.tabs} className={props.tabClassName} />
        )}
        <div className="relative flex w-full flex-1 items-center justify-center">{illustration}</div>
      </div>
      <div className="relative flex min-h-[140px] w-full flex-col items-start justify-center gap-2 border-t border-[#f9f3f5] bg-white p-5 tracking-[-0.24px] sm:h-[165px] sm:p-6">
        {description}
      </div>
    </div>
  );
}

export default function FinancingCostV3() {
  const [interestPercent, setInterestPercent] = useState(100);
  const [repaymentTab, setRepaymentTab] = useState<RepaymentTab>("base");

  const interestTab = interestTabFromPercent(interestPercent);
  const interestCostAmount = Math.round((interestPercent / 100) * MAX_INTEREST_COST);
  const interest = {
    rentShare: `£${RENT_SHARE}`,
    interestCost: `£${interestCostAmount}`,
    payment: `£${RENT_SHARE + interestCostAmount}`,
  };
  const repaymentBase = REPAYMENT_DATA[repaymentTab];
  const paidMonthlyFraction = interestPercent / 100;
  const adjustmentAmount = repaymentBase.baseAdjustment * (1 - paidMonthlyFraction);
  const settlementAmount = repaymentBase.principal + adjustmentAmount;
  const takeAmount = repaymentBase.take
    ? repaymentBase.take.baseTakeAmount - (repaymentBase.take.baseTakeAmount - MIN_TAKE_AMOUNT) * paidMonthlyFraction
    : 0;
  const repayment = {
    principal: formatMoneyK(repaymentBase.principal),
    adjustment: formatMoneyK(adjustmentAmount),
    settlement: formatMoneyK(settlementAmount),
    take: repaymentBase.take
      ? {
          label: repaymentBase.take.label,
          value: `${repaymentBase.take.kind === "gain" ? "+" : "-"} ${formatMoneyK(takeAmount)}`,
          kind: repaymentBase.take.kind,
        }
      : undefined,
  };

  function selectInterestTab(tab: InterestTab) {
    if (tab === "rent") setInterestPercent(0);
    else if (tab === "full") setInterestPercent(100);
    else setInterestPercent(50);
  }

  return (
    <section className="flex flex-col items-start gap-10 bg-white px-5 pb-16 pt-10 sm:px-8 lg:gap-16 lg:px-20 lg:pb-30 lg:pt-16">
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
        <CardShell
          variant="plain"
          illustration={
            <div className="relative mx-auto h-[258px] w-[240px] shrink-0 sm:h-[338px] sm:w-[313px]">
              <Image
                src="/rent-share-illustration.png"
                alt="Diagram showing £2,000 rent split into your £1,600 share and Pauzible's £400 share"
                fill
                className="scale-120 object-contain"
              />
            </div>
          }
          description={
            <>
              <p className="font-heading text-xl font-bold text-dark">
                Rent Share <span className="font-heading text-base font-semibold text-[#6b6d6b]">(Monthly)</span>
              </p>
              <p className="text-base font-medium leading-6 text-[#6b6d6b] sm:h-[72px]">
                In return for unlocking your equity, Pauzible receives a small share of your rent.
              </p>
            </>
          }
        />

        {/* Interest Cost Card */}
        <CardShell
          variant="tabbed"
          active={interestTab}
          onChange={selectInterestTab}
          tabs={[
            { value: "rent", label: "Rent share only" },
            { value: "partial", label: "Partial monthly" },
            { value: "full", label: "Monthly" },
          ]}
          illustration={
            <div className="flex w-full flex-col items-center justify-center gap-2.5">
              <div
                className={`relative flex h-1 w-full max-w-[266px] items-center ${interestTab === "partial" ? "" : "invisible"}`}
                aria-hidden={interestTab !== "partial"}
              >
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#f4dce3]">
                  <div className="absolute inset-y-0 left-0 bg-brand" style={{ width: `${interestPercent}%` }} />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={interestPercent}
                  onChange={(e) => setInterestPercent(Number(e.target.value))}
                  tabIndex={interestTab === "partial" ? 0 : -1}
                  className="range-thumb absolute inset-0 h-1 w-full cursor-pointer appearance-none bg-transparent"
                  aria-label="Interest cost payment amount"
                />
              </div>
              <div className="flex items-center justify-center py-3 drop-shadow-[0px_12px_50px_rgba(131,13,65,0.12)]">
                <StatCircle value={interest.rentShare} label="Rent Share" background={PINK_CREAM_GRADIENT} />
                <OperatorBadge symbol="+" />
                <StatCircle
                  value={interest.interestCost}
                  label={
                    <>
                      Interest
                      <br />
                      Cost
                    </>
                  }
                  background="#fde2e8"
                  valueClassName="text-brand"
                  labelClassName="text-brand"
                />
                <OperatorBadge symbol="=" />
                <StatCircle value={interest.payment} suffix="/m" label="Payment" background={MULTI_STOP_GRADIENT} />
              </div>
              <div className="invisible" aria-hidden>
                <TakeBadge label="Takes Lose" value="- £50K" kind="lose" />
              </div>
            </div>
          }
          description={
            <>
              <p className="font-heading text-xl font-bold text-dark">Interest Cost</p>
              <p className="text-base font-medium leading-6 text-[#6b6d6b] sm:h-[72px]">
                Choose to pay financing costs monthly or at the end of the financing term with monthly compounding.
              </p>
            </>
          }
        />

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
          illustration={
            <div className="flex w-full flex-col items-center justify-center gap-2.5">
              <div className="invisible relative flex h-1 w-full max-w-[266px] items-center" aria-hidden>
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#f4dce3]" />
              </div>
              <div className="flex items-center justify-center px-1 py-3 drop-shadow-[0px_12px_50px_rgba(131,13,65,0.12)]">
                <StatCircle value={repayment.principal} label="Principal" background={PINK_CREAM_GRADIENT} />
                <OperatorBadge symbol="+" />
                <StatCircle
                  value={repayment.adjustment}
                  label={
                    <>
                      Interest
                      <br />
                      Adjustment
                    </>
                  }
                  background={MULTI_STOP_GRADIENT}
                  valueClassName="text-brand"
                  labelClassName="text-brand"
                />
                <OperatorBadge symbol="=" />
                <StatCircle value={repayment.settlement} label="Settlement" background="#fff5f7" />
              </div>
              <div className={repayment.take ? "" : "invisible"} aria-hidden={!repayment.take}>
                <TakeBadge
                  label={repayment.take?.label ?? "Takes Lose"}
                  value={repayment.take?.value ?? "- £50K"}
                  kind={repayment.take?.kind ?? "lose"}
                />
              </div>
            </div>
          }
          description={
            <>
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
            </>
          }
        />
      </div>
    </section>
  );
}
