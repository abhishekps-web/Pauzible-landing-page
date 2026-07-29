"use client";

import Image from "next/image";
import { useState } from "react";

type PaymentOption = "rent" | "mixed" | "full";
type PaymentMethod = "fixed" | "share";

const MONTHLY_INTEREST_RATE = 0.004; // 0.40% per month, illustrative fixed rate
const MIN_RENT_SHARE = 0.2; // "Rent share only" — lower bound of the payment slider, as a share of monthly rent
const MAX_RENT_SHARE = 1; // "Full monthly" — upper bound of the payment slider, i.e. the full monthly rent
const BASE_TERM_YEARS = 5; // reference term the minimum rent-share requirement is calibrated against

function formatMoney(amount: number) {
  return `£${Math.max(0, Math.round(amount)).toLocaleString("en-GB")}`;
}

function formatK(amount: number) {
  const rounded = Math.max(0, Math.round(amount));
  return rounded >= 1000 ? `£${Math.round(rounded / 1000)}K` : `£${rounded}`;
}

function paymentOptionFromPercent(percent: number): PaymentOption {
  if (percent <= 0) return "rent";
  if (percent >= 100) return "full";
  return "mixed";
}

export default function EquityCalculator() {
  const [financingAmountRaw, setFinancingAmountRaw] = useState(100000);
  const [isEditingFinancingAmount, setIsEditingFinancingAmount] = useState(false);
  const [financingAmountInput, setFinancingAmountInput] = useState("");
  const [propertyValue, setPropertyValue] = useState(500000);
  const [mortgageBalance, setMortgageBalance] = useState(300000);
  const [term, setTerm] = useState<2 | 3 | 5>(5);
  const [monthlyRent, setMonthlyRent] = useState(1627);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("fixed");
  const [paymentPercent, setPaymentPercent] = useState(0);

  const equity = Math.max(propertyValue - mortgageBalance, 0);
  const financingAmount = Math.min(financingAmountRaw, equity);

  const equityPercent = equity > 0 ? (financingAmount / equity) * 100 : 0;
  const propertyValuePercent = propertyValue > 0 ? (financingAmount / propertyValue) * 100 : 0;
  const releasedWidthPct = Math.min(100, propertyValuePercent);
  const retainedWidthPct = propertyValue > 0 ? Math.max(0, ((equity - financingAmount) / propertyValue) * 100) : 0;
  const mortgageWidthPct = propertyValue > 0 ? Math.max(0, (mortgageBalance / propertyValue) * 100) : 0;

  const maxPayment = Math.max(1, Math.round(monthlyRent * MAX_RENT_SHARE));
  const termFactor = BASE_TERM_YEARS / term;
  const minPayment = Math.min(maxPayment, Math.round(monthlyRent * MIN_RENT_SHARE * termFactor));
  const selectedPayment = Math.round(minPayment + (maxPayment - minPayment) * (paymentPercent / 100));
  const paymentOption = paymentOptionFromPercent(paymentPercent);

  const baseInterestPerMonth = Math.round(financingAmount * MONTHLY_INTEREST_RATE);
  const interestCostPerMonth = Math.max(0, baseInterestPerMonth - selectedPayment);
  const totalMonthlyPayment = selectedPayment;

  const termMonths = term * 12;
  const unpaidInterest = interestCostPerMonth * termMonths;
  const finalRepayment = financingAmount + unpaidInterest;

  const worstCaseUnpaidInterest = Math.max(0, baseInterestPerMonth - minPayment) * termMonths;
  const savingsOverall = Math.max(0, worstCaseUnpaidInterest - unpaidInterest);

  function startEditingFinancingAmount() {
    setFinancingAmountInput(formatMoney(financingAmount));
    setIsEditingFinancingAmount(true);
  }

  function commitFinancingAmountInput() {
    const digits = Number(financingAmountInput.replace(/[^\d]/g, "")) || 0;
    setFinancingAmountRaw(digits);
    setIsEditingFinancingAmount(false);
  }

  function selectPaymentOption(option: PaymentOption) {
    if (option === "rent") setPaymentPercent(0);
    else if (option === "full") setPaymentPercent(100);
    else setPaymentPercent(50);
  }

  return (
    <section id="equity-calculator" className="flex flex-col items-center bg-white pb-16 sm:px-5 md:px-20 md:pb-24">
      <div className="flex w-[1280px] max-w-full flex-col items-center gap-8 overflow-hidden bg-gradient-to-r from-[#fbf5ef] via-[#fde2e8] to-[#f4e9de] px-5 py-10 sm:rounded-[24px] sm:px-8 md:gap-10 md:rounded-[32px] md:px-16 md:py-[72px]">
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
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d6f39f]">
                <span className="font-heading text-sm font-extrabold tracking-[-0.19px] text-dark">1</span>
              </div>
              <p className="font-heading text-base font-bold tracking-[-0.19px] text-dark sm:text-xl">
                Enter financing amount you want to release
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 px-0 sm:px-5">
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
                  className="w-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-center font-heading text-4xl font-bold leading-none tracking-tight text-brand outline-none sm:text-[56px] sm:tracking-[-2.7px]"
                />
              ) : (
                <p
                  role="button"
                  tabIndex={0}
                  onClick={startEditingFinancingAmount}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") startEditingFinancingAmount();
                  }}
                  className="flex-1 cursor-pointer text-center font-heading text-4xl font-bold tracking-tight text-brand sm:text-[56px] sm:tracking-[-2.7px]"
                >
                  {formatMoney(financingAmount)}
                </p>
              )}
              <button
                type="button"
                onClick={startEditingFinancingAmount}
                aria-label="Edit financing amount"
                className="relative size-[30px] shrink-0 rounded-full bg-[#f5f5f5]"
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
                <span className="text-[13px] font-medium leading-[19.5px] tracking-[-0.24px] text-[#6b6d6b]">
                  £0
                </span>
                <span className="text-[13px] font-medium leading-[19.5px] tracking-[-0.24px] text-[#6b6d6b]">
                  {formatMoney(equity)}
                </span>
              </div>
              <div className="relative flex h-1 w-full items-center">
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#eee]">
                  <div
                    className="absolute inset-y-0 left-0 bg-brand"
                    style={{ width: `${equity > 0 ? (financingAmount / equity) * 100 : 0}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(equity, 1)}
                  value={financingAmount}
                  onChange={(e) => setFinancingAmountRaw(Number(e.target.value))}
                  className="range-thumb absolute inset-0 h-1 w-full cursor-pointer appearance-none bg-transparent"
                  aria-label="Financing amount"
                />
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-start">
              <div className="flex flex-1 flex-col items-start gap-1.5 rounded-2xl bg-[#f5f5f5] p-3">
                <span className="w-full text-xs font-medium tracking-[-0.24px] text-[#6b6d6b]">
                  Property value
                </span>
                <label className="flex w-full items-center gap-1 whitespace-nowrap rounded-[28px] border border-[#d8d4cf] bg-white px-[9px] py-[7px] text-sm tracking-[-0.24px] drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)]">
                  <span className="font-semibold text-brand">£</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={propertyValue.toLocaleString("en-GB")}
                    onChange={(e) => {
                      const digits = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setPropertyValue(digits);
                    }}
                    className="w-full min-w-0 bg-transparent font-medium text-dark outline-none"
                  />
                </label>
              </div>
              <div className="flex flex-1 flex-col items-start gap-1.5 rounded-2xl bg-[#f5f5f5] p-3">
                <span className="w-full text-xs font-medium tracking-[-0.24px] text-[#6b6d6b]">
                  Mortgage balance
                </span>
                <label className="flex w-full items-center gap-1 whitespace-nowrap rounded-[28px] border border-[#d8d4cf] bg-white px-[9px] py-[7px] text-sm tracking-[-0.24px] drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)]">
                  <span className="font-semibold text-brand">£</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={mortgageBalance.toLocaleString("en-GB")}
                    onChange={(e) => {
                      const digits = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
                      setMortgageBalance(digits);
                    }}
                    className="w-full min-w-0 bg-transparent font-medium text-dark outline-none"
                  />
                </label>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-1.5 self-stretch rounded-2xl bg-[#f5f5f5] p-3">
                <span className="font-heading text-xl font-extrabold tracking-[-0.24px] text-dark">
                  {formatMoney(equity)}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#6b6d6b]">equity</span>
              </div>
            </div>

            {/* Equity progress bar */}
            <div className="flex h-4 w-full overflow-hidden rounded">
              <div
                className="h-full border-r-2 border-white bg-[#ce507f]"
                style={{ width: `${releasedWidthPct}%` }}
              />
              <div
                className="h-full border-r-2 border-white bg-[#ffa3c5]"
                style={{ width: `${retainedWidthPct}%` }}
              />
              <div className="h-full flex-1 bg-[#d3bdf9]" style={{ width: `${mortgageWidthPct}%` }} />
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="size-[9px] shrink-0 rounded-full bg-[#ce507f]" />
                  <span className="text-xs font-medium tracking-[-0.24px] text-[#6b6d6b]">Released</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-[9px] shrink-0 rounded-full bg-[#ffa3c5]" />
                  <span className="text-xs font-medium tracking-[-0.24px] text-[#6b6d6b]">Retained equity</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-[9px] shrink-0 rounded-full bg-[#d3bdf9]" />
                  <span className="text-xs font-medium tracking-[-0.24px] text-[#6b6d6b]">Mortgage</span>
                </div>
              </div>
              <div className="flex h-[26px] items-center justify-center rounded-full border border-[#d48400] bg-white px-[13px]">
                <span className="whitespace-nowrap text-xs font-semibold tracking-[-0.24px] text-[#d48400]">
                  {equityPercent >= 70 ? "Near limit" : "Within limit"}
                </span>
              </div>
            </div>

            <div className="flex h-[99px] w-full items-start rounded-2xl">
              <div className="flex h-full flex-1 flex-col items-center gap-1.5 px-2 py-[18px]">
                <span className="font-heading text-3xl font-extrabold tracking-[-0.24px] text-dark">
                  {Math.round(equityPercent)}%
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#6b6d6b]">Equity percent</span>
              </div>
              <div className="flex h-full items-center py-3.5">
                <div className="h-full w-px bg-[#d8d4cf]" />
              </div>
              <div className="flex h-full flex-1 flex-col items-center gap-1.5 px-2 py-[18px]">
                <span className="font-heading text-3xl font-extrabold tracking-[-0.24px] text-dark">
                  {Math.round(propertyValuePercent)}%
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#6b6d6b]">
                  Property value percent
                </span>
              </div>
            </div>
          </div>

          {/* Step 2 — Term */}
          <div className="flex w-full flex-col items-start gap-5 rounded-[22px] bg-white p-4 shadow-[0_10px_28px_-18px_rgba(131,13,65,0.18)] sm:p-[22px]">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d6f39f]">
                <span className="font-heading text-sm font-extrabold tracking-[-0.19px] text-dark">2</span>
              </div>
              <p className="font-heading text-base font-bold tracking-[-0.19px] text-dark sm:text-xl">
                How long do you want it for?
              </p>
            </div>
            <div className="flex w-full items-end justify-center gap-2.5 pt-px">
              {([2, 3, 5] as const).map((years) => {
                const active = term === years;
                return (
                  <button
                    key={years}
                    type="button"
                    onClick={() => setTerm(years)}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border px-[11px] py-[19px] drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)] ${
                      active
                        ? "border-brand bg-[rgba(131,13,65,0.06)] shadow-[0_0_0_3px_rgba(131,13,65,0.08)]"
                        : "border-[#d8d4cf] bg-white"
                    }`}
                  >
                    <span
                      className={`font-heading text-[40px] font-extrabold tracking-[-0.24px] ${
                        active ? "text-brand" : "text-[#6b6d6b]"
                      }`}
                    >
                      {years}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-[0.6px] ${
                        active ? "text-brand" : "text-[#6b6d6b]"
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
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d6f39f]">
                <span className="font-heading text-sm font-extrabold tracking-[-0.19px] text-dark">3</span>
              </div>
              <p className="font-heading text-base font-bold tracking-[-0.19px] text-dark sm:text-xl">Your payments</p>
            </div>

            <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-[#f5f5f5] py-2.5 pl-3 pr-2.5 sm:pl-4">
              <span className="text-xs font-semibold tracking-[-0.24px] text-dark sm:text-sm">
                Monthly rent from property
              </span>
              <label className="flex w-[110px] shrink-0 items-center gap-1 whitespace-nowrap rounded-[28px] border border-[#d8d4cf] bg-white px-[9px] py-[7px] text-sm tracking-[-0.24px] drop-shadow-[0_1px_1px_rgba(50,7,7,0.04)] sm:w-[135px]">
                <span className="font-semibold text-brand">£</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={monthlyRent.toLocaleString("en-GB")}
                  onChange={(e) => {
                    const digits = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
                    setMonthlyRent(digits);
                  }}
                  className="w-full min-w-0 bg-transparent font-medium text-dark outline-none"
                />
              </label>
            </div>

            <div className="flex w-full flex-col items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#6b6d6b]">
                Final repayment amount
              </span>
              <div className="flex w-full items-start justify-center rounded-full border border-[rgba(131,13,65,0.08)] bg-[#f5f5f5] p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("fixed")}
                  className={`flex-1 rounded-full px-[17px] py-[9px] text-center ${
                    paymentMethod === "fixed"
                      ? "border border-[#e8e9e8] bg-brand text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                      : "text-[#6b6d6b]"
                  }`}
                >
                  <p className={`text-sm font-semibold tracking-[-0.24px] ${paymentMethod === "fixed" ? "text-white" : "text-dark"}`}>
                    Fixed Amount
                  </p>
                  <p className={`text-xs font-medium ${paymentMethod === "fixed" ? "text-white/80" : "text-[#6b6d6b]"}`}>
                    Set upfront
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("share")}
                  className={`flex-1 rounded-full px-4 py-2 text-center ${
                    paymentMethod === "share"
                      ? "border border-[#e8e9e8] bg-brand text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                      : "text-[#6b6d6b]"
                  }`}
                >
                  <p className={`text-sm font-semibold tracking-[-0.24px] ${paymentMethod === "share" ? "text-white" : "text-dark"}`}>
                    Share Value
                  </p>
                  <p className={`text-xs font-medium ${paymentMethod === "share" ? "text-white/80" : "text-[#6b6d6b]"}`}>
                    Changes with your property value
                  </p>
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.6px] text-[#6b6d6b]">
                Choose how much to pay each month
              </span>
              <div className="flex w-full flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-4">
                <button
                  type="button"
                  onClick={() => selectPaymentOption("rent")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 sm:px-[17px] sm:py-[13px] ${
                    paymentOption === "rent" ? "border-brand bg-[rgba(131,13,65,0.06)]" : "border-[#e8e9e8] bg-white"
                  }`}
                >
                  <span className={`size-4 shrink-0 rounded-full border ${paymentOption === "rent" ? "border-brand" : "border-[#d0d1d0] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"}`}>
                    {paymentOption === "rent" && <span className="mx-auto mt-[3px] block size-[8px] rounded-full bg-brand" />}
                  </span>
                  <span className={`whitespace-nowrap text-xs font-semibold tracking-[-0.24px] sm:text-sm ${paymentOption === "rent" ? "text-brand" : "text-[#6b6d6b]"}`}>
                    Rent share only
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => selectPaymentOption("mixed")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 sm:px-[17px] sm:py-[13px] ${
                    paymentOption === "mixed" ? "border-brand bg-[rgba(131,13,65,0.06)]" : "border-[#e8e9e8] bg-white"
                  }`}
                >
                  <span className={`size-4 shrink-0 rounded-full border ${paymentOption === "mixed" ? "border-brand" : "border-[#d0d1d0] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"}`}>
                    {paymentOption === "mixed" && <span className="mx-auto mt-[3px] block size-[8px] rounded-full bg-brand" />}
                  </span>
                  <span className={`whitespace-nowrap text-xs font-semibold tracking-[-0.24px] sm:text-sm ${paymentOption === "mixed" ? "text-brand" : "text-[#6b6d6b]"}`}>
                    Mixed partially
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => selectPaymentOption("full")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 sm:px-[17px] sm:py-[13px] ${
                    paymentOption === "full" ? "border-brand bg-[rgba(131,13,65,0.06)]" : "border-[#e8e9e8] bg-white"
                  }`}
                >
                  <span className={`size-4 shrink-0 rounded-full border ${paymentOption === "full" ? "border-brand" : "border-[#d0d1d0] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"}`}>
                    {paymentOption === "full" && <span className="mx-auto mt-[3px] block size-[8px] rounded-full bg-brand" />}
                  </span>
                  <span className={`whitespace-nowrap text-xs font-semibold tracking-[-0.24px] sm:text-sm ${paymentOption === "full" ? "text-brand" : "text-[#6b6d6b]"}`}>
                    Full monthly
                  </span>
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col items-center">
              <p className="text-center font-heading text-[28px] font-extrabold leading-[42px] tracking-[-0.24px] text-brand">
                {formatMoney(selectedPayment)}
                <span className="font-heading text-sm font-semibold leading-[21px] text-[#6b6d6b]">/mo</span>
              </p>

              {/* Payment slider — driven by the "Choose how much to pay each month" annotation:
                  leftmost = Rent share only, dragged = Mixed partially, rightmost = Full monthly */}
              <div className="flex w-full max-w-[538px] flex-col gap-3">
                <div className="flex w-full items-center justify-between">
                  <span className="text-[13px] font-medium leading-[19.5px] tracking-[-0.24px] text-[#6b6d6b]">
                    {formatMoney(minPayment)}/mo
                  </span>
                  <span className="text-[13px] font-medium leading-[19.5px] tracking-[-0.24px] text-[#6b6d6b]">
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

            <div className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#e8ffd1] p-4">
              <div className="relative size-5 shrink-0">
                <Image src="/equity-calculator/toast-icon.svg" alt="" fill />
              </div>
              <p className="text-center text-sm font-semibold tracking-[-0.24px] text-[#1f8a5b]">
                {paymentOption === "rent"
                  ? "You have chosen to fully defer the financing cost."
                  : savingsOverall > 0
                    ? `Paying ${formatMoney(selectedPayment)}/mo saves you ${formatK(savingsOverall)} overall.`
                    : "Move the slider to reduce your total repayment cost."}
              </p>
            </div>

            {/* Monthly payments summary */}
            <div className="flex w-full flex-col items-start gap-5 rounded-2xl bg-[#f8f0e7] p-5">
              <p className="font-heading text-xl font-semibold tracking-[-0.24px] text-dark">Monthly Payments</p>

              <div className="flex w-full items-end justify-between">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm font-medium tracking-[-0.24px] text-[#320707]">Pauzible&apos;s share</span>
                  <span className="text-xs font-medium tracking-[-0.24px] text-[#6b6d6b]">
                    of your {formatMoney(monthlyRent)} monthly rent
                  </span>
                </div>
                <span className="font-heading text-lg font-bold tracking-[-0.24px] text-dark">
                  {formatMoney(totalMonthlyPayment)}/mo
                </span>
              </div>

              <div className="h-px w-full bg-[#d9d9d9]" />

              <div className="flex w-full items-end justify-between">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-medium tracking-[-0.24px] text-[#320707]">Interest cost</span>
                  <span className="text-xs font-medium tracking-[-0.24px] text-[#6b6d6b]">
                    <span className="font-semibold text-brand">{(MONTHLY_INTEREST_RATE * 100).toFixed(2)}%</span> per month
                  </span>
                </div>
                <span className="font-heading text-lg font-bold tracking-[-0.24px] text-dark">
                  {formatMoney(interestCostPerMonth)}/mo
                </span>
              </div>

              <div className="h-px w-full bg-[#d9d9d9]" />

              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold tracking-[-0.24px] text-[#320707]">Total Monthly Payment</span>
                <span className="font-heading text-2xl font-bold tracking-[-0.24px] text-brand">
                  {formatMoney(totalMonthlyPayment)}/mo
                </span>
              </div>
            </div>

            {/* Final repayment summary */}
            <div className="flex w-full flex-col items-start gap-5 rounded-2xl bg-[#f8f0e7] p-5">
              <p className="font-heading text-xl font-semibold tracking-[-0.24px] text-dark">Final Repayment</p>

              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-medium tracking-[-0.24px] text-[#320707]">
                  Principal (Released amount)
                </span>
                <span className="font-heading text-[17px] font-bold tracking-[-0.24px] text-[#320707]">
                  {formatK(financingAmount)}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-medium tracking-[-0.24px] text-[#320707]">
                  Unpaid interest (Interest cost)
                </span>
                <span className="font-heading text-[17px] font-bold tracking-[-0.24px] text-[#320707]">
                  {formatK(unpaidInterest)}
                </span>
              </div>

              <div className="h-px w-full bg-[#d9d9d9]" />

              <div className="flex w-full items-center justify-between rounded-2xl bg-[#320707] px-[18px] py-4">
                <span className="font-heading text-base font-medium tracking-[-0.24px] text-white">
                  Paid at the end of the term
                </span>
                <span className="font-heading text-2xl font-extrabold leading-[39px] tracking-[-0.24px] text-[#d6f39f]">
                  {formatK(finalRepayment)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex w-full max-w-[520px] flex-col items-center gap-3 px-6">
          <a
            href="#"
            className="flex h-14 w-full items-center justify-center rounded-full bg-brand no-underline"
          >
            <span className="text-lg font-semibold leading-[26px] tracking-[-0.24px] text-brand-btn-text">
              Get started
            </span>
          </a>
          <p className="text-center text-xs font-medium tracking-[-0.24px] text-[#6b6d6b]">
            Illustrative example. Not a quote or offer.
          </p>
        </div>
      </div>
    </section>
  );
}
