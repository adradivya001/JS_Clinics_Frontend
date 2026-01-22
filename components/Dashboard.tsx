import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, CalendarDays, Users, TrendingUp, Settings,
  Search, Bell, LogOut, ChevronDown, UserCheck
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { DashboardHome } from './DashboardHome';
import { AnalyticsView } from './AnalyticsView';
import { LeadsView } from './LeadsView';
import { AppointmentsView } from './AppointmentsView';
import { PatientsView } from './PatientsView';
import { SettingsView } from './SettingsView';
import { PatientProfile } from './PatientProfile';
import { RescheduleModal, Toast, CheckInModal, AddLeadModal } from './Modals';
import { Appointment, Lead, DashboardProps, UserRole, Patient } from '../types';
import { api } from '../services/api';
import { DOCTORS } from '../constants';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leadsFilter, setLeadsFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [profileInitialTab, setProfileInitialTab] = useState<string>('overview');

  // --- Mock State ---
  // --- API State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // --- Refresh Trigger ---
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsData, leadsData, patientsData] = await Promise.all([
          api.getAppointments({ date: new Date().toISOString().split('T')[0], doctor_id: 'dr_sireesha' }),
          api.getLeads(),
          api.getPatients()
        ]);

        // Mock Data for Fallback
        // Mock Data for Fallback (Removed in favor of DOCTORS constant)


        // Create Patient Map
        const patientItems = patientsData?.data?.items ?? [];
        const patientMap = new Map();
        if (Array.isArray(patientItems)) {
          patientItems.forEach((p: any) => patientMap.set(p.id, p.name));
        }

        // Create Lead Map (renamed to avoid conflict)
        const leadLookupItems = leadsData?.data?.items ?? [];
        const leadMap = new Map();
        if (Array.isArray(leadLookupItems)) {
          leadLookupItems.forEach((l: any) => leadMap.set(l.id, l.name));
        }

        // Normalize Appointments
        const apptItems = apptsData?.data?.items ?? [];
        const mappedAppts: Appointment[] = Array.isArray(apptItems) ? apptItems.map((item: any) => {
          // patient_name might be missing or 'Unknown', so handle explicitly
          let resolvedName = item.patient_name_snapshot || item.patient_name || item.patientName || item.name;

          if (!resolvedName || resolvedName === 'Unknown') {
            if (item.patient_id || item.patientId) {
              resolvedName = patientMap.get(item.patient_id || item.patientId);
            }
          }

          if (!resolvedName || resolvedName === 'Unknown') {
            // Fallback: check linked lead (via lead_id if present) or try matching patient_id to a lead
            resolvedName = leadMap.get(item.lead_id) || leadMap.get(item.patient_id || item.patientId) || 'Unknown';
          }

          const docId = item.doctor_id || item.doctorId;
          // Robust Doctor Name Resolution
          // Check: doctor_name_snapshot -> doctor_name -> doctorName -> consultant -> MOCK lookup -> 'Unknown'
          let resolvedDocName = item.doctor_name_snapshot || item.doctor_name || item.doctorName || item.consultant;

          if (!resolvedDocName || resolvedDocName === 'Unknown') {
            resolvedDocName = DOCTORS.find(d => d.id === docId)?.name || 'Unknown';
          }

          // Final fallback for demo if ID exists but name failed (prevent 'Unknown' for valid-looking IDs)
          if ((!resolvedDocName || resolvedDocName === 'Unknown') && docId) {
            const found = DOCTORS.find(d => d.id === docId);
            if (found) resolvedDocName = found.name;
          }

          return {
            id: item.id,
            patientName: resolvedName,
            doctorName: resolvedDocName,
            doctorId: docId,
            patientId: item.patient_id || item.patientId,
            time: item.start_time || item.time,
            date: item.appointment_date || item.date,
            type: item.type,
            status: item.status,
            resourceId: item.resource_id
          };
        }) : [];
        // Seed Mock Data if Empty (Removed)
        // if (mappedAppts.length === 0) { ... }

        setAppointments(mappedAppts);

        // Normalize Leads
        const leadItems = leadsData?.data?.items ?? [];
        const mappedLeads: Lead[] = Array.isArray(leadItems) ? leadItems.map((item: any) => ({
          ...item,
          id: item.id,
          name: item.name,
          phone: item.phone,
          // Robust Source Check
          source: item.source || item.Source || item.referral_source || item.lead_source || 'Walk-In',
          inquiry: item.inquiry,
          status: item.status,
          dateAdded: item.created_at || item.dateAdded || new Date().toISOString(),

          // Map snake_case backend fields to frontend camelCase (Robust)
          age: item.age || item.Age ? String(item.age || item.Age) : undefined,
          gender: item.gender || item.Gender || item.sex,
          problem: item.problem || item.Problem || item.presenting_problem,
          treatmentDoctor: item.treatment_doctor || item.treatmentDoctor || item.camp_doctor || item.CampDoctor,
          treatmentSuggested: item.treatment_suggested || item.treatmentSuggested || item.suggested_tx || item.SuggestedTx
        })) : [];
        console.log('Raw Leads Data (for debugging):', leadItems[0]); // Debug log
        setLeads(mappedLeads);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchData();
  }, [userRole, refreshTrigger]);

  // Refetch data when navigating to the main dashboard view to ensure fresh data
  useEffect(() => {
    if (
      location.pathname === '/dashboard' ||
      location.pathname === '/dashboard/' ||
      location.pathname === '/dashboard/leads'
    ) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [location.pathname]);

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGlobalSearch = () => {
    showToast(`Searching for: "${globalSearch}"...`);
  };

  // --- Derived State ---
  const leadsInCROQueue = leads.filter(l => l.status === 'Stalling - Sent to CRO').length;
  const leadsConvertedToday = leads.filter(l => l.status === 'Converted - Active Patient').length;

  // --- Handlers ---
  const handleCheckIn = (id: string) => {
    setCheckInId(id);
  };

  const handleCheckInConfirm = async (data: { visitType: string; remarks: string }) => {
    if (checkInId) {
      try {
        await api.updateAppointmentStatus(checkInId, { status: 'Checked-In' });
        setAppointments(prev => prev.map(a => a.id === checkInId ? { ...a, status: 'Checked-In' } : a));
        showToast(`Checked in ${appointments.find(a => a.id === checkInId)?.patientName}`);
        setCheckInId(null);
      } catch (e) {
        console.error(e);
        showToast('Failed to check in');
      }
    }
  };

  const handleRescheduleConfirm = async (date: string, time: string) => {
    if (rescheduleId) {
      try {
        const appt = appointments.find(a => a.id === rescheduleId);
        if (appt) {
          // Minimal payload for Reschedule as per updated backend specs
          await api.updateAppointment(rescheduleId, {
            appointment_date: date,
            appointment_time: time.split(' ')[0], // Changed from start_time -> appointment_time
            doctor_id: appt.doctorId,
            notes: 'Rescheduled via Dashboard' // New field
          } as any);
          setAppointments(prev => prev.map(a => a.id === rescheduleId ? { ...a, date, time: time, status: 'Scheduled' } : a)); // Reset to Scheduled?
          showToast(`Rescheduled to ${date} at ${time}`);
          setRescheduleId(null);
        }
      } catch (e) {
        console.error(e);
        showToast('Failed to reschedule');
      }
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.updateAppointmentStatus(id, { status: 'Canceled', cancellation_reason: 'Dashboard Cancel' });
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Canceled' } : a));
        showToast('Appointment canceled');
      } catch (e) {
        console.error(e);
        showToast('Failed to cancel');
      }
    }
  };

  const handleAddLead = async (data: {
    name: string;
    phone: string;
    source: string;
    inquiry: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other';
    problem: string;
    treatmentDoctor: string;
    treatmentSuggested: string;
  }) => {
    // Check for duplicates
    if (leads.some(l => l.phone === data.phone)) {
      showToast("Lead with this phone number already exists.");
      return;
    }

    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        source: data.source,
        inquiry: data.inquiry,
        status: 'New Inquiry',
        age: data.age,
        gender: data.gender,
        problem: data.problem,
        treatment_doctor: data.treatmentDoctor,
        treatment_suggested: data.treatmentSuggested,
        date_added: new Date().toISOString()
      };
      const createdLead = await api.createLead(payload);
      // Map back 
      const newLead: Lead = {
        // ... map from createdLead ...
        // For now assuming response structure or using local details
        ...payload,
        id: createdLead.data?.id || `lead-${Date.now()}`,
        dateAdded: new Date().toISOString().split('T')[0],
        treatmentDoctor: data.treatmentDoctor,
        treatmentSuggested: data.treatmentSuggested
      } as any;

      setLeads([newLead, ...leads]);
      setIsAddLeadModalOpen(false);

      showToast("Lead created successfully");
    } catch (e) {
      console.error("Failed to create lead", e);
      showToast("Failed to create lead");
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    try {
      // Sanitize payload: strip ID and read-only fields
      const { id, dateAdded, treatmentDoctor, treatmentSuggested, ...rest } = updatedLead;

      // Construct payload with correct backend field names (snake_case)
      const payload = {
        ...rest,
        treatment_doctor: treatmentDoctor,
        treatment_suggested: treatmentSuggested
      };

      await api.updateLead(updatedLead.id, payload);
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      if (updatedLead.status === 'Stalling - Sent to CRO') {
        showToast("Lead assigned to CRO Desk");
      } else if (updatedLead.status === 'Converted - Active Patient') {
        showToast("Patient file created successfully");
      }
    } catch (e) {
      console.error("Failed to update lead", e);
      showToast("Failed to update lead");
    }
  };

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleNavigateToLeads = (filter: string) => {
    setLeadsFilter(filter);
    navigate('/dashboard/leads');
  };

  const handlePatientSelect = (patient: Patient, tab?: string) => {
    setSelectedPatient(patient);
    setProfileInitialTab(tab || 'overview');
  };

  const handleConsultationComplete = async () => {
    const patientToComplete = selectedPatient; // Capture ref
    setSelectedPatient(null);
    showToast('Consultation Completed');

    if (patientToComplete) {
      // Auto-complete today's appointment if found
      const today = new Date().toISOString().split('T')[0];
      const targetAppt = appointments.find(a =>
        (a.patientName === patientToComplete.name || a.doctorId === patientToComplete.id /* fallback */) &&
        a.date === today &&
        a.status !== 'Completed' && a.status !== 'Canceled'
      );

      if (targetAppt) {
        try {
          await api.updateAppointmentStatus(targetAppt.id, { status: 'Completed' });
          setAppointments(prev => prev.map(a => a.id === targetAppt.id ? { ...a, status: 'Completed' } : a));
          // showToast('Appointment marked Completed'); // Optional, toast already shown
        } catch (e) {
          console.error("Failed to update appointment status", e);
        }
      }
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-brand-bg flex h-screen overflow-hidden font-sans text-brand-textPrimary selection:bg-brand-primary selection:text-brand-bg">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-56 md:w-52 lg:w-64 xl:w-72 bg-brand-surface flex-shrink-0 flex flex-col border-r border-brand-border fixed h-full z-50 shadow-lg transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 md:p-5 lg:p-6 xl:p-8 flex items-center space-x-2 md:space-x-3 lg:space-x-4 border-b border-brand-border">
          <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-xl bg-brand-primary flex items-center justify-center font-bold text-brand-bg shadow-lg shadow-brand-primary/20 text-base md:text-lg lg:text-xl">J</div>
          <div>
            <span className="font-bold tracking-tight text-base md:text-lg lg:text-xl block text-brand-textPrimary">JanmaSethu</span>
            <span className="text-[8px] md:text-[9px] lg:text-[10px] text-brand-textSecondary font-bold tracking-widest uppercase">Clinical OS v2.0</span>
          </div>
        </div>

        <nav className="flex-1 px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 space-y-2 md:space-y-3 overflow-y-auto custom-scrollbar">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={location.pathname === '/dashboard' || location.pathname === '/dashboard/'}
            onClick={() => navigate('/dashboard')}
          />
          {(userRole === UserRole.ADMIN || userRole === UserRole.FRONT_DESK || userRole === UserRole.CRO) && (
            <NavItem
              icon={<Users size={20} />}
              label="Leads Pipeline"
              active={location.pathname === '/dashboard/leads'}
              onClick={() => { setLeadsFilter('All'); navigate('/dashboard/leads'); }}
            />
          )}
          <NavItem
            icon={<CalendarDays size={22} />}
            label="Appointments"
            active={location.pathname === '/dashboard/appointments'}
            onClick={() => navigate('/dashboard/appointments')}
          />
          <NavItem
            icon={<UserCheck size={22} />}
            label="Patients"
            active={location.pathname === '/dashboard/patients'}
            onClick={() => navigate('/dashboard/patients')}
          />
          {(userRole === UserRole.ADMIN || userRole === UserRole.CRO) && (
            <NavItem
              icon={<TrendingUp size={22} />}
              label="Analytics"
              active={location.pathname === '/dashboard/analytics'}
              onClick={() => navigate('/dashboard/analytics')}
            />
          )}

        </nav>

        <div className="p-6 border-t border-brand-border">
          <button onClick={onLogout} className="flex items-center space-x-3 text-brand-textSecondary hover:text-brand-error hover:bg-brand-error/10 transition-all w-full px-4 py-3 rounded-xl font-bold group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 overflow-y-auto overflow-x-hidden md:ml-52 lg:ml-64 xl:ml-72 flex flex-col relative z-10 bg-brand-bg">
        {/* Top Bar */}
        <header className="bg-brand-surface/80 backdrop-blur-md border-b border-brand-border sticky top-0 z-20 px-3 sm:px-4 md:px-6 lg:px-8 py-3 lg:py-4 flex justify-between items-center flex-shrink-0 gap-3">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg bg-brand-bg border border-brand-border text-brand-textSecondary hover:text-brand-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <LayoutDashboard size={20} />
          </button>

          <div className="flex items-center bg-brand-bg px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl border border-brand-border flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:border-brand-primary transition-all">
            <Search size={18} className="text-brand-textSecondary mr-2 lg:mr-3 flex-shrink-0" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
              placeholder="Global Search (Patients, Leads...)"
              className="bg-transparent outline-none text-sm w-full text-brand-textPrimary placeholder:text-brand-textSecondary font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
            <div className="flex items-center space-x-2 sm:space-x-4 cursor-pointer group p-1 rounded-xl hover:bg-brand-bg transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold text-xs sm:text-sm border border-brand-primary/20">
                {userRole === UserRole.ADMIN ? 'AD' : userRole === UserRole.CRO ? 'CR' : userRole === UserRole.DOCTOR ? 'DR' : 'FD'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs sm:text-sm font-bold text-brand-textPrimary group-hover:text-brand-primary transition-colors">
                  {userRole === UserRole.ADMIN || userRole === UserRole.CRO ? 'CRO / Admin' :
                    userRole === UserRole.DOCTOR ? 'Doctor' : 'Front Desk'}
                </p>
                <p className="text-[10px] sm:text-[11px] text-brand-textSecondary font-bold">
                  {userRole === UserRole.ADMIN || userRole === UserRole.CRO ? 'Admin Terminal' : 'Main Terminal'}
                </p>
              </div>
              <ChevronDown size={16} className="text-brand-textSecondary group-hover:text-brand-textPrimary hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route index element={
              <DashboardHome
                userRole={userRole}
                leads={leads}
                appointments={appointments}
                leadsInCROQueue={leadsInCROQueue}
                leadsConvertedToday={leadsConvertedToday}
                onCheckIn={handleCheckIn}
                onReschedule={(id) => setRescheduleId(id)}
                onCancelAppointment={handleCancelAppointment}
                onUpdateLead={handleUpdateLead}
                onOpenAddLeadModal={() => setIsAddLeadModalOpen(true)}
                onNavigateToLeads={handleNavigateToLeads}
                onPatientSelect={handlePatientSelect}
              />
            } />
            <Route path="leads" element={
              <div className="bg-brand-surface rounded-2xl shadow-sm border border-brand-border overflow-hidden animate-slide-up h-full flex flex-col">
                <LeadsView
                  leads={leads}
                  onUpdateLead={handleUpdateLead}
                  onOpenAddModal={() => setIsAddLeadModalOpen(true)}
                  initialFilter={leadsFilter}
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
              </div>
            } />
            <Route path="appointments" element={
              <div className="animate-slide-up">
                <AppointmentsView userRole={userRole} />
              </div>
            } />
            <Route path="patients" element={
              <div className="animate-slide-up">
                <PatientsView onNavigateToLeads={() => { setLeadsFilter('All'); navigate('/dashboard/leads'); }} />
              </div>
            } />

            <Route path="analytics" element={
              <div className="animate-slide-up">
                <AnalyticsView />
              </div>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Overlays */}
      <RescheduleModal
        isOpen={!!rescheduleId}
        onClose={() => setRescheduleId(null)}
        onConfirm={handleRescheduleConfirm}
        patientName={appointments.find(a => a.id === rescheduleId)?.patientName || ''}
      />

      <CheckInModal
        isOpen={!!checkInId}
        onClose={() => setCheckInId(null)}
        onConfirm={handleCheckInConfirm}
        patientName={appointments.find(a => a.id === checkInId)?.patientName || ''}
      />

      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onConfirm={handleAddLead}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      {/* Patient Profile Overlay - Lifted to Dashboard level for z-index fix */}
      {selectedPatient && (
        <PatientProfile
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          userRole={userRole}
          initialTab={profileInitialTab}
          onCompleteConsultation={handleConsultationComplete}
          onPatientUpdate={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`
      flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group
      ${active
        ? 'bg-brand-primary/20 text-brand-primary font-bold translate-x-1 border-r-4 border-brand-primary'
        : 'text-brand-textSecondary hover:bg-brand-bg hover:text-brand-textPrimary font-medium hover:translate-x-1'}
    `}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="text-sm tracking-wide">{label}</span>
  </div>
);
