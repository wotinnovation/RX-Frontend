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
    <div className="fixed inset-0 z-[110] flex items-stretch justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer pointer-events-auto"
      />

      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-card border-l border-border w-full max-w-2xl rounded-l-[2.5rem] rounded-r-none shadow-2xl overflow-hidden flex flex-col h-full pointer-events-auto"
      >
        {/* Header Tabs */}
        <div className="bg-secondary/30 p-2 md:p-3 flex border-b border-border items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 py-3 rounded-[0.75rem] text-[11px] font-black uppercase tracking-widest transition-all",
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
            className="ml-4 w-10 h-10 flex items-center justify-center rounded-[0.75rem] hover:bg-rose-500 hover:text-white transition-all text-muted-foreground border border-border bg-card shadow-sm shrink-0"
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
