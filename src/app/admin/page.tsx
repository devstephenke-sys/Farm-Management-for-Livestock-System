'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Users, GraduationCap, LayoutDashboard, UserCheck, ShieldAlert, Check, Ban, Plus, Loader2 } from 'lucide-react';

export default function AdminPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('admin-dashboard');
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // New Learning Resource Form State
  const [resourceForm, setResourceForm] = useState({
    title: '',
    category: 'CATTLE',
    contentType: 'ARTICLE',
    contentUrl: '',
    contentBody: '',
  });

  // Protect route
  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load Admin Data
  const loadAdminData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      // 1. Load platform analytics
      const analyticsRes = await fetch('/api/admin/analytics');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.stats);
      }

      // 2. Load users list
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsersList(usersData.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user, activeTab]);

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

  // Vet approval action
  const handleApproveVet = async (vetId: number, approve: boolean) => {
    const confirmation = confirm(`Are you sure you want to ${approve ? 'approve' : 'decline'} this veterinarian registration?`);
    if (!confirmation) return;

    try {
      const res = await fetch(`/api/admin/vets/${vetId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Veterinarian registration ${approve ? 'approved and activated' : 'declined and suspended'}.`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
      alert('Error changing registration status');
    }
  };

  // Toggle user suspension
  const handleToggleUserSuspension = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmation = confirm(`Are you sure you want to ${nextStatus === 'SUSPENDED' ? 'SUSPEND' : 'ACTIVATE'} this user account?`);
    if (!confirmation) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`User account status set to ${nextStatus}.`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
      alert('Error updating user status');
    }
  };

  // Create learning resource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceForm.title || !resourceForm.category || !resourceForm.contentType) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      const res = await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Learning resource uploaded successfully to public directory!');
        setResourceForm({
          title: '',
          category: 'CATTLE',
          contentType: 'ARTICLE',
          contentUrl: '',
          contentBody: '',
        });
        setActiveTab('admin-dashboard');
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Internal error adding resource');
    }
  };

  const pendingVetsList = usersList.filter(u => u.role === 'VET' && u.status === 'PENDING');

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="ADMIN" />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight">
              Admin Control Center
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h5 className="font-bold text-sm text-slate-800">{user.name}</h5>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Root</span>
            </div>
          </div>
        </header>

        {/* Router content */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'admin-dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-200 text-xs">
              
              {/* Analytics KPI grid */}
              {analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
                    <div className="text-slate-400 font-bold text-[10px] uppercase">Registered Farmers</div>
                    <h3 className="text-2xl font-black text-slate-800">{analytics.totalFarmers} Users</h3>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
                    <div className="text-slate-400 font-bold text-[10px] uppercase">Registered Vets</div>
                    <h3 className="text-2xl font-black text-slate-800">{analytics.totalVets} Vets</h3>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
                    <div className="text-slate-400 font-bold text-[10px] uppercase">Pending Licenses</div>
                    <h3 className="text-2xl font-black text-amber-600 animate-pulse">{analytics.pendingVets} Requests</h3>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
                    <div className="text-slate-400 font-bold text-[10px] uppercase">Total System Revenue</div>
                    <h3 className="text-2xl font-black text-primary">KES {analytics.totalRevenue}</h3>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
                    <div className="text-slate-400 font-bold text-[10px] uppercase">Active Subscriptions</div>
                    <h3 className="text-2xl font-black text-accent">{analytics.activeSubs} Farms</h3>
                  </div>
                </div>
              )}

              {/* Plans Distribution & Recent Payments */}
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* SVG distributions */}
                {analytics && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-slate-800 text-sm">Active Plan Distribution</h4>
                    
                    <div className="space-y-4 pt-2">
                      {Object.entries(analytics.planDistribution).map(([plan, count]: any) => {
                        const total = Object.values(analytics.planDistribution).reduce((a: any, b: any) => a + b, 0) as number;
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={plan} className="space-y-1">
                            <div className="flex justify-between font-bold text-[11px]">
                              <span className="text-slate-600">{plan}</span>
                              <span className="text-slate-800">{count} Active</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-accent h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Audit trail payments */}
                {analytics && (
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-slate-800 text-sm">M-Pesa Sandbox Receipts Audit</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs leading-normal">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                            <th className="p-2">Client</th>
                            <th className="p-2">Plan</th>
                            <th className="p-2">Amount</th>
                            <th className="p-2">Receipt</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recentPayments && analytics.recentPayments.length > 0 ? (
                            analytics.recentPayments.map((p: any) => (
                              <tr key={p.id} className="border-b border-slate-100 text-slate-600">
                                <td className="p-2 font-bold text-slate-700">{p.user?.name}</td>
                                <td className="p-2 uppercase">{p.plan || 'TRIAL'}</td>
                                <td className="p-2">KES {p.amount}</td>
                                <td className="p-2 font-mono text-[10px]">{p.mpesaReceiptNumber || 'N/A'}</td>
                                <td className="p-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800'
                                  }`}>{p.status}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-2 text-center text-slate-400">No payment logs audited.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VET APPROVALS */}
          {activeTab === 'admin-vets' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200 text-xs leading-relaxed">
              <div>
                <h4 className="font-extrabold text-base text-slate-800">Veterinarian License Registry</h4>
                <p className="text-slate-400 text-xs">Verify credentials and approve/reject veterinarian listings prior to public view.</p>
              </div>

              <div className="space-y-4">
                {pendingVetsList.length > 0 ? (
                  pendingVetsList.map((vet) => (
                    <div 
                      key={vet.id} 
                      className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-sm text-slate-800">{vet.name}</h5>
                        <p className="text-slate-500 font-medium">{vet.qualification}</p>
                        <div className="text-[10px] text-slate-400 space-y-1">
                          <p>KVB Registration No: <strong className="text-slate-600">{vet.licenseNumber}</strong></p>
                          <p>Specialization: <strong className="text-slate-600">{vet.specialization}</strong></p>
                          <p>Region of Service: <strong className="text-slate-600">{vet.subCounty}, {vet.county} County</strong></p>
                          <p>Email: <strong className="text-slate-600">{vet.email}</strong> | Phone: <strong className="text-slate-600">{vet.phone}</strong></p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveVet(vet.id, true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check size={14} className="stroke-[3]" />
                          <span>Approve Vet</span>
                        </button>
                        <button
                          onClick={() => handleApproveVet(vet.id, false)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Ban size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl">
                    <span className="text-2xl mb-1 block">🏆</span>
                    <p className="font-semibold text-sm">No pending veterinarian registrations</p>
                    <p className="text-[10px] text-slate-400 mt-1">All veterinarian license applications have been resolved.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: USER ACCOUNTS MANAGER */}
          {activeTab === 'admin-users' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h4 className="font-extrabold text-base text-slate-800">Accounts Directory</h4>
                <p className="text-slate-400 text-xs">Monitor user registration records and suspend/unsuspend profiles.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs leading-normal">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Role</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Region</th>
                      <th className="p-2">License/Sub</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="border-b border-slate-100 text-slate-600">
                        <td className="p-2 font-bold text-slate-800">{usr.name}</td>
                        <td className="p-2">{usr.email}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            usr.role === 'FARMER' ? 'bg-indigo-50 text-indigo-800' : 'bg-teal-50 text-teal-800'
                          }`}>{usr.role}</span>
                        </td>
                        <td className="p-2">{usr.phone || 'N/A'}</td>
                        <td className="p-2">{usr.county || 'N/A'}</td>
                        <td className="p-2 font-medium">
                          {usr.role === 'VET' ? usr.licenseNumber : (usr.subscriptions?.[0]?.plan || 'BASIC')}
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            usr.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                          }`}>{usr.status}</span>
                        </td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => handleToggleUserSuspension(usr.id, usr.status)}
                            className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                              usr.status === 'ACTIVE'
                                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-100'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100'
                            }`}
                          >
                            {usr.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADD RESOURCES */}
          {activeTab === 'admin-resources' && (
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h4 className="font-extrabold text-base text-slate-800">Upload Learning Resource</h4>
                <p className="text-slate-400 text-xs">Create educational guides or embed training videos for the public directory.</p>
              </div>

              <form onSubmit={handleCreateResource} className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400">Resource Title</label>
                  <input
                    type="text"
                    required
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. Broiler Management Guidelines"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400">Target Category</label>
                    <select
                      value={resourceForm.category}
                      onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                    >
                      <option value="CATTLE">Cattle</option>
                      <option value="GOAT">Goats</option>
                      <option value="SHEEP">Sheep</option>
                      <option value="POULTRY">Poultry</option>
                      <option value="PIG">Pigs</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400">Content Type</label>
                    <select
                      value={resourceForm.contentType}
                      onChange={(e) => setResourceForm({ ...resourceForm, contentType: e.target.value })}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                    >
                      <option value="ARTICLE">Article Text</option>
                      <option value="VIDEO">YouTube Embedded Video</option>
                    </select>
                  </div>
                </div>

                {resourceForm.contentType === 'VIDEO' ? (
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400">YouTube Embedded URL</label>
                    <input
                      type="text"
                      required
                      value={resourceForm.contentUrl}
                      onChange={(e) => setResourceForm({ ...resourceForm, contentUrl: e.target.value })}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                      placeholder="e.g. https://www.youtube.com/embed/XXXXXX"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400">Article Text Body (Rich description)</label>
                    <textarea
                      required
                      value={resourceForm.contentBody}
                      onChange={(e) => setResourceForm({ ...resourceForm, contentBody: e.target.value })}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none h-44 resize-none"
                      placeholder="Write guidelines, steps, feeding/vaccination timelines..."
                    ></textarea>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Upload Resource</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
