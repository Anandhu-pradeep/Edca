import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Organizations } from "@/components/landing/Organizations";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-white/20 selection:text-white">
      <Navbar />
      <Hero />
      <Features />
      <DashboardPreview />
      <Organizations />
      <FAQ />
      <Pricing />
      <Footer />
    </main>
  );
}
