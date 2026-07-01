'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Video, BookOpen, Loader2, ChevronRight, ExternalLink } from 'lucide-react';
import { TRAINING_CATEGORIES, TRAINING_MODULES, getModulesForCategory } from '@/lib/training-modules';

type Step = 'category' | 'module' | 'lesson';

export default function LearningCenterPage() {
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentView, setContentView] = useState<'VIDEO' | 'ARTICLE'>('VIDEO');

  const categoryInfo = TRAINING_CATEGORIES.find((c) => c.id === selectedCategory);
  const moduleInfo = TRAINING_MODULES.find((m) => m.id === selectedModule);
  const lesson = resources[0] || null;

  useEffect(() => {
    if (step !== 'lesson' || !selectedCategory || !selectedModule) return;

    setLoading(true);
    fetch(`/api/learning?category=${selectedCategory}&module=${selectedModule}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResources(data.resources || []);
          const first = data.resources?.[0];
          if (first?.contentType === 'VIDEO' && first?.contentUrl) {
            setContentView('VIDEO');
          } else {
            setContentView('ARTICLE');
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [step, selectedCategory, selectedModule]);

  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id);
    setSelectedModule(null);
    setStep('module');
  };

  const handleSelectModule = (id: string) => {
    setSelectedModule(id);
    setStep('lesson');
  };

  const goBack = () => {
    if (step === 'lesson') {
      setStep('module');
      setSelectedModule(null);
      setResources([]);
    } else if (step === 'module') {
      setStep('category');
      setSelectedCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-primary text-white py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-light transition-colors">
            <ArrowLeft size={14} /> Back to Home Page
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <GraduationCap size={32} className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Agricultural Learning Center</h1>
              <p className="text-xs text-slate-300">Free training — pick livestock, then topic module</p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70 pt-2">
            <button onClick={() => { setStep('category'); setSelectedCategory(null); setSelectedModule(null); }} className="hover:text-white cursor-pointer">
              All Livestock
            </button>
            {categoryInfo && (
              <>
                <ChevronRight size={12} />
                <button onClick={() => { setStep('module'); setSelectedModule(null); }} className="hover:text-white cursor-pointer">
                  {categoryInfo.emoji} {categoryInfo.name}
                </button>
              </>
            )}
            {moduleInfo && (
              <>
                <ChevronRight size={12} />
                <span className="text-accent">{moduleInfo.icon} {moduleInfo.name}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {step !== 'category' && (
          <button onClick={goBack} className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent transition-colors cursor-pointer">
            <ArrowLeft size={14} /> Back
          </button>
        )}

        {/* Step 1: Pick livestock category */}
        {step === 'category' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {TRAINING_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-accent/30 transition-all text-left group cursor-pointer"
              >
                <span className="text-5xl">{cat.emoji}</span>
                <h3 className="font-extrabold text-lg text-slate-800 mt-4 group-hover:text-primary">{cat.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{getModulesForCategory(cat.id).length} training modules</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-accent">
                  <span>Explore modules</span>
                  <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Pick module */}
        {step === 'module' && selectedCategory && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-black text-slate-800">
              {categoryInfo?.emoji} {categoryInfo?.name} — Choose a Module
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {getModulesForCategory(selectedCategory).map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(mod.id)}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all text-left group cursor-pointer"
                >
                  <span className="text-3xl">{mod.icon}</span>
                  <h3 className="font-bold text-slate-800 mt-3 group-hover:text-primary">{mod.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Video &amp; article guide</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Lesson content */}
        {step === 'lesson' && (
          <div className="animate-in fade-in duration-300">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <Loader2 className="animate-spin text-accent" size={32} />
                <span className="text-sm text-slate-500">Loading lesson...</span>
              </div>
            ) : lesson ? (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100">
                      {lesson.contentUrl && (
                        <button
                          onClick={() => setContentView('VIDEO')}
                          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                            contentView === 'VIDEO' ? 'bg-accent/10 text-primary border-b-2 border-accent' : 'text-slate-400'
                          }`}
                        >
                          <Video size={14} /> Video
                        </button>
                      )}
                      <button
                        onClick={() => setContentView('ARTICLE')}
                        className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                          contentView === 'ARTICLE' ? 'bg-accent/10 text-primary border-b-2 border-accent' : 'text-slate-400'
                        }`}
                      >
                        <BookOpen size={14} /> Article / PDF Guide
                      </button>
                    </div>

                    {contentView === 'VIDEO' && lesson.contentUrl ? (
                      <div className="aspect-video bg-black">
                        <iframe
                          width="100%"
                          height="100%"
                          src={lesson.contentUrl}
                          title={lesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="p-8 prose prose-sm max-w-none">
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{lesson.contentBody}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {lesson.category} · {lesson.module}
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-800 leading-snug">{lesson.title}</h2>
                    {lesson.contentBody && contentView === 'VIDEO' && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-6">{lesson.contentBody}</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-primary to-primary-hover rounded-3xl p-6 text-white space-y-3">
                    <h4 className="font-bold text-sm">Need Professional Assistance?</h4>
                    <p className="text-xs text-white/70">Book a licensed veterinarian through FarmFMS after registering your farm.</p>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-primary font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <span>Register &amp; Book Vet</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <span className="text-4xl">📚</span>
                <p className="text-slate-500 mt-3 text-sm">No lesson found for this module yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
