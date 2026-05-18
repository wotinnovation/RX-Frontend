"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Pill,
  BarChart3,
  CheckCircle2,
  Gift,
  LogOut,
  Menu,
  X,
  Stethoscope,
  MapPin,
  ClipboardList,
  PlusCircle,
  UserPlus,
  Hospital,
  Receipt,
  FileText,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedAddForm } from "./forms/unified-add-form";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeModal, setActiveModal] = useState<"clinic" | "doctor" | "staff" | null>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isManager = user?.role === "Manager";

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: isManager ? "/dashboard/manager" : "/dashboard/staff" },
    ...(isManager ? [
      { icon: ClipboardList, label: "Appointments", href: "/dashboard/manager-appointments" },
      { icon: Users, label: "Team Performance", href: "/dashboard/team" },
      { icon: MapPin, label: "Customer Assignment", href: "/dashboard/customers" },
      { icon: FileText, label: "Intelligence Center", href: "/dashboard/reports" },
      { icon: Receipt, label: "Approvals & Expenses", href: "/dashboard/approvals" },
    ] : [
      { icon: Calendar, label: "Appointments", href: "/dashboard/staff-appointments" },
      { icon: ClipboardList, label: "Meetings & Visits", href: "/dashboard/staff-meetings" },
    ]),
    { icon: BarChart3, label: "Sales View", href: "/dashboard/sales" },
    { icon: Pill, label: "Clinical Samples", href: "/dashboard/free-medicine" },
    { icon: Gift, label: "Gifts & Meetups", href: "/dashboard/gifts-meetups" },
    { icon: MessageSquare, label: "Team Chat", href: "/dashboard/chat" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 lg:hidden bg-primary text-primary-foreground rounded-[10px] shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)" }}
        className={cn(
          "fixed top-0 left-0 h-screen bg-card border-r border-border z-40 transition-all duration-300 ease-in-out flex flex-col sidebar-container",
          !isOpen && "items-center"
        )}
      >
        {/* Logo */}
        <div className="h-24 px-4 flex items-center justify-center overflow-hidden border-b border-border/40">
          {isOpen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/logo/logo.png"
              alt="RX Logo"
              style={{ width: 120, height: 'auto', display: 'block' }}
            />
          ) : (
            <div className="w-12 h-12 rounded-[10px] bg-primary/10 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/logo.png"
                alt="RX"
                style={{ width: 36, height: 'auto', display: 'block' }}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-[10px] transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon size={22} className={cn(isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                <AnimatePresence mode="wait">
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Manager Quick Actions */}
        {isManager && (
          <div className="px-4 py-4 space-y-2 border-t border-border">
            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 mb-2">Resource Center</p>
                  <button
                    onClick={() => setActiveModal("clinic")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 rounded-[10px] transition-all border border-primary/20 shadow-sm"
                  >
                    <PlusCircle size={18} /> Quick Onboard
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setActiveModal("clinic")}
                    className="p-3 text-primary bg-primary/5 hover:bg-primary/10 rounded-[10px] border border-primary/20"
                    title="Quick Onboard"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-border mt-auto">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-[10px] bg-secondary/50",
            !isOpen && "justify-center"
          )}>
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground shrink-0 shadow-inner">
              {user?.name?.charAt(0) || "S"}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || "Sarakhan"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role || "Sales Person"}</p>
              </div>
            )}
            {isOpen && (
              <button
                onClick={logout}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-[10px] transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
          {!isOpen && (
            <button
              onClick={logout}
              className="mt-4 p-3 hover:bg-destructive/10 hover:text-destructive rounded-[10px] transition-colors w-full flex justify-center"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main Content Spacer (Desktop) */}
      <div
        className="hidden lg:block transition-all duration-300 ease-in-out"
        style={{ width: isOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)" }}
      />

      <AnimatePresence>
        {activeModal && (
          <UnifiedAddForm
            initialTab={activeModal as any}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
