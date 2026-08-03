"use client";

import Image from "next/image";
import { useState } from "react";
import { useUnlockEquityDialog } from "@/components/UnlockEquityDialog";

type PaymentOption = "rent" | "mixed" | "full";
type PaymentMethod = "fixed" | "share";

// Nominal monthly rate by term, per payment method (matches production rate card).
const RATE_TABLE_FIXED: Record<2 | 3 | 5, number> = { 2: 0.0079, 3: 0.0079, 5: 0.0083 };
const RATE_TABLE_SHARE: Record<2 | 3 | 5, number> = { 2: 0.0075, 3: 0.007, 5: 0.0057 };
const RATE_ADJUSTMENT = 0.0016666666666666668; // flat monthly offset baked into the effective rate
const FINANCING_LIMIT = 100000; // threshold above which the financing amount is flagged as out of range
const MIN_FINANCING_AMOUNT = 10000; // lower bound of the financing amount slider
const FINANCING_AMOUNT_STEP = 2500; // slider increment/decrement step
const ADJUSTMENT_RANGE_PERCENT = 10; // Share Value mode: property value swing shown at the adjustment slider's endpoints

function formatMoney(amount: number) {
  return `£${Math.max(0, Math.round(amount)).toLocaleString("en-GB")}`;
}

function formatK(amount: number) {
  const rounded = Math.max(0, Math.round(amount));
  return rounded >= 1000 ? `£${Math.round(rounded / 1000)}K` : `£${rounded}`;
}

function formatSignedK(amount: number) {
  const rounded = Math.round(amount);
  if (rounded === 0) return formatK(0);
  return `${rounded > 0 ? "+" : "−"}${formatK(Math.abs(rounded))}`;
}

function paymentOptionFromPercent(percent: number): PaymentOption {
  if (percent <= 0) return "rent";
  if (percent >= 100) return "full";
  return "mixed";
}

export default function EquityCalculator() {
  const { openUnlockEquityDialog } = useUnlockEquityDialog();
  const [financingAmountRaw, setFinancingAmountRaw] = useState(100000);
  const [isEditingFinancingAmount, setIsEditingFinancingAmount] = useState(false);
  const [financingAmountInput, setFinancingAmountInput] = useState("");
  const [propertyValue, setPropertyValue] = useState(500000);
  const [mortgageBalance, setMortgageBalance] = useState(300000);
  const [term, setTerm] = useState<2 | 3 | 5>(5);
  const [monthlyRent, setMonthlyRent] = useState(1667);
  const [isEditingMonthlyRent, setIsEditingMonthlyRent] = useState(false);
  const [monthlyRentInput, setMonthlyRentInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("fixed");
  const [paymentPercent, setPaymentPercent] = useState(0);
  const [adjustmentPercent, setAdjustmentPercent] = useState(0);

  const equity = Math.max(propertyValue - mortgageBalance, 0);
  const financingAmount = Math.max(MIN_FINANCING_AMOUNT, Math.min(financingAmountRaw, equity));

  const equityPercent = equity > 0 ? (financingAmount / equity) * 100 : 0;
  const propertyValuePercent = propertyValue > 0 ? (financingAmount / propertyValue) * 100 : 0;
  const releasedWidthPct = Math.min(100, propertyValuePercent);
  const retainedWidthPct = propertyValue > 0 ? Math.max(0, ((equity - financingAmount) / propertyValue) * 100) : 0;
  const mortgageWidthPct = propertyValue > 0 ? Math.max(0, (mortgageBalance / propertyValue) * 100) : 0;

  const termMonths = term * 12;
  const nominalMonthlyRate = paymentMethod === "fixed" ? RATE_TABLE_FIXED[term] : RATE_TABLE_SHARE[term];
  const effectiveMonthlyRate = nominalMonthlyRate - RATE_ADJUSTMENT;

  // Rent-share floor: proportional to the fraction of property value released.
  const releasedShareOfProperty = propertyValue > 0 ? financingAmount / propertyValue : 0;
  const minPaymentExact = releasedShareOfProperty * monthlyRent;
  const minPayment = Math.round(minPaymentExact);

  const fullMonthlyInterest = financingAmount * effectiveMonthlyRate;
  const maxPayment = Math.round(minPaymentExact + fullMonthlyInterest);

  const paymentFraction = Math.max(0, Math.min(1, paymentPercent / 100));
  const financeMo = fullMonthlyInterest * paymentFraction;
  const selectedPayment = Math.round(minPaymentExact + financeMo);
  const paymentOption = paymentOptionFromPercent(paymentPercent);

  const interestCostPerMonth = Math.round(financeMo);
  const totalMonthlyPayment = selectedPayment;

  // Compounded interest that accrues if nothing is paid toward it, per the term's nominal rate.
  const fullyDeferredInterest = Math.max(0, financingAmount * (Math.pow(1 + nominalMonthlyRate, termMonths) - 1));
  const unpaidInterest = fullyDeferredInterest * (1 - paymentFraction);
  const finalRepayment = financingAmount + unpaidInterest;

  const totalInterestPaid = financeMo * termMonths + unpaidInterest;
  const savingsOverall = Math.max(0, fullyDeferredInterest - totalInterestPaid);

  // Share Value mode: the released amount is linked to property value, so a hypothetical
  // property value move over the term scales the final repayment proportionally.
  const computeFinalRepaymentAtAdjustment = (percent: number) => {
    const adjustedFinancingAmount = financingAmount * (1 + percent / 100);
    const adjustedFullyDeferredInterest = Math.max(
      0,
      adjustedFinancingAmount * (Math.pow(1 + nominalMonthlyRate, termMonths) - 1)
    );
    const adjustedUnpaidInterest = adjustedFullyDeferredInterest * (1 - paymentFraction);
    return adjustedFinancingAmount + adjustedUnpaidInterest;
  };
  const adjustedFinalRepayment = computeFinalRepaymentAtAdjustment(adjustmentPercent);
  const adjustmentAmount = adjustedFinalRepayment - finalRepayment;
  const fallsAdjustmentAmount = computeFinalRepaymentAtAdjustment(-ADJUSTMENT_RANGE_PERCENT) - finalRepayment;
  const risesAdjustmentAmount = computeFinalRepaymentAtAdjustment(ADJUSTMENT_RANGE_PERCENT) - finalRepayment;
  const displayedFinalRepayment = paymentMethod === "share" ? adjustedFinalRepayment : finalRepayment;

  function startEditingFinancingAmount() {
    setFinancingAmountInput(formatMoney(financingAmount));
    setIsEditingFinancingAmount(true);
  }

  function commitFinancingAmountInput() {
    const digits = Number(financingAmountInput.replace(/[^\d]/g, "")) || 0;
    setFinancingAmountRaw(digits);
    setIsEditingFinancingAmount(false);
  }

  function startEditingMonthlyRent() {
    setMonthlyRentInput(formatMoney(monthlyRent));
    setIsEditingMonthlyRent(true);
  }

  function commitMonthlyRentInput() {
    const digits = Number(monthlyRentInput.replace(/[^\d]/g, "")) || 0;
    setMonthlyRent(digits);
    setIsEditingMonthlyRent(false);
  }

  function selectPaymentOption(option: PaymentOption) {
    if (option === "rent") setPaymentPercent(0);
    else if (option === "full") setPaymentPercent(100);
    else setPaymentPercent(50);
  }

  return (
    <section id="equity-calculator" className="flex flex-col items-center bg-white pb-16 sm:px-5 md:px-20 md:pb-24">
      <div className="flex w-[1280px] max-w-full flex-col items-center gap-8 overflow-hidden bg-gradient-to-r from-[rgba(251,245,239,0.5)] via-[rgba(253,226,232,0.5)] to-[rgba(244,233,222,0.5)] px-5 py-10 sm:rounded-[24px] sm:px-8 md:gap-10 md:rounded-[32px] md:px-16 md:py-[72px]">
        {/* Header */}
        <div className="flex w-full max-w-[1024px] flex-col items-center gap-2">
          <div className="flex h-[34px] items-center justify-center border-b-2 border-[#c4c4c4]">
            <p className="whitespace-nowrap font-heading text-xs font-bold uppercase tracking-[2px] text-dark">
              Equity Calculator
            </p>
          </div>
          <p className="text-center font-heading text-3xl font-bold leading-tight tracking-tight text-dark sm:text-4xl md:whitespace-nowrap md:text-[48px] md:leading-[56px] md:tracking-[-1.68px]">
            Equity Partnership in Numbers
          </p>
        </div>

        {/* Widget */}
        <div className="flex w-full max-w-[582px] flex-col items-start gap-4">
          {/* Step 1 — Financing amount */}
          <div className="relative grid w-full gap-y-5 rounded-[22px] bg-white p-4 drop-shadow-[0_10px_14px_rgba(131,13,65,0.18)] sm:p-[22px]">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FAF0F3]">
                <span className="font-heading text-sm font-extrabold tracking-[-0.24px] text-dark">1</span>
              </div>
              <p className="font-heading text-base font-semibold tracking-[-0.22px] text-dark sm:text-[22px]">
                Enter financing amount you want to release
              </p>
            </div>

            <div className="relative flex items-center justify-center px-0 sm:px-5">
              {isEditingFinancingAmount ? (
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={financingAmountInput}
                  onChange={(e) => {
                    const digits = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
                    setFinancingAmountInput(digits > 0 ? formatMoney(digits) : "");
                  }}
                  onBlur={commitFinancingAmountInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitFinancingAmountInput();
                    if (e.key === "Escape") setIsEditingFinancingAmount(false);
                  }}
                  className="w-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-center font-heading text-4xl font-extrabold leading-none tracking-tight text-brand outline-none sm:text-[48px] sm:tracking-[-1.5px]"
                />
              ) : (
                <p
                  role="button"
                  tabIndex={0}
                  onClick={startEditingFinancingAmount}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") startEditingFinancingAmount();
                  }}
                  className="flex-1 cursor-pointer text-center font-heading text-4xl font-extrabold tracking-tight text-brand sm:text-[48px] sm:tracking-[-1.5px]"
                >
                  {formatMoney(financingAmount)}
                </p>
              )}
              <button
                type="button"
                onClick={startEditingFinancingAmount}
                aria-label="Edit financing amount"
                className="absolute right-0 top-1/2 size-[30px] shrink-0 -translate-y-1/2 rounded-full border border-[#d8dad8] bg-white drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)] sm:right-5"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative size-[14px]">
                    <Image src="/equity-calculator/edit-icon.svg" alt="" fill />
                  </div>
                </div>
              </button>
            </div>

            {/* Financing amount slider */}
            <div className="flex w-full max-w-[538px] flex-col gap-3">
              <div className="flex w-full items-center justify-between">
                <span className="font-heading text-base font-medium leading-5 tracking-[-0.24px] text-[#454745]">
                  {formatMoney(MIN_FINANCING_AMOUNT)}
                </span>
                <span className="font-heading text-base font-medium leading-5 tracking-[-0.24px] text-[#454745]">
                  {formatMoney(equity)}
                </span>
              </div>
              <div className="relative flex h-1 w-full items-center">
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#eee]">
                  <div
                    className="absolute inset-y-0 left-0 bg-brand"
                    style={{
                      width: `${
                        equity > MIN_FINANCING_AMOUNT
                          ? ((financingAmount - MIN_FINANCING_AMOUNT) / (equity - MIN_FINANCING_AMOUNT)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={MIN_FINANCING_AMOUNT}
                  max={Math.max(equity, MIN_FINANCING_AMOUNT + 1)}
                  step={FINANCING_AMOUNT_STEP}
                  value={financingAmount}
                  onChange={(e) => setFinancingAmountRaw(Number(e.target.value))}
                  className="range-thumb absolute inset-0 h-1 w-full cursor-pointer appearance-none bg-transparent"
                  aria-label="Financing amount"
                />
              </div>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
              <div className="flex flex-1 items-center justify-between gap-2">
                <span className="whitespace-nowrap font-heading text-sm font-semibold tracking-[-0.24px] text-[#454745]">
                  Property Value
                </span>
                <label className="flex w-[120px] shrink-0 items-center justify-center whitespace-nowrap rounded-[28px] border border-[#d8dad8] bg-white px-[9px] py-[7px] text-base tracking-[-0.24px] drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={propertyValue.toLocaleString("en-GB")}
                    onChange={(e) => {
                      const digits = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setPropertyValue(digits);
                    }}
                    className="w-full min-w-0 bg-transparent text-center font-heading font-semibold text-dark outline-none"
                  />
                </label>
              </div>
              <div className="flex flex-1 items-center justify-between gap-2">
                <span className="whitespace-nowrap font-heading text-sm font-semibold tracking-[-0.24px] text-[#454745]">
                  Mortgage Balance
                </span>
                <label className="flex w-[120px] shrink-0 items-center justify-center whitespace-nowrap rounded-[28px] border border-[#d8dad8] bg-white px-[9px] py-[7px] text-base tracking-[-0.24px] drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)]">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={mortgageBalance.toLocaleString("en-GB")}
                    onChange={(e) => {
                      const digits = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setMortgageBalance(digits);
                    }}
                    className="w-full min-w-0 bg-transparent text-center font-heading font-semibold text-dark outline-none"
                  />
                </label>
              </div>
            </div>

            {/* Equity progress bar */}
            <div className="flex h-4 w-full overflow-hidden rounded-lg">
              <div
                className="h-full border-r-2 border-white bg-[#f9a8d4]"
                style={{ width: `${releasedWidthPct}%` }}
              />
              <div
                className="h-full border-r-2 border-white bg-[#fbcfe8]"
                style={{ width: `${retainedWidthPct}%` }}
              />
              <div className="h-full flex-1 bg-[#e8e9e8]" style={{ width: `${mortgageWidthPct}%` }} />
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="size-[9px] shrink-0 rounded-full bg-[#f9a8d4]" />
                  <span className="font-heading text-sm font-medium tracking-[-0.24px] text-[#454745]">Released</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-[9px] shrink-0 rounded-full bg-[#fbcfe8]" />
                  <span className="font-heading text-sm font-medium tracking-[-0.24px] text-[#454745]">Retained Equity</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-[9px] shrink-0 rounded-full bg-[#e8e9e8]" />
                  <span className="font-heading text-sm font-medium tracking-[-0.24px] text-[#454745]">Mortgage</span>
                </div>
              </div>
              <div
                className={`flex h-[26px] items-center justify-center rounded-full px-3 ${
                  financingAmount > FINANCING_LIMIT
                    ? "bg-[rgba(220,38,38,0.1)]"
                    : financingAmount === FINANCING_LIMIT
                      ? "bg-[#ffeed1]"
                      : "bg-[rgba(31,138,91,0.1)]"
                }`}
              >
                <span
                  className={`whitespace-nowrap font-heading text-sm font-semibold tracking-[-0.24px] ${
                    financingAmount > FINANCING_LIMIT
                      ? "text-[#dc2626]"
                      : financingAmount === FINANCING_LIMIT
                        ? "text-[#d48400]"
                        : "text-[#1f8a5b]"
                  }`}
                >
                  {financingAmount > FINANCING_LIMIT
                    ? "Above our limit"
                    : financingAmount === FINANCING_LIMIT
                      ? "Nearing limit"
                      : "Comfortably in range"}
                </span>
              </div>
            </div>

            <div className="flex h-[80px] w-full items-center rounded-2xl">
              <div className="flex h-full flex-1 flex-col items-center justify-center gap-1.5 px-2 py-[18px]">
                <span className="font-heading text-3xl font-extrabold tracking-[-0.24px] text-[#320707]">
                  {Math.round(equityPercent)}%
                </span>
                <span className="font-heading text-xs font-bold uppercase tracking-[0.5px] text-[#320707]">
                  Releasing from equity
                </span>
              </div>
              <div className="flex h-full flex-col items-center justify-center gap-2 py-1">
                <div className="h-full w-px flex-1 bg-[#d8d4cf]" />
                <div className="relative h-[8px] w-[15px] shrink-0">
                  <Image src="/equity-calculator/or-icon.svg" alt="or" fill />
                </div>
                <div className="h-full w-px flex-1 bg-[#d8d4cf]" />
              </div>
              <div className="flex h-full flex-1 flex-col items-center justify-center gap-1.5 px-2 py-[18px]">
                <span className="font-heading text-3xl font-extrabold tracking-[-0.24px] text-[#320707]">
                  {Math.round(propertyValuePercent)}%
                </span>
                <span className="font-heading text-xs font-bold uppercase tracking-[0.5px] text-[#320707]">
                  Releasing from valuation
                </span>
              </div>
            </div>
          </div>

          {/* Step 2 — Term */}
          <div className="flex w-full flex-col items-start gap-5 rounded-[22px] bg-white p-4 shadow-[0_10px_28px_-18px_rgba(131,13,65,0.18)] sm:p-[22px]">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FAF0F3]">
                <span className="font-heading text-sm font-extrabold tracking-[-0.24px] text-dark">2</span>
              </div>
              <p className="font-heading text-base font-semibold tracking-[-0.22px] text-dark sm:text-[22px]">
                How long do you want it for?
              </p>
            </div>
            <div className="flex w-full items-end justify-center gap-3 pt-px">
              {([2, 3, 5] as const).map((years) => {
                const active = term === years;
                return (
                  <button
                    key={years}
                    type="button"
                    onClick={() => setTerm(years)}
                    className={`flex h-[80px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl border bg-white px-[11px] py-[19px] drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)] ${
                      active ? "border-brand shadow-[inset_0_0_0_1px_#830d41]" : "border-[#e4e4e4]"
                    }`}
                  >
                    <span
                      className={`font-heading text-[30px] font-extrabold tracking-[-0.24px] ${
                        active ? "text-brand" : "text-[#454745]"
                      }`}
                    >
                      {years}
                    </span>
                    <span
                      className={`font-heading text-base font-bold uppercase tracking-[0.5px] ${
                        active ? "text-brand" : "text-[#454745]"
                      }`}
                    >
                      Years
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3 — Payments */}
          <div className="flex w-full flex-col items-center gap-6 rounded-[22px] bg-white p-4 shadow-[0_10px_28px_-18px_rgba(131,13,65,0.18)] sm:p-[22px]">
            <div className="flex w-full items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FAF0F3]">
                <span className="font-heading text-sm font-extrabold tracking-[-0.24px] text-dark">3</span>
              </div>
              <p className="font-heading text-base font-semibold tracking-[-0.22px] text-dark sm:text-[22px]">Your payments</p>
            </div>

            <div className="flex w-full flex-col items-center gap-4">
              <span className="text-center font-heading text-base font-semibold tracking-[-0.24px] text-[#454745] sm:text-lg">
                Choose how to pay final repayment
              </span>
              <div className="flex w-full items-start justify-center rounded-full bg-[#f1f5f2] p-[3px]">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("fixed")}
                  className={`flex-1 rounded-full px-4 py-2 text-center ${
                    paymentMethod === "fixed" ? "bg-brand drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : ""
                  }`}
                >
                  <p className={`font-heading text-base font-semibold tracking-[-0.24px] ${paymentMethod === "fixed" ? "text-white" : "text-dark"}`}>
                    Fixed Amount
                  </p>
                  <p className={`font-heading text-[13px] font-medium ${paymentMethod === "fixed" ? "text-white/80" : "text-[#6b6d6b]"}`}>
                    Set
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline">{" "}</span>
                    upfront
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("share")}
                  className={`flex-1 rounded-full px-4 py-2 text-center ${
                    paymentMethod === "share" ? "bg-brand drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : ""
                  }`}
                >
                  <p className={`font-heading text-base font-semibold tracking-[-0.24px] ${paymentMethod === "share" ? "text-white" : "text-dark"}`}>
                    Share Value
                  </p>
                  <p className={`font-heading text-[13px] font-medium ${paymentMethod === "share" ? "text-white/80" : "text-[#6b6d6b]"}`}>
                    Changes with your property value
                  </p>
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col items-center gap-2">
              <span className="text-center font-heading text-base font-semibold tracking-[-0.24px] text-[#454745] sm:text-lg">
                Monthly rent you get from property
              </span>
              <div className="relative flex w-full items-center justify-center px-0 sm:px-5">
                {isEditingMonthlyRent ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={monthlyRentInput}
                    onChange={(e) => {
                      const digits = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setMonthlyRentInput(digits > 0 ? formatMoney(digits) : "");
                    }}
                    onBlur={commitMonthlyRentInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitMonthlyRentInput();
                      if (e.key === "Escape") setIsEditingMonthlyRent(false);
                    }}
                    className="w-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-center font-heading text-2xl font-extrabold leading-none tracking-tight text-brand outline-none sm:text-[30px]"
                  />
                ) : (
                  <p
                    role="button"
                    tabIndex={0}
                    onClick={startEditingMonthlyRent}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") startEditingMonthlyRent();
                    }}
                    className="flex-1 cursor-pointer text-center font-heading text-2xl font-extrabold tracking-tight text-brand sm:text-[30px]"
                  >
                    {formatMoney(monthlyRent)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={startEditingMonthlyRent}
                  aria-label="Edit monthly rent"
                  className="absolute right-0 top-1/2 size-[30px] shrink-0 -translate-y-1/2 rounded-full border border-[#d8dad8] bg-white drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)] sm:right-5"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative size-[14px]">
                      <Image src="/equity-calculator/edit-icon.svg" alt="" fill />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-4">
              <span className="text-center font-heading text-base font-semibold tracking-[-0.24px] text-[#454745] sm:text-lg">
                Choose how much interest cost to pay each month
              </span>
              <div className="flex w-full items-stretch gap-3">
                <button
                  type="button"
                  onClick={() => selectPaymentOption("rent")}
                  className={`flex flex-1 items-center justify-between gap-1.5 rounded-2xl px-3 py-3 sm:px-4 ${
                    paymentOption === "rent" ? "bg-[#fde2e8]" : "bg-[#f1f5f2]"
                  }`}
                >
                  <span className={`whitespace-nowrap font-heading text-base font-semibold tracking-[-0.24px] ${paymentOption === "rent" ? "text-brand" : "text-dark"}`}>
                    Rent share only
                  </span>
                  {paymentOption === "rent" ? (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand">
                      <span className="relative size-[10px]">
                        <Image src="/equity-calculator/check-icon.svg" alt="" fill />
                      </span>
                    </span>
                  ) : (
                    <span className="relative size-4 shrink-0">
                      <Image src="/equity-calculator/radio-unchecked.svg" alt="" fill />
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => selectPaymentOption("mixed")}
                  className={`flex flex-1 items-center justify-between gap-1.5 rounded-2xl px-3 py-3 sm:px-4 ${
                    paymentOption === "mixed" ? "bg-[#fde2e8]" : "bg-[#f1f5f2]"
                  }`}
                >
                  <span className={`whitespace-nowrap font-heading text-base font-semibold tracking-[-0.24px] ${paymentOption === "mixed" ? "text-brand" : "text-dark"}`}>
                    Partial Monthly
                  </span>
                  {paymentOption === "mixed" ? (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand">
                      <span className="relative size-[10px]">
                        <Image src="/equity-calculator/check-icon.svg" alt="" fill />
                      </span>
                    </span>
                  ) : (
                    <span className="relative size-4 shrink-0">
                      <Image src="/equity-calculator/radio-unchecked.svg" alt="" fill />
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => selectPaymentOption("full")}
                  className={`flex flex-1 items-center justify-between gap-1.5 rounded-2xl px-3 py-3 sm:px-4 ${
                    paymentOption === "full" ? "bg-[#fde2e8]" : "bg-[#f1f5f2]"
                  }`}
                >
                  <span className={`whitespace-nowrap font-heading text-base font-semibold tracking-[-0.24px] ${paymentOption === "full" ? "text-brand" : "text-dark"}`}>
                    Monthly
                  </span>
                  {paymentOption === "full" ? (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand">
                      <span className="relative size-[10px]">
                        <Image src="/equity-calculator/check-icon.svg" alt="" fill />
                      </span>
                    </span>
                  ) : (
                    <span className="relative size-4 shrink-0">
                      <Image src="/equity-calculator/radio-unchecked.svg" alt="" fill />
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col items-center">
              <p className="text-center font-heading text-[30px] font-extrabold leading-[42px] tracking-[-0.24px] text-[#320707]">
                {formatMoney(selectedPayment)}
                <span className="font-heading text-lg font-semibold leading-[21px] text-[#6b6d6b]">/mo</span>
              </p>

              {/* Payment slider — driven by the "Choose how much to pay each month" annotation:
                  leftmost = Rent share only, dragged = Mixed partially, rightmost = Full monthly */}
              <div className="flex w-full max-w-[538px] flex-col gap-3">
                <div className="flex w-full items-center justify-between">
                  <span className="font-heading text-base font-medium leading-5 tracking-[-0.24px] text-[#454745]">
                    {formatMoney(minPayment)}/mo
                  </span>
                  <span className="font-heading text-base font-medium leading-5 tracking-[-0.24px] text-[#454745]">
                    {formatMoney(maxPayment)}/mo
                  </span>
                </div>
                <div className="relative flex h-1 w-full items-center">
                  <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#eee]">
                    <div className="absolute inset-y-0 left-0 bg-brand" style={{ width: `${paymentPercent}%` }} />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={paymentPercent}
                    onChange={(e) => setPaymentPercent(Number(e.target.value))}
                    className="range-thumb absolute inset-0 h-1 w-full cursor-pointer appearance-none bg-transparent"
                    aria-label="Monthly payment amount"
                  />
                </div>
              </div>
            </div>

            <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-[#e8ffd1] p-4">
              <p className="text-center font-heading text-lg font-bold leading-[21px] tracking-[0.18px] text-[#1f8d58]">
                {paymentOption === "rent"
                  ? "You have chosen to fully defer the financing cost."
                  : savingsOverall > 0
                    ? `Paying ${formatMoney(selectedPayment)}/mo saves you ${formatK(savingsOverall)} overall.`
                    : "Move the slider to reduce your total repayment cost."}
              </p>
            </div>

            {/* Payment summary */}
            <div className="flex w-full flex-col items-start gap-4 rounded-2xl bg-[#fbf5ef] p-5">
              {/* Monthly payments */}
              <p className="font-heading text-xl font-semibold tracking-[-0.24px] text-[#320707]">Monthly Payments</p>

              <div className="flex w-full items-end justify-between">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-heading text-base font-medium tracking-[-0.24px] text-dark">Pauzible&apos;s share</span>
                  <span className="font-heading text-sm font-medium tracking-[-0.24px] text-[#6b6d6b]">
                    of your {formatMoney(monthlyRent)} monthly rent
                  </span>
                </div>
                <span className="font-heading text-lg font-semibold tracking-[-0.24px] text-dark">
                  {formatMoney(minPayment)}/mo
                </span>
              </div>

              <div className="flex w-full items-end justify-between">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-heading text-base font-medium tracking-[-0.24px] text-dark">Interest cost</span>
                  <span className="font-heading text-sm font-medium tracking-[-0.24px] text-[#6b6d6b]">
                    <span className="font-bold text-brand">{(effectiveMonthlyRate * 100).toFixed(2)}%</span> per month
                  </span>
                </div>
                <span className="font-heading text-lg font-semibold tracking-[-0.24px] text-dark">
                  {formatMoney(interestCostPerMonth)}/mo
                </span>
              </div>

              <div className="h-px w-full bg-[#d9d9d9]" />

              <div className="flex w-full items-center justify-between">
                <span className="font-heading text-lg font-medium tracking-[-0.24px] text-dark">Total monthly payment</span>
                <span className="font-heading text-2xl font-bold tracking-[-0.24px] text-brand">
                  {formatMoney(totalMonthlyPayment)}/mo
                </span>
              </div>

              <div className="h-px w-full bg-[#d9d9d9]" />

              {/* Final repayment */}
              <p className="font-heading text-xl font-semibold tracking-[-0.24px] text-[#320707]">Final Repayment</p>

              <div className="flex w-full items-center justify-between">
                <span className="font-heading text-base font-medium tracking-[-0.24px] text-dark">
                  Principal (Released amount)
                </span>
                <span className="font-heading text-lg font-semibold tracking-[-0.24px] text-dark">
                  {formatK(financingAmount)}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <span className="font-heading text-base font-medium tracking-[-0.24px] text-dark">
                  Unpaid interest (Interest cost)
                </span>
                <span className="font-heading text-lg font-semibold tracking-[-0.24px] text-dark">
                  {formatK(unpaidInterest)}
                </span>
              </div>

              {paymentMethod === "share" && (
                <>
                  <div className="h-px w-full bg-[#d9d9d9]" />
                  <div className="flex w-full flex-col items-start gap-4">
                    <p className="text-sm leading-[20px] tracking-[-0.24px] text-[#6b6d6b]">
                      You have chosen <strong className="font-bold text-[#320707]">Property value-linked</strong> so the
                      final amount moves with your property&apos;s value.
                    </p>

                    <div className="flex w-full items-center justify-between">
                      <span className="font-heading text-base font-medium tracking-[-0.24px] text-dark">Adjustment amount</span>
                      <span className="font-heading text-lg font-semibold tracking-[-0.24px] text-dark">
                        {formatSignedK(adjustmentAmount)}
                      </span>
                    </div>

                    <div className="flex w-full flex-col gap-3">
                      <div className="relative flex h-1 w-full items-center">
                        <div
                          className="pointer-events-none relative h-1 w-full overflow-hidden rounded-full"
                          style={{ backgroundImage: "linear-gradient(to right, #9bd878, #f4e9de, #f9c579)" }}
                        />
                        <span className="pointer-events-none absolute left-[1.5%] top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-[#9bd878]" />
                        <span className="pointer-events-none absolute right-[1.5%] top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-[#f9c579]" />
                        <input
                          type="range"
                          min={-ADJUSTMENT_RANGE_PERCENT}
                          max={ADJUSTMENT_RANGE_PERCENT}
                          step={ADJUSTMENT_RANGE_PERCENT}
                          value={adjustmentPercent}
                          onChange={(e) => setAdjustmentPercent(Number(e.target.value))}
                          className="range-thumb absolute inset-0 h-1 w-full cursor-pointer appearance-none bg-transparent"
                          aria-label="Property value adjustment"
                        />
                      </div>
                      <div className="flex w-full items-start justify-between">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="whitespace-nowrap font-heading text-xs font-semibold tracking-[-0.24px] text-[#4a7a1e]">
                            Falls: {formatSignedK(fallsAdjustmentAmount)}
                          </span>
                          <span className="whitespace-nowrap font-heading text-xs tracking-[-0.24px] text-[#6b6d6b]">
                            ({ADJUSTMENT_RANGE_PERCENT}% lower)
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="whitespace-nowrap font-heading text-xs font-semibold tracking-[-0.24px] text-dark">
                            Unchanged: £0
                          </span>
                          <span className="whitespace-nowrap font-heading text-xs tracking-[-0.24px] text-[#6b6d6b]">(as today)</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="whitespace-nowrap font-heading text-xs font-semibold tracking-[-0.24px] text-[#d48400]">
                            Rises: {formatSignedK(risesAdjustmentAmount)}
                          </span>
                          <span className="whitespace-nowrap font-heading text-xs tracking-[-0.24px] text-[#6b6d6b]">
                            ({ADJUSTMENT_RANGE_PERCENT}% higher)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex w-full items-center justify-between rounded-2xl bg-[#320707] px-5 py-4">
                <span className="font-heading text-base font-medium tracking-[-0.24px] text-white">
                  Paid at the end of the term
                </span>
                <span className="font-heading text-[26px] font-extrabold leading-[39px] tracking-[-0.24px] text-[#E8E9E8]">
                  {formatK(displayedFinalRepayment)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex w-full max-w-[520px] flex-col items-center gap-3 px-6">
          <button
            type="button"
            onClick={openUnlockEquityDialog}
            className="flex h-14 w-full items-center justify-center rounded-full bg-brand"
          >
            <span className="font-heading text-xl font-semibold leading-[26px] tracking-[-0.24px] text-brand-btn-text">
              Get started
            </span>
          </button>
          <p className="text-center font-heading text-xs font-normal tracking-[-0.24px] text-[#6b6d6b]">
            Illustrative example. Not a quote or offer.
          </p>
        </div>
      </div>
    </section>
  );
}
