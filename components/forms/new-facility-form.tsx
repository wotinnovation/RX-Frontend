"use client";

import React, { useState } from "react";
import { X, Building2, MapPin, ShieldAlert, Users, HeartPulse, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useData } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";

interface NewFacilityFormProps {
  onClose: () => void;
  isModal?: boolean;
}

export function NewFacilityForm({ onClose, isModal = true }: NewFacilityFormProps) {
  const { addHospital } = useData();
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    priority: "medium" as const,
    doctors: 5,
    patients: 50,
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
    addHospital({
      name: formData.name,
      area: formData.area,
      priority: formData.priority,
      doctors: formData.doctors,
      patients: formData.patients,
    });
    onClose();
  };

  const content = (
    <div className={cn("relative bg-card w-full flex flex-col h-full overflow-hidden pointer-events-auto", !isModal && "max-w-none border-0 shadow-none rounded-none")}>
      {isModal && (
        <div className="p-5 bg-emerald-600 text-white relative shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-50 pointer-events-auto"><X size={16} /></button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={12} className="fill-current" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-70">Infrastructure Expansion</p>
            </div>
            <h3 className="text-xl font-black tracking-tighter">Register New Clinic</h3>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        {/* ... form content remains the same ... */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Facility Designation</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" size={18} />
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Al Zahra Medical Center" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Geographic Zone</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" size={18} />
              <input required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="e.g. Jumeirah, Dubai" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Priority Protocol</label>
              <div className="relative group">
                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" size={18} />
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all appearance-none cursor-pointer">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physician Count</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input type="number" required value={formData.doctors} onChange={e => setFormData({...formData, doctors: parseInt(e.target.value) || 0})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Estimated Patient Load</label>
            <div className="relative group">
              <HeartPulse className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" size={18} />
              <input type="number" required value={formData.patients} onChange={e => setFormData({...formData, patients: parseInt(e.target.value) || 0})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all" />
            </div>
          </div>
        </div>
      </form>

      <div className="p-8 border-t border-border bg-secondary/10 flex justify-end gap-4 shrink-0">
        <button type="button" onClick={onClose} className="px-8 py-4 text-muted-foreground font-black text-[10px] uppercase hover:bg-secondary rounded-[10px] transition-all">Cancel</button>
        <button onClick={handleSubmit} className="px-12 py-4 bg-emerald-600 text-white font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all">Commit Facility</button>
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
