'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface MpesaSimulatorProps {
  checkoutRequestId: string;
  planName: string;
  amount: number;
  onSuccess: () => void;
  onFailure: (message: string) => void;
  onClose: () => void;
}

export default function MpesaSimulator({
  checkoutRequestId,
  planName,
  amount,
  onSuccess,
  onFailure,
  onClose,
}: MpesaSimulatorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'SUCCESS' | 'FAILED' | null>(null);
  const [log, setLog] = useState<string>('');

  const runSimulation = async (simulateSuccess: boolean) => {
    setLoading(true);
    setLog(`Firing simulated callback request to API endpoint...\n`);
    try {
      const res = await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutRequestId,
          success: simulateSuccess,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setLog((prev) => prev + `Callback processed successfully by database. Status: SUCCESS.\n`);
        setResult(simulateSuccess ? 'SUCCESS' : 'FAILED');
        
        setTimeout(() => {
          if (simulateSuccess) {
            onSuccess();
          } else {
            onFailure(data.callbackResponse?.message || 'Payment cancelled by user.');
          }
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to simulate callback');
      }
    } catch (error: any) {
      console.error('Simulation error:', error);
      setLog((prev) => prev + `Error running simulation: ${error.message}\n`);
      alert(`Simulation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Header banner */}
        <div className="bg-primary text-white p-6 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <CreditCard className="text-accent" size={28} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg">{BRAND.name} M-Pesa Sandbox</h3>
            <p className="text-xs text-accent-light/85">Testing {BRAND.mpesaAccountRef(planName)} callback</p>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-2 leading-relaxed">
            <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
              💡 Why is this simulator showing?
            </h5>
            <p>
              You are testing on <strong>localhost</strong>. Safaricom's sandbox API servers cannot send the asynchronous payment callback payload to your local machine (<code>http://localhost:3000</code>) unless you run an HTTP tunnel like Ngrok.
            </p>
            <p className="font-medium">
              Use the controls below to trigger the exact callback webhook payload Safaricom would send, allowing you to test the complete database update flow!
            </p>
          </div>

          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Plan Option:</span>
              <strong className="text-primary font-bold">{planName} Plan</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Charged:</span>
              <strong className="text-slate-800 font-bold">KES {amount}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Checkout Request ID:</span>
              <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 select-all max-w-[180px] truncate block">
                {checkoutRequestId}
              </code>
            </div>
          </div>

          {log && (
            <div className="bg-black text-emerald-400 p-3 rounded-xl font-mono text-[10px] h-24 overflow-y-auto whitespace-pre-wrap leading-tight border border-slate-800">
              {log}
            </div>
          )}

          {result === 'SUCCESS' && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded-xl justify-center font-bold text-sm">
              <CheckCircle2 size={18} />
              <span>Simulated Payment Approved! Updating...</span>
            </div>
          )}

          {result === 'FAILED' && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl justify-center font-bold text-sm">
              <XCircle size={18} />
              <span>Simulated Payment Cancelled! Closes soon...</span>
            </div>
          )}

          {!result && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={loading}
                onClick={() => runSimulation(true)}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>Simulate Success</span>
              </button>
              <button
                disabled={loading}
                onClick={() => runSimulation(false)}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                <span>Simulate Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel & Close
          </button>
        </div>
      </div>
    </div>
  );
}
