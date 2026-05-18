"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  Bell,
  MessageSquare,
  DollarSign,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { useData } from "@/lib/context/data-context";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    {
      id: "n-1",
      title: "Expense Request Approved",
      message: "Sarah Al Hashmi approved your fuel expense claim of 250 AED.",
      time: "5m ago",
      type: "expense",
      unread: true
    },
    {
      id: "n-2",
      title: "New Scheduled Appointment",
      message: "Dr. Ahmed Hammadi confirmed clinical audit sync for tomorrow at 10:00 AM.",
      time: "1h ago",
      type: "appointment",
      unread: true
    },
    {
      id: "n-3",
      title: "Unread Team Message",
      message: "Faisal Al Marzouqi: 'I just arrived at City Heart...'",
      time: "2h ago",
      type: "message",
      unread: true
    }
  ]);

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

      <div className="flex items-center gap-6 relative">
        {/* Notification Bell and Dropdown */}
        <div className="relative">
          <button
            id="notif-bell-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={cn(
              "p-2.5 rounded-[10px] bg-secondary/50 hover:bg-secondary transition-all relative border border-border/40 hover:border-primary/20 flex items-center justify-center",
              isNotifOpen && "bg-secondary text-primary"
            )}
            title="Notifications"
          >
            <Bell size={18} className={cn(isNotifOpen ? "text-primary" : "text-muted-foreground hover:text-foreground")} />
            {notifications.filter(n => n.unread).length > 0 && (
              <span 
                id="notif-badge" 
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-card animate-pulse"
              >
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <>
                {/* Click-outside backdrop */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsNotifOpen(false)} 
                />
                
                {/* Dropdown Small Modal */}
                <motion.div
                  id="notif-dropdown"
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-[10px] shadow-2xl z-50 overflow-hidden text-left"
                >
                  {/* Header */}
                  <div className="bg-secondary/20 border-b border-border/60 p-4 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Bell size={12} className="text-primary" /> Notifications
                    </h4>
                    {notifications.filter(n => n.unread).length > 0 && (
                      <button 
                        id="notif-mark-read-btn"
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                        className="text-[9px] font-black uppercase tracking-wider text-primary hover:underline transition-all"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Body list */}
                  <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => {
                        const getNotifIcon = () => {
                          switch (notif.type) {
                            case "expense": return <DollarSign size={13} className="text-emerald-600" />;
                            case "appointment": return <CalendarIcon size={13} className="text-blue-600" />;
                            case "message": return <MessageSquare size={13} className="text-purple-600" />;
                            default: return <Bell size={13} className="text-primary" />;
                          }
                        };
                        
                        const getNotifBg = () => {
                          switch (notif.type) {
                            case "expense": return "bg-emerald-500/10 border-emerald-500/20";
                            case "appointment": return "bg-blue-500/10 border-blue-500/20";
                            case "message": return "bg-purple-500/10 border-purple-500/20";
                            default: return "bg-primary/10 border-primary/20";
                          }
                        };

                        return (
                          <div 
                            key={notif.id}
                            id={`notif-item-${notif.id}`}
                            onClick={() => {
                              setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                            }}
                            className={cn(
                              "p-4 cursor-pointer hover:bg-secondary/40 transition-all flex gap-3 items-start border-l-[3px]",
                              notif.unread ? "bg-primary/[0.02] border-primary" : "bg-transparent border-transparent"
                            )}
                          >
                            <div className={cn("p-2 rounded-lg border shrink-0 mt-0.5 flex items-center justify-center", getNotifBg())}>
                              {getNotifIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <p className={cn("text-xs font-bold truncate leading-tight", notif.unread ? "text-foreground" : "text-muted-foreground")}>
                                  {notif.title}
                                </p>
                                <span className="text-[8px] text-muted-foreground/80 font-black uppercase shrink-0 mt-0.5">
                                  {notif.time}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 leading-normal font-medium whitespace-pre-wrap">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center opacity-40">
                        <CheckCircle2 size={24} className="text-muted-foreground mb-1" />
                        <p className="text-[10px] font-black uppercase tracking-wider">All caught up!</p>
                        <p className="text-[9px]">No new updates to show.</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-border/60 bg-secondary/10 flex justify-center">
                    <button 
                      onClick={() => setIsNotifOpen(false)}
                      className="w-full text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground py-1 bg-secondary/30 rounded-lg hover:bg-secondary transition-all"
                    >
                      Dismiss Panel
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* System Health */}
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
