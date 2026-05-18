"use client";

import React from "react";
import { 
  MapPin, 
  Users, 
  Search, 
  ChevronRight, 
  Building2, 
  ShieldCheck, 
  UserCheck,
  TrendingUp,
  Activity,
  PlusCircle,
  X,
  Edit3,
  Trash2
} from "lucide-react";
import { useData, Hospital } from "@/lib/context/data-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { UnifiedAddForm } from "@/components/forms/unified-add-form";

export default function CustomerAssignmentPage() {
  const { hospitals, reps, assignHospital, sales, deleteHospital } = useData();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"all" | "unassigned" | "assigned">("all");
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = React.useState(false);
  const [editingHospital, setEditingHospital] = React.useState<Hospital | null>(null);

  const unassignedCount = hospitals.filter(h => !h.assignedRepId).length;

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "unassigned") return matchesSearch && !h.assignedRepId;
    if (activeTab === "assigned") return matchesSearch && !!h.assignedRepId;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Assignment</h1>
          <p className="text-muted-foreground mt-2">Manage territory distribution and representative hospital allocation.</p>
          
          <div className="flex items-center gap-2 mt-6">
            <button 
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "all" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
              )}
            >
              All Facilities
            </button>
            <button 
              onClick={() => setActiveTab("unassigned")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === "unassigned" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
              )}
            >
              Unassigned
              {unassignedCount > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{unassignedCount}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("assigned")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "assigned" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
              )}
            >
              Assigned
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-card border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-1 focus:ring-primary w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsUnifiedModalOpen(true)}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
          >
            <PlusCircle size={18} /> Add
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isUnifiedModalOpen && (
          <UnifiedAddForm onClose={() => setIsUnifiedModalOpen(false)} />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Territory Summary */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-card border border-border rounded-[2.5rem] card-shadow flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white shadow-lg">
              <Building2 size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Coverage</p>
              <p className="text-3xl font-black">{hospitals.length}</p>
              <p className="text-xs font-bold text-emerald-600 mt-1">100% Facilities Audited</p>
            </div>
          </div>
          
          <div className="p-8 bg-card border border-border rounded-[2.5rem] card-shadow flex items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-lg">
              <UserCheck size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Rep Allocation</p>
              <p className="text-3xl font-black">{hospitals.filter(h => h.assignedRepId).length}</p>
              <p className="text-xs font-bold text-amber-600 mt-1">{hospitals.filter(h => !h.assignedRepId).length} Pending Assignment</p>
            </div>
          </div>

          <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <TrendingUp size={60} className="absolute bottom-[-10px] right-[-10px] opacity-20 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Market Efficiency</p>
              <p className="text-3xl font-black">94.2%</p>
              <p className="text-xs font-bold opacity-90 mt-1">Optimal Route Compliance</p>
            </div>
          </div>
        </div>

        {/* Assignment Console */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden card-shadow">
            <table className="w-full text-left">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Facility Information</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Network Statistics</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Priority</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Representative</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredHospitals.map((hospital) => {
                  const assignedRep = reps.find(r => r.id === hospital.assignedRepId);
                  const hospitalSales = sales.filter(s => s.hospitalId === hospital.id).reduce((acc, s) => acc + (s.amount || 0), 0);
                  
                  return (
                    <tr key={hospital.id} className="hover:bg-secondary/10 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Building2 size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-base">{hospital.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <MapPin size={10} className="text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{hospital.area}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex gap-4">
                            <div className="text-center">
                              <p className="text-xs font-black">{hospital.doctors}</p>
                              <p className="text-[8px] font-black uppercase text-muted-foreground">Doctors</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black">{hospital.patients}</p>
                              <p className="text-[8px] font-black uppercase text-muted-foreground">Patients</p>
                            </div>
                          </div>
                          <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[9px] font-black">
                            {hospitalSales.toLocaleString()} AED VALUE
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={cn(
                          "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          hospital.priority === "high" ? "bg-rose-100 text-rose-600 border border-rose-200" :
                          hospital.priority === "medium" ? "bg-amber-100 text-amber-600 border border-amber-200" :
                          "bg-emerald-100 text-emerald-600 border border-emerald-200"
                        )}>
                          {hospital.priority}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex flex-col items-center gap-2">
                          <select 
                            value={hospital.assignedRepId || ""}
                            onChange={(e) => assignHospital(hospital.id, e.target.value || null)}
                            className="bg-secondary/50 border border-border rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:bg-secondary min-w-[160px]"
                          >
                            <option value="">Unassigned</option>
                            {reps.map(rep => (
                              <option key={rep.id} value={rep.id}>{rep.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              // We'll just open the add clinic tab for now as "Edit"
                              setIsUnifiedModalOpen(true);
                            }}
                            className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${hospital.name}?`)) {
                                deleteHospital(hospital.id);
                              }
                            }}
                            className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
