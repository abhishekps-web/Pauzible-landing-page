import Image from "next/image";

const FOOTER_GRADIENT =
  "linear-gradient(90deg, rgb(251,245,239) 0%, rgb(251,242,238) 7.1429%, rgb(252,240,237) 14.286%, rgb(252,237,236) 21.429%, rgb(252,234,235) 28.571%, rgb(253,231,234) 35.714%, rgb(253,229,233) 42.857%, rgb(253,226,232) 50%, rgb(252,227,231) 57.143%, rgb(250,228,229) 64.286%, rgb(249,229,228) 71.429%, rgb(248,230,226) 78.571%, rgb(247,231,225) 85.714%, rgb(245,232,223) 92.857%, rgb(244,233,222) 100%)";

const socialLinks = [
  { label: "Pauzible on X", icon: "/footer/icon-x.svg" },
  { label: "Pauzible on LinkedIn", icon: "/footer/icon-linkedin.svg" },
  { label: "Pauzible on Instagram", icon: "/footer/icon-instagram.svg" },
  { label: "Pauzible on Facebook", icon: "/footer/icon-facebook.svg" },
];

const linkColumns = [
  {
    heading: "Explore",
    links: ["Calculator", "Knowledge Hub", "Insights", "Partners"],
  },
  {
    heading: "Company",
    links: ["About", "FAQ"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Use", "Consent Preferences"],
  },
];

function FooterLinkColumn({ heading, links }: { heading: string; links: string[] }) {
  return (
    <div className="flex flex-col items-start gap-3.5 pt-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[1.1px] text-dark">{heading}</p>
      <ul className="m-0 flex list-none flex-col items-start gap-2.5 p-0">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="whitespace-nowrap text-[13.5px] font-medium tracking-[-0.24px] text-dark/80 no-underline"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="flex justify-center bg-white px-4 sm:px-6">
      <div className="w-full max-w-[1280px] overflow-hidden rounded-t-[32px]">
        {/* CTA section */}
        <div className="relative w-full" style={{ backgroundImage: FOOTER_GRADIENT }}>
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <Image src="/footer/bg-image.png" alt="" fill className="object-cover" />
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(168.53deg, rgba(255,245,247,0.82) 8.4861%, rgba(253,226,232,0.94) 91.514%)",
            }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-start px-6 pb-10 pt-10 sm:px-16 sm:pb-[52px] sm:pt-14">
            <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
              <a href="#" className="flex items-center gap-2 no-underline">
                <div
                  className="size-7 shrink-0 bg-brand [mask-image:url(/logo-mask.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:28px_28px] [-webkit-mask-image:url(/logo-mask.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:28px_28px]"
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap font-heading text-2xl font-bold tracking-[-0.48px] text-dark">
                  Pauzible
                </span>
              </a>

              <div className="flex flex-col items-start gap-3.5 sm:items-end">
                <a
                  href="#"
                  className="flex h-10 shrink-0 items-center gap-3 rounded-full bg-brand py-1 pl-5 pr-1 no-underline"
                >
                  <span className="whitespace-nowrap text-sm font-medium tracking-[-0.24px] text-[#eee]">
                    Get started
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eee]">
                    <Image src="/footer/icon-arrow.svg" alt="" width={16} height={16} aria-hidden="true" />
                  </span>
                </a>

                <div className="flex items-start gap-2">
                  {socialLinks.map(({ label, icon }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dark/25 p-px no-underline"
                    >
                      <Image src={icon} alt="" width={13} height={13} className="opacity-70" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 font-heading text-4xl font-extrabold leading-tight tracking-tight text-dark sm:pt-11 sm:text-[52px] sm:leading-[55px] sm:tracking-[-1.82px]">
              <p>Property finance,</p>
              <p>reimagined.</p>
            </div>

            <div className="flex w-full flex-col items-start gap-10 pt-10 sm:flex-row sm:justify-between sm:gap-0 sm:pt-12">
              <div className="flex w-full flex-wrap items-start gap-8 sm:w-auto sm:gap-[52px]">
                {linkColumns.map((column) => (
                  <FooterLinkColumn key={column.heading} {...column} />
                ))}
              </div>

              <div className="flex flex-col items-start gap-3.5 pt-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[1.1px] text-dark">Contact</p>
                <div className="flex flex-col items-start gap-2 text-[13.5px] font-medium tracking-[-0.24px] text-dark/80">
                  <p className="whitespace-nowrap">
                    38 Lombard Street
                    <br />
                    London EC3V 9BS
                  </p>
                  <p className="whitespace-nowrap">020 8865 3352</p>
                  <p className="whitespace-nowrap">hello@pauzible.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand wordmark */}
        <div
          className="flex w-full items-center justify-center overflow-hidden pt-4 sm:pt-7"
          style={{ backgroundImage: FOOTER_GRADIENT }}
        >
          <p className="whitespace-nowrap font-heading text-[15vw] font-extrabold leading-[0.88] tracking-[-0.05em] text-[#320707] sm:text-[225px] sm:leading-[198px] sm:tracking-[-11.2px]">
            Pauzible
          </p>
        </div>

        {/* Legal */}
        <div className="flex flex-col items-start gap-2 px-6 pb-8 pt-6 sm:px-16" style={{ backgroundImage: FOOTER_GRADIENT }}>
          <p className="text-[11px] font-medium tracking-[-0.24px] text-dark/70">
            Pauzible Asset Services (UK) Limited is registered with and supervised by the Financial
            Conduct Authority for anti-money laundering purposes only. Registration no. 1053392.
          </p>
          <p className="text-[11px] font-medium tracking-[-0.24px] text-dark/70">
            Pauzible Asset Services (UK) Limited is registered in England and Wales with Company
            number 15917067. Our registered office is at 38 Lombard Street London EC3V 9BS.
          </p>
          <p className="text-[11px] font-medium tracking-[-0.24px] text-dark/70">
            Pauzible Asset Services (UK) Limited is registered with the Information Commissioner&apos;s
            Office with Registration reference ZC088971.
          </p>
          <p className="text-[11px] font-medium tracking-[-0.24px] text-dark/70">
            Pauzible Asset Services (UK) Limited is not authorised by the Financial Conduct
            Authority. You do not have any of the protections under the Financial Conduct Authority
            rules and do not have any cover from the Financial Ombudsman Scheme or the Financial
            Services Compensation Scheme in relation to any contract that you may have with
            Pauzible Asset Services (UK) Limited. Customers should ensure they understand what this
            means before they use the Pauzible product.
          </p>
          <p className="text-[11px] font-medium tracking-[-0.24px] text-dark/70">
            Telephone calls may be recorded for quality assurance, training and monitoring purposes.
          </p>
          <p className="text-[11px] font-medium tracking-[-0.24px] text-dark/60">
            © 2026 Pauzible. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
