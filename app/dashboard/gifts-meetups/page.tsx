"use client";

import React, { useState, useMemo } from "react";
import { 
  Gift, 
  Coffee, 
  Users, 
  Send, 
  Check, 
  History, 
  Search, 
  Building2, 
  User, 
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Award,
  MoreHorizontal,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GiftDetailModal } from "@/components/gift-detail-modal";
import { useAuth } from "@/lib/context/auth-context";
import { useData } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";
import { GIFTS_MEETUPS_DATA, GiftMeetup } from "@/lib/data/gifts-meetups-data";

export default function GiftsMeetupsPage() {
  const { user } = useAuth();
  const isManager = user?.role === "Manager";
  const { reps, hospitals, doctors, giftMeetups, addGiftMeetup, updateGiftMeetupStatus } = useData();
  
  const [activeTab, setActiveTab] = useState<"provision" | "history">(isManager ? "history" : "provision");
  const [itemType, setItemType] = useState<"gift" | "meetup">("gift");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cost, setCost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const history = useMemo(() => {
    let base = [...giftMeetups];
    if (!isManager) {
      base = base.filter(item => item.staffName === user?.name || item.staffName === "Muna Al Falasi");
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return base.filter(item => 
        item.staffName.toLowerCase().includes(q) || 
        item.item.toLowerCase().includes(q) || 
        item.hospitalName.toLowerCase().includes(q) ||
        item.doctorName.toLowerCase().includes(q)
      );
    }
    return base.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [isManager, user, searchQuery]);

  const totalSpent = history.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !selectedHospital || !selectedDoctor) return;

    setIsSending(true);
    setTimeout(() => {
      addGiftMeetup({
        staffName: user?.name || "Muna Al Falasi",
        type: itemType,
        item: itemName,
        hospitalName: selectedHospital,
        doctorName: selectedDoctor,
        quantity: quantity,
        cost: cost ? parseFloat(cost) : undefined,
        date: new Date().toISOString().split('T')[0],
        proofUrl: proofFile ? URL.createObjectURL(proofFile) : undefined,
      });

      setIsSending(false);
      setIsSent(true);
      
      setTimeout(() => {
        setIsSent(false);
        setItemName("");
        setQuantity(1);
        setCost("");
        setSelectedHospital("");
        setSelectedDoctor("");
        setProofFile(null);
        setActiveTab("history");
      }, 2000);
    }, 1500);
  };

  const handleApprove = (id: string) => {
    updateGiftMeetupStatus(id, "approved");
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 dashboard-header">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 opacity-80 min-[1400px]:block hidden">
            Relationship Management
          </h2>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">Gifts & Meetups</h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg max-w-2xl leading-relaxed">
            {isManager 
              ? "Oversee promotional expenditures, hospitalities, and clinical engagement resources across territories." 
              : "Log promotional gifts and hospitalities provided during your clinical visits and detaling sessions."}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border p-1.5 rounded-[10px] shadow-xl">
          {!isManager && (
            <button 
              onClick={() => setActiveTab("provision")} 
              className={cn("px-6 py-2.5 rounded-[10px] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "provision" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary")}
            >
              <Send size={14} /> Log Provision
            </button>
          )}
          <button 
            onClick={() => setActiveTab("history")} 
            className={cn("px-6 py-2.5 rounded-[10px] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "history" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary")}
          >
            <History size={14} /> {isManager ? "Audit Dashboard" : "My History"}
          </button>
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary"><Gift size={20} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Gifts</p>
          </div>
          <h3 className="text-3xl font-black tabular-nums">{history.filter(h => h.type === 'gift').length} Distributed</h3>
          <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">+8% this month</p>
        </div>
        <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-amber-500/10 flex items-center justify-center text-amber-600"><Coffee size={20} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catered Meetups</p>
          </div>
          <h3 className="text-3xl font-black tabular-nums">{history.filter(h => h.type === 'meetup').length} Sessions</h3>
          <p className="text-[9px] font-bold text-amber-500 mt-1 uppercase">Promotional Detailing</p>
        </div>
        <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-blue-500/10 flex items-center justify-center text-blue-600"><DollarSign size={20} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Expenditure</p>
          </div>
          <h3 className="text-3xl font-black tabular-nums">AED {totalSpent.toLocaleString()}</h3>
          <p className="text-[9px] font-bold text-blue-500 mt-1 uppercase">Budget Utilization: 64%</p>
        </div>
        <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Users size={20} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Staff Engagement</p>
          </div>
          <h3 className="text-3xl font-black tabular-nums">{reps.length} Active Reps</h3>
          <p className="text-[9px] font-bold text-indigo-500 mt-1 uppercase">Relationship Building</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "provision" ? (
          <motion.div 
            key="provision"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-card border border-border rounded-[10px] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <h3 className="text-2xl font-black tracking-tight mb-8">New Provision Entry</h3>
                
                <form onSubmit={handleLog} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resource Type</label>
                      <div className="flex bg-secondary/50 p-1 rounded-[10px] border border-border">
                        <button 
                          type="button"
                          onClick={() => setItemType("gift")}
                          className={cn("flex-1 py-3 rounded-[8px] text-[10px] font-black uppercase transition-all", itemType === "gift" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-secondary")}
                        >
                          Promotional Gift
                        </button>
                        <button 
                          type="button"
                          onClick={() => setItemType("meetup")}
                          className={cn("flex-1 py-3 rounded-[8px] text-[10px] font-black uppercase transition-all", itemType === "meetup" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-secondary")}
                        >
                          Meetup/Food
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cost (Est. AED)</label>
                      <input 
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Item Description / Activity Title</label>
                    <input 
                      required
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder={itemType === "gift" ? "e.g. Medical Textbook, Branded Pen" : "e.g. Clinical Lunch detaling, Coffee Sync"}
                      className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Facility</label>
                      <select 
                        required
                        value={selectedHospital}
                        onChange={(e) => setSelectedHospital(e.target.value)}
                        className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="">Select Hospital</option>
                        {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lead Physician</label>
                      <select 
                        required
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirmation / Receipt (Optional)</label>
                    <div className="flex items-center gap-4 p-4 border border-dashed border-border rounded-[10px] bg-secondary/10">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        className="text-xs font-bold w-full focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                      />
                      {proofFile && <div className="text-[10px] font-black text-emerald-500 uppercase flex shrink-0 items-center gap-1"><Check size={14} /> Attached</div>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || isSent}
                    className={cn(
                      "w-full py-5 rounded-[10px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3",
                      isSent ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                      "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] border-none"
                    )}
                  >
                    {isSending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 
                     isSent ? <><Check size={20} /> Entry Logged Successfully</> : 
                     <><Award size={18} /> Execute Log Entry</>}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="p-8 bg-indigo-600 rounded-[10px] text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                  <Award size={100} />
                </div>
                <h3 className="text-xl font-black mb-2">Compliance Alert</h3>
                <p className="text-xs text-indigo-100 uppercase font-black tracking-widest mb-6 opacity-80">Promotional Guidelines</p>
                <p className="text-sm font-medium leading-relaxed opacity-90">All gifts exceeding AED 500 and hospitality exceeding AED 200 per head require mandatory manager pre-approval. Ensure clinical relevance for all promotional items.</p>
              </div>
              
              <div className="bg-card border border-border rounded-[10px] p-8 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                   <TrendingUp size={14} className="text-primary" /> Top Promotional Assets
                </h4>
                <div className="space-y-4">
                  {[
                    { name: "Medical Textbooks", pct: 45, color: "bg-blue-500" },
                    { name: "Clinical Lunch", pct: 30, color: "bg-amber-500" },
                    { name: "Branded Stationery", pct: 15, color: "bg-emerald-500" },
                    { name: "Demo Equipment", pct: 10, color: "bg-indigo-500" }
                  ].map(asset => (
                    <div key={asset.name} className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase">
                        <span>{asset.name}</span>
                        <span>{asset.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={cn("h-full", asset.color)} style={{ width: `${asset.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search staff, facility, or item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" 
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-4 bg-card border border-border rounded-[10px] text-muted-foreground hover:text-primary transition-colors shadow-sm">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[10px] shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/10">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Type & Date</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Item / Activity</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Beneficiary</th>
                      {isManager && <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rep Name</th>}
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Value (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {history.map((item, i) => (
                      <motion.tr 
                        key={item.id} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.05 }} 
                        onClick={() => setSelectedGift(item)}
                        className="group transition-all hover:bg-secondary/30 cursor-pointer"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border border-border transition-transform group-hover:scale-110",
                              item.type === 'gift' ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                            )}>
                              {item.type === 'gift' ? <Gift size={18} /> : <Coffee size={18} />}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5">{item.type}</p>
                              <span className="text-xs font-black tabular-nums">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{item.item}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Quantity: {item.quantity}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-muted-foreground" />
                            <p className="text-xs font-black truncate max-w-[200px]">{item.hospitalName}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <User size={12} className="text-muted-foreground" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{item.doctorName}</p>
                          </div>
                        </td>
                        {isManager && (
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                {item.staffName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs font-black">{item.staffName}</span>
                            </div>
                          </td>
                        )}
                        <td className="px-8 py-6 text-center">
                          {isManager && item.status === "pending_approval" ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedGift(item); }}
                              className="px-4 py-2 bg-primary text-white rounded-[10px] text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            >
                              Audit Request
                            </button>
                          ) : (
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase",
                              item.status === 'approved' ? "bg-emerald-500/10 text-emerald-600" : 
                              (item.status === 'rejected' ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600")
                            )}>
                              {item.status === 'approved' ? <Check size={12} /> : 
                               (item.status === 'rejected' ? <XCircle size={12} className="text-rose-600" /> : 
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />)}
                              {item.status.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {item.cost?.toLocaleString() || "N/A"} AED
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedGift && (
          <GiftDetailModal 
            item={selectedGift}
            onClose={() => setSelectedGift(null)}
            onApprove={(id, comment) => updateGiftMeetupStatus(id, "approved", comment)}
            onReject={(id, comment) => updateGiftMeetupStatus(id, "rejected", comment)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
