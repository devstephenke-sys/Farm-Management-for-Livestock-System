'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, User, Phone, MapPin, Building, Award, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import countiesData from '@/lib/counties.json';

export default function RegisterPage() {
  const [role, setRole] = useState<'FARMER' | 'VET'>('FARMER');
  
  // Base fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Farmer specific fields
  const [farmName, setFarmName] = useState('');
  const [county, setCounty] = useState(countiesData[0]?.county_name || '');
  const [subCounty, setSubCounty] = useState('');
  const [ward, setWard] = useState('');

  // Vet specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('Cattle & Goats');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  // Find current county object
  const currentCountyObj = countiesData.find(c => c.county_name === county);
  const subCountiesList = currentCountyObj ? currentCountyObj.constituencies : [];

  // Find current subcounty object
  const currentSubCountyObj = subCountiesList.find(s => s.constituency_name === subCounty);
  const wardsList = currentSubCountyObj ? currentSubCountyObj.wards : [];

  // Sync subcounty when county changes
  useEffect(() => {
    if (currentCountyObj && subCountiesList.length > 0) {
      if (!subCountiesList.some(s => s.constituency_name === subCounty)) {
        setSubCounty(subCountiesList[0].constituency_name);
      }
    } else {
      setSubCounty('');
    }
  }, [county]);

  // Sync ward when subcounty changes
  useEffect(() => {
    if (currentSubCountyObj && wardsList.length > 0) {
      if (!wardsList.includes(ward)) {
        setWard(wardsList[0]);
      }
    } else {
      setWard('');
    }
  }, [subCounty, county]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password || !name) {
      setError('Please fill in all general profile fields');
      return;
    }

    const payload: any = { email, password, name, role, phone };

    if (role === 'FARMER') {
      if (!farmName || !county || !subCounty || !ward) {
        setError('Please fill in all farm profile fields');
        return;
      }
      payload.farmName = farmName;
      payload.county = county;
      payload.subCounty = subCounty;
      payload.ward = ward;
    } else {
      if (!licenseNumber || !qualification || !specialization || !county || !subCounty) {
        setError('Please fill in all professional vet fields');
        return;
      }
      payload.licenseNumber = licenseNumber;
      payload.qualification = qualification;
      payload.specialization = specialization;
      payload.county = county;
      payload.subCounty = subCounty;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (role === 'FARMER') {
          setSuccessMsg('Registration successful! Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setSuccessMsg('Registration submitted! Your credentials are now pending admin approval. You will receive an alert once activated.');
        }
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
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
            <h2 className="text-3xl font-black text-white tracking-tight">FMS Register</h2>
            <p className="text-xs text-accent font-bold uppercase tracking-wider mt-0.5">Start Tracking Herd History</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl border border-slate-100 rounded-3xl space-y-6">
          
          {/* Role selector */}
          <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 border border-slate-200">
            <button
              type="button"
              onClick={() => { setRole('FARMER'); setError(''); setSuccessMsg(''); }}
              className={`py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                role === 'FARMER' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              👩‍🌾 Register as Farmer
            </button>
            <button
              type="button"
              onClick={() => { setRole('VET'); setError(''); setSuccessMsg(''); }}
              className={`py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                role === 'VET' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🩺 Register as Veterinarian
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
              General Account Info
            </h4>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 focus:bg-white outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 focus:bg-white outline-none"
                    placeholder="e.g. 0712345678"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={14} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 focus:bg-white outline-none"
                    placeholder="name@farm.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={14} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 focus:bg-white outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Farmer Specific Panel */}
            {role === 'FARMER' && (
              <div className="space-y-4 pt-2">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                  Farm Profile Details
                </h4>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Farm Name</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building size={14} />
                    </div>
                    <input
                      type="text"
                      required={role === 'FARMER'}
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 focus:bg-white outline-none"
                      placeholder="e.g. highlands dairy farm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">County</label>
                    <select
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 outline-none"
                    >
                      {countiesData.map((c) => (
                        <option key={c.county_code} value={c.county_name}>
                          {c.county_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sub County</label>
                    <select
                      required={role === 'FARMER'}
                      value={subCounty}
                      onChange={(e) => setSubCounty(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 outline-none"
                    >
                      {subCountiesList.map((sc) => (
                        <option key={sc.constituency_name} value={sc.constituency_name}>
                          {sc.constituency_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ward</label>
                    <select
                      required={role === 'FARMER'}
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 outline-none"
                    >
                      {wardsList.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Veterinarian Specific Panel */}
            {role === 'VET' && (
              <div className="space-y-4 pt-2">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                  Professional Veterinarian Details
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">KVB License Number</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Award size={14} />
                      </div>
                      <input
                        type="text"
                        required={role === 'VET'}
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 focus:bg-white outline-none"
                        placeholder="e.g. KVB-2026-X"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Specialization Area</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 outline-none"
                    >
                      <option value="Cattle & Goats">Cattle & Goats</option>
                      <option value="Poultry & Pigs">Poultry & Pigs</option>
                      <option value="Large Mammals">Large Mammals</option>
                      <option value="General Diagnostics">General Diagnostics</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Highest Qualification</label>
                  <input
                    type="text"
                    required={role === 'VET'}
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 outline-none"
                    placeholder="e.g. Bachelor of Veterinary Medicine (BVM)"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">County of Service</label>
                    <select
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 outline-none"
                    >
                      {countiesData.map((c) => (
                        <option key={c.county_code} value={c.county_name}>
                          {c.county_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sub County</label>
                    <select
                      required={role === 'VET'}
                      value={subCounty}
                      onChange={(e) => setSubCounty(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm bg-slate-50 outline-none"
                    >
                      {subCountiesList.map((sc) => (
                        <option key={sc.constituency_name} value={sc.constituency_name}>
                          {sc.constituency_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating profile...</span>
                  </>
                ) : (
                  <span>Register Profile</span>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-accent hover:text-primary transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
