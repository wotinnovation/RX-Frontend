"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { motion, Variants } from "framer-motion";
import { Mail, Lock, ArrowRight, Shield, TrendingUp, BarChart3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const PRIMARY = "#59b4b3";
const PRIMARY_SHADOW = "rgba(89,180,179,0.35)";

const leftVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function LoginPage() {
  const [role, setRole] = useState<"Sales Person" | "Manager">("Sales Person");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = role === "Manager" ? "John Manager" : "Faisal Al Marzouqi";
    login(name, role);
  };

  const features = [
    { icon: Shield, label: "Secure role-based access control" },
    { icon: TrendingUp, label: "Real-time sales analytics" },
    { icon: BarChart3, label: "Intelligent reporting & insights" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">

      {/* ── LEFT PANEL ───────────────────────────────────────── */}
      <motion.div
        className="relative flex-1 flex flex-col justify-between p-10 md:p-14 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0a5e 40%, #1e0a4a 100%)" }}
        variants={leftVariants}
        initial="hidden"
        animate="show"
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,80,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(120,80,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow orbs */}
        <motion.div
          className="absolute top-[20%] left-[30%] w-4 h-4 rounded-full bg-pink-400/60 blur-md"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[50%] left-[65%] w-3 h-3 rounded-full bg-purple-300/50 blur-md"
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-[70%] left-[20%] w-3.5 h-3.5 rounded-full blur-md"
          style={{ background: PRIMARY }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-10">
            <Image
              src="/images/logo/logo.png"
              alt="RX Logo"
              width={110}
              height={48}
              className="object-contain"
            />
          </motion.div>

          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 mb-8">
            <Zap size={12} style={{ color: PRIMARY }} />
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#c4b5fd" }}>
              Pharmaceutical Sales Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black leading-tight text-white mb-6 max-w-lg">
            Manage your{" "}
            <span style={{ color: "#f472b6" }}>sales pipeline</span>{" "}
            with precision.
          </motion.h1>

          {/* Sub */}
          <motion.p variants={itemVariants} className="text-sm leading-relaxed max-w-sm" style={{ color: "#a78bfa" }}>
            Track appointments, manage customers, and close deals — all in one powerful dashboard.
          </motion.p>
        </div>

        {/* Feature list */}
        <motion.div variants={itemVariants} className="relative z-10 space-y-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(89,180,179,0.18)" }}>
                <f.icon size={14} style={{ color: PRIMARY }} />
              </div>
              <span className="text-[13px] font-medium" style={{ color: "#c4b5fd" }}>{f.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full md:w-[380px] lg:w-[420px] flex items-center justify-center p-10 relative"
        style={{ background: "#e0f2f1" }}
      >
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight" style={{ color: "#1e1b2e" }}>Welcome back</h2>
            <p className="text-sm mt-1" style={{ color: "#7c6f9f" }}>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role toggle */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#7c6f9f" }}>Role</label>
              <div className="flex bg-white/60 p-1 rounded-xl border gap-1" style={{ borderColor: `${PRIMARY}40` }}>
                {(["Sales Person", "Manager"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "flex-1 py-2 text-[11px] font-black rounded-lg transition-all tracking-wide",
                      role === r ? "text-white shadow-md" : "hover:opacity-70"
                    )}
                    style={role === r
                      ? { background: PRIMARY, color: "#fff" }
                      : { color: PRIMARY }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#7c6f9f" }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: PRIMARY }} />
                <input
                  type="text"
                  readOnly
                  value={role === "Manager" ? "manager@rx.ae" : "faisal@rx.ae"}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none"
                  style={{ background: "rgba(255,255,255,0.7)", borderColor: `${PRIMARY}55`, color: "#1e1b2e" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#7c6f9f" }}>Password</label>
                <a href="#" className="text-[10px] font-bold hover:underline" style={{ color: PRIMARY }}>Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: PRIMARY }} />
                <input
                  type="password"
                  defaultValue="••••••••"
                  readOnly
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none"
                  style={{ background: "rgba(255,255,255,0.7)", borderColor: `${PRIMARY}55`, color: "#1e1b2e" }}
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: `0 12px 28px ${PRIMARY_SHADOW}` }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2"
              style={{ background: PRIMARY, boxShadow: `0 8px 24px ${PRIMARY_SHADOW}` }}
            >
              Sign In <ArrowRight size={16} />
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] mt-8" style={{ color: "#7c6f9f" }}>
            System Status:{" "}
            <span className="font-bold" style={{ color: PRIMARY }}>● Online</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}