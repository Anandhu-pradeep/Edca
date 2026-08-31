import { useQuery } from '@tanstack/react-query';
import { getCreditBalance } from '@/lib/credit';
import { Wallet, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const CreditBalance = () => {
    const { data: balance, isLoading, error } = useQuery({
        queryKey: ['creditBalance'],
        queryFn: getCreditBalance,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 p-6 bg-secondary/20 rounded-2xl animate-pulse border border-border/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg"></div>
                    <div className="w-32 h-5 bg-muted/50 rounded"></div>
                </div>
                <div className="w-40 h-12 bg-muted/50 rounded"></div>
                <div className="flex justify-between mt-2 pt-4 border-t border-border/20">
                    <div className="w-24 h-4 bg-muted/50 rounded"></div>
                    <div className="w-20 h-8 bg-muted/50 rounded-full"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return null; // hide on error
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 p-6 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-primary/10 hover:border-white/10 group">
            {/* Ambient glowing background shapes */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-primary-foreground">
                    <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20 shadow-inner">
                        <Wallet size={20} className="text-primary" />
                    </div>
                    <span className="font-bold text-sm tracking-widest text-muted-foreground uppercase">Available Credits</span>
                </div>
            </div>
            
            <div className="relative z-10 text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-2 drop-shadow-sm">
                {balance?.balance?.toLocaleString() ?? 0}
            </div>
            
            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 mt-4">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Sparkles size={14} className="text-yellow-500/80" />
                    Total consumed: <span className="text-foreground/80 font-semibold">{balance?.totalConsumed?.toLocaleString() ?? 0}</span>
                </span>
                <Link href="/credits">
                    <Button size="sm" className="h-8 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                        Buy Credits
                    </Button>
                </Link>
            </div>
        </div>
    );
};
