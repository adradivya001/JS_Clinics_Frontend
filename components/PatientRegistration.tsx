import React, { useState } from 'react';
import { Save, ArrowRight, FileText, UserPlus, Calendar } from 'lucide-react';
import { Patient } from '../types';
import { api } from '../services/api';

// --- Daily Register Table ---
export const DailyRegisterTable: React.FC = () => {
    // Mock Data for Register
    const [registerData, setRegisterData] = useState([
        { date: '2025-12-03', name: 'Sarah Jenkins', age: '32', phone: '9876543210', visit: 'Follow-up', consultant: 'Dr. Sharma', payment: 'Paid', referredBy: 'Dr. Rao', remarks: 'Routine Checkup' },
        { date: '2025-12-03', name: 'Priya Patel', age: '28', phone: '9876543212', visit: 'Lab', consultant: 'Dr. Gupta', payment: 'Pending', referredBy: 'Self', remarks: 'Blood Work' },
        { date: '2025-12-02', name: 'Michael Chen', age: '35', phone: '9876543211', visit: 'Consult', consultant: 'Dr. Sharma', payment: 'Paid', referredBy: 'Online', remarks: 'New Patient' },
    ]);

    const handleAddWalkIn = () => {
        const name = prompt("Enter Patient Name:");
        if (name) {
            const newEntry = {
                date: new Date().toISOString().split('T')[0],
                name: name,
                age: '-',
                phone: '-',
                visit: 'Walk-In',
                consultant: 'Dr. Sharma', // Default
                payment: 'Pending',
                referredBy: 'Walk-In',
                remarks: 'Manual Entry'
            };
            setRegisterData([newEntry, ...registerData]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-surface rounded-2xl shadow-sm border border-brand-border overflow-hidden">
            <div className="p-6 border-b border-brand-border bg-brand-bg/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-brand-textPrimary flex items-center">
                    <FileText className="mr-2 text-brand-primary" size={20} /> Daily Patient Register
                </h3>
                <div className="flex space-x-2">
                    <button onClick={handleAddWalkIn} className="px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm font-bold text-brand-textSecondary hover:text-brand-primary transition-colors">
                        Add Walk-In
                    </button>
                    <button className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-brand-secondary transition-colors">
                        Print Register
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-brand-bg sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Date</th>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Patient Name</th>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Age</th>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Phone No</th>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Visit Type</th>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Consultant</th>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Payment</th>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Referred By</th>
                            <th className="p-4 text-xs font-bold text-brand-textSecondary uppercase tracking-wider border-b border-brand-border">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {registerData.map((row, index) => (
                            <tr key={index} className="hover:bg-brand-bg/50 transition-colors">
                                <td className="p-4 text-sm text-brand-textPrimary font-medium">{row.date}</td>
                                <td className="p-4 text-sm text-brand-textPrimary font-bold">{row.name}</td>
                                <td className="p-4 text-sm text-brand-textSecondary">{row.age}</td>
                                <td className="p-4 text-sm text-brand-textSecondary font-mono">{row.phone}</td>
                                <td className="p-4 text-sm text-brand-textPrimary">{row.visit}</td>
                                <td className="p-4 text-sm text-brand-textPrimary">{row.consultant}</td>
                                <td className="p-4">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${row.payment === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                        {row.payment}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-brand-textSecondary">{row.referredBy}</td>
                                <td className="p-4 text-sm text-brand-textSecondary italic">{row.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Patient Conversion Form ---
interface PatientConversionFormProps {
    initialData?: any; // Using any for Lead type compatibility or import Lead
    onSuccess?: () => void;
}

export const PatientConversionForm: React.FC<PatientConversionFormProps> = ({ initialData, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        relation: '',
        maritalStatus: 'Married',
        gender: initialData?.gender || 'Female',
        dob: '',
        age: initialData?.age || '',
        aadhar: '',
        bloodGroup: '',
        house: '',
        street: initialData?.address || '', // Attempt to map address if available
        area: '',
        city: '',
        district: '',
        state: '',
        postalCode: '',
        email: initialData?.email || '',
        mobile: initialData?.phone || '',
        referralDoctor: '',
        hospitalAddress: '',
        uhid: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // 1. Create Patient
            const patientPayload: any = { ...formData };

            // Map 'date' to 'registration_date' for Backend Schema
            if (patientPayload.date) {
                patientPayload.registration_date = patientPayload.date;
            }

            // Link to Lead if available (As per Schema: Patients.lead_id -> Leads.id)
            if (initialData?.id) {
                // @ts-ignore
                patientPayload.lead_id = initialData.id;
            }

            /* 
               Ensure payload matches backend expectation. 
               If backend requires specific fields like `phone` instead of `mobile`, map them here.
               For now sending formData directly as it aligns largely with typical schemas, 
               but `mobile` might need to be `phone`.
            */
            // @ts-ignore
            if (!patientPayload.phone && patientPayload.mobile) patientPayload.phone = patientPayload.mobile;

            const response = await api.createPatient(patientPayload);
            const newPatientId = response?.data?.id || response?.id;

            // 2. Update Lead Status if applicable
            if (initialData?.id) {
                try {
                    // Only update the status. Linking is done via lead_id in Patients table.
                    const updatePayload: any = { status: 'Converted - Active Patient' };
                    await api.updateLead(initialData.id, updatePayload);
                } catch (leadError) {
                    console.error("Failed to update lead status", leadError);
                    // Don't block success flow if patient is created but lead update fails
                }
            }

            alert(`Patient ${formData.name} registered successfully!`);

            if (onSuccess) {
                onSuccess();
            }

        } catch (error: any) {
            console.error("Registration failed", error);

            // Handle Conflict (Patient already exists)
            // Check for status 409 or message content
            if ((error.status === 409) || (error.message && (error.message.includes('409') || error.message.includes('Conflict')))) {
                const confirmMessage = `A patient with these details (likely mobile: ${formData.mobile}) already exists.\n\nDo you want to mark this Lead as 'Converted' and attempt to link to the existing patient?`;

                if (window.confirm(confirmMessage)) {
                    try {
                        // 1. Attempt to find the existing patient to link
                        let existingId = null;

                        // Strategy A: Backend returns it in error data (Preferred)
                        // This relies on backend sending { success: false, error: '...', existing_id: '...' }
                        if (error.data && error.data.existing_id) {
                            existingId = error.data.existing_id;
                        }
                        // Strategy B: If backend returned the full patient object
                        else if (error.data && error.data.patient && error.data.patient.id) {
                            existingId = error.data.patient.id;
                        }

                        // Strategy C: Fallback to frontend search (Optimistic)
                        if (!existingId) {
                            try {
                                const patientsData = await api.getPatients();
                                // Optimistic local search
                                const found = patientsData?.data?.items?.find((p: any) =>
                                    (p.mobile === formData.mobile) || (p.phone === formData.mobile)
                                );
                                if (found) existingId = found.id;
                            } catch (searchErr) {
                                console.warn("Could not search for existing patient", searchErr);
                            }
                        }

                        // 2. Update Lead & Link
                        if (initialData?.id) {
                            const updatePayload: any = { status: 'Converted - Active Patient' };

                            // Correct Linking: Update Patient with lead_id (Foreign Key is on Patient)
                            if (existingId) {
                                try {
                                    await api.updatePatient(existingId, { lead_id: initialData.id });
                                } catch (linkErr) {
                                    console.warn("Failed to reverse-link lead to existing patient", linkErr);
                                }
                            } else {
                                alert("Could not automatically find the existing patient ID to link. The lead will be marked converted, but you may need to verify the patient record manually.");
                            }

                            // Update Lead Status (No patient_id column on leads)
                            await api.updateLead(initialData.id, updatePayload);

                            alert(`Lead converted successfully.${existingId ? ' Linked to existing patient.' : ''}`);
                            if (onSuccess) onSuccess();
                        }
                    } catch (updateErr: any) {
                        alert(`Failed to update lead: ${updateErr.message}`);
                    }
                }
            } else {
                alert(`Failed to register patient: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-brand-surface rounded-2xl shadow-sm border border-brand-border overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-brand-border bg-brand-bg/50">
                <h3 className="text-lg font-bold text-brand-textPrimary flex items-center">
                    <UserPlus className="mr-2 text-brand-primary" size={20} /> New Patient Registration (Conversion)
                </h3>
                <p className="text-sm text-brand-textSecondary mt-1">
                    {initialData ? `Converting Lead: ${initialData.name}` : 'Complete patient profile for admission/treatment.'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form className="space-y-8 max-w-5xl mx-auto" onSubmit={handleSubmit}>

                    {/* Section 1: Basic Demographics */}
                    <div className="bg-brand-bg/30 p-6 rounded-xl border border-brand-border">
                        <h4 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-6 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs mr-2">1</span>
                            Demographics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Patient Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" required />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">S/D/H/W of</label>
                                <input name="relation" value={formData.relation} onChange={handleChange} placeholder="Relation Name" className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Marital Status</label>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all">
                                    <option value="Married">Married</option>
                                    <option value="Single">Single</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all">
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Age</label>
                                <input name="age" value={formData.age} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>

                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Aadhar Number</label>
                                <input name="aadhar" value={formData.aadhar} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Blood Group</label>
                                <input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contact Information */}
                    <div className="bg-brand-bg/30 p-6 rounded-xl border border-brand-border">
                        <h4 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-6 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs mr-2">2</span>
                            Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">House / Apt</label>
                                <input name="house" value={formData.house} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Street / Road</label>
                                <input name="street" value={formData.street} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Area / Sector</label>
                                <input name="area" value={formData.area} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>

                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">City / Town</label>
                                <input name="city" value={formData.city} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">District</label>
                                <input name="district" value={formData.district} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">State</label>
                                <input name="state" value={formData.state} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>

                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Postal Code</label>
                                <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Email Address</label>
                                <input name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Mobile Number</label>
                                <input name="mobile" value={formData.mobile} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" required />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Referral & Admin */}
                    <div className="bg-brand-bg/30 p-6 rounded-xl border border-brand-border">
                        <h4 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-6 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs mr-2">3</span>
                            Referral & Admin
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Referral Doctor Name</label>
                                <input name="referralDoctor" value={formData.referralDoctor} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Hospital Address</label>
                                <input name="hospitalAddress" value={formData.hospitalAddress} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">UHID</label>
                                <input name="uhid" value={formData.uhid} onChange={handleChange} placeholder="Enter UHID manually" className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-brand-textSecondary uppercase ml-1">Registration Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full mt-1 bg-white border border-brand-border rounded-lg py-2.5 px-3 text-sm text-brand-textPrimary outline-none focus:border-brand-primary transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 flex items-center transition-all active:scale-95 disabled:opacity-70">
                            <Save size={20} className="mr-2" /> {isSubmitting ? 'Saving...' : 'Save Patient Record'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
