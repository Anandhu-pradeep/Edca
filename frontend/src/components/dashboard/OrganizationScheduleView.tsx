'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Calendar, Target, Plus, CheckCircle2, AlertCircle, Video, Users, Sparkles, CreditCard } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function OrganizationScheduleView() {
  const { activeOrganization } = useAuthStore();
  const isOrgAdmin = activeOrganization?.role === 'OWNER' || activeOrganization?.role === 'ADMIN';

  const [selectedClassId, setSelectedClassId] = useState('');
  const [scheduleRole, setScheduleRole] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(100);

  // Fetch organization credits
  const { data: credits, refetch: refetchCredits, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['orgCredits', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return null;
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/credits`);
      return res.data;
    },
    enabled: !!activeOrganization?.id,
  });

  // Fetch classes
  const { data: classes = [], refetch: refetchClasses } = useQuery({
    queryKey: ['orgClasses', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return [];
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/classes`);
      return res.data;
    },
    enabled: !!activeOrganization?.id,
  });

  const selectedClass = classes.find((c: any) => c.id === selectedClassId);
  const studentCount = selectedClass?.studentCount || 0;
  const creditsRequired = studentCount * 5;
  const currentBalance = credits?.balance ?? 0;
  const hasEnoughCredits = currentBalance >= creditsRequired;

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

  const handleQuickPurchase = async () => {
    if (!activeOrganization) return;
    try {
      setIsBuyingCredits(true);
      toast.loading("Creating recharge order...", { id: "schedule-payment" });

      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Failed to load Razorpay SDK", { id: "schedule-payment" });
        setIsBuyingCredits(false);
        return;
      }

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
        description: `Recharge ${purchaseAmount} Credits for Organization`,
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying transaction...", { id: "schedule-payment" });
            await axiosInstance.post(
              `/organizations/${activeOrganization.id}/credits/purchase/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }
            );
            refetchCredits();
            toast.success(`Success! +${purchaseAmount} Credits added to wallet.`, { id: "schedule-payment" });
          } catch (err: any) {
            toast.error("Payment Verification Failed", { id: "schedule-payment" });
          } finally {
            setIsBuyingCredits(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsBuyingCredits(false);
            toast.error("Recharge cancelled", { id: "schedule-payment" });
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setIsBuyingCredits(false);
      toast.error(err.response?.data?.message || "Failed to initialize credit purchase", { id: "schedule-payment" });
    }
  };

  const handleScheduleInterviews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !scheduleRole.trim() || !activeOrganization) {
      toast.error("Please choose a class and specify the target role.");
      return;
    }

    if (studentCount === 0) {
      toast.error("This class has 0 enrolled students. Assign students to the class first.");
      return;
    }

    if (!hasEnoughCredits) {
      toast.error(`Insufficient credit balance. You need ${creditsRequired} credits, but currently have ${currentBalance}.`);
      return;
    }

    setIsScheduling(true);
    try {
      await axiosInstance.post(
        `/organizations/${activeOrganization.id}/interviews/schedule/class/${selectedClassId}`,
        { 
          role: scheduleRole.trim(),
          scheduledAt: scheduledDate ? new Date(scheduledDate).toISOString() : null
        }
      );
      toast.success(`AI Interview "${scheduleRole}" scheduled for all ${studentCount} students!`);
      setScheduleRole('');
      setSelectedClassId('');
      setScheduledDate('');
      refetchCredits();
      refetchClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule interviews. Check credit balance.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Schedule AI Interviews</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Assign role-specific AI mock interviews to entire classes simultaneously using organization credits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credits Card */}
        <div className="p-6 bg-card border border-border/40 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Organization Wallet
              </span>
              <span className="p-2 bg-primary/10 text-primary rounded-lg">
                <Target className="w-5 h-5" />
              </span>
            </div>

            <h3 className="text-3xl font-extrabold text-foreground">
              {isLoadingCredits ? '...' : (credits?.balance ?? 0)}
              <span className="text-sm font-medium text-muted-foreground ml-1.5">Credits</span>
            </h3>

            <div className="mt-4 p-3 bg-secondary/30 rounded-lg space-y-1.5 text-xs text-muted-foreground border border-border/30">
              <div className="flex justify-between items-center">
                <span>Cost per Student</span>
                <span className="font-semibold text-foreground">5 Credits</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Interview Format</span>
                <span className="font-semibold text-foreground">AI Video & Audio</span>
              </div>
            </div>
          </div>

          {isOrgAdmin && (
            <div className="mt-6 pt-4 border-t border-border/30 space-y-3">
              <div className="flex items-center gap-2">
                <select
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none"
                >
                  <option value={50}>50 Credits (₹250)</option>
                  <option value={100}>100 Credits (₹450)</option>
                  <option value={250}>250 Credits (₹1,000)</option>
                  <option value={500}>500 Credits (₹1,900)</option>
                </select>
                <Button
                  onClick={handleQuickPurchase}
                  disabled={isBuyingCredits}
                  size="sm"
                  className="bg-primary text-primary-foreground text-xs font-bold gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isBuyingCredits ? 'Processing...' : 'Recharge'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Schedule & Assign Form */}
        <div className="lg:col-span-2 p-6 bg-card border border-border/40 rounded-xl shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Assign Interview to Class</h3>
              <p className="text-xs text-muted-foreground">Select a cohort and configure their target job role</p>
            </div>
          </div>

          <form onSubmit={handleScheduleInterviews} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="classSelection" className="text-xs font-semibold">
                Target Class Cohort
              </Label>
              <select
                id="classSelection"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">-- Select a Class --</option>
                {classes.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount || 0} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="targetRoleInput" className="text-xs font-semibold">
                Target Job Role
              </Label>
              <Input
                id="targetRoleInput"
                placeholder="e.g. Junior Full-Stack Developer, Data Analyst, Product Engineer"
                value={scheduleRole}
                onChange={(e) => setScheduleRole(e.target.value)}
                className="text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="scheduledAtInput" className="text-xs font-semibold">
                  Scheduled Session Date & Time (Optional)
                </Label>
                <span className="text-[11px] text-muted-foreground">Default: immediate / flexible</span>
              </div>
              <Input
                id="scheduledAtInput"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="text-sm cursor-pointer"
              />
            </div>

            {selectedClassId && (
              <div className="p-4 bg-secondary/20 rounded-xl border border-border/30 space-y-2 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Selected Class:</span>
                  <span className="font-semibold text-foreground">{selectedClass?.name}</span>
                </div>
                {scheduledDate && (
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Scheduled Session:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(scheduledDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Students Enrolled:</span>
                  <span className="font-semibold text-foreground">{studentCount} Students</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/30">
                  <span className="font-medium text-foreground">Required Credits:</span>
                  <span className="font-bold text-sm text-primary">{creditsRequired} Credits</span>
                </div>

                {!hasEnoughCredits && (
                  <div className="flex items-center gap-2 mt-2 p-2.5 bg-red-500/10 text-red-500 rounded-lg font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Insufficient balance ({currentBalance} available). Please recharge above.</span>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isScheduling || !selectedClassId || !scheduleRole.trim() || !hasEnoughCredits || studentCount === 0}
              className="w-full py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isScheduling ? 'Scheduling...' : `Assign AI Interview to Class (${creditsRequired} Credits)`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
