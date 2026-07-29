import type { Metadata } from "next";
import { Outfit, Inter, Fira_Sans_Condensed } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const firaSansCondensed = Fira_Sans_Condensed({
  variable: "--font-fira-sans-condensed",
  subsets: ["latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  title: "Pauzible — Release Equity from your buy-to-lets",
  description:
    "Pauzible turns your property wealth into cash while you keep 100% ownership. A partner that shares the downside as well as the upside for 2, 3 or 5y terms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${firaSansCondensed.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
