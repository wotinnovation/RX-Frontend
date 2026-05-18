"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Building2, User, FileText, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useData } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";

interface NewAuditFormProps {
  onClose: () => void;
  isModal?: boolean;
  initialData?: {
    date?: string;
    hour?: string;
    staffName?: string;
  };
}

export function NewAuditForm({ onClose, initialData, isModal = true }: NewAuditFormProps) {
  const { hospitals, doctors, addAppointment } = useData();
  const [formData, setFormData] = useState({
    title: "",
    type: "audit" as const,
    hospitalId: "",
    doctorId: "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    hour: initialData?.hour || "09:00",
    description: "",
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
    const hospital = hospitals.find(h => h.id === formData.hospitalId);
    const doctor = doctors.find(d => d.id === formData.doctorId);

    addAppointment({
      title: formData.title,
      type: formData.type,
      entityName: hospital?.name || "Unknown Facility",
      location: hospital?.area || "Unknown Area",
      date: formData.date,
      hour: formData.hour,
      duration: "1h",
      description: formData.description,
      contactPerson: doctor?.name || "Liaison Officer",
      status: "scheduled",
      hospitalName: hospital?.name,
      doctorName: doctor?.name,
      staffName: initialData?.staffName || "Unassigned",
    });
    onClose();
  };

  const content = (
    <div className={cn("relative bg-card border border-border w-full max-w-xl rounded-[10px] shadow-2xl overflow-hidden flex flex-col h-[72vh] max-h-[90vh] pointer-events-auto", !isModal && "max-w-none border-0 shadow-none rounded-none h-full")}>
      {isModal && (
        <div className="p-8 bg-primary text-primary-foreground relative shrink-0">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-10" />
          <button type="button" onClick={onClose} className="absolute top-8 right-8 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-50 pointer-events-auto"><X size={20} /></button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="fill-current" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Logistics Deployment</p>
            </div>
            <h3 className="text-3xl font-black tracking-tighter">Schedule Field Visit</h3>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visit Objective</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Stock Audit, Product Detailing" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visit Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                  <option value="audit">Audit</option>
                  <option value="medical">Medical Detail</option>
                  <option value="meeting">Strategic Meeting</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input type="time" required value={formData.hour} onChange={e => setFormData({...formData, hour: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Medical Facility</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <select required value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                  <option value="">Select Hospital/Clinic...</option>
                  {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Liaison (Doctor)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <select required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
                  <option value="">Select Personnel...</option>
                  {doctors.filter(d => d.hospitalId === formData.hospitalId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  {!formData.hospitalId && doctors.slice(0, 10).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Execution Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Brief</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Outline specific tasks or focus areas for this visit..." className="w-full p-5 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[100px] resize-none" />
            </div>
          </div>
        </div>
      </form>

      <div className="p-8 border-t border-border bg-secondary/10 flex justify-end gap-4 shrink-0">
        <button type="button" onClick={onClose} className="px-8 py-4 text-muted-foreground font-black text-[10px] uppercase hover:bg-secondary rounded-[10px] transition-all">Cancel</button>
        <button onClick={handleSubmit} className="px-12 py-4 bg-primary text-primary-foreground font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Deploy Itinerary</button>
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
