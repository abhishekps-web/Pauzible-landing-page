import Image from "next/image";

function ValueCard({
  illustration,
  title,
  description,
}: {
  illustration: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-[#e8e9e8] sm:w-[413px]">
      <div className="relative h-[198px] w-full shrink-0 sm:h-[286px]">
        <Image src={illustration} alt="" fill className="object-cover" />
      </div>

      <div className="flex min-h-[140px] w-full shrink-0 flex-col items-start justify-center gap-2 overflow-hidden border-t border-[#f9f3f5] bg-white p-5 sm:h-[165px] sm:p-6">
        <p className="font-heading text-xl font-bold leading-7 text-dark">{title}</p>
        <p className="text-base font-medium leading-6 text-[#6b6d6b]">{description}</p>
      </div>
    </div>
  );
}

export default function ValueProposition() {
  return (
    <section id="what-is-pauzible" className="flex flex-col items-center gap-10 bg-white px-5 pb-16 pt-12 sm:px-8 md:gap-16 md:px-20 md:pb-20 md:pt-18">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-4 md:h-44">
        <div className="flex h-[34px] items-center justify-center border-b-2 border-[#d6f39f]">
          <p className="font-heading text-xs font-bold uppercase tracking-[2px] text-dark">
            What is Pauzible
          </p>
        </div>
        <p className="text-center font-heading text-3xl font-bold leading-tight tracking-tight text-dark sm:text-4xl md:whitespace-nowrap md:text-[48px] md:leading-[56px] md:tracking-[-1.5px]">
          Fixed Term Equity Partnership
        </p>
        <p className="w-full max-w-[958px] text-center text-base font-medium leading-[26px] tracking-[-0.24px] text-[#6b6d6b] md:text-lg md:leading-[29.25px]">
          Pauzible&apos;s Fixed Term Equity Partnership is secured against your property. It runs
          for a 2, 3 or 5-year term you choose. Pauzible shares in both the upside and the
          downside of the value of your property.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-center">
        <ValueCard
          title="Equity"
          description="Your equity is the value of your property minus the amount of your mortgage."
          illustration="/value-proposition/equity-illustration.png"
        />

        <ValueCard
          title="Partnership"
          description="Pauzible can release a large proportion of your trapped equity, while you retain 100% ownership of your property."
          illustration="/value-proposition/partnership-illustration.png"
        />

        <ValueCard
          title="Term"
          description="Choose the financing term that best suits your needs."
          illustration="/value-proposition/term-illustration.png"
        />
      </div>
    </section>
  );
}
