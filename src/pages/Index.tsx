import { useState } from "react";

import StickyHeader from "@/components/StickyHeader";
import HeroSection from "@/components/HeroSection";
import DataExplorer from "@/components/DataExplorer";
import SolutionsSection from "@/components/SolutionsSection";
import IndustryStrip from "@/components/IndustryStrip";
import GuaranteeSection from "@/components/GuaranteeSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import CheckoutDialog from "@/components/CheckoutDialog";
import { LegalSection, Footer } from "@/components/FooterSection";
import { type PricingPlan } from "@/data/pricing";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <>
      <StickyHeader />
      <HeroSection onSearch={handleSearch} />
      <DataExplorer loading={loading} />
      <IndustryStrip />
      <SolutionsSection />
      <GuaranteeSection />
      <PricingSection onBuy={setSelectedPlan} />
      <FAQSection />
      <LegalSection />
      <Footer />
      <WhatsAppButton />
      <CheckoutDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </>
  );
};

export default Index;
