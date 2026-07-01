'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import MpesaSimulator from '@/components/MpesaSimulator';
import BillingPanel from '@/components/BillingPanel';
import NotificationBell from '@/components/NotificationBell';
import FarmPerformanceDashboard from '@/components/FarmPerformanceDashboard';
import FarmAnalyticsHub from '@/components/FarmAnalyticsHub';
import FinancialDashboardPanel from '@/components/FinancialDashboardPanel';
import countiesData from '@/lib/counties.json';
import { LivestockTypeIcon } from '@/lib/livestockIcons';
import { 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  Heart, 
  HeartPulse,
  Pencil,
  Printer, 
  Sparkles, 
  Smartphone, 
  CheckCircle,
  AlertTriangle,
  Award,
  Video,
  BookOpen,
  TrendingDown,
  DollarSign,
  Coins,
  Package,
  Clock,
  UserCheck,
  Users,
  UserSquare2,
  Check,
  XCircle,
  AlertCircle,
  Download,
  Settings,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  FlaskConical,
  FileText,
  CreditCard
} from 'lucide-react';

import { PLAN_CARDS, PLAN_RANK } from '@/lib/plans';

export default function FarmerDashboard() {
  const { user, loading, activePlan, isSubscribed, refreshSession, logout } = useAuth();
  const router = useRouter();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Business data states
  const [animals, setAnimals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [learningResources, setLearningResources] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Operational Module States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);

  // Search & Filter herd state
  const [herdSearch, setHerdSearch] = useState('');
  const [herdTypeFilter, setHerdTypeFilter] = useState('ALL');

  // Form states
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [animalDetailTab, setAnimalDetailTab] = useState<'profile' | 'health' | 'breeding' | 'production'>('profile');

  // New Animal Form Fields
  const [newAnimal, setNewAnimal] = useState({
    tagNumber: '',
    name: '',
    type: 'COW',
    breed: '',
    gender: 'FEMALE',
    dob: '',
    color: '',
    weight: '',
    fatherTag: '',
    motherTag: '',
    purchaseDate: '',
    purchaseCost: '',
  });

  // Log forms states
  const [newHealthRecord, setNewHealthRecord] = useState({
    type: 'VACCINATION',
    title: '',
    notes: '',
    cost: '',
    date: '',
  });
  const [newBreedingRecord, setNewBreedingRecord] = useState({
    type: 'ARTIFICIAL_INSEMINATION',
    details: '',
    result: 'SUCCESS',
    nextActionDate: '',
    date: '',
  });
  const [newProductionRecord, setNewProductionRecord] = useState({
    milkYield: '',
    eggCount: '',
    notes: '',
    date: '',
  });

  // Form states for FMS Operational Upgrades
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [productionAnimalFilter, setProductionAnimalFilter] = useState('ALL');
  const [newTransaction, setNewTransaction] = useState({
    type: 'INCOME',
    category: 'MILK_SALES',
    amount: '',
    description: '',
    date: '',
  });

  const [showAddInventory, setShowAddInventory] = useState(false);
  const [newInventory, setNewInventory] = useState({
    id: '', // Empty means new
    name: '',
    category: 'FEED',
    quantity: '',
    unit: 'bags',
    expiryDate: '',
    lowStockThreshold: '',
    supplier: '',
    cost: '',
    recordExpense: true,
  });

  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    animalId: '',
    type: 'VACCINATION',
    title: '',
    dueDate: '',
    notes: '',
  });

  const [showAddWorker, setShowAddWorker] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [editWorkerForm, setEditWorkerForm] = useState({
    name: '',
    role: '',
    phone: '',
    status: 'ACTIVE',
  });
  const [newWorker, setNewWorker] = useState({
    name: '',
    role: '',
    phone: '',
  });

  const [showAssignTask, setShowAssignTask] = useState(false);
  const [newTask, setNewTask] = useState({
    workerId: '',
    taskName: '',
    description: '',
    dueDate: '',
  });

  // Vet Booking Form
  const [vetsList, setVetsList] = useState<any[]>([]);
  const [selectedVetId, setSelectedVetId] = useState('');
  const [bookingAnimalId, setBookingAnimalId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingUrgency, setBookingUrgency] = useState('MEDIUM');
  const [bookingSymptoms, setBookingSymptoms] = useState('');
  const [vetFilterCounty, setVetFilterCounty] = useState('Nakuru');
  const [vetFilterSpecialization, setVetFilterSpecialization] = useState('Cattle & Goats');

  // M-Pesa billing states
  const [billingPhone, setBillingPhone] = useState('');
  const [billingPaying, setBillingPaying] = useState(false);
  const [selectedBillingPlan, setSelectedBillingPlan] = useState<'STANDARD' | 'PREMIUM' | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{ plan: string; expiresAt: string } | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingRefreshKey, setBillingRefreshKey] = useState(0);
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [showMpesaSimulator, setShowMpesaSimulator] = useState(false);
  const [payingPlan, setPayingPlan] = useState('');
  const [payingAmount, setPayingAmount] = useState(0);

  // Profile settings
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    county: '',
    subCounty: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Printing state
  const [selectedAnimalReportId, setSelectedAnimalReportId] = useState('');

  // Protect route
  useEffect(() => {
    if (!loading && (!user || user.role !== 'FARMER')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Set default county filter to user's farm county when loaded
  useEffect(() => {
    if (user?.farm?.county) {
      setVetFilterCounty(user.farm.county);
    }
  }, [user]);

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      // 1. Fetch Animals
      const animalsRes = await fetch('/api/animals');
      const animalsData = await animalsRes.json();
      if (animalsData.success) setAnimals(animalsData.animals);

      // 2. Fetch Appointments
      const apptRes = await fetch('/api/appointments');
      const apptData = await apptRes.json();
      if (apptData.success) setAppointments(apptData.appointments);

      // 3. Fetch Notifications
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      if (notifData.success) setNotifications(notifData.notifications);

      // 4. Fetch public learning resources
      const learningRes = await fetch('/api/learning');
      const learningData = await learningRes.json();
      if (learningData.success) setLearningResources(learningData.resources);

      // 5. Fetch financials
      const txRes = await fetch('/api/financials');
      const txData = await txRes.json();
      if (txData.success) setTransactions(txData.transactions);

      // 6. Fetch inventory
      const invRes = await fetch('/api/inventory');
      const invData = await invRes.json();
      if (invData.success) setInventoryItems(invData.inventoryItems);

      // 7. Fetch scheduler
      const schedRes = await fetch('/api/scheduler');
      const schedData = await schedRes.json();
      if (schedData.success) setScheduleEvents(schedData.scheduleEvents);

      // 8. Fetch workers
      const workersRes = await fetch('/api/workers');
      const workersData = await workersRes.json();
      if (workersData.success) setWorkers(workersData.workers);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'FARMER') {
      loadDashboardData();
    }
  }, [user]);

  // Check for scanned animal tag in URL search query parameter (QR Code Simulation scanning)
  useEffect(() => {
    if (animals.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const tag = params.get('animalTag');
      if (tag) {
        const found = animals.find(a => a.tagNumber.toLowerCase() === tag.toLowerCase());
        if (found) {
          setSelectedAnimal(found);
          setAnimalDetailTab('profile');
          // Clear query param so it doesn't reopen on every reload/refresh
          router.replace('/dashboard');
        }
      }
    }
  }, [animals, router]);

  // Fetch veterinarians for booking selection
  const loadVetsList = async () => {
    try {
      const url = `/api/appointments?action=getVets&county=${vetFilterCounty}&specialization=${vetFilterSpecialization}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setVetsList(data.vets);
        if (data.vets.length > 0) setSelectedVetId(String(data.vets[0].id));
      }
    } catch (e) {
      console.error('Error fetching vets:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'vet') {
      loadVetsList();
    }
  }, [activeTab, vetFilterCounty, vetFilterSpecialization]);

  useEffect(() => {
    if (activeTab === 'billing' && activePlan === 'BASIC' && !selectedBillingPlan) {
      setSelectedBillingPlan('STANDARD');
    } else if (activeTab === 'billing' && activePlan === 'STANDARD' && !selectedBillingPlan) {
      setSelectedBillingPlan('PREMIUM');
    }
  }, [activeTab, activePlan, selectedBillingPlan]);

  useEffect(() => {
    if (user?.phone && !billingPhone) {
      const digits = user.phone.replace(/\D/g, '');
      const local = digits.startsWith('254') ? '0' + digits.slice(3) : digits;
      setBillingPhone(local);
    }
  }, [user, billingPhone]);

  useEffect(() => {
    if (activeTab === 'settings' && user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        county: user.county || user.farm?.county || '',
        subCounty: user.subCounty || user.farm?.subCounty || '',
      }));
    }
  }, [activeTab, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d2518] to-[#1b4332]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Users size={28} className="text-accent" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-white/60">Loading Farm Portal...</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Handlers ---

  // Create new animal profile
  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnimal),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Animal registered successfully!');
        setShowAddAnimal(false);
        setNewAnimal({
          tagNumber: '',
          name: '',
          type: 'COW',
          breed: '',
          gender: 'FEMALE',
          dob: '',
          color: '',
          weight: '',
          fatherTag: '',
          motherTag: '',
          purchaseDate: '',
          purchaseCost: '',
        });
        loadDashboardData();
      } else {
        alert(data.error || `Failed to add: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Internal error registering animal.');
    }
  };

  // Open single animal detailed record log
  const handleSelectAnimal = async (animalId: number) => {
    try {
      const res = await fetch(`/api/animals/${animalId}`);
      const data = await res.json();
      if (data.success && data.animal) {
        setSelectedAnimal({
          ...data.animal,
          lineage: data.lineage,
        });
        setAnimalDetailTab('profile');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to load animal detail history.');
    }
  };

  // Add Health Log Record to Selected Animal
  const handleAddHealthRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    try {
      const res = await fetch('/api/records/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newHealthRecord,
          animalId: selectedAnimal.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Health history updated!');
        setNewHealthRecord({ type: 'VACCINATION', title: '', notes: '', cost: '', date: '' });
        handleSelectAnimal(selectedAnimal.id);
        loadDashboardData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Add Breeding Event Log to Selected Animal
  const handleAddBreedingRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    try {
      const res = await fetch('/api/records/breeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBreedingRecord,
          animalId: selectedAnimal.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Breeding history updated!');
        setNewBreedingRecord({ type: 'ARTIFICIAL_INSEMINATION', details: '', result: 'SUCCESS', nextActionDate: '', date: '' });
        handleSelectAnimal(selectedAnimal.id);
        loadDashboardData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Add Daily Yield Production Log to Selected Animal
  const handleAddProductionRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    if (selectedAnimal.gender === 'MALE') {
      alert('Production logging is only available for female animals.');
      return;
    }
    try {
      const res = await fetch('/api/records/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProductionRecord,
          animalId: selectedAnimal.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Production diary updated!');
        setNewProductionRecord({ milkYield: '', eggCount: '', notes: '', date: '' });
        handleSelectAnimal(selectedAnimal.id);
        loadDashboardData();
      } else {
        alert(data.error || 'Could not save production record.');
      }
    } catch (error) {
      console.error(error);
      alert('Could not save production record. Check your connection and try again.');
    }
  };

  // Book a Veterinarian Appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVetId || !bookingAnimalId || !bookingDate || !bookingSymptoms) {
      alert('Please fill out all booking fields');
      return;
    }
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veterinarianId: parseInt(selectedVetId),
          animalId: parseInt(bookingAnimalId),
          preferredDate: bookingDate,
          urgency: bookingUrgency,
          symptoms: bookingSymptoms,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Appointment request submitted successfully to veterinarian!');
        setBookingAnimalId('');
        setBookingSymptoms('');
        setBookingDate('');
        loadDashboardData();
        setActiveTab('dashboard');
      } else {
        alert(`Failed to book: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Internal booking error.');
    }
  };

  // Cancel an Appointment
  const handleCancelAppointment = async (apptId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Appointment cancelled.');
        loadDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Initiate M-Pesa STK Push Payment for Plan Upgrade
  const handlePaySubscription = async () => {
    const plan = selectedBillingPlan;
    setBillingError(null);
    if (!plan) {
      setBillingError('Please select a plan to upgrade to.');
      return;
    }
    const planInfo = PLAN_CARDS[plan];
    if (!billingPhone) {
      setBillingError('Please enter your M-Pesa phone number.');
      return;
    }
    const phoneDigits = billingPhone.replace(/\D/g, '');
    if (phoneDigits.length < 9) {
      setBillingError('Enter a valid Safaricom number, e.g. 0712345678');
      return;
    }
    const currentRank = PLAN_RANK[activePlan as keyof typeof PLAN_RANK] ?? 0;
    const targetRank = PLAN_RANK[plan];
    if (targetRank <= currentRank) {
      setBillingError(`You are already on ${activePlan} or a higher plan.`);
      return;
    }

    setPayingPlan(plan);
    setPayingAmount(planInfo.testPrice);
    setBillingPaying(true);
    setPaymentSuccess(null);
    
    try {
      const res = await fetch('/api/payments/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: billingPhone, plan }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutRequestId(data.checkoutRequestId);
        setShowMpesaSimulator(true);
        setBillingRefreshKey((k) => k + 1);
      } else {
        setBillingError(data.error || 'Payment could not be started. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setBillingError('Could not reach the payment server. Check your connection and try again.');
    } finally {
      setBillingPaying(false);
    }
  };

  // Clear notifications (dashboard panel only)
  const handleClearNotifications = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditWorker = (worker: any) => {
    setEditingWorker(worker);
    setEditWorkerForm({
      name: worker.name || '',
      role: worker.role || '',
      phone: worker.phone || '',
      status: worker.status || 'ACTIVE',
    });
    setShowAddWorker(false);
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;
    if (!editWorkerForm.name || !editWorkerForm.role) {
      alert('Fill name and role');
      return;
    }
    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_WORKER',
          workerId: editingWorker.id,
          ...editWorkerForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingWorker(null);
        loadDashboardData();
        alert('Worker updated successfully!');
      } else {
        alert(data.error || 'Could not update worker');
      }
    } catch (error) {
      console.error(error);
      alert('Could not update worker');
    }
  };

  const handleDeleteWorker = async (workerId: number, workerName: string) => {
    if (!confirm(`Remove ${workerName} from your farm roster? Their assigned tasks will also be deleted.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/workers?workerId=${workerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (editingWorker?.id === workerId) setEditingWorker(null);
        loadDashboardData();
        alert('Worker removed from roster.');
      } else {
        alert(data.error || 'Could not delete worker');
      }
    } catch (error) {
      console.error(error);
      alert('Could not delete worker');
    }
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.amount) {
      alert('Enter transaction amount');
      return;
    }
    try {
      const res = await fetch('/api/financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });
      const data = await res.json();
      if (data.success) {
        setNewTransaction({ type: 'INCOME', category: 'MILK_SALES', amount: '', description: '', date: '' });
        setShowAddTransaction(false);
        loadDashboardData();
        alert('Transaction recorded successfully!');
      } else {
        alert(data.error || 'Could not save transaction.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not save transaction. Check your connection and try again.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileMessage('New passwords do not match');
      return;
    }
    setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          county: profileForm.county,
          subCounty: profileForm.subCounty,
          currentPassword: profileForm.currentPassword || undefined,
          newPassword: profileForm.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileMessage('Profile updated successfully!');
        setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        await refreshSession();
      } else {
        setProfileMessage(data.error || 'Failed to update profile');
      }
    } catch {
      setProfileMessage('An error occurred while saving');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleExportHerdCsv = () => {
    const headers = ['Tag', 'Name', 'Type', 'Breed', 'Gender', 'Weight (kg)', 'Status', 'DOB'];
    const rows = animals.map((a) => [
      a.tagNumber, a.name, a.type, a.breed, a.gender, a.weight, a.status,
      new Date(a.dob).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `herd-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Delete Animal
  const handleDeleteAnimal = async (animalId: number) => {
    if (!confirm('Are you sure you want to delete this animal profile permanently? This deletes all history records.')) return;
    try {
      const res = await fetch(`/api/animals/${animalId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Animal removed.');
        setSelectedAnimal(null);
        loadDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Filtering Herd ---
  const filteredHerd = animals.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(herdSearch.toLowerCase()) || 
                          a.tagNumber.toLowerCase().includes(herdSearch.toLowerCase()) || 
                          a.breed.toLowerCase().includes(herdSearch.toLowerCase());
    const matchesType = herdTypeFilter === 'ALL' || a.type === herdTypeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate aggregates for Overview Tab
  const sickAnimals = animals.filter(a => 
    a.healthRecords?.some((hr: any) => hr.type === 'DISEASE') || false
  ).length;

  const totalHerdWeight = animals.reduce((sum, a) => sum + a.weight, 0);

  // Group production records for chart plotting (aggregated milk yield)
  const milkChartData = animals
    .filter(a => a.type === 'COW')
    .flatMap(a => a.productionRecords || [])
    .filter((pr: any) => pr.milkYield !== null)
    .reduce((acc: any[], pr: any) => {
      const dateStr = new Date(pr.date).toISOString().split('T')[0];
      const existing = acc.find(pt => pt.date === dateStr);
      if (existing) {
        existing.value += pr.milkYield;
      } else {
        acc.push({ date: dateStr, value: pr.milkYield });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // descending by date

  const allHealthLogs = animals
    .flatMap((a) => (a.healthRecords || []).map((hr: any) => ({ ...hr, animalName: a.name, animalTag: a.tagNumber })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const allBreedingLogs = animals
    .flatMap((a) => (a.breedingRecords || []).map((br: any) => ({ ...br, animalName: a.name, animalTag: a.tagNumber })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const allProductionLogs = animals
    .flatMap((a) =>
      (a.productionRecords || []).map((pr: any) => ({
        ...pr,
        animalId: a.id,
        animalName: a.name,
        animalTag: a.tagNumber,
        animalType: a.type,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const animalsWithProduction = animals.filter((a) =>
    (a.productionRecords || []).length > 0
  );

  const filteredProductionGroups = animalsWithProduction
    .filter((a) => productionAnimalFilter === 'ALL' || String(a.id) === productionAnimalFilter)
    .map((a) => ({
      animal: a,
      records: (a.productionRecords || [])
        .map((pr: any) => ({ ...pr, animalId: a.id, animalName: a.name, animalTag: a.tagNumber }))
        .sort((x: any, y: any) => new Date(y.date).getTime() - new Date(x.date).getTime()),
    }))
    .filter((group) => group.records.length > 0);

  const selectedAnimalCanLogProduction = selectedAnimal?.gender === 'FEMALE';

  const upcomingSchedule = scheduleEvents
    .filter((e) => !e.completed && new Date(e.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const subscriptionDaysLeft = user?.subscription?.endDate
    ? Math.max(0, Math.ceil((new Date(user.subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="FARMER" />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between no-print shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-accent rounded-full"></div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
              {activeTab === 'dashboard' && 'Farm Overview'}
              {activeTab === 'analytics' && 'Farm Analytics'}
              {activeTab === 'herd' && 'Herd Directory'}
              {activeTab === 'health' && 'Health Logs'}
              {activeTab === 'breeding' && 'Breeding & Lineage'}
              {activeTab === 'production' && 'Production Log'}
              {activeTab === 'vet' && 'Book Veterinarian'}
              {activeTab === 'reports' && 'Reports & Export'}
              {activeTab === 'billing' && 'Billing & Subscription'}
              {activeTab === 'learning' && 'Learning Center'}
              {activeTab === 'financials' && 'Financial Ledger'}
              {activeTab === 'inventory' && 'Inventory & Stock'}
              {activeTab === 'scheduler' && 'Deworming & Vaccines'}
              {activeTab === 'workers' && 'Worker Directory'}
              {activeTab === 'settings' && 'Profile & Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            
            {/* Notifications Bell */}
            <NotificationBell />

            <div className="h-8 w-px bg-slate-200"></div>

            {/* Profile trigger */}
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="text-right">
                <h5 className="font-bold text-sm text-slate-800">{user.name}</h5>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.farm?.name}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Inner Tab Router */}
        <main className="flex-1 p-8 overflow-y-auto print:p-0">
          
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-200">

              {/* Subscription status banner */}
              {user?.subscription && (
                <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSubscribed
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-800">
                      {activePlan} Plan {isSubscribed ? ' - Active' : ' - Basic (Limited)'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {subscriptionDaysLeft !== null
                        ? `${subscriptionDaysLeft} days remaining on your subscription`
                        : 'Upgrade to unlock vet booking and advanced features'}
                    </p>
                  </div>
                  {activePlan === 'BASIC' && (
                    <button
                      onClick={() => setActiveTab('billing')}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              )}
              
              <FarmPerformanceDashboard
                animals={animals}
                transactions={transactions}
                scheduleEvents={scheduleEvents}
                inventoryItems={inventoryItems}
                notifications={notifications}
                upcomingSchedule={upcomingSchedule}
                milkChartData={milkChartData}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <FarmAnalyticsHub animals={animals} scheduleEvents={scheduleEvents} />
          )}

          {/* TAB 2: HERD DIRECTORY */}
          {activeTab === 'herd' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between no-print">
                <div className="flex gap-2">
                  <div className="relative shadow-sm max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      value={herdSearch}
                      onChange={(e) => setHerdSearch(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs bg-white outline-none"
                      placeholder="Search tag, name, breed..."
                    />
                  </div>

                  <select
                    value={herdTypeFilter}
                    onChange={(e) => setHerdTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-slate-600 text-xs bg-white outline-none"
                  >
                    <option value="ALL">All Types</option>
                    <option value="COW">Cows</option>
                    <option value="GOAT">Goats</option>
                    <option value="SHEEP">Sheep</option>
                    <option value="PIG">Pigs</option>
                    <option value="POULTRY">Poultry</option>
                    <option value="RABBIT">Rabbits</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddAnimal(true)}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Livestock</span>
                </button>
              </div>

              {/* Add Animal Modal Form */}
              {showAddAnimal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-slate-100 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="font-extrabold text-slate-800 text-lg">Register New Livestock</h3>
                      <button onClick={() => setShowAddAnimal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">âœ• Close</button>
                    </div>

                    <form onSubmit={handleCreateAnimal} className="space-y-4 text-xs">
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Tag Number (Unique ID)</label>
                          <input
                            type="text"
                            required
                            value={newAnimal.tagNumber}
                            onChange={(e) => setNewAnimal({ ...newAnimal, tagNumber: e.target.value.toUpperCase() })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                            placeholder="e.g. COW-004"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Animal Name</label>
                          <input
                            type="text"
                            required
                            value={newAnimal.name}
                            onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                            placeholder="e.g. Daisy"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Type</label>
                          <select
                            value={newAnimal.type}
                            onChange={(e) => setNewAnimal({ ...newAnimal, type: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                          >
                            <option value="COW">Cow</option>
                            <option value="GOAT">Goat</option>
                            <option value="SHEEP">Sheep</option>
                            <option value="PIG">Pig</option>
                            <option value="POULTRY">Poultry</option>
                            <option value="RABBIT">Rabbit</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Breed</label>
                          <input
                            type="text"
                            required
                            value={newAnimal.breed}
                            onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                            placeholder="e.g. Holstein Friesian"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Gender</label>
                          <select
                            value={newAnimal.gender}
                            onChange={(e) => setNewAnimal({ ...newAnimal, gender: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none"
                          >
                            <option value="FEMALE">Female</option>
                            <option value="MALE">Male</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Date of Birth</label>
                          <input
                            type="date"
                            required
                            value={newAnimal.dob}
                            onChange={(e) => setNewAnimal({ ...newAnimal, dob: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Color</label>
                          <input
                            type="text"
                            value={newAnimal.color}
                            onChange={(e) => setNewAnimal({ ...newAnimal, color: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                            placeholder="e.g. Brown"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={newAnimal.weight}
                            onChange={(e) => setNewAnimal({ ...newAnimal, weight: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                            placeholder="e.g. 150"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Father Tag Number</label>
                          <input
                            type="text"
                            value={newAnimal.fatherTag}
                            onChange={(e) => setNewAnimal({ ...newAnimal, fatherTag: e.target.value.toUpperCase() })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                            placeholder="Optional father ID"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Mother Tag Number</label>
                          <input
                            type="text"
                            value={newAnimal.motherTag}
                            onChange={(e) => setNewAnimal({ ...newAnimal, motherTag: e.target.value.toUpperCase() })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                            placeholder="Optional mother ID"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Purchase Date</label>
                          <input
                            type="date"
                            value={newAnimal.purchaseDate}
                            onChange={(e) => setNewAnimal({ ...newAnimal, purchaseDate: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-500 uppercase">Purchase Cost (KES)</label>
                          <input
                            type="number"
                            value={newAnimal.purchaseCost}
                            onChange={(e) => setNewAnimal({ ...newAnimal, purchaseCost: e.target.value })}
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                            placeholder="Optional cost"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Register Livestock
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Herd List Directory Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHerd.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => handleSelectAnimal(animal.id)}
                    className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-accent/40 shadow-sm hover:shadow-lg transition-all duration-150 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50">
                            <LivestockTypeIcon type={animal.type} size={20} />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800 leading-snug group-hover:text-primary transition-colors">{animal.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{animal.tagNumber}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          animal.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {animal.status}
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Breed:</span>
                          <strong className="text-slate-800">{animal.breed}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Gender:</span>
                          <strong className="text-slate-800 uppercase">{animal.gender}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Weight:</span>
                          <strong className="text-slate-800">{animal.weight} kg</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Born: {new Date(animal.dob).toLocaleDateString()}</span>
                      <span className="font-bold text-accent group-hover:underline">View History &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Single Animal Profile History Modal/Drawer */}
              {selectedAnimal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-end">
                  <div className="bg-white h-screen w-full max-w-2xl shadow-2xl p-8 overflow-y-auto space-y-6 flex flex-col justify-between border-l border-slate-100 animate-in slide-in-from-right duration-300">
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50">
                            <LivestockTypeIcon type={selectedAnimal.type} size={24} />
                          </span>
                          <div>
                            <h3 className="font-extrabold text-lg text-slate-800">{selectedAnimal.name} ({selectedAnimal.tagNumber})</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedAnimal.breed}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedAnimalReportId(selectedAnimal.id); setActiveTab('reports'); setSelectedAnimal(null); }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                            title="Generate report sheet"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAnimal(selectedAnimal.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100 cursor-pointer"
                            title="Delete animal profile"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button onClick={() => setSelectedAnimal(null)} className="text-slate-400 hover:text-slate-600 font-extrabold ml-2 text-sm">âœ• Close</button>
                        </div>
                      </div>

                      {/* Modal tabs */}
                      <div className="flex border-b border-slate-100 text-xs font-bold text-slate-500 gap-4">
                        <button onClick={() => setAnimalDetailTab('profile')} className={`pb-2 border-b-2 transition-colors ${animalDetailTab === 'profile' ? 'border-primary text-primary' : 'border-transparent hover:text-slate-800'}`}>Profile & Lineage</button>
                        <button onClick={() => setAnimalDetailTab('health')} className={`pb-2 border-b-2 transition-colors ${animalDetailTab === 'health' ? 'border-primary text-primary' : 'border-transparent hover:text-slate-800'}`}>Health Logs</button>
                        <button onClick={() => setAnimalDetailTab('breeding')} className={`pb-2 border-b-2 transition-colors ${animalDetailTab === 'breeding' ? 'border-primary text-primary' : 'border-transparent hover:text-slate-800'}`}>Breeding Events</button>
                        <button
                          onClick={() => selectedAnimalCanLogProduction && setAnimalDetailTab('production')}
                          disabled={!selectedAnimalCanLogProduction}
                          className={`pb-2 border-b-2 transition-colors ${
                            !selectedAnimalCanLogProduction
                              ? 'border-transparent text-slate-300 cursor-not-allowed'
                              : animalDetailTab === 'production'
                                ? 'border-primary text-primary'
                                : 'border-transparent hover:text-slate-800'
                          }`}
                          title={!selectedAnimalCanLogProduction ? 'Production logging is for female animals only' : undefined}
                        >
                          Production Diary
                        </button>
                      </div>

                      {/* Detail Tab Contents */}
                      {animalDetailTab === 'profile' && (
                        <div className="space-y-6 text-xs leading-relaxed animate-in fade-in duration-150">
                          {/* Basic specifications */}
                          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <div>
                              <span className="text-slate-400">Date of Birth:</span>
                              <p className="font-bold text-slate-800 mt-0.5">{new Date(selectedAnimal.dob).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Color/Markings:</span>
                              <p className="font-bold text-slate-800 mt-0.5">{selectedAnimal.color || 'None specified'}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Purchase Date:</span>
                              <p className="font-bold text-slate-800 mt-0.5">{selectedAnimal.purchaseDate ? new Date(selectedAnimal.purchaseDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-slate-400">Purchase Cost:</span>
                              <p className="font-bold text-slate-800 mt-0.5">{selectedAnimal.purchaseCost ? `KES ${selectedAnimal.purchaseCost}` : 'N/A'}</p>
                            </div>
                          </div>

                          {/* QR Code Identification Card */}
                          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-slate-800 text-sm">QR Code Identification</h4>
                              <p className="text-slate-400 text-[10px]">Every animal has a unique digital ID. Print this code, laminate it, and attach it to the animal's ear or stall for easy scanning.</p>
                            </div>
                            <div className="flex flex-col items-center ml-4 shrink-0 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/dashboard?animalTag=' + selectedAnimal.tagNumber : 'http://localhost:3000/dashboard?animalTag=' + selectedAnimal.tagNumber)}`} 
                                alt="Animal QR Code" 
                                className="w-24 h-24 border border-slate-200 p-1.5 bg-white rounded-lg animate-fade-in"
                              />
                              <span className="text-[9px] text-slate-500 font-mono mt-1.5 font-bold">{selectedAnimal.tagNumber}</span>
                            </div>
                          </div>

                          {/* Lineage Tree */}
                          <div className="space-y-3">
                            <h4 className="font-extrabold text-slate-800 text-sm">Parent-Child Lineage Tree</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] text-blue-500 font-bold uppercase">Father Node</span>
                                <span className="font-extrabold text-slate-800 mt-1">{selectedAnimal.fatherTag || 'Unknown Sire'}</span>
                                {selectedAnimal.lineage?.father ? (
                                  <button onClick={() => handleSelectAnimal(selectedAnimal.lineage.father.id)} className="text-[9px] text-accent hover:underline font-bold mt-2 text-left">View Sire Record &rarr;</button>
                                ) : selectedAnimal.fatherTag && (
                                  <span className="text-[9px] text-slate-400 mt-2">Not registered in system</span>
                                )}
                              </div>

                              <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-3 flex flex-col">
                                <span className="text-[10px] text-rose-500 font-bold uppercase">Mother Node</span>
                                <span className="font-extrabold text-slate-800 mt-1">{selectedAnimal.motherTag || 'Unknown Dam'}</span>
                                {selectedAnimal.lineage?.mother ? (
                                  <button onClick={() => handleSelectAnimal(selectedAnimal.lineage.mother.id)} className="text-[9px] text-accent hover:underline font-bold mt-2 text-left">View Dam Record &rarr;</button>
                                ) : selectedAnimal.motherTag && (
                                  <span className="text-[9px] text-slate-400 mt-2">Not registered in system</span>
                                )}
                              </div>
                            </div>

                            {/* Offspring Listing */}
                            {selectedAnimal.lineage?.offspring && selectedAnimal.lineage.offspring.length > 0 && (
                              <div className="space-y-2 pt-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Registered Offspring</span>
                                <div className="space-y-1.5">
                                  {selectedAnimal.lineage.offspring.map((child: any) => (
                                    <div key={child.id} className="flex justify-between items-center p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                                      <span className="font-bold text-slate-700">{child.name} ({child.tagNumber})</span>
                                      <button onClick={() => handleSelectAnimal(child.id)} className="text-[10px] text-accent hover:underline font-bold">View offspring &rarr;</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TAB: HEALTH HISTORIES */}
                      {animalDetailTab === 'health' && (
                        <div className="space-y-6 animate-in fade-in duration-150 text-xs">
                          {/* Form to log new health detail */}
                          <form onSubmit={handleAddHealthRecord} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                            <h5 className="font-extrabold text-slate-800 text-xs">Log Medical Event</h5>
                            
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400">Type</label>
                                <select
                                  value={newHealthRecord.type}
                                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, type: e.target.value })}
                                  className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                >
                                  <option value="VACCINATION">Vaccination</option>
                                  <option value="TREATMENT">Treatment</option>
                                  <option value="DISEASE">Disease Log</option>
                                  <option value="MEDICATION">Medication</option>
                                  <option value="VET_VISIT">Vet Visit</option>
                                </select>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <label className="block font-bold text-slate-400">Title / Diagnosis</label>
                                <input
                                  type="text"
                                  required
                                  value={newHealthRecord.title}
                                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, title: e.target.value })}
                                  className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                  placeholder="e.g. Blackquarter vaccine"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400">Date Logged</label>
                                <input
                                  type="date"
                                  value={newHealthRecord.date}
                                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, date: e.target.value })}
                                  className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400">Cost incurred (KES)</label>
                                <input
                                  type="number"
                                  value={newHealthRecord.cost}
                                  onChange={(e) => setNewHealthRecord({ ...newHealthRecord, cost: e.target.value })}
                                  className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                  placeholder="e.g. 500"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-slate-400">Notes & Clinical Description</label>
                              <textarea
                                value={newHealthRecord.notes}
                                onChange={(e) => setNewHealthRecord({ ...newHealthRecord, notes: e.target.value })}
                                className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white h-16 resize-none"
                                placeholder="Dose particulars, symptoms, etc."
                              ></textarea>
                            </div>

                            <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold">
                              Log Medical Entry
                            </button>
                          </form>

                          {/* Health records history logs */}
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Lifetime Medical Logs</span>
                            <div className="space-y-2">
                              {selectedAnimal.healthRecords && selectedAnimal.healthRecords.length > 0 ? (
                                selectedAnimal.healthRecords.map((hr: any) => (
                                  <div key={hr.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-1 leading-relaxed">
                                    <div className="flex justify-between items-center">
                                      <span className="font-extrabold text-slate-800">{hr.title}</span>
                                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">{hr.type}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{hr.notes}</p>
                                    <div className="text-[9px] text-slate-400 pt-1 flex justify-between items-center">
                                      <span>Date: {new Date(hr.date).toLocaleDateString()}</span>
                                      {hr.cost > 0 && <span className="font-semibold text-slate-700">Cost: KES {hr.cost}</span>}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center py-6 text-slate-400 text-xs">No medical events registered.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB: BREEDING LOGS */}
                      {animalDetailTab === 'breeding' && (
                        <div className="space-y-6 animate-in fade-in duration-150 text-xs">
                          {/* Form to log new breeding activity */}
                          <form onSubmit={handleAddBreedingRecord} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                            <h5 className="font-extrabold text-slate-800 text-xs">Record Breeding Event</h5>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400">Activity Type</label>
                                <select
                                  value={newBreedingRecord.type}
                                  onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, type: e.target.value })}
                                  className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                >
                                  <option value="ARTIFICIAL_INSEMINATION">Artificial Insemination</option>
                                  <option value="MATING">Natural Mating</option>
                                  <option value="PREGNANCY_CHECK">Pregnancy Check</option>
                                  <option value="HEAT_DETECTION">Heat Detection</option>
                                  <option value="CALVING_LAMBING">Calving / Lambing</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400">Result / Status</label>
                                <select
                                  value={newBreedingRecord.result}
                                  onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, result: e.target.value })}
                                  className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                >
                                  <option value="SUCCESS">Success / Mated</option>
                                  <option value="FAILED">Failed / Not Mated</option>
                                  <option value="PREGNANT">Pregnant (Confirmed)</option>
                                  <option value="NOT_PREGNANT">Not Pregnant</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400">Event Date</label>
                                <input
                                  type="date"
                                  value={newBreedingRecord.date}
                                  onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, date: e.target.value })}
                                  className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400">Next Action Date (e.g. Due Check)</label>
                                <input
                                  type="date"
                                  value={newBreedingRecord.nextActionDate}
                                  onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, nextActionDate: e.target.value })}
                                  className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-slate-400">Sire Tag Number (for Mating/AI) / Details</label>
                              <input
                                type="text"
                                value={newBreedingRecord.details}
                                onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, details: e.target.value })}
                                className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                placeholder="e.g. COW-001 or Sire details"
                              />
                            </div>

                            {(newBreedingRecord.type === 'MATING' || newBreedingRecord.type === 'ARTIFICIAL_INSEMINATION') && newBreedingRecord.details && (
                              (() => {
                                const sireTag = newBreedingRecord.details.trim().toUpperCase();
                                const isSelf = sireTag === selectedAnimal.tagNumber.toUpperCase();
                                const isFather = selectedAnimal.fatherTag && sireTag === selectedAnimal.fatherTag.toUpperCase();
                                const isMother = selectedAnimal.motherTag && sireTag === selectedAnimal.motherTag.toUpperCase();
                                const isSibling = animals.some(a => 
                                  a.tagNumber.toUpperCase() === sireTag && 
                                  (
                                    (a.fatherTag && selectedAnimal.fatherTag && a.fatherTag.toUpperCase() === selectedAnimal.fatherTag.toUpperCase()) || 
                                    (a.motherTag && selectedAnimal.motherTag && a.motherTag.toUpperCase() === selectedAnimal.motherTag.toUpperCase())
                                  )
                                );

                                if (isSelf || isFather || isMother || isSibling) {
                                  let relationship = "close relative";
                                  if (isSelf) relationship = "the animal itself";
                                  else if (isFather) relationship = "its pedigree Sire (Father)";
                                  else if (isMother) relationship = "its pedigree Dam (Mother)";
                                  else if (isSibling) relationship = "its sibling / half-sibling";

                                  return (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 text-amber-800 text-[11px] font-medium items-start">
                                      <AlertTriangle size={14} className="shrink-0 text-amber-500 mt-0.5" />
                                      <div>
                                        <p className="font-bold text-amber-900">âš ï¸ Inbreeding Risk Detected!</p>
                                        <p className="mt-0.5">Sire <strong>{sireTag}</strong> is identified as {relationship}. Mating close relatives increases genetic defect risks and reduces herd vigor.</p>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()
                            )}

                            <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold">
                              Log Breeding Event
                            </button>
                          </form>

                          {/* Historical breeding data */}
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Breeding & Gestation Logs</span>
                            <div className="space-y-2">
                              {selectedAnimal.breedingRecords && selectedAnimal.breedingRecords.length > 0 ? (
                                selectedAnimal.breedingRecords.map((br: any) => (
                                  <div key={br.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-1 leading-relaxed">
                                    <div className="flex justify-between items-center">
                                      <span className="font-extrabold text-slate-800">{br.type.replace(/_/g, ' ')}</span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                        br.result === 'PREGNANT' || br.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                      }`}>{br.result}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{br.details}</p>
                                    <div className="text-[9px] text-slate-400 pt-1 flex justify-between items-center">
                                      <span>Date: {new Date(br.date).toLocaleDateString()}</span>
                                      {br.nextActionDate && <span>Follow-up action: {new Date(br.nextActionDate).toLocaleDateString()}</span>}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center py-6 text-slate-400 text-xs">No breeding events logged.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB: PRODUCTION DIARIES */}
                      {animalDetailTab === 'production' && (
                        <div className="space-y-6 animate-in fade-in duration-150 text-xs">
                          {!selectedAnimalCanLogProduction ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <Package size={32} className="text-slate-400 mx-auto" />
                              <p className="text-sm font-bold text-slate-600 mt-3">Production logging unavailable</p>
                              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                This animal is recorded as male. Milk and egg production can only be logged for female livestock.
                              </p>
                            </div>
                          ) : (
                            <>
                          {/* Form to log yield */}
                          <form onSubmit={handleAddProductionRecord} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                            <h5 className="font-extrabold text-slate-800 text-xs">Log Daily Yield</h5>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {selectedAnimal.type === 'COW' || selectedAnimal.type === 'GOAT' || selectedAnimal.type === 'SHEEP' ? (
                                <div className="space-y-1">
                                  <label className="block font-bold text-slate-400">Milk Yield (Liters)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={newProductionRecord.milkYield}
                                    onChange={(e) => setNewProductionRecord({ ...newProductionRecord, milkYield: e.target.value })}
                                    className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                    placeholder="e.g. 15.5"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <label className="block font-bold text-slate-400">Egg Count</label>
                                  <input
                                    type="number"
                                    value={newProductionRecord.eggCount}
                                    onChange={(e) => setNewProductionRecord({ ...newProductionRecord, eggCount: e.target.value })}
                                    className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                    placeholder="e.g. 1"
                                  />
                                </div>
                              )}
                              
                              <div className="space-y-1">
                                <label className="block font-bold text-slate-400">Record Date</label>
                                <input
                                  type="date"
                                  value={newProductionRecord.date}
                                  onChange={(e) => setNewProductionRecord({ ...newProductionRecord, date: e.target.value })}
                                  className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-slate-400">Notes</label>
                              <input
                                type="text"
                                value={newProductionRecord.notes}
                                onChange={(e) => setNewProductionRecord({ ...newProductionRecord, notes: e.target.value })}
                                className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                                placeholder="e.g. Morning milking"
                              />
                            </div>

                            <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold">
                              Record Production Yield
                            </button>
                          </form>

                          {/* Historical yield data */}
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recent Yield Entries</span>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {selectedAnimal.productionRecords && selectedAnimal.productionRecords.length > 0 ? (
                                selectedAnimal.productionRecords.map((pr: any) => (
                                  <div key={pr.id} className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl bg-slate-50/50">
                                    <div>
                                      <strong className="text-slate-800">
                                        {pr.milkYield !== null ? `${pr.milkYield} Liters` : `${pr.eggCount} Eggs`}
                                      </strong>
                                      {pr.notes && <span className="text-slate-400 ml-2">({pr.notes})</span>}
                                    </div>
                                    <span className="text-[9px] text-slate-400">{new Date(pr.date).toLocaleDateString()}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center py-6 text-slate-400 text-xs">No yield logs cataloged.</p>
                              )}
                            </div>
                          </div>
                            </>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Bottom banner details */}
                    <div className="border-t border-slate-100 pt-4 text-center">
                      <span className="text-[10px] text-slate-400">Unique FMS system reference ID: {selectedAnimal.id}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HEALTH LOG DIRECTORY (HERD GENERAL HISTORIES) */}
          {activeTab === 'health' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200 text-xs leading-relaxed">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-base text-slate-800">General Herd Medical Registry</h4>
                  <p className="text-slate-400 text-xs">Consolidated logs of all vaccinations and treatments across your farm.</p>
                </div>
              </div>

              <div className="space-y-3">
                {allHealthLogs.length > 0 ? allHealthLogs.map((log: any, idx: number) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800">{log.title}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">{log.type}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{log.notes}</p>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          Target Animal: <span className="text-primary font-bold">{log.animalName} ({log.animalTag})</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold text-slate-700">{new Date(log.date).toLocaleDateString()}</div>
                        {log.cost > 0 && <div className="text-xs font-black text-slate-900 mt-1">KES {log.cost}</div>}
                      </div>
                    </div>
                  )) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <HeartPulse size={32} className="text-rose-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-600 mt-3">No health records yet</p>
                    <p className="text-xs text-slate-400 mt-1">Open an animal in Herd Directory to log vaccinations and treatments.</p>
                    <button onClick={() => setActiveTab('herd')} className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer">
                      Go to Herd Directory
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BREEDING & LINEAGE LOGS */}
          {activeTab === 'breeding' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200 text-xs leading-relaxed">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-base text-slate-800">Breeding & Insemination Registry</h4>
                  <p className="text-slate-400 text-xs">Tracks natural mating dates, artificial insemination batches, and pregnancy checklists.</p>
                </div>
              </div>

              <div className="space-y-3">
                {allBreedingLogs.length > 0 ? allBreedingLogs.map((log: any, idx: number) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800">{log.type.replace(/_/g, ' ')}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            log.result === 'PREGNANT' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>{log.result}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{log.details}</p>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          Target Animal: <span className="text-primary font-bold">{log.animalName} ({log.animalTag})</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold text-slate-700">{new Date(log.date).toLocaleDateString()}</div>
                        {log.nextActionDate && (
                          <div className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold mt-1">
                            Due check: {new Date(log.nextActionDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Heart size={32} className="text-pink-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-600 mt-3">No breeding records yet</p>
                    <p className="text-xs text-slate-400 mt-1">Track AI, mating, and pregnancy checks from an animal profile.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCTION LOG */}
          {activeTab === 'production' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">Milking & Layer Collections Log</h4>
                    <p className="text-xs text-slate-400 mt-1">Records grouped by animal. Filter to focus on one livestock.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="production-animal-filter" className="text-[10px] font-bold text-slate-400 uppercase">
                      Filter by animal
                    </label>
                    <select
                      id="production-animal-filter"
                      value={productionAnimalFilter}
                      onChange={(e) => setProductionAnimalFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none min-w-[180px]"
                    >
                      <option value="ALL">All animals with records</option>
                      {animals.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                          {a.name} ({a.tagNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-5">
                  {filteredProductionGroups.length > 0 ? (
                    filteredProductionGroups.map(({ animal, records }) => (
                      <div key={animal.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <LivestockTypeIcon type={animal.type} size={18} />
                            <div>
                              <p className="font-extrabold text-sm text-slate-800">{animal.name}</p>
                              <p className="text-[10px] text-slate-400">{animal.tagNumber} · {animal.type} · {records.length} record{records.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectAnimal(animal.id)}
                            className="text-[10px] font-bold text-accent hover:underline cursor-pointer"
                          >
                            View animal
                          </button>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {records.map((log: any) => (
                            <div key={log.id} className="p-3 flex justify-between items-center text-xs bg-white">
                              <div>
                                <strong className="text-slate-800">
                                  {log.milkYield !== null && log.milkYield !== undefined
                                    ? `${log.milkYield} Liters`
                                    : `${log.eggCount ?? 0} Eggs`}
                                </strong>
                                {log.notes && <p className="text-[10px] text-slate-400 mt-0.5">Notes: {log.notes}</p>}
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold">{new Date(log.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Package size={32} className="text-amber-500 mx-auto" />
                      <p className="text-sm font-bold text-slate-600 mt-3">
                        {productionAnimalFilter === 'ALL' ? 'No production logs yet' : 'No records for this animal'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Record daily milk yields or egg counts from a female animal&apos;s profile.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BOOK VETERINARIAN */}
          {activeTab === 'vet' && (
            <div className="grid md:grid-cols-3 gap-8 items-start animate-in fade-in duration-200">
              
              {/* Filter and selector panel */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-base text-slate-800">1. Select Veterinarian available in county</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">County</label>
                      <select
                        value={vetFilterCounty}
                        onChange={(e) => setVetFilterCounty(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-slate-50"
                      >
                        {countiesData.map((c) => (
                          <option key={c.county_code} value={c.county_name}>
                            {c.county_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Specialization</label>
                      <select
                        value={vetFilterSpecialization}
                        onChange={(e) => setVetFilterSpecialization(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-slate-50"
                      >
                        <option value="Cattle & Goats">Cattle & Goats</option>
                        <option value="Poultry & Pigs">Poultry & Pigs</option>
                        <option value="Large Mammals">Large Mammals</option>
                        <option value="General Diagnostics">General Diagnostics</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {vetsList.length > 0 ? (
                      vetsList.map((vet) => (
                        <div 
                          key={vet.id} 
                          onClick={() => setSelectedVetId(String(vet.id))}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center ${
                            selectedVetId === String(vet.id)
                              ? 'border-accent bg-emerald-50/30'
                              : 'border-slate-100 bg-white hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-1 text-xs">
                            <h5 className="font-extrabold text-slate-800">{vet.name}</h5>
                            <p className="text-slate-400">{vet.qualification}</p>
                            <div className="text-[10px] text-primary font-bold">Speciality: {vet.specialization}</div>
                            <div className="text-[10px] text-slate-400">Lic No: {vet.licenseNumber}</div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold border border-slate-200">
                              {vet.county}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-2 font-medium">{vet.phone}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-slate-400 text-xs bg-slate-50/50 rounded-2xl">
                        No veterinarians found matching search criteria.
                      </p>
                    )}
                  </div>
                </div>

                {/* Booking status history */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-base text-slate-800">Booking Status History</h4>
                  
                  <div className="space-y-3">
                    {appointments.map((appt) => (
                      <div key={appt.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800">Doctor visit for {appt.animal.name}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              appt.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              appt.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              'bg-gray-100 text-gray-800'
                            }`}>{appt.status}</span>
                          </div>
                          <p className="text-slate-500 mt-1">Symptoms: {appt.symptoms}</p>
                          <div className="text-[10px] text-slate-400">
                            Assigned Doc: <strong className="text-slate-600">{appt.veterinarian.name} ({appt.veterinarian.phone})</strong>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0 text-xs">
                          <span className="font-bold text-slate-700">{new Date(appt.preferredDate).toLocaleDateString()}</span>
                          {appt.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelAppointment(appt.id)}
                              className="block mt-2 text-[10px] font-bold text-rose-600 hover:underline text-right w-full cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wizard Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-xs leading-relaxed">
                <h4 className="font-extrabold text-base text-slate-800">2. Fill Booking Particulars</h4>
                
                {activePlan === 'BASIC' ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs space-y-2.5">
                    <h5 className="font-bold text-amber-900 flex items-center gap-1">
                      <AlertTriangle size={14} /> Vet Booking Locked
                    </h5>
                    <p>Veterinarian access requires a Standard or Premium subscription. You are currently on the Basic plan.</p>
                    <button 
                      onClick={() => setActiveTab('billing')}
                      className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold w-full mt-2 cursor-pointer"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookAppointment} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Target Animal</label>
                      <select
                        required
                        value={bookingAnimalId}
                        onChange={(e) => setBookingAnimalId(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      >
                        <option value="">-- Choose Animal --</option>
                        {animals.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.tagNumber})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Urgency level</label>
                      <select
                        value={bookingUrgency}
                        onChange={(e) => setBookingUrgency(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      >
                        <option value="LOW">Low (Routine Checkup)</option>
                        <option value="MEDIUM">Medium (Symptoms present)</option>
                        <option value="HIGH">High (Emergency)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Describe Symptoms</label>
                      <textarea
                        required
                        value={bookingSymptoms}
                        onChange={(e) => setBookingSymptoms(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none h-24 resize-none"
                        placeholder="e.g. Diarrhea, loss of appetite, lethargy..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Book Doctor Visit
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS MODULE */}
          {activeTab === 'reports' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Reports configuration controls */}
              <div className="grid md:grid-cols-2 gap-8 no-print">
                {/* Individual printable animal card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-xs">
                  <h4 className="font-extrabold text-base text-slate-800">Individual Animal Health Ledger</h4>
                  <p className="text-slate-400">Generates a detailed medical and pedigree tree certificate ready for print or PDF download.</p>
                  
                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Select Animal</label>
                      <select
                        value={selectedAnimalReportId}
                        onChange={(e) => setSelectedAnimalReportId(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      >
                        <option value="">-- Choose Animal --</option>
                        {animals.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.tagNumber})</option>
                        ))}
                      </select>
                    </div>

                    {selectedAnimalReportId && (
                      <button
                        onClick={() => window.print()}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Printer size={14} />
                        <span>Print Animal Report</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Farm Summary printable card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">Farm Performance Summary</h4>
                    <p className="text-slate-400">Aggregates herd counts, total milk outputs, financial consult fees, and active medical alerts.</p>
                  </div>
                  
                  <button
                    onClick={() => { setSelectedAnimalReportId(''); window.print(); }}
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-6"
                  >
                    <Printer size={14} />
                    <span>Print Overall Farm Summary</span>
                  </button>

                  <button
                    onClick={handleExportHerdCsv}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-primary border border-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-3"
                  >
                    <Download size={14} />
                    <span>Export Herd Inventory (CSV)</span>
                  </button>
                </div>
              </div>

              {/* PRINTABLE COMPONENT VIEW LAYOUT (Rendered hidden in web, styled for print only) */}
              <div className="print-only hidden print:block print-container border border-slate-100 bg-white p-8 rounded-3xl text-sm leading-relaxed">
                {selectedAnimalReportId ? (
                  // Printable View: Individual Animal
                  (() => {
                    const rptAnimal = animals.find(a => String(a.id) === String(selectedAnimalReportId));
                    if (!rptAnimal) return <p>Report animal not found.</p>;
                    return (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4">
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase">Animal Ledger Certificate</h2>
                            <p className="text-xs text-slate-400 font-bold tracking-wider mt-0.5">FMS PLATFORM REPORT</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/dashboard?animalTag=' + rptAnimal.tagNumber : 'http://localhost:3000/dashboard?animalTag=' + rptAnimal.tagNumber)}`} 
                              alt="Animal QR Code" 
                              className="w-14 h-14 border border-slate-200 p-1 bg-white rounded-lg"
                            />
                            <Users size={28} className="text-emerald-700" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                          <div>
                            <h3 className="font-bold text-slate-500 text-xs uppercase">Animal Identity</h3>
                            <div className="space-y-1.5 mt-2 text-xs">
                              <p>Name: <strong>{rptAnimal.name}</strong></p>
                              <p>Tag Number: <strong>{rptAnimal.tagNumber}</strong></p>
                              <p>Type: <strong>{rptAnimal.type}</strong></p>
                              <p>Breed: <strong>{rptAnimal.breed}</strong></p>
                              <p>Gender: <strong>{rptAnimal.gender}</strong></p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-500 text-xs uppercase">Herd Records</h3>
                            <div className="space-y-1.5 mt-2 text-xs">
                              <p>Date of Birth: <strong>{new Date(rptAnimal.dob).toLocaleDateString()}</strong></p>
                              <p>Coloring: <strong>{rptAnimal.color}</strong></p>
                              <p>Registered Weight: <strong>{rptAnimal.weight} kg</strong></p>
                              <p>Pedigree Sire: <strong>{rptAnimal.fatherTag || 'N/A'}</strong></p>
                              <p>Pedigree Dam: <strong>{rptAnimal.motherTag || 'N/A'}</strong></p>
                            </div>
                          </div>
                        </div>

                        {/* Health logs print section */}
                        <div className="space-y-3 pb-4 border-b border-slate-200">
                          <h4 className="font-bold text-slate-700 text-xs uppercase">Lifetime Health History</h4>
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-300 bg-slate-100">
                                <th className="p-2">Date</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Details</th>
                                <th className="p-2 text-right">Expenses (KES)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rptAnimal.healthRecords && rptAnimal.healthRecords.length > 0 ? (
                                rptAnimal.healthRecords.map((hr: any) => (
                                  <tr key={hr.id} className="border-b border-slate-100">
                                    <td className="p-2">{new Date(hr.date).toLocaleDateString()}</td>
                                    <td className="p-2 font-semibold text-[10px]">{hr.type}</td>
                                    <td className="p-2">{hr.title} - {hr.notes}</td>
                                    <td className="p-2 text-right font-medium">{hr.cost > 0 ? `KES ${hr.cost}` : '0.00'}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="p-2 text-center text-slate-400">No medical events logged.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // Printable View: Farm Summary
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase">Farm Summary Report</h2>
                        <p className="text-xs text-slate-400 font-bold tracking-wider mt-0.5">{user.farm?.name}</p>
                      </div>
                      <Users size={28} className="text-emerald-700" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-200 text-center">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Herd Size</span>
                        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{animals.length} animals</h4>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Medical Issues</span>
                        <h4 className="text-xl font-extrabold text-rose-600 mt-1">{sickAnimals} sick</h4>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Active Plan</span>
                        <h4 className="text-xl font-extrabold text-emerald-700 mt-1">{activePlan}</h4>
                      </div>
                    </div>

                    {/* Breakdown by type table */}
                    <div className="space-y-3 pb-4 border-b border-slate-200">
                      <h4 className="font-bold text-slate-700 text-xs uppercase">Herd Inventory Mix</h4>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-100">
                            <th className="p-2">Animal Class</th>
                            <th className="p-2">Total Count</th>
                            <th className="p-2">Average Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['COW', 'GOAT', 'SHEEP', 'POULTRY', 'PIG'].map((type) => {
                            const subHerd = animals.filter(a => a.type === type);
                            if (subHerd.length === 0) return null;
                            const avgWeight = Math.round(subHerd.reduce((sum, a) => sum + a.weight, 0) / subHerd.length);
                            return (
                              <tr key={type} className="border-b border-slate-100">
                                <td className="p-2 font-bold">{type}</td>
                                <td className="p-2">{subHerd.length} head</td>
                                <td className="p-2">{avgWeight} kg</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: BILLING & PLANS */}
          {activeTab === 'billing' && (
            <BillingPanel
              activePlan={activePlan}
              isSubscribed={isSubscribed}
              user={user}
              subscriptionDaysLeft={subscriptionDaysLeft}
              billingPhone={billingPhone}
              setBillingPhone={setBillingPhone}
              billingPaying={billingPaying}
              selectedBillingPlan={selectedBillingPlan}
              setSelectedBillingPlan={setSelectedBillingPlan}
              paymentSuccess={paymentSuccess}
              billingError={billingError}
              setBillingError={setBillingError}
              showMpesaSimulator={showMpesaSimulator}
              onPay={handlePaySubscription}
              refreshTrigger={billingRefreshKey}
            />
          )}

          {/* TAB 9: LEARNING CENTER EMBED */}
          {activeTab === 'learning' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {learningResources.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    {item.contentType === 'VIDEO' && item.contentUrl ? (
                      <div className="aspect-video w-full bg-black relative border-b border-slate-100">
                        <iframe
                          width="100%"
                          height="100%"
                          src={item.contentUrl}
                          title={item.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="aspect-[2.2/1] w-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-slate-300 border-b border-slate-100">
                        <BookOpen size={48} className="text-accent" />
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                            {item.contentType === 'VIDEO' ? <Video size={12} /> : <BookOpen size={12} />}
                            <span>{item.contentType}</span>
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-800 text-base mt-3 leading-snug">
                          {item.title}
                        </h3>
                        
                        {item.contentBody && (
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            {item.contentBody}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-50 text-[10px] text-slate-400 flex justify-between items-center">
                        <span>Admin Upload</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: FINANCIAL LEDGER */}
          {activeTab === 'financials' && (
            <FinancialDashboardPanel
              transactions={transactions}
              showAddTransaction={showAddTransaction}
              setShowAddTransaction={setShowAddTransaction}
              newTransaction={newTransaction}
              setNewTransaction={setNewTransaction}
              onSubmitTransaction={handleSubmitTransaction}
            />
          )}

          {/* TAB 11: INVENTORY & STOCK */}
          {activeTab === 'inventory' && (
            <div className="space-y-8 animate-in fade-in duration-200 text-xs">
              {/* Inventory summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(() => {
                  const lowStockCount = inventoryItems.filter(i => i.quantity <= i.lowStockThreshold).length;
                  const expiredCount = inventoryItems.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date()).length;
                  return (
                    <>
                      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Catalog Items</span>
                        <h3 className="text-2xl font-black text-slate-800">{inventoryItems.length} Products</h3>
                        <p className="text-[10px] text-slate-400">Total distinct inventory rows</p>
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Stock Alerts</span>
                        <h3 className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-800'}`}>{lowStockCount} Items</h3>
                        <p className="text-[10px] text-slate-400">Items below threshold limits</p>
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expired Products</span>
                        <h3 className={`text-2xl font-black ${expiredCount > 0 ? 'text-rose-500' : 'text-slate-800'}`}>{expiredCount} Vaccines/Meds</h3>
                        <p className="text-[10px] text-slate-400">Vaccines/drugs past expiry dates</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Warnings panel */}
              {(() => {
                const lowStockList = inventoryItems.filter(i => i.quantity <= i.lowStockThreshold);
                const expiredList = inventoryItems.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date());
                if (lowStockList.length > 0 || expiredList.length > 0) {
                  return (
                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 space-y-3 leading-relaxed">
                      <h5 className="font-extrabold text-rose-800 text-sm flex items-center gap-1">
                        <AlertCircle size={16} />
                        <span>Critical Safety Warnings</span>
                      </h5>
                      <ul className="space-y-2 text-rose-700 text-xs">
                        {lowStockList.map(item => (
                          <li key={item.id} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span><strong>{item.name}</strong> is low or out of stock! Current: {item.quantity} {item.unit} (Threshold: {item.lowStockThreshold} {item.unit})</span>
                          </li>
                        ))}
                        {expiredList.map(item => (
                          <li key={item.id} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                            <span><strong>{item.name}</strong> expired on {new Date(item.expiryDate).toLocaleDateString()}! Dispose of safely and replace immediately.</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Main inventory lists & forms */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* List table */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                  <h4 className="font-extrabold text-base text-slate-800">Inventory Directory</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                          <th className="p-2">Item Name</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Current Stock</th>
                          <th className="p-2">Supplier</th>
                          <th className="p-2">Expiry Date</th>
                          <th className="p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryItems.length > 0 ? (
                          inventoryItems.map((item: any) => {
                            const isLow = item.quantity <= item.lowStockThreshold;
                            const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                            return (
                              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="p-2 font-extrabold text-slate-800">{item.name}</td>
                                <td className="p-2 text-slate-500 font-semibold">{item.category}</td>
                                <td className="p-2">
                                  <span className={`px-2 py-0.5 rounded font-extrabold ${
                                    isLow ? 'bg-amber-100 text-amber-800 font-black' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {item.quantity} {item.unit}
                                  </span>
                                </td>
                                <td className="p-2 text-slate-400">{item.supplier || 'N/A'}</td>
                                <td className={`p-2 ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-2">
                                  <button 
                                    onClick={() => {
                                      setNewInventory({
                                        id: String(item.id),
                                        name: item.name,
                                        category: item.category,
                                        quantity: String(item.quantity),
                                        unit: item.unit,
                                        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
                                        lowStockThreshold: String(item.lowStockThreshold),
                                        supplier: item.supplier || '',
                                        cost: String(item.cost || ''),
                                        recordExpense: false,
                                      });
                                    }}
                                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-bold cursor-pointer"
                                  >
                                    Adjust Stock
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">No inventory logged yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form to restock / add */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-base text-slate-800">
                    {newInventory.id ? 'Adjust Stock Level' : 'Add New Inputs'}
                  </h4>
                  <p className="text-slate-400">Log feed bags, dewormers, vaccines, or milking machine spares into inventory.</p>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newInventory.name || !newInventory.quantity) return alert('Fill name and quantity');
                    try {
                      const res = await fetch('/api/inventory', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newInventory),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setNewInventory({
                          id: '',
                          name: '',
                          category: 'FEED',
                          quantity: '',
                          unit: 'bags',
                          expiryDate: '',
                          lowStockThreshold: '',
                          supplier: '',
                          cost: '',
                          recordExpense: true,
                        });
                        loadDashboardData();
                        alert('Inventory stock updated successfully!');
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Item Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Dairy Meal Concentrates"
                        value={newInventory.name}
                        onChange={(e) => setNewInventory({ ...newInventory, name: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Category</label>
                        <select 
                          value={newInventory.category}
                          onChange={(e) => setNewInventory({ ...newInventory, category: e.target.value })}
                          className="block w-full px-2 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        >
                          <option value="FEED">Feed & Nutrition</option>
                          <option value="DRUG">Dewormers / Drugs</option>
                          <option value="VACCINE">Vaccines</option>
                          <option value="EQUIPMENT">Equipment Spares</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Storage Unit</label>
                        <select 
                          value={newInventory.unit}
                          onChange={(e) => setNewInventory({ ...newInventory, unit: e.target.value })}
                          className="block w-full px-2 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        >
                          <option value="bags">Bags</option>
                          <option value="vials">Vials</option>
                          <option value="bottles">Bottles</option>
                          <option value="units">Units / Pcs</option>
                          <option value="liters">Liters</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Quantity</label>
                        <input 
                          type="number"
                          step="0.1"
                          placeholder="Current quantity"
                          value={newInventory.quantity}
                          onChange={(e) => setNewInventory({ ...newInventory, quantity: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Safety Limit (Low Stock)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 5"
                          value={newInventory.lowStockThreshold}
                          onChange={(e) => setNewInventory({ ...newInventory, lowStockThreshold: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Expiry Date (Meds/Feeds)</label>
                      <input 
                        type="date"
                        value={newInventory.expiryDate}
                        onChange={(e) => setNewInventory({ ...newInventory, expiryDate: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Supplier Name</label>
                        <input 
                          type="text"
                          placeholder="Manufacturer/Agrovet"
                          value={newInventory.supplier}
                          onChange={(e) => setNewInventory({ ...newInventory, supplier: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Cost per Unit (KES)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 2500"
                          value={newInventory.cost}
                          onChange={(e) => setNewInventory({ ...newInventory, cost: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        />
                      </div>
                    </div>

                    {!newInventory.id && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="recordExpense"
                          checked={newInventory.recordExpense}
                          onChange={(e) => setNewInventory({ ...newInventory, recordExpense: e.target.checked })}
                          className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="recordExpense" className="font-bold text-slate-500 select-none cursor-pointer">
                          Link to financial ledger (Log expense)
                        </label>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all cursor-pointer shadow-md text-xs">
                        Save Item
                      </button>
                      {newInventory.id && (
                        <button 
                          type="button"
                          onClick={() => {
                            setNewInventory({
                              id: '',
                              name: '',
                              category: 'FEED',
                              quantity: '',
                              unit: 'bags',
                              expiryDate: '',
                              lowStockThreshold: '',
                              supplier: '',
                              cost: '',
                              recordExpense: true,
                            });
                          }}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: DEWORMING & VACCINATION SCHEDULER */}
          {activeTab === 'scheduler' && (
            <div className="space-y-8 animate-in fade-in duration-200 text-xs">
              
              {/* Task summary header */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-800">Vaccination & Deworming Planner</h4>
                  <p className="text-slate-400 text-xs">Schedule upcoming treatments. When tasks are checked off, animal health charts and expenses update automatically.</p>
                </div>
                <button 
                  onClick={() => setShowAddSchedule(!showAddSchedule)}
                  className="px-3.5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md text-xs shrink-0"
                >
                  <Plus size={14} />
                  <span>Create Schedule Task</span>
                </button>
              </div>

              {/* Main scheduler layouts */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Checklist column */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                  <h4 className="font-extrabold text-base text-slate-800">Active Planner Tasks</h4>
                  
                  <div className="space-y-4">
                    {scheduleEvents.length > 0 ? (
                      scheduleEvents.map((evt: any) => {
                        const isOverdue = !evt.completed && new Date(evt.dueDate) < new Date();
                        return (
                          <div key={evt.id} className={`p-4 border rounded-2xl flex items-start gap-4 transition-all ${
                            evt.completed ? 'bg-slate-50/50 border-slate-100 opacity-65' : 
                            isOverdue ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}>
                            {/* Checkbox button */}
                            <button
                              onClick={async () => {
                                if (evt.completed) return; // already completed
                                const costStr = prompt('Enter execution cost (KES) if any:', '0');
                                if (costStr === null) return; // cancelled prompt
                                const notesStr = prompt('Enter treatment batch / execution notes:', evt.notes || '');
                                if (notesStr === null) return;
                                
                                try {
                                  const res = await fetch('/api/scheduler', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      id: evt.id,
                                      completed: true,
                                      notes: notesStr,
                                      cost: costStr,
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    loadDashboardData();
                                    alert('Task marked as completed! Health records and finances synced.');
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                                evt.completed ? 'bg-primary border-primary text-white' : 
                                isOverdue ? 'border-rose-300 hover:bg-rose-50/50' : 'border-slate-300 hover:bg-slate-50'
                              } cursor-pointer`}
                              disabled={evt.completed}
                            >
                              {evt.completed && <Check size={14} className="stroke-[3]" />}
                            </button>

                            <div className="flex-1 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-800">{evt.title}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  evt.type === 'VACCINATION' ? 'bg-blue-100 text-blue-800' : 
                                  evt.type === 'DEWORMING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {evt.type}
                                </span>
                                {isOverdue && <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-extrabold animate-pulse">OVERDUE</span>}
                              </div>

                              <p className="text-slate-500 text-xs">{evt.notes || 'No description notes provided.'}</p>
                              
                              <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-slate-50">
                                <span>Target Animal: <strong className="text-slate-700">{evt.animal ? `${evt.animal.name} (${evt.animal.tagNumber})` : 'Herd-wide'}</strong></span>
                                <span>Due Date: <strong className="text-slate-700">{new Date(evt.dueDate).toLocaleDateString()}</strong></span>
                                {evt.completed && <span>Completed on: <strong className="text-emerald-700">{new Date(evt.completedDate || evt.createdAt).toLocaleDateString()}</strong></span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center py-10 text-slate-400">No scheduled tasks logged.</p>
                    )}
                  </div>
                </div>

                {/* Form to add schedule */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-base text-slate-800">Add Reminder Task</h4>
                  <p className="text-slate-400">Create routine calendar schedules to prevent outbreaks.</p>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newSchedule.title || !newSchedule.dueDate) return alert('Enter title and due date');
                    try {
                      const res = await fetch('/api/scheduler', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newSchedule),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setNewSchedule({ animalId: '', type: 'VACCINATION', title: '', dueDate: '', notes: '' });
                        loadDashboardData();
                        alert('Reminder task scheduled!');
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Task Title</label>
                      <input 
                        type="text"
                        placeholder="e.g. Foot and Mouth Booster Shot"
                        value={newSchedule.title}
                        onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Reminder Type</label>
                        <select 
                          value={newSchedule.type}
                          onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value })}
                          className="block w-full px-2 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        >
                          <option value="VACCINATION">Vaccination</option>
                          <option value="DEWORMING">Deworming</option>
                          <option value="OTHER">Other Task</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Target Animal</label>
                        <select 
                          value={newSchedule.animalId}
                          onChange={(e) => setNewSchedule({ ...newSchedule, animalId: e.target.value })}
                          className="block w-full px-2 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        >
                          <option value="">-- Choose Animal --</option>
                          {animals.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.tagNumber})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Scheduled Due Date</label>
                      <input 
                        type="date"
                        value={newSchedule.dueDate}
                        onChange={(e) => setNewSchedule({ ...newSchedule, dueDate: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400">Instructions / Notes</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Administer 10ml dosage intramusculary"
                        value={newSchedule.notes}
                        onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      />
                    </div>

                    <button type="submit" className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all cursor-pointer shadow-md text-xs">
                      Save Scheduled Event
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: WORKER DIRECTORY */}
          {activeTab === 'workers' && (
            <div className="space-y-8 animate-in fade-in duration-200 text-xs">
              
              {/* Workers operations widgets */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Worker profiles management list */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-base text-slate-800">Farm Workers & Staff</h4>
                    <button 
                      onClick={() => setShowAddWorker(!showAddWorker)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <Plus size={12} />
                      <span>Register Worker</span>
                    </button>
                  </div>

                  {showAddWorker && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newWorker.name || !newWorker.role) return alert('Fill name and role');
                      try {
                        const res = await fetch('/api/workers', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'ADD_WORKER', ...newWorker }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setNewWorker({ name: '', role: '', phone: '' });
                          setShowAddWorker(false);
                          loadDashboardData();
                          alert('Staff worker registered successfully!');
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                      <h5 className="font-extrabold text-slate-800 text-xs">New Worker Profile</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400">Full Name</label>
                          <input 
                            type="text"
                            placeholder="e.g. Jane Mwangi"
                            value={newWorker.name}
                            onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400">Role / Title</label>
                          <input 
                            type="text"
                            placeholder="e.g. Milker & Feeder"
                            value={newWorker.role}
                            onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Phone Number</label>
                        <input 
                          type="text"
                          placeholder="e.g. +254712345678"
                          value={newWorker.phone}
                          onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                        />
                      </div>
                      <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold">
                        Add to Farm Roster
                      </button>
                    </form>
                  )}

                  {editingWorker && (
                    <form onSubmit={handleUpdateWorker} className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-slate-800 text-xs">Edit Worker Profile</h5>
                        <button
                          type="button"
                          onClick={() => setEditingWorker(null)}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400">Full Name</label>
                          <input
                            type="text"
                            value={editWorkerForm.name}
                            onChange={(e) => setEditWorkerForm({ ...editWorkerForm, name: e.target.value })}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400">Role / Title</label>
                          <input
                            type="text"
                            value={editWorkerForm.role}
                            onChange={(e) => setEditWorkerForm({ ...editWorkerForm, role: e.target.value })}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400">Phone Number</label>
                          <input
                            type="text"
                            value={editWorkerForm.phone}
                            onChange={(e) => setEditWorkerForm({ ...editWorkerForm, phone: e.target.value })}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400">Status</label>
                          <select
                            value={editWorkerForm.status}
                            onChange={(e) => setEditWorkerForm({ ...editWorkerForm, status: e.target.value })}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold">
                        Save Changes
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {workers.length > 0 ? (
                      workers.map((worker: any) => (
                        <div key={worker.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center gap-3 bg-slate-50/50">
                          <div>
                            <span className="font-extrabold text-sm text-slate-800">{worker.name}</span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              <span>Role: <strong className="text-slate-600">{worker.role}</strong></span>
                              {worker.phone && <span className="ml-3">Phone: <strong className="text-slate-600">{worker.phone}</strong></span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                              {worker.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEditWorker(worker)}
                              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                              title="Edit worker"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWorker(worker.id, worker.name)}
                              className="p-2 rounded-lg border border-rose-100 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer"
                              title="Delete worker"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-slate-400">No staff workers registered.</p>
                    )}
                  </div>
                </div>

                {/* Assign Task board & forms */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-base text-slate-800">Assign Tasks</h4>
                    <button 
                      onClick={() => setShowAssignTask(!showAssignTask)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <Plus size={12} />
                      <span>New Task Assignment</span>
                    </button>
                  </div>

                  {showAssignTask && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newTask.workerId || !newTask.taskName || !newTask.dueDate) return alert('Fill worker, task name, and due date');
                      try {
                        const res = await fetch('/api/workers', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'ASSIGN_TASK', ...newTask }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setNewTask({ workerId: '', taskName: '', description: '', dueDate: '' });
                          setShowAssignTask(false);
                          loadDashboardData();
                          alert('Task assigned successfully!');
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                      <h5 className="font-extrabold text-slate-800 text-xs">New Task Assignment</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400">Select Worker</label>
                          <select 
                            value={newTask.workerId}
                            onChange={(e) => setNewTask({ ...newTask, workerId: e.target.value })}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                          >
                            <option value="">-- Choose Worker --</option>
                            {workers.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400">Due Date</label>
                          <input 
                            type="date"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Task Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. Clean feed bunks"
                          value={newTask.taskName}
                          onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400">Task Details</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Clean morning milking bay and sanitize milking claws"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                        />
                      </div>
                      <button type="submit" className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold">
                        Assign Staff Task
                      </button>
                    </form>
                  )}

                  {/* Task list board */}
                  <div className="space-y-3">
                    {workers.flatMap(w => (w.tasks || []).map((t: any) => ({ ...t, workerName: w.name }))).length > 0 ? (
                      workers.flatMap(w => (w.tasks || []).map((t: any) => ({ ...t, workerName: w.name })))
                        .map((task: any) => (
                          <div key={task.id} className={`p-4 border rounded-2xl flex items-start gap-3 transition-all ${
                            task.status === 'COMPLETED' ? 'bg-slate-50/50 border-slate-100 opacity-65' : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}>
                            <button
                              onClick={async () => {
                                const nextStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
                                try {
                                  const res = await fetch('/api/workers', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ taskId: task.id, status: nextStatus }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    loadDashboardData();
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                                task.status === 'COMPLETED' ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-300 hover:bg-slate-50'
                              } cursor-pointer`}
                            >
                              {task.status === 'COMPLETED' && <Check size={12} className="stroke-[3]" />}
                            </button>
                            <div className="flex-1 space-y-1">
                              <span className={`font-extrabold text-sm text-slate-800 ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>{task.taskName}</span>
                              <p className="text-slate-400 text-xs">{task.description}</p>
                              <div className="text-[10px] text-slate-400 pt-1.5 flex justify-between items-center border-t border-slate-50">
                                <span>Assigned to: <strong className="text-slate-600">{task.workerName}</strong></span>
                                <span>Due: <strong className="text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</strong></span>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center py-6 text-slate-400">No tasks assigned yet.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: PROFILE & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl">
                    <Settings size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-800">Profile & Account Settings</h4>
                    <p className="text-xs text-slate-400">Update your contact details and password</p>
                  </div>
                </div>

                {profileMessage && (
                  <div className={`text-xs p-3.5 rounded-xl border ${
                    profileMessage.includes('success')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {profileMessage}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-500 uppercase text-[10px]">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-500 uppercase text-[10px]">Phone</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        placeholder="0712345678"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase text-[10px]">Email (read-only)</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-500 uppercase text-[10px]">County</label>
                      <select
                        value={profileForm.county}
                        onChange={(e) => setProfileForm({ ...profileForm, county: e.target.value })}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      >
                        {countiesData.map((c) => (
                          <option key={c.county_code} value={c.county_name}>{c.county_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-500 uppercase text-[10px]">Sub County</label>
                      <input
                        type="text"
                        value={profileForm.subCounty}
                        onChange={(e) => setProfileForm({ ...profileForm, subCounty: e.target.value })}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h5 className="font-extrabold text-sm text-slate-800">Change Password</h5>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-500 uppercase text-[10px]">Current Password</label>
                      <input
                        type="password"
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                        className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase text-[10px]">New Password</label>
                        <input
                          type="password"
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                          className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase text-[10px]">Confirm New Password</label>
                        <input
                          type="password"
                          value={profileForm.confirmPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                          className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* M-Pesa Callback Webhook Simulator Portal Dialog */}
      {showMpesaSimulator && (
        <MpesaSimulator
          checkoutRequestId={checkoutRequestId}
          planName={payingPlan}
          amount={payingAmount}
          onSuccess={() => {
            setShowMpesaSimulator(false);
            const activatedPlan = payingPlan || selectedBillingPlan || 'STANDARD';
            const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            setPaymentSuccess({
              plan: activatedPlan,
              expiresAt: expires.toISOString(),
            });
            refreshSession();
            setBillingRefreshKey((k) => k + 1);
            setActiveTab('billing');
          }}
          onFailure={(msg) => {
            setShowMpesaSimulator(false);
            setBillingError(`Payment cancelled or rejected: ${msg}`);
            setBillingRefreshKey((k) => k + 1);
          }}
          onClose={() => setShowMpesaSimulator(false)}
        />
      )}

    </div>
  );
}
