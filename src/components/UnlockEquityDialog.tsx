"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type UnlockEquityDialogContextValue = {
  openUnlockEquityDialog: () => void;
};

const UnlockEquityDialogContext = createContext<UnlockEquityDialogContextValue | null>(null);

export function useUnlockEquityDialog() {
  const context = useContext(UnlockEquityDialogContext);
  if (!context) throw new Error("useUnlockEquityDialog must be used within UnlockEquityDialogProvider");
  return context;
}

const PROPERTY_VALUE_OPTIONS = [
  "Below £150,000",
  "Between £150,000 and £300,000",
  "Between £300,000 and £500,000",
  "Above £500,000",
];

const MORTGAGE_BALANCE_OPTIONS = [
  "Below £100,000",
  "Between £100,000 and £200,000",
  "Between £200,000 and £350,000",
  "Above £350,000",
  "No mortgage",
];

type FieldName =
  | "fullName"
  | "email"
  | "contactNumber"
  | "propertyValue"
  | "mortgageBalance"
  | "monthlyRent"
  | "consent";

type FormErrors = Partial<Record<FieldName, string>>;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function inputClass(hasError: boolean, textColorClass: string = "text-dark") {
  return `w-full rounded-2xl border bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-[#6b6d6b] ${textColorClass} ${
    hasError ? "border-red-400" : "border-[#d8d4cf]"
  }`;
}

function SelectField({
  value,
  onChange,
  hasError,
  placeholder,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  placeholder: string;
  options: string[];
  ariaLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`flex w-full items-center justify-between gap-2 rounded-2xl border bg-white px-3.5 py-2.5 text-left text-sm ${
          hasError ? "border-red-400" : "border-[#d8d4cf]"
        } ${value ? "text-dark" : "text-[#6b6d6b]"}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <Image
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          src="/chevron-down.svg"
          width={12}
          height={12}
          alt=""
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div
          role="listbox"
          className="absolute left-0 top-full z-10 mt-2 flex w-full flex-col gap-1 rounded-2xl border border-[#fce7f3] bg-white p-2 shadow-[0_10px_24px_rgba(131,13,65,0.12)]"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-medium leading-5 tracking-[-0.24px] text-dark hover:bg-[#fff5f7]"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-dark">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function UnlockEquityForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [mortgageBalance, setMortgageBalance] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors: FormErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Please enter your full name.";
    if (!isValidEmail(email.trim())) nextErrors.email = "Please enter a valid email address.";
    if (!contactNumber.trim()) nextErrors.contactNumber = "Please enter a contact number.";
    if (!propertyValue) nextErrors.propertyValue = "Please select an estimated property value.";
    if (!mortgageBalance) nextErrors.mortgageBalance = "Please select your outstanding mortgage.";
    const rent = Number(monthlyRent);
    if (!monthlyRent.trim() || !Number.isFinite(rent) || rent <= 0) {
      nextErrors.monthlyRent = "Please enter your monthly rent.";
    }
    if (!consent) nextErrors.consent = "Please agree to the terms to continue.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSubmitted(true);
  }

  function resetForm() {
    setFullName("");
    setEmail("");
    setContactNumber("");
    setPropertyValue("");
    setMortgageBalance("");
    setMonthlyRent("");
    setMessage("");
    setConsent(false);
    setErrors({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 floating-scrollbar">
          <div className="flex flex-col items-start gap-5">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#d6f39f]">
              <span className="text-2xl font-bold text-dark">✓</span>
            </div>
            <div>
              <h3 className="font-heading text-2xl font-bold tracking-tight text-dark">You&apos;re on the list</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b6d6b]">
                Thanks! We&apos;ve saved your details — we&apos;ll email you the moment a place opens up.
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-[#e8e9e8] p-6 sm:p-8 sm:pt-5">
          <button
            type="button"
            onClick={resetForm}
            className="w-full rounded-full border border-[#d8d4cf] py-3.5 text-center text-sm font-semibold text-dark"
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 floating-scrollbar">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-dark">Unlock your funds</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b6d6b]">
              We&apos;re onboarding landlords in stages. Leave your details and we&apos;ll be in touch the moment you
              can apply.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name*" error={errors.fullName}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className={inputClass(!!errors.fullName)}
              />
            </Field>

            <Field label="Email*" error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className={inputClass(!!errors.email)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact number*" error={errors.contactNumber}>
              <div
                className={`flex items-center gap-2 rounded-2xl border bg-white px-3.5 py-2.5 ${
                  errors.contactNumber ? "border-red-400" : "border-[#d8d4cf]"
                }`}
              >
                <span className="shrink-0 text-sm font-semibold text-[#6b6d6b]">+44</span>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. 7123 456 789"
                  className="w-full min-w-0 bg-transparent text-sm text-dark outline-none"
                />
              </div>
            </Field>

            <Field label="Monthly rent*" error={errors.monthlyRent}>
              <div
                className={`flex items-center gap-2 rounded-2xl border bg-white px-3.5 py-2.5 ${
                  errors.monthlyRent ? "border-red-400" : "border-[#d8d4cf]"
                }`}
              >
                <span className="shrink-0 text-sm font-semibold text-[#6b6d6b]">£</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Monthly rent"
                  className="w-full min-w-0 bg-transparent text-sm text-dark outline-none"
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Estimated property value*" error={errors.propertyValue}>
              <SelectField
                value={propertyValue}
                onChange={setPropertyValue}
                hasError={!!errors.propertyValue}
                placeholder="Estimated property value"
                options={PROPERTY_VALUE_OPTIONS}
                ariaLabel="Estimated property value"
              />
            </Field>

            <Field label="Outstanding mortgage*" error={errors.mortgageBalance}>
              <SelectField
                value={mortgageBalance}
                onChange={setMortgageBalance}
                hasError={!!errors.mortgageBalance}
                placeholder="Outstanding mortgage"
                options={MORTGAGE_BALANCE_OPTIONS}
                ariaLabel="Outstanding mortgage"
              />
            </Field>
          </div>

          <Field label="Message">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any details you want us to know (optional)"
              rows={3}
              className={`${inputClass(false)} resize-none`}
            />
          </Field>

          <div className="flex flex-col gap-1.5 pt-1">
            <label className="flex items-start gap-3 text-sm leading-relaxed text-[#6b6d6b]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-[#d8d4cf] text-brand focus:ring-brand"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="font-medium text-dark underline underline-offset-4">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="font-medium text-dark underline underline-offset-4">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {errors.consent ? <p className="text-xs text-red-600">{errors.consent}</p> : null}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#e8e9e8] p-6 sm:p-8 sm:pt-5">
        <button
          type="submit"
          className="w-full rounded-full bg-brand py-3.5 text-center text-base font-semibold text-brand-btn-text"
        >
          Join the waitlist
        </button>
      </div>
    </form>
  );
}

export function UnlockEquityDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openUnlockEquityDialog = useCallback(() => setIsOpen(true), []);
  const closeDialog = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDialog();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeDialog]);

  return (
    <UnlockEquityDialogContext.Provider value={{ openUnlockEquityDialog }}>
      {children}
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeDialog} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Unlock your funds"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close dialog"
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-[#f5f5f5] text-dark"
            >
              ✕
            </button>
            <UnlockEquityForm />
          </div>
        </div>
      ) : null}
    </UnlockEquityDialogContext.Provider>
  );
}
