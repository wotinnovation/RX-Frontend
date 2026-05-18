"use client";

import React, { useState } from "react";
import { X, Building2, UserPlus, Stethoscope, Calendar, Zap, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NewFacilityForm } from "./new-facility-form";
import { NewPatientForm } from "./new-patient-form";
import { NewDoctorForm } from "./new-doctor-form";
import { NewAuditForm } from "./new-audit-form";
import { NewStaffForm } from "./new-staff-form";

interface UnifiedAddFormProps {
  onClose: () => void;
  initialTab?: "clinic" | "patient" | "doctor" | "schedule" | "staff";
}

export function UnifiedAddForm({ onClose, initialTab = "clinic" }: UnifiedAddFormProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: "clinic", label: "Add Clinic", icon: Building2, color: "bg-emerald-500" },
    { id: "doctor", label: "Add Doctor", icon: Stethoscope, color: "bg-amber-500" },
    { id: "patient", label: "Add Patient", icon: UserPlus, color: "bg-pink-600" },
    { id: "staff", label: "Add Staff", icon: Users, color: "bg-indigo-600" },
    { id: "schedule", label: "Schedule Visit", icon: Calendar, color: "bg-primary" },
  ];

  const ActiveForm = () => {
    switch (activeTab) {
      case "clinic": return <NewFacilityForm onClose={onClose} isModal={false} />;
      case "doctor": return <NewDoctorForm onClose={onClose} isModal={false} />;
      case "patient": return <NewPatientForm onClose={onClose} isModal={false} />;
      case "staff": return <NewStaffForm onClose={onClose} isModal={false} />;
      case "schedule": return <NewAuditForm onClose={onClose} isModal={false} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-card border border-border w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[72vh] max-h-[90vh] pointer-events-auto"
      >
        {/* Header Tabs */}
        <div className="bg-secondary/30 p-4 md:p-5 flex border-b border-border items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id
                  ? `${tab.color} text-white shadow-lg`
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
          <button
            onClick={onClose}
            className="ml-4 w-14 h-14 flex items-center justify-center rounded-[1.25rem] hover:bg-rose-500 hover:text-white transition-all text-muted-foreground border border-border bg-card shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <ActiveForm />
        </div>
      </motion.div>
    </div>
  );
}
