"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Organizations", href: "#organizations" },
    { name: "FAQ", href: "#faq" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4 px-4 transition-all duration-300">
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "w-full max-w-6xl rounded-full px-6 py-4 flex items-center justify-between transition-all duration-300",
          isScrolled ? "bg-background/90 border border-border shadow-lg backdrop-blur-md" : "bg-transparent"
        )}
      >
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          {/* Light Logo (visible in light mode) */}
          <Image 
            src="/logo-light.png" 
            alt="Edca Logo" 
            width={180} 
            height={48} 
            className="block dark:hidden h-12 w-auto object-contain"
          />
          {/* Dark Logo (visible in dark mode) */}
          <Image 
            src="/logo-dark.png" 
            alt="Edca Logo" 
            width={180} 
            height={48} 
            className="hidden dark:block h-12 w-auto object-contain"
          />
          <span className="text-xl font-bold font-heading text-foreground tracking-tight">
            Edca
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
             <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => router.push('/sign?view=login')} className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors">
            Log in
          </button>
          <Button 
            onClick={() => router.push('/sign?view=register')}
            className="rounded-full px-6 bg-primary text-primary-foreground hover:opacity-90"
          >
            Get Started
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button 
            className="text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-4 right-4 mt-2 p-4 rounded-2xl bg-card border border-border shadow-2xl md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-lg font-medium text-foreground p-2 hover:bg-muted rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <button 
              onClick={() => { setIsMobileMenuOpen(false); router.push('/sign?view=login'); }} 
              className="text-lg font-medium text-foreground p-2 hover:bg-muted rounded-lg text-left w-full"
            >
              Log in
            </button>
            <Button 
              onClick={() => { setIsMobileMenuOpen(false); router.push('/sign?view=register'); }} 
              className="w-full rounded-xl h-12 bg-primary text-primary-foreground hover:opacity-90"
            >
              Get Started
            </Button>
          </div>
        </motion.div>
      )}


    </header>
  );
}
