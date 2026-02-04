import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, CalendarDays, Users, TrendingUp, Settings,
    LogOut, ChevronDown, UserCheck, Activity, Clock, AlertTriangle, CheckCircle
} from 'lucide-react'; // Added Activity, Clock, AlertTriangle, CheckCircle
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { api } from '../services/api';

interface ControlTowerProps {
    onLogout: () => void;
    userRole: UserRole;
}

// Layout components duplicated from Dashboard.tsx to avoid props drilling/refactoring hell
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

export const ControlTower: React.FC<ControlTowerProps> = ({ onLogout, userRole }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- State for Control Tower Data ---
    const [patientFlow, setPatientFlow] = useState({ scheduled: 0, arrived: 0, checkedIn: 0, completed: 0 });
    const [waitingAlerts, setWaitingAlerts] = useState<any[]>([]);
    const [liveQueue, setLiveQueue] = useState<any[]>([]);
    const [doctorUtilization, setDoctorUtilization] = useState<any[]>([]);
    const [leadSnapshot, setLeadSnapshot] = useState({ new: 0, contacted: 0, stalling: 0, converted: 0 });
    const [loading, setLoading] = useState(true);

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [flowData, alertsData, queueData, docData, leadsData] = await Promise.all([
                    api.getPatientFlowSummary().catch(() => ({ data: { scheduled: 12, arrived: 8, checkedIn: 5, completed: 3 } })), // Mock fallback
                    api.getWaitingAlerts().catch(() => ({ data: [] })),
                    api.getLiveQueue().catch(() => ({ data: [] })),
                    api.getDoctorUtilization().catch(() => ({ data: [] })),
                    api.getLeadSnapshot().catch(() => ({ data: { new: 5, contacted: 12, stalling: 3, converted: 2 } })) // Mock fallback
                ]);

                // Safely set state enabling fallbacks if needed for demo
                setPatientFlow(flowData.data || { scheduled: 0, arrived: 0, checkedIn: 0, completed: 0 });
                setWaitingAlerts(alertsData.data || []);
                setLiveQueue(queueData.data || []);
                setDoctorUtilization(docData.data || []);
                setLeadSnapshot(leadsData.data || { new: 0, contacted: 0, stalling: 0, converted: 0 });

                // Mocks for visual verification if API returns empty/fail (Remove in prod)
                if (!queueData?.data?.length) {
                    setLiveQueue([
                        { patientName: "Ramesh Gupta", doctor: "Dr. Sireesha", status: "Arrived", waitingMinutes: 45 },
                        { patientName: "Sita Verma", doctor: "Dr. Ananya", status: "Checked-In", waitingMinutes: 12 },
                    ]);
                }
                if (!alertsData?.data?.length) {
                    setWaitingAlerts([
                        { message: "Patient waiting > 30 mins", patientName: "Ramesh Gupta", doctor: "Dr. Sireesha", minutes: 45 }
                    ]);
                }
                if (!docData?.data?.length) {
                    setDoctorUtilization([
                        { doctorName: "Dr. Sireesha", total: 15, completed: 5, pending: 10 },
                        { doctorName: "Dr. Ananya", total: 12, completed: 8, pending: 4 },
                    ]);
                }

            } catch (error) {
                console.error("Control Tower fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Set up polling interval for "Live" feel
        const interval = setInterval(fetchData, 60000); // 1 min poll
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-brand-bg flex h-screen overflow-hidden font-sans text-brand-textPrimary selection:bg-brand-primary selection:text-brand-bg">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Duplicated from Dashboard */}
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
                        active={false}
                        onClick={() => navigate('/dashboard')}
                    />
                    <NavItem
                        icon={<Activity size={20} />}
                        label="Control Tower"
                        active={true}
                        onClick={() => { }} // Already here
                    />
                    {(userRole === UserRole.ADMIN || userRole === UserRole.FRONT_DESK || userRole === UserRole.CRO) && (
                        <NavItem
                            icon={<Users size={20} />}
                            label="Leads Pipeline"
                            active={false}
                            onClick={() => navigate('/dashboard/leads')}
                        />
                    )}
                    <NavItem
                        icon={<CalendarDays size={22} />}
                        label="Appointments"
                        active={false}
                        onClick={() => navigate('/dashboard/appointments')}
                    />
                    <NavItem
                        icon={<UserCheck size={22} />}
                        label="Patients"
                        active={false}
                        onClick={() => navigate('/dashboard/patients')}
                    />
                    {(userRole === UserRole.ADMIN || userRole === UserRole.CRO) && (
                        <NavItem
                            icon={<TrendingUp size={22} />}
                            label="Analytics"
                            active={false}
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
                <header className="bg-brand-surface/80 backdrop-blur-md border-b border-brand-border sticky top-0 z-20 px-3 sm:px-4 md:px-6 lg:px-8 py-3 lg:py-4 flex justify-between items-center flex-shrink-0 gap-3 mb-6">
                    <button
                        className="md:hidden p-2 rounded-lg bg-brand-bg border border-brand-border text-brand-textSecondary hover:text-brand-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <LayoutDashboard size={20} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-brand-textPrimary flex items-center gap-2">
                            <Activity className="text-brand-primary" /> Control Tower
                        </h1>
                        <p className="text-sm text-brand-textSecondary">Live Clinic Operations • {new Date().toLocaleDateString()}</p>
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

                {/* 1. Top KPI Cards - Patient Flow */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <KPICard title="Scheduled Today" value={patientFlow.scheduled} icon={<CalendarDays className="text-blue-500" />} />
                    <KPICard title="Arrived" value={patientFlow.arrived} icon={<Users className="text-orange-500" />} />
                    <KPICard title="Checked-In" value={patientFlow.checkedIn} icon={<CheckCircle className="text-green-500" />} />
                    <KPICard title="Completed" value={patientFlow.completed} icon={<LogOut className="text-gray-500" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Waiting Alerts & Live Queue */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 2. Waiting Alerts */}
                        {waitingAlerts.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <AlertTriangle size={80} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
                                    <AlertTriangle size={20} />
                                    Attention Required
                                </h3>
                                <div className="space-y-3">
                                    {waitingAlerts.map((alert, idx) => (
                                        <div key={idx} className="bg-white/60 p-3 rounded-lg flex justify-between items-center text-red-800">
                                            <span className="font-semibold">{alert.message || "High Wait Time"}</span>
                                            <span className="text-sm">{alert.patientName} ({alert.minutes} min) - {alert.doctor}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Live Patient Queue */}
                        <div className="bg-brand-surface rounded-2xl shadow-sm border border-brand-border overflow-hidden">
                            <div className="p-6 border-b border-brand-border flex justify-between items-center">
                                <h3 className="text-lg font-bold text-brand-textPrimary">Live Patient Queue</h3>
                                <div className="flex items-center gap-2 text-sm text-brand-textSecondary">
                                    <Clock size={16} /> Sorted by wait time
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-brand-bg text-brand-textSecondary text-xs font-bold uppercase tracking-wider">
                                            <th className="p-4">Patient</th>
                                            <th className="p-4">Doctor</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Wait Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {liveQueue.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-brand-textSecondary">No active patients in queue.</td>
                                            </tr>
                                        ) : (
                                            liveQueue.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-brand-bg/50 transition-colors group">
                                                    <td className="p-4 font-medium text-brand-textPrimary">{item.patientName}</td>
                                                    <td className="p-4 text-brand-textSecondary">{item.doctor}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                                    ${item.status === 'Arrived' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-bold text-brand-primary group-hover:scale-105 transition-transform origin-left">
                                                        {item.waitingMinutes} min
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Doctor Utilization & Leads */}
                    <div className="space-y-8">

                        {/* 4. Doctor Utilization */}
                        <div className="bg-brand-surface rounded-2xl shadow-sm border border-brand-border p-6">
                            <h3 className="text-lg font-bold text-brand-textPrimary mb-4">Doctor Load</h3>
                            <div className="space-y-4">
                                {doctorUtilization.map((doc, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-brand-border hover:border-brand-primary/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-brand-textPrimary">{doc.doctorName}</h4>
                                            <span className="text-xs font-bold px-2 py-0.5 bg-brand-bg rounded-md text-brand-textSecondary">{doc.total} Total</span>
                                        </div>
                                        <div className="flex gap-2 text-sm">
                                            <div className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-center font-semibold">
                                                {doc.completed} <span className="block text-[10px] font-normal uppercase">Done</span>
                                            </div>
                                            <div className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-center font-semibold">
                                                {doc.pending} <span className="block text-[10px] font-normal uppercase">Pending</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {doctorUtilization.length === 0 && (
                                    <div className="text-center text-brand-textSecondary py-4">No active doctors today.</div>
                                )}
                            </div>
                        </div>

                        {/* 5. Lead Snapshot */}
                        <div className="bg-brand-surface rounded-2xl shadow-sm border border-brand-border p-6">
                            <h3 className="text-lg font-bold text-brand-textPrimary mb-4">Today's Leads</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <LeadCount label="New" count={leadSnapshot.new} color="text-brand-primary" />
                                <LeadCount label="Contacted" count={leadSnapshot.contacted} color="text-blue-500" />
                                <LeadCount label="Stalling" count={leadSnapshot.stalling} color="text-orange-500" />
                                <LeadCount label="Converted" count={leadSnapshot.converted} color="text-green-500" />
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
};

// Helper Components
const KPICard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
    <div className="bg-brand-surface rounded-xl p-5 border border-brand-border shadow-sm flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform">
        <div className="bg-brand-bg p-3 rounded-full mb-3">{icon}</div>
        <h2 className="text-3xl font-bold text-brand-textPrimary">{value}</h2>
        <p className="text-sm text-brand-textSecondary font-medium uppercase tracking-wide mt-1">{title}</p>
    </div>
);

const LeadCount = ({ label, count, color }: { label: string, count: number, color: string }) => (
    <div className="bg-brand-bg rounded-xl p-3 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${color}`}>{count}</span>
        <span className="text-xs text-brand-textSecondary font-bold text-center">{label}</span>
    </div>
);
