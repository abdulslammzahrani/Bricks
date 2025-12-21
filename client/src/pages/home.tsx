import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  const [isFormComplete, setIsFormComplete] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection onCompleteChange={setIsFormComplete} />
        {!isFormComplete && (
          <>
            <HowItWorks />
            <Features />
            <CTASection />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
