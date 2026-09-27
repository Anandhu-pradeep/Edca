"use client";

import { useQuery } from '@tanstack/react-query';
import { getPaymentHistory } from '@/lib/payment';
import { getCreditTransactions } from '@/lib/credit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, XCircle, Clock, ArrowLeft, Receipt } from 'lucide-react';
import Link from 'next/link';
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const cleanDescription = (desc: string) => {
    return desc.replace(/ \(ID: [a-zA-Z0-9-]+\)/, '');
};

import { Suspense } from 'react';

export default function HistoryPage() {
    const { data: payments, isLoading: loadingPayments } = useQuery({
        queryKey: ['paymentHistory'],
        queryFn: getPaymentHistory
    });

    const { data: transactions, isLoading: loadingTransactions } = useQuery({
        queryKey: ['creditTransactions'],
        queryFn: getCreditTransactions
    });

    return (
        <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent activeTabOverride="History">
            <div className="w-full max-w-4xl mx-auto py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link href="/?tab=Credits+%26+Billing" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors group mb-2">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                Back to Credits & Billing
            </Link>
            
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                    <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-primary drop-shadow-sm">Transaction History</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">View your credit usage and payment history securely.</p>
                </div>
            </div>

            <Tabs defaultValue="transactions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[350px] bg-secondary/50 p-1 backdrop-blur-md border border-white/5">
                    <TabsTrigger value="transactions" className="rounded-md text-xs h-8">Credit Usage</TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-md text-xs h-8">Payment History</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="mt-4">
                    <div className="border border-white/10 rounded-2xl bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
                        {loadingTransactions ? (
                            <div className="p-12 text-center text-muted-foreground animate-pulse">Loading transactions...</div>
                        ) : transactions?.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                <ArrowDownRight className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p>No credit transactions found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {transactions?.map((tx) => (
                                    <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-all duration-300 group">
                                        <div className="flex items-center gap-3.5">
                                            <div className={`p-2 rounded-lg shadow-inner border transition-all duration-300 group-hover:scale-105 ${
                                                tx.credits > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                            }`}>
                                                {tx.credits > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground/90 text-sm">{cleanDescription(tx.description || tx.type.replace('_', ' '))}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {format(new Date(tx.createdAt), 'MMM dd, yyyy • hh:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${tx.credits > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {tx.credits > 0 ? '+' : ''}{tx.credits}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Balance: <span className="text-foreground/80">{tx.balanceAfter}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="payments" className="mt-4">
                    <div className="border border-white/10 rounded-2xl bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
                        {loadingPayments ? (
                            <div className="p-12 text-center text-muted-foreground animate-pulse">Loading payments...</div>
                        ) : payments?.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                <CheckCircle2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p>No payment history found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {payments?.map((payment) => (
                                    <div key={payment.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-all duration-300 group">
                                        <div>
                                            <p className="font-semibold text-sm flex items-center gap-2 text-foreground/90">
                                                {payment.status === 'SUCCESS' && <CheckCircle2 className="h-4 w-4 text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />}
                                                {payment.status === 'FAILED' && <XCircle className="h-4 w-4 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" />}
                                                {payment.status === 'CREATED' && <Clock className="h-4 w-4 text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]" />}
                                                Purchased {payment.credits} Credits
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                Order ID: {payment.razorpayOrderId} • {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-1.5">
                                            <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                                                ₹{(payment.amount / 100).toFixed(2)}
                                            </p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded flex font-bold uppercase tracking-widest border shadow-sm ${
                                                payment.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                payment.status === 'FAILED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
        </DashboardContent>
        </Suspense>
    );
}
