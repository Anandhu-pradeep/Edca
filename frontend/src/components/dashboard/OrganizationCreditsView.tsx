import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { CreditCard, History, Plus, Target, CheckCircle2 } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

export function OrganizationCreditsView() {
  const { activeOrganization } = useAuthStore();
  const [purchaseAmount, setPurchaseAmount] = useState(100);

  const { data: credits, refetch } = useQuery({
    queryKey: ['orgCredits', activeOrganization?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/organizations/${activeOrganization?.id}/credits`);
      return res.data;
    },
    enabled: !!activeOrganization?.id,
  });

  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePurchase = async () => {
    if (!activeOrganization) return;
    
    try {
      setIsProcessing(true);
      toast.loading("Creating secure payment...", { id: "org-payment" });

      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Failed to load Razorpay SDK", { id: "org-payment" });
        setIsProcessing(false);
        return;
      }

      // Create order
      const orderRes = await axiosInstance.post(
        `/organizations/${activeOrganization.id}/credits/purchase/create-order`,
        { credits: purchaseAmount }
      );
      
      const order = orderRes.data.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TQLP0lXvBOqpEf',
        amount: order.amount,
        currency: order.currency,
        name: "EDCA AI Platform",
        description: `Purchase ${purchaseAmount} Credits for Organization`,
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...", { id: "org-payment" });

            await axiosInstance.post(
              `/organizations/${activeOrganization.id}/credits/purchase/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }
            );

            refetch();
            toast.success(`Payment Successful! +${purchaseAmount} Credits added to Organization`, { id: "org-payment" });
          } catch (err: any) {
            console.error(err);
            toast.error("Payment Verification Failed", { id: "org-payment" });
          }
        },
        theme: {
          color: "#0f172a",
        },
        modal: {
          ondismiss: function() {
            toast.error("Payment Cancelled", { id: "org-payment" });
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`, { id: "org-payment" });
      });
      
      paymentObject.open();

    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to initiate payment", { id: "org-payment" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!credits) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading credits...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 liquid-glass">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{credits.balance}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 liquid-glass">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reserved Credits</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{credits.reservedBalance}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transaction History */}
        <div className="lg:col-span-2 p-6 liquid-glass">
          <h3 className="text-lg font-bold text-foreground mb-4">Transaction History</h3>
          <div className="space-y-3">
            {credits.recentTransactions?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
            ) : (
              credits.recentTransactions?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 liquid-glass-subtle rounded-lg border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-500">+{tx.amount} CR</span>
                    <p className="text-[10px] text-muted-foreground uppercase">{tx.transactionType}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Purchase Credits */}
        <div className="p-6 liquid-glass flex flex-col h-fit">
          <h3 className="text-lg font-bold text-foreground mb-2">Purchase Credits</h3>
          <p className="text-sm text-muted-foreground mb-6">Top up your organization balance to schedule more interviews.</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Amount to Purchase
              </label>
              <div className="flex gap-2">
                {[10, 50, 100, 500].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setPurchaseAmount(amt)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${purchaseAmount === amt ? 'bg-purple-500 text-white shadow-md' : 'liquid-glass-subtle text-foreground hover:bg-secondary/50'}`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 liquid-glass-subtle rounded-lg border border-border/40 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cost per credit</span>
                <span className="font-semibold">₹0.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-semibold">{purchaseAmount}</span>
              </div>
              <div className="h-px bg-border/50 my-2"></div>
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">₹{(purchaseAmount * 0.5).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              {isProcessing ? "Processing..." : "Purchase Now"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
