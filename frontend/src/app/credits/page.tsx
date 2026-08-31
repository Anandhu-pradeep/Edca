"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { createPaymentOrder, verifyPayment } from '@/lib/payment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BuyCreditsPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [customCredits, setCustomCredits] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentState, setPaymentState] = useState<'IDLE' | 'LOADING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
    
    const [selectedPackage, setSelectedPackage] = useState<{credits: number, price: number, label: string} | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isOrg = user?.roles?.includes('ROLE_ORGANIZATION');

    const personalPackages = [
        { label: 'Basic', credits: 10, price: 10 },
        { label: 'Standard', credits: 50, price: 50 },
    ];

    const orgPackages = [
        { label: 'Basic', credits: 1000, price: 500 },
        { label: 'Standard', credits: 5000, price: 2500 },
    ];

    const packages = isOrg ? orgPackages : personalPackages;
    
    // Calculate price based on credits requested (safe calculation, though backend is source of truth)
    const calculatePrice = (credits: number) => {
        return isOrg ? (credits * 0.5) : (credits * 1);
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuy = async (credits: number) => {
        if (credits <= 0) {
            toast.error("Please enter a valid amount of credits");
            return;
        }

        try {
            setIsProcessing(true);
            setPaymentState('LOADING');
            toast.loading("Creating secure payment...", { id: "payment" });

            const res = await loadRazorpayScript();
            if (!res) {
                toast.error("Failed to load Razorpay SDK", { id: "payment" });
                setPaymentState('FAILED');
                setIsProcessing(false);
                return;
            }

            const order = await createPaymentOrder({ credits });

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TQLP0lXvBOqpEf',
                amount: order.amount,
                currency: order.currency,
                name: "EDCA AI Platform",
                description: `Purchase ${credits} Credits`,
                order_id: order.orderId,
                handler: async function (response: any) {
                    try {
                        setPaymentState('PROCESSING');
                        toast.loading("Verifying payment...", { id: "payment" });

                        await verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
                        setPaymentState('SUCCESS');
                        toast.success(`Payment Successful! +${credits} Credits`, { id: "payment" });
                    } catch (err: any) {
                        console.error(err);
                        setPaymentState('FAILED');
                        toast.error("Payment Verification Failed", { id: "payment" });
                    }
                },
                prefill: {
                    name: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username,
                    email: user?.email,
                },
                theme: {
                    color: "#0f172a",
                },
                modal: {
                    ondismiss: function() {
                        if (paymentState !== 'SUCCESS') {
                            setPaymentState('IDLE');
                            toast.error("Payment Cancelled", { id: "payment" });
                        }
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (response: any) {
                setPaymentState('FAILED');
                toast.error(`Payment Failed: ${response.error.description}`, { id: "payment" });
            });
            setIsDialogOpen(false);
            paymentObject.open();

        } catch (err: any) {
            console.error(err);
            setPaymentState('FAILED');
            toast.error(err?.response?.data?.message || "Failed to create order", { id: "payment" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container max-w-5xl py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative z-10">
                <div className="inline-block mb-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-primary drop-shadow-sm">
                        Buy Credits
                    </h1>
                </div>
                <p className="text-muted-foreground text-lg">
                    {isOrg 
                        ? "Enterprise pricing applied. 1 credit = ₹0.50" 
                        : "Personal pricing applied. 1 credit = ₹1"}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <CreditBalance />
                    <Card className="bg-gradient-to-br from-emerald-500/5 via-primary/5 to-transparent border-primary/20 backdrop-blur-md shadow-lg overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="flex items-center gap-2.5">
                                <div className="relative flex items-center justify-center p-1.5 bg-primary/10 rounded-md">
                                    <ShieldCheck className="text-primary h-5 w-5 relative z-10" />
                                    <span className="absolute inset-0 rounded-md bg-primary/20 animate-ping opacity-25"></span>
                                </div>
                                Secure Checkout
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">All payments are securely processed by Razorpay. Credits are added instantly upon verification.</p>
                            <Link href="/credits/history" className="mt-2 flex items-center text-xs font-medium text-primary hover:underline group">
                                View transaction history 
                                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {packages.map((pkg) => (
                            <Card key={pkg.label} className="flex flex-col bg-card/40 backdrop-blur-xl border-white/10 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 cursor-pointer overflow-hidden group relative" onClick={() => !isProcessing && (setSelectedPackage(pkg), setIsDialogOpen(true))}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
                                <CardHeader className="relative z-10 pb-2 pt-4">
                                    <CardTitle className="text-lg font-bold text-foreground/90">{pkg.label}</CardTitle>
                                    <CardDescription className="text-primary font-medium tracking-wide text-xs">{pkg.credits.toLocaleString()} Credits</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 relative z-10 pb-2">
                                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">₹{pkg.price.toLocaleString()}</div>
                                </CardContent>
                                <CardFooter className="relative z-10 pb-4">
                                    <Button 
                                        className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                                        disabled={isProcessing}
                                        onClick={(e) => { e.stopPropagation(); setSelectedPackage(pkg); setIsDialogOpen(true); }}
                                    >
                                        Buy {pkg.label}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-lg relative overflow-hidden mt-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                        <CardHeader className="relative z-10 pb-2 pt-4">
                            <CardTitle className="text-lg">Custom Amount</CardTitle>
                            <CardDescription className="text-xs">Enter the exact number of credits you need</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-2">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Credits</label>
                                <Input 
                                    type="number" 
                                    className="bg-background/50 backdrop-blur-sm border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
                                    placeholder={isOrg ? "e.g. 10000" : "e.g. 100"} 
                                    value={customCredits}
                                    onChange={(e) => setCustomCredits(e.target.value)}
                                    min={1}
                                />
                            </div>
                            {Number(customCredits) > 0 && (
                                <div className="p-3 bg-primary/5 rounded-xl flex items-center justify-between border border-primary/10 shadow-inner mt-2 animate-in fade-in zoom-in-95 duration-300">
                                    <span className="text-sm font-medium text-muted-foreground">Total Price:</span>
                                    <span className="text-xl font-bold text-primary">₹{calculatePrice(Number(customCredits)).toLocaleString()}</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="relative z-10 pb-4">
                            <Button 
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5" 
                                disabled={isProcessing || !customCredits || Number(customCredits) <= 0}
                                onClick={() => {
                                    const credits = Number(customCredits);
                                    if (credits > 0) {
                                        setSelectedPackage({ credits, price: calculatePrice(credits), label: 'Custom Amount' });
                                        setIsDialogOpen(true);
                                    }
                                }}
                            >
                                Buy Custom Credits
                            </Button>
                        </CardFooter>
                    </Card>

                    {paymentState === 'SUCCESS' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6" />
                            <div>
                                <h4 className="font-semibold">Payment Successful</h4>
                                <p className="text-sm opacity-90">Your credits have been added to your wallet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Confirm Purchase</DialogTitle>
                        <DialogDescription>
                            Review your order details before proceeding to secure payment.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPackage && (
                        <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Package</span>
                                <span className="font-medium">{selectedPackage.label}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Credits</span>
                                <span className="font-medium">{selectedPackage.credits.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Price per Credit</span>
                                <span className="font-medium text-foreground">{isOrg ? "₹0.50" : "₹1.00"}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 mt-4 bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl border border-primary/20">
                                <span className="font-semibold text-lg text-foreground/90">Total Amount</span>
                                <span className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">₹{selectedPackage.price.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-between gap-3">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => {
                                if (selectedPackage) {
                                    handleBuy(selectedPackage.credits);
                                }

                            }}
                            disabled={isProcessing}
                            className="w-full sm:w-auto"
                        >
                            {isProcessing ? "Processing..." : "Proceed to Pay"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
