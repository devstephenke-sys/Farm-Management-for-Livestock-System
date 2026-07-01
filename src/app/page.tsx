'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Check, 
  ArrowRight, 
  TrendingUp, 
  HeartPulse, 
  Calendar, 
  Users, 
  FileSpreadsheet, 
  BookOpen,
  Phone,
  Smartphone,
  ShieldCheck,
  Activity,
  Play,
  Cpu,
  Layers,
  Sparkles,
  Database
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'lineage' | 'health' | 'mpesa' | 'yields'>('profiles');
  const [learningArticles, setLearningArticles] = useState<any[]>([]);
  const [telemetryTime, setTelemetryTime] = useState<string>('');
  const [mockVitals, setMockVitals] = useState({ temp: 38.6, heartRate: 72, respRate: 22 });
  const [mpesaState, setMpesaState] = useState<'idle' | 'pushing' | 'pin' | 'processing' | 'success'>('idle');
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [activeFmsLogs, setActiveFmsLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate tracker for background radial glows
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  // Fetch learning articles
  useEffect(() => {
    fetch('/api/learning')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.resources) {
          setLearningArticles(data.resources.slice(0, 3));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Update telemetry and logs
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setTelemetryTime(date.toLocaleTimeString());
      
      // Jitter health vitals slightly
      setMockVitals(prev => ({
        temp: parseFloat((38.4 + Math.random() * 0.4).toFixed(1)),
        heartRate: Math.floor(68 + Math.random() * 8),
        respRate: Math.floor(20 + Math.random() * 5)
      }));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Simulator telemetry logs
  useEffect(() => {
    const logItems = [
      '⚡ FMS Gateway Initialized on port 3000',
      '📈 Telemetry Stream Connected: [Herd-FMS-01]',
      '🔑 Auth Token generated: Session active (Role: Farmer)',
      '🥛 Yield recorded: COW-002 (Cherry) -> 12.4 Liters',
      '🩹 Medical Record updated for GOAT-004: Dewormer applied',
      '📡 RFID Tag Tagged: COW-001 Bessie scanned successfully',
      '🩺 Vet request: Doctor Jane Smith assigned to COW-003',
      '💳 M-Pesa STK push request generated for Lipa Na M-Pesa',
      '📊 Weekly summary PDF generated successfully',
      '🧬 Lineage verified: Sire BULL-009 matched with COW-001 offspring'
    ];

    const interval = setInterval(() => {
      const randLog = logItems[Math.floor(Math.random() * logItems.length)];
      const timestamp = new Date().toLocaleTimeString();
      setActiveFmsLogs(prev => [...prev.slice(-6), `[${timestamp}] ${randLog}`]);
    }, 3000);

    // Initial logs
    setActiveFmsLogs([
      `[${new Date().toLocaleTimeString()}] ⚡ FMS Gateway Initialized on port 3000`,
      `[${new Date().toLocaleTimeString()}] 📈 Telemetry Stream Connected: [Herd-FMS-01]`,
      `[${new Date().toLocaleTimeString()}] 📡 RFID Tag Tagged: COW-001 Bessie scanned`
    ]);

    return () => clearInterval(interval);
  }, []);

  // Scroll telemetry logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeFmsLogs]);

  // Simulate M-Pesa Transaction Flow
  const triggerMpesaDemo = () => {
    setMpesaState('pushing');
    setTimeout(() => {
      setMpesaState('pin');
    }, 1500);
  };

  const submitMpesaPin = () => {
    setMpesaState('processing');
    setTimeout(() => {
      const mockReceiptNum = 'MPESA' + Math.random().toString(36).substring(2, 8).toUpperCase() + 'R' + Math.floor(Math.random() * 10);
      setMpesaReceipt(mockReceiptNum);
      setMpesaState('success');
    }, 2000);
  };

  const resetMpesaDemo = () => {
    setMpesaState('idle');
    setMpesaReceipt('');
  };

  const featureTabs = [
    {
      id: 'profiles',
      title: 'Digital Profiles',
      short: 'Tag details, weights & breeds',
      icon: FileSpreadsheet,
    },
    {
      id: 'lineage',
      title: 'Pedigree & Lineage',
      short: 'Clickable parent-offspring trees',
      icon: Calendar,
    },
    {
      id: 'health',
      title: 'Clinical Diagnostics',
      short: 'Vet records & health telemetry',
      icon: HeartPulse,
    },
    {
      id: 'mpesa',
      title: 'M-Pesa Integration',
      short: 'Subscription billing & receipts',
      icon: Smartphone,
    },
    {
      id: 'yields',
      title: 'Yield Analytics',
      short: 'Dairy production charting',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-accent selection:text-slate-900">
      
      {/* Glow blobs for premium backdrops */}
      <div className="absolute top-[20%] left-[10%] w-[35rem] h-[35rem] rounded-full scale-glow-green opacity-40 pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[5%] w-[40rem] h-[40rem] rounded-full scale-glow-teal opacity-30 pointer-events-none z-0"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-float">🚜</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                FarmFMS <span className="text-[10px] bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">PRO</span>
              </span>
              <span className="text-[9px] block font-bold text-accent uppercase tracking-widest leading-none">Smart Agriculture</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            <a href="#pipeline" className="hover:text-accent transition-colors">Data Pipeline</a>
            <a href="#features" className="hover:text-accent transition-colors">Core Features</a>
            <a href="#pricing" className="hover:text-accent transition-colors">Billing & Plans</a>
            <a href="#learning" className="hover:text-accent transition-colors">Knowledge Base</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="relative group overflow-hidden bg-accent text-slate-950 text-xs font-extrabold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg shadow-accent/15 hover:shadow-accent/35"
            >
              <span className="relative z-10">Register Farm</span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative scale-grid pt-16 pb-24 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-accent text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span>Cloud-Based telemetry & Billing</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black leading-none tracking-tight text-white">
              The Data Pipeline for <span className="bg-gradient-to-r from-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent">Smart Farming</span>
            </h1>
            
            <p className="text-slate-400 text-base max-w-xl leading-relaxed">
              Ditch traditional spreadsheets. FarmFMS unites livestock Tag identification, lineage tracking, clinical diagnostics, and M-Pesa billing into a single, high-fidelity agriculture platform.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/register"
                className="bg-accent text-slate-950 font-extrabold px-8 py-4 rounded-xl text-center shadow-lg shadow-accent/10 hover:shadow-accent/25 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <span>Get Started Now</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="#pipeline"
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold px-8 py-4 rounded-xl text-center border border-slate-800 transition-all text-sm uppercase tracking-wider"
              >
                Launch Simulator Demo
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-900 text-center sm:text-left">
              <div>
                <h4 className="text-2xl font-extrabold text-white">100%</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">M-Pesa STK Integrated</p>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-white">Nakuru</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Vet Network Node</p>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-white">Dynamic</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Lineage Mapper</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Right: Interactive Terminal Dashboard */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative animate-float">
              
              {/* Header Tab Panel */}
              <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-accent animate-pulse" />
                  <span>Telemetry Stream Node: ACTIVE</span>
                </div>
              </div>

              {/* Console Logs */}
              <div className="p-5 font-mono text-xs text-slate-300 space-y-2.5 h-[230px] overflow-y-auto bg-slate-950/70">
                {activeFmsLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="text-accent shrink-0">&gt;</span>
                    <span className="break-all leading-normal text-emerald-400/90">{log}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              {/* Status footer banner */}
              <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                <span>System Health: 99.9%</span>
                <span className="text-accent font-bold">Lipa Na M-Pesa Online</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Interactive Scale.com Demo Pipeline section */}
      <section id="pipeline" className="py-24 border-b border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-accent font-bold text-xs uppercase tracking-widest bg-accent/10 border border-accent/25 px-3 py-1 rounded-full">Interactive Farm Flow</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Visualize Your Operations in Real Time
            </h2>
            <p className="text-slate-400">
              Click through the pipeline triggers below to simulate how FarmFMS gathers animal records, models pedigree structures, monitors diagnostics, and processes subscriptions.
            </p>
          </div>

          {/* Interactive Pipeline Showcase Area */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Tabs List Column (Left) */}
            <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
              {featureTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      if (tab.id !== 'mpesa') resetMpesaDemo();
                    }}
                    className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all relative ${
                      isActive 
                        ? 'bg-slate-900 border-accent/40 shadow-lg shadow-accent/5' 
                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 hover:bg-slate-900/50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-accent rounded-r"></div>
                    )}
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isActive ? 'bg-accent text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm leading-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {tab.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">
                        {tab.short}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Visual Canvas Column (Right) */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
              
              {/* Dynamic Sub-header Info */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 z-10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Telemetry Demo Node &gt; {activeTab.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">{telemetryTime}</div>
              </div>

              {/* Dynamic Visualization rendering */}
              <div className="flex-1 flex items-center justify-center relative z-10 py-6">
                
                {/* 1. DIGITAL PROFILES VISUAL */}
                {activeTab === 'profiles' && (
                  <div className="w-full max-w-sm space-y-4 animate-scale-in">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-24 h-24 scale-glow-green opacity-40 rounded-full"></div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🥛</span>
                          <div>
                            <h4 className="font-extrabold text-sm text-white">COW-001 Bessie</h4>
                            <p className="text-[9px] font-mono text-slate-500 uppercase">Friesian Breed</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                          PREGNANT
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Weight Context</span>
                          <span className="font-mono font-bold text-white mt-0.5 block">450.5 kg</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Daily Yield</span>
                          <span className="font-mono font-bold text-accent mt-0.5 block">18.5 Liters</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Vaccinated</span>
                          <span className="font-mono font-bold text-white mt-0.5 block">Yes (F&M)</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Assigned Vet</span>
                          <span className="font-mono font-bold text-white mt-0.5 block">Dr. J. Smith</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>RFID Designation</span>
                        <code className="bg-slate-900 px-2 py-0.5 rounded text-accent">fms:tag:COW-001</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PEDIGREE TREE VISUAL */}
                {activeTab === 'lineage' && (
                  <div className="w-full max-w-md animate-scale-in">
                    <svg viewBox="0 0 400 240" className="w-full h-auto text-slate-400">
                      {/* Connection Lines with glowing dashes */}
                      <path d="M100,60 L200,120" stroke="#334155" strokeWidth="2" />
                      <path d="M300,60 L200,120" stroke="#334155" strokeWidth="2" />
                      <path d="M200,120 L200,180" stroke="#334155" strokeWidth="2" />

                      <path d="M100,60 L200,120" stroke="#52b788" strokeWidth="2" className="animate-flow-dash" />
                      <path d="M300,60 L200,120" stroke="#52b788" strokeWidth="2" className="animate-flow-dash" />
                      <path d="M200,120 L200,180" stroke="#52b788" strokeWidth="2" className="animate-flow-dash" />

                      {/* Parent 1 (Sire) */}
                      <g transform="translate(100, 60)" className="cursor-pointer group">
                        <circle r="22" fill="#0f172a" stroke="#52b788" strokeWidth="2" />
                        <text y="-30" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold">Sire: BULL-009</text>
                        <text y="4" textAnchor="middle" fill="#52b788" className="text-[8px] font-mono">Angus</text>
                      </g>

                      {/* Parent 2 (Dam) */}
                      <g transform="translate(300, 60)" className="cursor-pointer group">
                        <circle r="22" fill="#0f172a" stroke="#52b788" strokeWidth="2" />
                        <text y="-30" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold">Dam: COW-004</text>
                        <text y="4" textAnchor="middle" fill="#52b788" className="text-[8px] font-mono">Friesian</text>
                      </g>

                      {/* Middle Node (Offspring) */}
                      <g transform="translate(200, 120)" className="cursor-pointer">
                        <circle r="26" fill="#1e293b" stroke="#10b981" strokeWidth="3" />
                        <text y="4" textAnchor="middle" fill="#ffffff" className="text-[9px] font-bold">COW-001 (Bessie)</text>
                      </g>

                      {/* Grand-offspring Node */}
                      <g transform="translate(200, 180)" className="cursor-pointer">
                        <circle r="20" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                        <text y="28" textAnchor="middle" fill="#94a3b8" className="text-[9px]">Offspring: HEIFER-012</text>
                        <text y="3" textAnchor="middle" fill="#94a3b8" className="text-[8px] font-mono">Calf</text>
                      </g>
                    </svg>
                  </div>
                )}

                {/* 3. CLINICAL DIAGNOSTICS VISUAL */}
                {activeTab === 'health' && (
                  <div className="w-full max-w-sm space-y-4 animate-scale-in">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Vitals Stream</span>
                        <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                          <Activity size={10} className="animate-pulse" /> Live Telemetry
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-center">
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Temperature</span>
                          <span className="text-base font-mono font-bold text-white block mt-1">{mockVitals.temp} °C</span>
                          <span className="text-[8px] text-emerald-500 font-bold block mt-0.5">NORMAL</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Heart Rate</span>
                          <span className="text-base font-mono font-bold text-white block mt-1">{mockVitals.heartRate} bpm</span>
                          <span className="text-[8px] text-emerald-500 font-bold block mt-0.5">STABLE</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Respiratory</span>
                          <span className="text-base font-mono font-bold text-white block mt-1">{mockVitals.respRate} /m</span>
                          <span className="text-[8px] text-emerald-500 font-bold block mt-0.5">STEADY</span>
                        </div>
                      </div>

                      {/* Mini Area Chart representing Heart Rhythm */}
                      <div className="h-16 bg-slate-900/40 rounded-xl border border-slate-800/80 relative overflow-hidden flex items-end">
                        <svg viewBox="0 0 300 60" className="w-full h-full" preserveAspectRatio="none">
                          <path
                            d="M0,45 Q15,10 30,45 T60,45 T90,20 T120,45 T150,45 T180,5 T210,45 T240,45 T270,30 L300,45 L300,60 L0,60 Z"
                            fill="rgba(82, 183, 136, 0.08)"
                            stroke="#52b788"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. M-PESA BILLING SIMULATION VISUAL */}
                {activeTab === 'mpesa' && (
                  <div className="w-full max-w-xs animate-scale-in">
                    <div className="bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] p-4 h-[300px] flex flex-col justify-between shadow-2xl relative">
                      
                      {/* Speaker / Camera mock */}
                      <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-4"></div>

                      <div className="flex-1 flex flex-col justify-center text-center space-y-3.5 px-3">
                        {mpesaState === 'idle' && (
                          <div className="space-y-4">
                            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-accent rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                              KES
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-white">Lipa Na M-Pesa STK</h4>
                              <p className="text-[10px] text-slate-500 mt-1">Simulate subscription payment billing</p>
                            </div>
                            <button
                              onClick={triggerMpesaDemo}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-lg"
                            >
                              Pay KES 1,500
                            </button>
                          </div>
                        )}

                        {mpesaState === 'pushing' && (
                          <div className="space-y-3">
                            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
                            <p className="text-[10px] text-slate-400 font-mono">STK PUSH SENT TO 2547***983</p>
                            <span className="text-[8px] text-slate-500 block">Check phone dialog popup</span>
                          </div>
                        )}

                        {mpesaState === 'pin' && (
                          <div className="space-y-3">
                            <h4 className="font-bold text-xs text-white">Enter M-Pesa PIN</h4>
                            <input
                              type="password"
                              value="••••"
                              readOnly
                              className="w-24 text-center bg-slate-900 border border-slate-800 rounded-lg text-white font-bold p-1 text-sm block mx-auto"
                            />
                            <button
                              onClick={submitMpesaPin}
                              className="bg-accent text-slate-950 text-[10px] font-extrabold uppercase py-2 px-6 rounded-lg block mx-auto hover:bg-[#40a373] transition-colors"
                            >
                              Confirm Payment
                            </button>
                          </div>
                        )}

                        {mpesaState === 'processing' && (
                          <div className="space-y-3">
                            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto"></div>
                            <p className="text-[10px] text-slate-400 font-mono">WAITING FOR CALLBACK...</p>
                            <span className="text-[8px] text-slate-500">Processing transactional receipt</span>
                          </div>
                        )}

                        {mpesaState === 'success' && (
                          <div className="space-y-3 animate-success-pop">
                            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">
                              ✓
                            </div>
                            <h4 className="font-bold text-xs text-white">Payment Successful</h4>
                            <p className="text-[8px] font-mono text-emerald-400">{mpesaReceipt}</p>
                            <button
                              onClick={resetMpesaDemo}
                              className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-[8px] py-1.5 px-4 rounded-lg block mx-auto transition-colors"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Home button mock */}
                      <div className="w-10 h-1 bg-slate-800 rounded-full mx-auto mt-4"></div>
                    </div>
                  </div>
                )}

                {/* 5. YIELDS ANALYTICS CHART VISUAL */}
                {activeTab === 'yields' && (
                  <div className="w-full max-w-sm space-y-4 animate-scale-in">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Monthly Milk Yield (Liters)</span>
                        <span className="text-[10px] text-accent font-bold font-mono">Goal: 600L</span>
                      </div>

                      {/* Visual Chart Bars */}
                      <div className="h-32 flex items-end gap-3.5 pt-4">
                        <div className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-t-lg h-[40%] relative group overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 bg-accent/20 h-full"></div>
                          </div>
                          <span className="text-[9px] text-slate-500">Mar</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-t-lg h-[65%] relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 bg-accent/30 h-full"></div>
                          </div>
                          <span className="text-[9px] text-slate-500">Apr</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-t-lg h-[85%] relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent/20 to-accent/50 h-full"></div>
                          </div>
                          <span className="text-[9px] text-slate-500">May</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full bg-slate-900 border border-emerald-500/30 rounded-t-lg h-[95%] relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent/40 to-emerald-400/60 h-full"></div>
                          </div>
                          <span className="text-[9px] font-bold text-accent">Jun</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Decorative Flow Indicators */}
              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-[9px] font-mono text-slate-500">
                <span>Data Flow: Scanned RFID Tag &rarr; Analytics Engine &rarr; Subscribed Active State</span>
                <span className="text-accent flex items-center gap-1"><Cpu size={10} /> Active Node</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Core Features Pain Points Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-accent font-bold text-xs uppercase tracking-widest bg-accent/10 border border-accent/25 px-3 py-1 rounded-full">Developer Built</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Tailored For Modern Agriculture
          </h2>
          <p className="text-slate-400">
            FMS replaces manual paper registries with a cloud portal optimized for mobile, veterinary coordination, and secure billing.
          </p>
        </div>

        {/* Mouse Tracking glowing cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div 
            onMouseMove={handleMouseMove}
            className="glowing-card p-8 border border-slate-900 hover:border-accent/35 transition-all duration-300 group cursor-default"
          >
            <div className="p-3 bg-accent/10 rounded-xl w-fit text-accent group-hover:bg-accent group-hover:text-slate-950 transition-all duration-300 mb-6">
              <FileSpreadsheet size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Complete Animal Profiles</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Track tag numbers, breed metadata, photos, weights, and ownership costs. Access all records from the field.
            </p>
          </div>

          <div 
            onMouseMove={handleMouseMove}
            className="glowing-card p-8 border border-slate-900 hover:border-accent/35 transition-all duration-300 group cursor-default"
          >
            <div className="p-3 bg-accent/10 rounded-xl w-fit text-accent group-hover:bg-accent group-hover:text-slate-950 transition-all duration-300 mb-6">
              <Calendar size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Active Lineage Tracker</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Model mother and father family lines. Map offspring trees automatically to optimize breeding programs.
            </p>
          </div>

          <div 
            onMouseMove={handleMouseMove}
            className="glowing-card p-8 border border-slate-900 hover:border-accent/35 transition-all duration-300 group cursor-default"
          >
            <div className="p-3 bg-accent/10 rounded-xl w-fit text-accent group-hover:bg-accent group-hover:text-slate-950 transition-all duration-300 mb-6">
              <HeartPulse size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Clinical Diagnostics Sync</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Vets submit physical check logs digitally. Diagnosis and medication doses sync automatically with lifetime animal profiles.
            </p>
          </div>

          <div 
            onMouseMove={handleMouseMove}
            className="glowing-card p-8 border border-slate-900 hover:border-accent/35 transition-all duration-300 group cursor-default"
          >
            <div className="p-3 bg-accent/10 rounded-xl w-fit text-accent group-hover:bg-accent group-hover:text-slate-950 transition-all duration-300 mb-6">
              <Users size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Veterinary Dispatcher</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Find verified county veterinarians filtered by sub-county. Request consultations and check appointments in-app.
            </p>
          </div>

          <div 
            onMouseMove={handleMouseMove}
            className="glowing-card p-8 border border-slate-900 hover:border-accent/35 transition-all duration-300 group cursor-default"
          >
            <div className="p-3 bg-accent/10 rounded-xl w-fit text-accent group-hover:bg-accent group-hover:text-slate-950 transition-all duration-300 mb-6">
              <TrendingUp size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Yield Telemetry Charts</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Record milk yields for dairy cattle or egg counts for poultry. Visualize performance trends with responsive area charts.
            </p>
          </div>

          <div 
            onMouseMove={handleMouseMove}
            className="glowing-card p-8 border border-slate-900 hover:border-accent/35 transition-all duration-300 group cursor-default"
          >
            <div className="p-3 bg-accent/10 rounded-xl w-fit text-accent group-hover:bg-accent group-hover:text-slate-950 transition-all duration-300 mb-6">
              <BookOpen size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Free Learning Center</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Access embedded guides on goats, cattle, pigs, and poultry diseases without requiring any subscription.
            </p>
          </div>

        </div>
      </section>

      {/* Pain Point Comparison Grid */}
      <section className="py-20 bg-slate-950 border-t border-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-accent font-bold text-xs uppercase tracking-widest bg-accent/10 border border-accent/25 px-3 py-1 rounded-full">Legacy vs FMS</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Stop Guessing, Start Measuring
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Relying on paper logs leads to missed veterinary visits, lost lineage records, and zero yield insights. FarmFMS unites everything into a single, real-time platform.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">Organized Mating Registry</h5>
                  <p className="text-slate-400 text-xs mt-0.5">Track AI timings and pregnancies precisely to prevent inbreeding.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">Unified Health Ledger</h5>
                  <p className="text-slate-400 text-xs mt-0.5">Vets record diagnostic vitals on-site, instantly syncing to animal history.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h4 className="font-black text-lg border-b border-slate-800 pb-4 text-white">How FMS Solves Your Challenges</h4>
            
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-800/40">
                <span className="text-rose-400 font-bold">❌ Lost Paper Notebooks</span>
                <span className="text-emerald-400 font-bold">✔️ Lifetime Cloud Records</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-800/40">
                <span className="text-rose-400 font-bold">❌ Inbreeding Errors</span>
                <span className="text-emerald-400 font-bold">✔️ Auto-mapped Family Trees</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-800/40">
                <span className="text-rose-400 font-bold">❌ Isolated Field Vet Diagnosis</span>
                <span className="text-emerald-400 font-bold">✔️ Live Diagnostic Auto-Sync</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2">
                <span className="text-rose-400 font-bold">❌ Unclear Expenses</span>
                <span className="text-emerald-400 font-bold">✔️ Printable PDF Cost Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Plans */}
      <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-900 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-accent font-bold text-xs uppercase tracking-widest bg-accent/10 border border-accent/25 px-3 py-1 rounded-full">Secure Subscription Billing</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Select Your Farm Tier
            </h2>
            <p className="text-slate-400">
              Pay securely via Safaricom M-Pesa STK Push. Plans unlock vet directories, lineage matching, and data reporting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            
            {/* Basic Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between relative">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Basic</h4>
                <p className="text-slate-500 text-xs">For small scale farm starters</p>
                
                <div className="py-2 border-y border-slate-800 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">KES 500</span>
                  <span className="text-slate-500 text-xs">/ month</span>
                </div>
                
                <div className="inline-block bg-slate-850 border border-slate-800 text-slate-400 font-bold text-[9px] px-2 py-0.5 rounded uppercase leading-none">
                  Tested at KES 1
                </div>

                <ul className="space-y-3.5 text-xs text-slate-400 pt-4">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Up to 20 animals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Basic PDF reports</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <Check size={14} className="stroke-[2]" />
                    <span>No Veterinary Booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Public Learning Center</span>
                  </li>
                </ul>
              </div>
              
              <Link
                href="/register"
                className="mt-8 block text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sign Up Basic
              </Link>
            </div>

            {/* Standard Plan */}
            <div className="bg-slate-900 border-2 border-accent rounded-3xl p-8 flex flex-col justify-between relative shadow-xl shadow-accent/5 transform lg:-translate-y-2">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-accent text-slate-950 font-extrabold text-[9px] px-3.5 py-1 rounded-full uppercase tracking-wider">
                POPULAR
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Standard</h4>
                <p className="text-slate-500 text-xs">For growing commercial farms</p>
                
                <div className="py-2 border-y border-slate-800 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-accent">KES 1,500</span>
                  <span className="text-slate-500 text-xs">/ month</span>
                </div>

                <div className="inline-block bg-accent/10 border border-accent/25 text-accent font-bold text-[9px] px-2 py-0.5 rounded uppercase leading-none">
                  Tested at KES 2
                </div>

                <ul className="space-y-3.5 text-xs text-slate-300 pt-4">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Up to 100 animals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Advanced analytics & reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Full Veterinary Booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Public Learning Center</span>
                  </li>
                </ul>
              </div>
              
              <Link
                href="/register"
                className="mt-8 block text-center bg-accent hover:bg-[#40a373] text-slate-950 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sign Up Standard
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between relative">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Premium</h4>
                <p className="text-slate-500 text-xs">For large scale estates</p>
                
                <div className="py-2 border-y border-slate-800 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">KES 3,500</span>
                  <span className="text-slate-500 text-xs">/ month</span>
                </div>

                <div className="inline-block bg-slate-850 border border-slate-800 text-slate-400 font-bold text-[9px] px-2 py-0.5 rounded uppercase leading-none">
                  Tested at KES 3
                </div>

                <ul className="space-y-3.5 text-xs text-slate-400 pt-4">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Unlimited animals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Professional custom exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Priority vet dispatch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent stroke-[3]" />
                    <span>Full features unlocked</span>
                  </li>
                </ul>
              </div>
              
              <Link
                href="/register"
                className="mt-8 block text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sign Up Premium
              </Link>
            </div>

          </div>

          {/* M-Pesa badge footer */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 bg-slate-900/60 border border-slate-800 max-w-xl mx-auto p-4 rounded-2xl text-xs text-slate-400">
            <Smartphone className="text-accent animate-pulse" size={18} />
            <span className="text-center sm:text-left">
              Payments are processed instantly via Safaricom M-Pesa STK Push.
            </span>
            <span className="font-bold text-accent border-l border-slate-800 pl-3">LIPA NA M-PESA</span>
          </div>
        </div>
      </section>

      {/* Free Learning Center Preview Section */}
      <section id="learning" className="py-20 max-w-7xl mx-auto px-6 w-full border-t border-slate-900">
        <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between border-b border-slate-900 pb-6 mb-12">
          <div>
            <span className="text-accent font-bold text-xs uppercase tracking-widest">Free Knowledge Sharing</span>
            <h2 className="text-2xl md:text-4xl font-black text-white mt-2">Agricultural Learning Center</h2>
          </div>
          <Link 
            href="/learning" 
            className="text-accent hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 mt-3 sm:mt-0 transition-colors"
          >
            <span>Browse All Guides</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {learningArticles.length > 0 ? (
            learningArticles.map((article: any) => (
              <div key={article.id} className="bg-slate-900/40 rounded-3xl p-6 border border-slate-900 hover:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h4 className="font-bold text-white text-base mt-3 leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {article.contentBody}
                  </p>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Article resource</span>
                  <Link 
                    href="/learning" 
                    className="text-accent hover:text-white font-bold"
                  >
                    Read Guide
                  </Link>
                </div>
              </div>
            ))
          ) : (
            // Static Placeholder Fallbacks
            <>
              <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-900 hover:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">CATTLE</span>
                  <h4 className="font-bold text-white text-base mt-3 leading-snug">Feed Management for Dairy Cattle</h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    Feeding dairy cattle properly is essential for maximizing milk yields. Learn dry matter calculations, silage storage formulas, and dairy meal ratios...
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-900/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium font-mono text-[10px]">Article Resource</span>
                  <Link href="/learning" className="text-accent hover:text-white font-bold uppercase tracking-wider text-[10px]">Read Guide</Link>
                </div>
              </div>
              <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-900 hover:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">GOAT</span>
                  <h4 className="font-bold text-white text-base mt-3 leading-snug">Common Goat Diseases & Vaccination Schedules</h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    Goats are highly susceptible to CCPP and PPR diseases. Explore annual vaccine recommendations and tick control guidelines...
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-900/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium font-mono text-[10px]">Article Resource</span>
                  <Link href="/learning" className="text-accent hover:text-white font-bold uppercase tracking-wider text-[10px]">Read Guide</Link>
                </div>
              </div>
              <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-900 hover:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">PIG</span>
                  <h4 className="font-bold text-white text-base mt-3 leading-snug">Building a Modern Pig Housing Unit</h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    Review layout and spacing specifications for boars, gestating sows, and weaners to ensure dry, sanitary pens...
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-900/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium font-mono text-[10px]">Article Resource</span>
                  <Link href="/learning" className="text-accent hover:text-white font-bold uppercase tracking-wider text-[10px]">Read Guide</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <span className="text-2xl">🚜</span>
              <span className="font-bold text-lg tracking-tight">FarmFMS</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-550">
              Modern digital software helping Kenyan farmers maximize livestock productivity and access reliable animal diagnostics.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4">Modules</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-white">Farmer Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-white">Veterinarian Board</Link></li>
              <li><Link href="/login" className="hover:text-white">Administrator Panel</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4">Plans</h5>
            <ul className="space-y-2 text-xs">
              <li>Basic Plan (Up to 20 Animals)</li>
              <li>Standard Plan (Up to 100 Animals + Vet)</li>
              <li>Premium Plan (Unlimited Animals + Priority)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm mb-4">Contact Info</h5>
            <div className="space-y-2.5 text-xs">
              <p className="flex items-center gap-1.5"><Phone size={12} /> +254 (0) 700 000 000</p>
              <p className="flex items-center gap-1.5"><Smartphone size={12} /> Paybill: 174379</p>
              <p className="flex items-center gap-1.5"><ShieldCheck size={12} /> Sandbox Environment</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} FarmFMS Systems. Built for Kenyan Farmers.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
