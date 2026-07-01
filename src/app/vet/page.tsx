'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { LivestockTypeIcon } from '@/lib/livestockIcons';
import { Calendar, HeartPulse, ShieldAlert, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VetPortal() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('vet-dashboard');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Assessment Form State
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [vitals, setVitals] = useState({
    temperature: '',
    weight: '',
    heartRate: '',
    respiratoryRate: '',
    diagnosis: '',
    treatmentGiven: '',
    medicationName: '',
    medicationDosage: '',
    medicationDuration: '',
    recommendations: '',
    followUpDate: '',
  });

  // Symptoms Selection (multiple checkboxes)
  const [symptomsList, setSymptomsList] = useState<string[]>([]);
  const symptomsOptions = ['Fever', 'Diarrhea', 'Coughing', 'Weight Loss', 'Loss of Appetite', 'Lethargy', 'Wound/Injury'];

  // Protect route
  useEffect(() => {
    if (!loading && (!user || user.role !== 'VET')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load appointments
  const loadAppointments = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'VET') {
      loadAppointments();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Verifying session...</span>
        </div>
      </div>
    );
  }

  // Handle appointment status change (Approve/Reject)
  const handleStatusChange = async (apptId: number, status: 'APPROVED' | 'CANCELLED') => {
    const confirmation = status === 'CANCELLED' 
      ? confirm('Are you sure you want to decline this appointment request?')
      : true;

    if (!confirmation) return;

    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Appointment ${status === 'APPROVED' ? 'Approved' : 'Declined'}.`);
        loadAppointments();
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    }
  };

  // Toggle symptom select
  const handleSymptomToggle = (symptom: string) => {
    setSymptomsList((prev) => 
      prev.includes(symptom) 
        ? prev.filter((s) => s !== symptom) 
        : [...prev, symptom]
    );
  };

  // Submit Veterinary Assessment Report Form
  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    const {
      temperature,
      weight,
      heartRate,
      respiratoryRate,
      diagnosis,
      treatmentGiven,
      medicationName,
      medicationDosage,
      medicationDuration,
      recommendations,
      followUpDate,
    } = vitals;

    if (!temperature || !weight || !heartRate || !respiratoryRate || symptomsList.length === 0 || !diagnosis || !treatmentGiven) {
      alert('Please fill out all required clinical examination and assessment fields');
      return;
    }

    try {
      const res = await fetch('/api/vet/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppt.id,
          animalId: selectedAppt.animalId,
          temperature,
          weight,
          heartRate,
          respiratoryRate,
          symptoms: symptomsList,
          diagnosis,
          treatmentGiven,
          medicationName,
          medicationDosage,
          medicationDuration,
          recommendations,
          followUpDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Clinical report submitted successfully! Animal health history has been updated.');
        setSelectedAppt(null);
        setSymptomsList([]);
        setVitals({
          temperature: '',
          weight: '',
          heartRate: '',
          respiratoryRate: '',
          diagnosis: '',
          treatmentGiven: '',
          medicationName: '',
          medicationDosage: '',
          medicationDuration: '',
          recommendations: '',
          followUpDate: '',
        });
        loadAppointments();
      } else {
        alert(`Failed to submit: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Internal report submission error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="VET" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight">
              Veterinary Dashboard
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <h5 className="font-bold text-sm text-slate-800">{user.name}</h5>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">License: {user.licenseNumber}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* TAB 1: APPOINTMENTS LIST */}
          {activeTab === 'vet-dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Assigned Appointments & Consultations</h3>
                  <p className="text-xs text-slate-400">Receive booking requests, approve visits, and record clinical diagnostic assessments.</p>
                </div>
              </div>

              {loadingData ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <span className="text-xs font-semibold">Retrieving appointments...</span>
                </div>
              ) : appointments.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {appointments.map((appt) => (
                    <div 
                      key={appt.id} 
                      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Identity banner */}
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50">
                              <LivestockTypeIcon type={appt.animal.type || 'COW'} size={20} />
                            </span>
                            <div>
                              <h5 className="font-extrabold text-slate-800 leading-none">{appt.animal.name} ({appt.animal.tagNumber})</h5>
                              <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{appt.animal.breed}</p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            appt.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
                            appt.status === 'APPROVED' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {appt.status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-xs leading-relaxed text-slate-600">
                          <div className="flex justify-between">
                            <span>Farmer / Client:</span>
                            <strong className="text-slate-800">{appt.farmer.name}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Phone Number:</span>
                            <strong className="text-slate-800">{appt.farmer.phone}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Urgency Level:</span>
                            <span className={`font-bold ${
                              appt.urgency === 'HIGH' ? 'text-rose-600' : appt.urgency === 'MEDIUM' ? 'text-amber-600' : 'text-slate-500'
                            }`}>{appt.urgency}</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 mt-2">
                            <span className="font-bold text-slate-700 block mb-1">Symptoms Described:</span>
                            "{appt.symptoms}"
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold gap-3">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Date: {new Date(appt.preferredDate).toLocaleDateString()}</span>
                        </span>

                        {appt.status === 'PENDING' && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleStatusChange(appt.id, 'APPROVED')}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {appt.status === 'APPROVED' && (
                          <button
                            onClick={() => { setSelectedAppt(appt); setSymptomsList(appt.symptoms.split(', ')); }}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow cursor-pointer"
                          >
                            Fill Clinical Report
                          </button>
                        )}

                        {appt.status === 'COMPLETED' && appt.vetReport && (
                          <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                            <CheckCircle size={12} />
                            <span>Assessment Submitted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-white text-slate-400 p-6 text-center">
                  <span className="text-3xl mb-2">📅</span>
                  <p className="text-sm font-semibold">No assigned cases at the moment</p>
                  <p className="text-xs text-slate-400 mt-1">Once farmers in your county book visits, they will show up here.</p>
                </div>
              )}

              {/* Assessment Form Modal Pop-up */}
              {selectedAppt && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-slate-100 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="text-primary" size={20} />
                        <h3 className="font-extrabold text-slate-800 text-lg">Veterinary Assessment Form</h3>
                      </div>
                      <button onClick={() => setSelectedAppt(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕ Close</button>
                    </div>

                    <form onSubmit={handleSubmitAssessment} className="space-y-6 text-xs leading-relaxed">
                      
                      {/* Vitals inputs */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1 mb-3">
                          1. Clinical Examination (Vitals)
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Temp (°C)</label>
                            <input
                              type="number"
                              step="0.1"
                              required
                              value={vitals.temperature}
                              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                              placeholder="e.g. 38.5"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Weight (kg)</label>
                            <input
                              type="number"
                              step="0.1"
                              required
                              value={vitals.weight}
                              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                              placeholder="e.g. 450"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Heart Rate (bpm)</label>
                            <input
                              type="number"
                              required
                              value={vitals.heartRate}
                              onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                              placeholder="e.g. 60"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Resp Rate (/min)</label>
                            <input
                              type="number"
                              required
                              value={vitals.respiratoryRate}
                              onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                              placeholder="e.g. 24"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Symptoms checkboxes */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1 mb-3">
                          2. Clinical Symptoms Checklist
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {symptomsOptions.map((symptom) => {
                            const isChecked = symptomsList.includes(symptom);
                            return (
                              <button
                                key={symptom}
                                type="button"
                                onClick={() => handleSymptomToggle(symptom)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {symptom}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Diagnostic details */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1 mb-3">
                          3. Diagnostics & Treatment Given
                        </h4>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Diagnosis (Disease/Deficiency)</label>
                            <textarea
                              required
                              value={vitals.diagnosis}
                              onChange={(e) => setVitals({ ...vitals, diagnosis: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none h-20 resize-none"
                              placeholder="e.g. East Coast Fever / Mastitis deficiency..."
                            ></textarea>
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Treatment Administered</label>
                            <textarea
                              required
                              value={vitals.treatmentGiven}
                              onChange={(e) => setVitals({ ...vitals, treatmentGiven: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none h-20 resize-none"
                              placeholder="Describe injections, dressings, procedures..."
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* Medications */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1 mb-3">
                          4. Prescribed Medication (Optional)
                        </h4>
                        
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Drug / Vaccine Name</label>
                            <input
                              type="text"
                              value={vitals.medicationName}
                              onChange={(e) => setVitals({ ...vitals, medicationName: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                              placeholder="e.g. Penicillin"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Dosage Specs</label>
                            <input
                              type="text"
                              value={vitals.medicationDosage}
                              onChange={(e) => setVitals({ ...vitals, medicationDosage: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                              placeholder="e.g. 10ml daily"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Duration (Days)</label>
                            <input
                              type="text"
                              value={vitals.medicationDuration}
                              onChange={(e) => setVitals({ ...vitals, medicationDuration: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                              placeholder="e.g. 5 days"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Recommendations & follow-up */}
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1 mb-3">
                          5. Recommendations & Follow-Up Check
                        </h4>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Recommendations for Farmer</label>
                            <input
                              type="text"
                              value={vitals.recommendations}
                              onChange={(e) => setVitals({ ...vitals, recommendations: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                              placeholder="e.g. Isolate animal, feed high protein concentrate"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-400">Follow-Up Date</label>
                            <input
                              type="date"
                              value={vitals.followUpDate}
                              onChange={(e) => setVitals({ ...vitals, followUpDate: e.target.value })}
                              className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Submit Assessment Report & Sync History
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
