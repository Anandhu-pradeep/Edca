import Link from 'next/link';
import { Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-primary/30 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group cursor-pointer">
              <div className="w-8 h-8 bg-surface border border-primary/50 flex items-center justify-center font-heading font-bold text-primary group-hover:bg-primary group-hover:text-background transition-colors">
                CE
              </div>
              <span className="font-heading font-bold text-primary-text uppercase tracking-widest">
                Career_Edge<span className="animate-pulse text-primary">_</span>
              </span>
            </Link>
            <p className="text-secondary-text font-heading text-[10px] uppercase tracking-widest leading-relaxed">
              AI-powered simulation protocols.
              Optimizing candidate algorithms for corporate integration.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white text-[10px] uppercase tracking-widest mb-4">SYSTEM</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-secondary-text hover:text-primary font-heading text-[10px] uppercase tracking-widest transition-colors">&gt; Modules</Link></li>
              <li><Link href="#how-it-works" className="text-secondary-text hover:text-primary font-heading text-[10px] uppercase tracking-widest transition-colors">&gt; Execution_Flow</Link></li>
              <li><Link href="#pricing" className="text-secondary-text hover:text-primary font-heading text-[10px] uppercase tracking-widest transition-colors">&gt; Access_Tiers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white text-[10px] uppercase tracking-widest mb-4">NETWORK</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-secondary-text hover:text-accent-cyan font-heading text-[10px] uppercase tracking-widest transition-colors">&gt; Documentation</Link></li>
              <li><Link href="#" className="text-secondary-text hover:text-accent-cyan font-heading text-[10px] uppercase tracking-widest transition-colors">&gt; API_Access</Link></li>
              <li><Link href="#" className="text-secondary-text hover:text-accent-cyan font-heading text-[10px] uppercase tracking-widest transition-colors">&gt; Node_Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white text-[10px] uppercase tracking-widest mb-4">LEGAL</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-secondary-text hover:text-secondary font-heading text-[10px] uppercase tracking-widest transition-colors">&gt; Data_Privacy</Link></li>
              <li><Link href="#" className="text-secondary-text hover:text-secondary font-heading text-[10px] uppercase tracking-widest transition-colors">&gt; Terms_Of_Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary-text font-heading text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} CAREER_EDGE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-4 text-secondary-text font-heading text-[10px] uppercase tracking-widest">
            <span>SYS_STATUS: <span className="text-primary">ONLINE</span></span>
            <span>VERSION: 2.0.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
