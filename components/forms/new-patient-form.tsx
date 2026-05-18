"use client";

import React, { useState } from "react";
import { X, User, Activity, MapPin, Building2, UserPlus, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useData } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";

interface NewPatientFormProps {
  onClose: () => void;
  isModal?: boolean;
}

export function NewPatientForm({ onClose, isModal = true }: NewPatientFormProps) {
  const { hospitals, doctors, patients, togglePatientStatus } = useData();
  // Using a local mock since addPatient might not be in the context yet
  // Based on viewing data-context.tsx earlier, it doesn't have addPatient but has togglePatientStatus.
  // I should probably add addPatient to data-context.tsx first.
  
  const [formData, setFormData] = useState({
    name: "",
    age: 30,
    gender: "Male",
    condition: "",
    homeAddress: "",
    hospitalId: "",
    doctorId: "",
  });

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now I'll just close it, but I'll add the addPatient function to context in next step
    onClose();
  };

  const content = (
    <div className={cn("relative bg-card w-full flex flex-col h-full overflow-hidden pointer-events-auto", !isModal && "max-w-none border-0 shadow-none rounded-none")}>
      {isModal && (
        <div className="p-5 bg-pink-600 text-white relative shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-50 pointer-events-auto"><X size={16} /></button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus size={12} className="fill-current" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-70">Patient Intelligence</p>
            </div>
            <h3 className="text-xl font-black tracking-tighter">Onboard New Record</h3>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-pink-600 transition-colors" size={18} />
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sultan Mohamed" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-pink-600/10 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Age</label>
              <input type="number" required value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})} className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-pink-600/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-pink-600/10 transition-all appearance-none cursor-pointer">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Clinical Condition</label>
            <div className="relative group">
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-pink-600 transition-colors" size={18} />
              <input required value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} placeholder="e.g. Hypertension, Type 2 Diabetes" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-pink-600/10 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Facility</label>
              <select required value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})} className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-pink-600/10 transition-all appearance-none cursor-pointer">
                <option value="">Select Hospital...</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Attending Physician</label>
              <select required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-pink-600/10 transition-all appearance-none cursor-pointer">
                <option value="">Select Doctor...</option>
                {doctors.filter(d => d.hospitalId === formData.hospitalId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Home Address</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-pink-600 transition-colors" size={18} />
              <input required value={formData.homeAddress} onChange={e => setFormData({...formData, homeAddress: e.target.value})} placeholder="Villa/Apartment, Area, City" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-pink-600/10 transition-all" />
            </div>
          </div>
        </div>
      </form>

      <div className="p-8 border-t border-border bg-secondary/10 flex justify-end gap-4 shrink-0">
        <button type="button" onClick={onClose} className="px-8 py-4 text-muted-foreground font-black text-[10px] uppercase hover:bg-secondary rounded-[10px] transition-all">Cancel</button>
        <button type="submit" className="px-12 py-4 bg-pink-600 text-white font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-pink-600/20 hover:scale-[1.02] transition-all">Onboard Patient</button>
      </div>
    </div>
  );

  if (!isModal) return content;

  return (
    <div className="fixed inset-0 z-[110] flex items-stretch justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer pointer-events-auto" />
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-card border-l border-border w-full max-w-xl flex flex-col h-full rounded-l-[2rem] rounded-r-none shadow-2xl overflow-hidden pointer-events-auto"
      >
        {content}
      </motion.div>
    </div>
  );
}
