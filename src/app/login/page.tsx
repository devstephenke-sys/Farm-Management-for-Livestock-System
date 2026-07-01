'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Mail, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(data.user);
        
        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (data.user.role === 'VET') {
          router.push('/vet');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole: 'ADMIN' | 'FARMER' | 'VET') => {
    setError('');
    if (demoRole === 'ADMIN') {
      setEmail('admin@farm.com');
      setPassword('admin123');
    } else if (demoRole === 'FARMER') {
      setEmail('farmer@farm.com');
      setPassword('farmer123');
    } else if (demoRole === 'VET') {
      setEmail('vet@farm.com');
      setPassword('vet123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-900 via-primary-hover to-slate-900">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-light mb-6 transition-colors mx-auto w-fit">
          <ArrowLeft size={14} /> Back to Landing Page
        </Link>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl bg-white/10 p-2.5 rounded-2xl border border-white/10 shadow-lg">🚜</span>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">FMS Portal</h2>
            <p className="text-xs text-accent font-bold uppercase tracking-wider mt-0.5">Farmbrite Experience</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl border border-slate-100 rounded-3xl space-y-6">
          
          <h3 className="font-extrabold text-slate-800 text-lg text-center">Sign in to your account</h3>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  placeholder="name@farm.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Login Area */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="text-center">
              <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 font-bold uppercase px-2.5 py-0.5 rounded-full">
                Quick Demo Accounts (Single Click)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleQuickLogin('FARMER')}
                className="py-2.5 px-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-[10px] font-bold rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                👩‍🌾 Farmer
              </button>
              <button
                onClick={() => handleQuickLogin('VET')}
                className="py-2.5 px-1 bg-slate-50 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 border border-slate-200 text-[10px] font-bold rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                🩺 Vet Jane
              </button>
              <button
                onClick={() => handleQuickLogin('ADMIN')}
                className="py-2.5 px-1 bg-slate-50 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200 border border-slate-200 text-[10px] font-bold rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                🔑 Admin
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have a farm registered?{' '}
              <Link href="/register" className="font-bold text-accent hover:text-primary transition-colors">
                Register here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
