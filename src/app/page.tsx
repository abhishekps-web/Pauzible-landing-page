import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueProposition from "@/components/ValueProposition";
import GrowYourWealth from "@/components/GrowYourWealth";
import FinancingCostV3 from "@/components/FinancingCostV3";
import EquityCalculator from "@/components/EquityCalculator";
import CaseStudies from "@/components/CaseStudies";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ValueProposition />
      <GrowYourWealth />
      <FinancingCostV3 />
      <EquityCalculator />
      <CaseStudies />
      <FAQ />
      <Footer />
    </>
  );
}
