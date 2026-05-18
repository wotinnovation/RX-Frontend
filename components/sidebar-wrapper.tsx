"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { useData } from "@/lib/context/data-context";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const data = useData();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const showSidebar = !isLoginPage && user;

  if (authLoading || (showSidebar && data.isLoading)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {showSidebar && <Sidebar />}
      <main className="flex-1 overflow-x-hidden relative flex flex-col">
        {/* GLOBAL TOP BAR */}
        {showSidebar && (
          <GlobalTopBar 
            sales={data.sales} 
            reps={data.reps} 
            appointments={data.appointments} 
            medicines={data.medicines} 
          />
        )}
        
        <div className="flex-1 p-4 xl:p-8 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function GlobalTopBar({ sales, reps, appointments, medicines }: any) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const uaeTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(currentTime);

  const todayRevenue = (sales || []).filter((s: any) => {
    const saleDate = new Date(s.date);
    const today = new Date(2026, 4, 13); // Fixed target date for demo
    return saleDate.toDateString() === today.toDateString();
  }).reduce((acc: number, s: any) => acc + (s.amount || 0), 0);

  const activeReps = (reps || []).filter((r: any) => r.status === "on route").length;
  const pendingApps = (appointments || []).filter((a: any) => a.status === "scheduled").length;
  const lowStockCount = (medicines || []).filter((m: any) => m.stock < 300).length;

  return (
    <header className="h-24 border-b border-border bg-card/30 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="hidden xl:flex items-center gap-3 px-5 py-3 bg-emerald-500/10 rounded-[10px] border border-emerald-500/20 shadow-sm">
          <CalendarIcon size={20} className="text-emerald-600" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase text-black leading-tight">
              {new Date(2026, 4, 13).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[13px] font-black text-black tabular-nums tracking-tight">
              {uaeTime} <span className="text-[9px] opacity-40 ml-1">UAE</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <TopBarMetric label="Revenue Today" value={`${todayRevenue.toLocaleString()} AED`} icon={TrendingUp} color="text-emerald-500" />
          <div className="w-px h-8 bg-border hidden md:block" />
          <TopBarMetric label="Field Force" value="8/10 Active" icon={Users} color="text-blue-500" />
          <div className="w-px h-8 bg-border hidden lg:block" />
          <TopBarMetric label="Pending Sync" value={pendingApps.toString()} icon={Clock} color="text-purple-500" />
          <div className="w-px h-8 bg-border hidden lg:block" />
          <TopBarMetric label="Stock Alerts" value={lowStockCount.toString()} icon={AlertTriangle} color="text-amber-500" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">System Health</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-black uppercase text-emerald-500">Live Sync</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function TopBarMetric({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center gap-3 group cursor-default">
      <div className={cn("p-2 rounded-lg bg-secondary/50 group-hover:bg-secondary transition-colors", color)}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground leading-none mb-1">{label}</p>
        <p className="text-sm font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}
