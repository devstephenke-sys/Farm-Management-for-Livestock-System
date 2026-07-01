'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';

export default function LandingPage() {
  const [learningArticles, setLearningArticles] = useState<any[]>([]);

  useEffect(() => {
    // Fetch public learning center articles
    fetch('/api/learning')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.resources) {
          setLearningArticles(data.resources.slice(0, 3));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const features = [
    {
      title: 'Complete Livestock Profiles',
      desc: 'Track tags, QR code designations, breed details, photos, weights, and ownership costs effortlessly.',
      icon: FileSpreadsheet,
    },
    {
      title: 'Active Lineage Tracking',
      desc: 'Model mother/father relationships and map offspring lineages automatically. Solve poor breeding logs.',
      icon: Calendar,
    },
    {
      title: 'Clinical Vet Assessments',
      desc: 'Vets submit digital examination records. Diagnostic results auto-sync into animal lifetime medical files.',
      icon: HeartPulse,
    },
    {
      title: 'Veterinary Booking',
      desc: 'Find certified veterinarians in Nakuru or your county, filtered by specialization. Request visits digitally.',
      icon: Users,
    },
    {
      title: 'Production Recording',
      desc: 'Record milk yields for dairy cattle or egg counts for layers. Analyze trends via responsive charting.',
      icon: TrendingUp,
    },
    {
      title: 'Free Learning Center',
      desc: 'Access embedded YouTube guides and vet articles on cattle, goats, poultry, and pigs without logging in.',
      icon: BookOpen,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚜</span>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-primary">FarmFMS</span>
              <span className="text-[10px] block font-bold text-accent uppercase tracking-wider leading-none">Smart Agriculture</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#learning" className="hover:text-primary transition-colors">Learning Resources</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-bold text-primary hover:text-primary-light transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-primary hover:bg-primary-hover text-white text-sm font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/10 transition-all cursor-pointer"
            >
              Register Farm
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:py-32 bg-gradient-to-br from-primary via-[#1c3a27] to-[#12241b] text-white">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/25 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
              <span>🚀</span> Cloud-Based Farm Management
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              A Smarter Way to Manage Your <span className="text-accent">Herd & Operations</span>
            </h2>
            
            <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
              Ditch the manual spreadsheets. FMS empowers Kenyan farmers to track animal history, book veterinarians, record yields, print PDF reports, and settle bills via M-Pesa STK Push.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/register"
                className="bg-accent hover:bg-[#40a373] text-primary hover:text-white font-extrabold px-8 py-4 rounded-2xl text-center shadow-xl shadow-accent/15 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="bg-white/10 hover:bg-white/15 text-white font-bold px-8 py-4 rounded-2xl text-center border border-white/10 transition-all"
              >
                Learn More
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 text-center sm:text-left">
              <div>
                <h4 className="text-3xl font-black text-accent">100%</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">M-Pesa Integrated</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-accent">Nakuru</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Local Vet Network</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-accent">PDF</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Professional Reports</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 relative flex justify-center">
            {/* Simulated Teaser Widget */}
            <div className="glass-card text-slate-800 rounded-3xl w-full max-w-md p-6 border border-white/10 shadow-2xl relative animate-in fade-in-50 slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥛</span>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-800">Cow Bessie (COW-001)</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Friesian Breed</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PREGNANT
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Weight Context:</span>
                  <span className="font-bold text-slate-800">450.5 kg</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Daily Milk Yield:</span>
                  <span className="font-extrabold text-primary">18.5 Liters</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Last Vaccination:</span>
                  <span className="font-bold text-slate-800">Foot and Mouth (Passed)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Assigned Vet:</span>
                  <span className="font-bold text-slate-800">Dr. Jane Smith</span>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">FMS QR Designation</span>
                <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 select-all">
                  fms-animal-tag:COW-001
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Solutions Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h3 className="text-accent font-extrabold text-xs uppercase tracking-widest">Built For Local Farmers</h3>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            Designed to Solve Real-World Challenges
          </h2>
          <p className="text-slate-500">
            FMS replaces paper notebook logs with a single secure portal built for mobile responsiveness and team collaboration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="bg-white rounded-3xl p-8 border border-slate-100 hover:border-accent/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="p-4 bg-emerald-50 rounded-2xl w-fit text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200 mb-6">
                  <Icon size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pain Point Comparison Grid */}
      <section id="solutions" className="py-20 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-accent font-extrabold text-xs uppercase tracking-widest">FMS vs Traditional Farming</h3>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Stop Guessing, Start Measuring
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Relying on memory or paper sheets leads to missed vaccinations, poor parent lineage selection, incorrect breeding checks, and lost revenues. FMS aggregates everything.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <div>
                  <h5 className="font-bold text-sm">Organized Mating Registry</h5>
                  <p className="text-slate-400 text-xs mt-0.5">Track AI timing and pregnancies accurately to prevent lineage conflicts.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <div>
                  <h5 className="font-bold text-sm">Integrated Clinical Records</h5>
                  <p className="text-slate-400 text-xs mt-0.5">Vets log vitals directly on the field. Details update in animal profile instantaneously.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700/50 space-y-6">
            <h4 className="font-black text-lg border-b border-slate-700 pb-4">How FMS Solves Your Challenges</h4>
            
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-700/35">
                <span className="text-rose-400 font-bold">❌ Paper Notes</span>
                <span className="text-emerald-400 font-bold">✔️ Lifetime Cloud Records</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-700/35">
                <span className="text-rose-400 font-bold">❌ Lost Pedigree Data</span>
                <span className="text-emerald-400 font-bold">✔️ Clickable Family Tree Trees</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-700/35">
                <span className="text-rose-400 font-bold">❌ Manual Vet Reporting</span>
                <span className="text-emerald-400 font-bold">✔️ Automated Health Sync</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2">
                <span className="text-rose-400 font-bold">❌ Hard-to-Calculate Costs</span>
                <span className="text-emerald-400 font-bold">✔️ One-Click Printable Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Plans */}
      <section id="pricing" className="py-24 bg-slate-50 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h3 className="text-accent font-extrabold text-xs uppercase tracking-widest">Flexible Subscription Plans</h3>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            Select Your Farm Tier
          </h2>
          <p className="text-slate-500">
            Pay safely and securely via M-Pesa STK Push. Standard and Premium tiers unlock veterinary search directories.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          
          {/* Basic Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 flex flex-col justify-between shadow-sm relative">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-800">Basic</h4>
              <p className="text-slate-400 text-xs">For small scale farm starters</p>
              
              <div className="py-2 border-y border-slate-100 flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">KES 500</span>
                <span className="text-slate-400 text-xs">/ month</span>
              </div>
              
              <div className="inline-block bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded uppercase leading-none">
                Tested at KES 1
              </div>

              <ul className="space-y-3.5 text-xs text-slate-500 pt-4">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent stroke-[3]" />
                  <span>Up to 20 animals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent stroke-[3]" />
                  <span>Basic reports</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
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
              className="mt-8 block text-center bg-slate-100 hover:bg-slate-200 text-primary font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Sign Up Basic
            </Link>
          </div>

          {/* Standard Plan */}
          <div className="bg-white rounded-3xl p-8 border-2 border-accent flex flex-col justify-between shadow-xl relative transform md:-translate-y-2">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-accent text-white font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider border-2 border-white">
              POPULAR
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-800">Standard</h4>
              <p className="text-slate-400 text-xs">For growing commercial farms</p>
              
              <div className="py-2 border-y border-slate-100 flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">KES 1,500</span>
                <span className="text-slate-400 text-xs">/ month</span>
              </div>

              <div className="inline-block bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded uppercase leading-none">
                Tested at KES 2
              </div>

              <ul className="space-y-3.5 text-xs text-slate-500 pt-4">
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
              className="mt-8 block text-center bg-primary hover:bg-primary-hover text-white font-extrabold py-3.5 rounded-xl text-sm transition-colors shadow-lg cursor-pointer"
            >
              Sign Up Standard
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 flex flex-col justify-between shadow-sm relative">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-800">Premium</h4>
              <p className="text-slate-400 text-xs">For large scale ranching estates</p>
              
              <div className="py-2 border-y border-slate-100 flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">KES 3,500</span>
                <span className="text-slate-400 text-xs">/ month</span>
              </div>

              <div className="inline-block bg-amber-50 text-amber-700 font-bold text-[10px] px-2 py-0.5 rounded uppercase leading-none">
                Tested at KES 3
              </div>

              <ul className="space-y-3.5 text-xs text-slate-500 pt-4">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent stroke-[3]" />
                  <span>Unlimited animals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent stroke-[3]" />
                  <span>Professional customizable exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent stroke-[3]" />
                  <span>Priority veterinarian dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent stroke-[3]" />
                  <span>Full system features unlocked</span>
                </li>
              </ul>
            </div>
            
            <Link
              href="/register"
              className="mt-8 block text-center bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Sign Up Premium
            </Link>
          </div>

        </div>

        {/* M-Pesa badge footer */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 bg-white border border-slate-100 max-w-xl mx-auto p-4 rounded-2xl shadow-inner text-xs text-slate-500">
          <Smartphone className="text-primary" size={18} />
          <span className="text-center sm:text-left">
            Payments are secured and processed instantly via Safaricom M-Pesa STK Push.
          </span>
          <span className="font-bold text-primary border-l border-slate-200 pl-3">LIPA NA M-PESA</span>
        </div>
      </section>

      {/* Free Learning Center Preview Section */}
      <section id="learning" className="py-20 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between border-b border-slate-200 pb-6 mb-12">
          <div>
            <h3 className="text-accent font-extrabold text-xs uppercase tracking-widest">Free Knowledge Sharing</h3>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 mt-1">Agricultural Learning Center</h2>
          </div>
          <Link 
            href="/learning" 
            className="text-primary hover:text-accent font-bold text-xs flex items-center gap-1 mt-3 sm:mt-0 transition-colors"
          >
            <span>Browse All Resources</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {learningArticles.length > 0 ? (
            learningArticles.map((article: any) => (
              <div key={article.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-accent/15 text-primary border border-accent/15 px-2.5 py-0.5 rounded-full font-bold uppercase">
                    {article.category}
                  </span>
                  <h4 className="font-bold text-slate-800 text-base mt-3 leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {article.contentBody}
                  </p>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Article resource</span>
                  <Link 
                    href="/learning" 
                    className="text-primary hover:text-accent font-bold"
                  >
                    Read Guides
                  </Link>
                </div>
              </div>
            ))
          ) : (
            // Static Placeholder Fallbacks
            <>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-accent/15 text-primary border border-accent/15 px-2.5 py-0.5 rounded-full font-bold uppercase">CATTLE</span>
                  <h4 className="font-bold text-slate-800 text-base mt-3 leading-snug">Modern Feed Management for Dairy Cattle</h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Feeding dairy cattle properly is essential for maximizing milk yield. Learn dry matter limits, silage storage formulas, and dairy meal ratios...
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Article Resource</span>
                  <Link href="/learning" className="text-primary hover:text-accent font-bold">Read Guides</Link>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-accent/15 text-primary border border-accent/15 px-2.5 py-0.5 rounded-full font-bold uppercase">GOAT</span>
                  <h4 className="font-bold text-slate-800 text-base mt-3 leading-snug">Common Goat Diseases and Vaccination Schedules</h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Goats are susceptible to CCPP and PPR diseases. Explore annual vaccine recommendations and tick control guidelines...
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Article Resource</span>
                  <Link href="/learning" className="text-primary hover:text-accent font-bold">Read Guides</Link>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-accent/15 text-primary border border-accent/15 px-2.5 py-0.5 rounded-full font-bold uppercase">PIG</span>
                  <h4 className="font-bold text-slate-800 text-base mt-3 leading-snug">How to Build a Modern Pig Housing Unit</h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Review layout and spacing specifications for boars, gestating sows, and weaners to ensure dry, sanitary pens...
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Article Resource</span>
                  <Link href="/learning" className="text-primary hover:text-accent font-bold">Read Guides</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <span className="text-2xl">🚜</span>
              <span className="font-bold text-lg tracking-tight">FarmFMS</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
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
        
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
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

