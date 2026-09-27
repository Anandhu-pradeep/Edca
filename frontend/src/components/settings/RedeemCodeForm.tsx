"use client";

import { useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Loader2, Ticket, CheckCircle2, ClipboardPaste } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';

export default function RedeemCodeForm() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const queryClient = useQueryClient();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/\s/g, '').replace(/[^A-Z0-9]/g, '');
    if (val.length > 16) {
      val = val.slice(0, 16);
    }
    setCode(val);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      let val = text.toUpperCase().replace(/\s/g, '').replace(/[^A-Z0-9]/g, '');
      if (val.length > 16) {
        val = val.slice(0, 16);
      }
      setCode(val);
      setSuccessMsg('Code pasted');
      setTimeout(() => setSuccessMsg(''), 2000);
      setErrorMsg('');
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 16) {
      setErrorMsg('Code must be exactly 16 characters.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await axiosInstance.post('/redeem-codes/redeem', { code });
      const { creditsAdded } = response.data;
      setSuccessMsg(`${creditsAdded} credits added successfully!`);
      setCode('');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Invalid or unavailable redeem code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-4 border-t border-border/30 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-medium mb-1">Redeem Code</h3>
          <p className="text-xs text-muted-foreground">Have a credit code? Enter it below to add credits to your EDCA account.</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-full text-green-500 shrink-0">
          <Ticket className="w-6 h-6" />
        </div>
      </div>

      <form onSubmit={handleRedeem} className="space-y-4">
        <div className="flex items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 16-character code"
              className="pr-10 font-mono tracking-widest text-center"
              maxLength={16}
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading || code.length !== 16} size="sm">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Redeeming...' : 'Redeem Code'}
          </Button>
          {code.length > 0 && code.length < 16 && (
            <span className="text-xs text-muted-foreground">{code.length}/16 characters</span>
          )}
        </div>
      </form>

      {successMsg && (
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 text-green-500 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
