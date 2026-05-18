"use client";

import React, { useState } from "react";
import { X, User, Activity, MapPin, Building2, Stethoscope, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useData } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";

interface NewDoctorFormProps {
  onClose: () => void;
  isModal?: boolean;
}

export function NewDoctorForm({ onClose, isModal = true }: NewDoctorFormProps) {
  const { hospitals } = useData();
  
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    hospitalId: "",
    email: "",
    phone: "",
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
    // For now I'll just close it
    onClose();
  };

  const content = (
    <div className={cn("relative bg-card border border-border w-full max-w-xl rounded-[10px] shadow-2xl overflow-hidden flex flex-col h-[72vh] max-h-[90vh] pointer-events-auto", !isModal && "max-w-none border-0 shadow-none rounded-none h-full")}>
      {isModal && (
        <div className="p-8 bg-amber-500 text-white relative shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <button type="button" onClick={onClose} className="absolute top-8 right-8 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-50 pointer-events-auto"><X size={20} /></button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope size={14} className="fill-current" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Professional Network</p>
            </div>
            <h3 className="text-3xl font-black tracking-tighter">Add Doctor</h3>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name & Title</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500 transition-colors" size={18} />
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. Sarah Al Hashmi" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Specialty / Department</label>
            <div className="relative group">
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500 transition-colors" size={18} />
              <input required value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} placeholder="e.g. Cardiology, Orthopedics" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Hospital</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-500 transition-colors" size={18} />
              <select required value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all appearance-none cursor-pointer">
                <option value="">Select Facility...</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="sarah.h@example.com" className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+971 50 ..." className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all" />
            </div>
          </div>
        </div>
      </form>

      <div className="p-8 border-t border-border bg-secondary/10 flex justify-end gap-4 shrink-0">
        <button type="button" onClick={onClose} className="px-8 py-4 text-muted-foreground font-black text-[10px] uppercase hover:bg-secondary rounded-[10px] transition-all">Cancel</button>
        <button type="submit" className="px-12 py-4 bg-amber-500 text-white font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all">Onboard Doctor</button>
      </div>
    </div>
  );

  if (!isModal) return content;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      {content}
    </div>
  );
}
