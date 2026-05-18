"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "Manager") {
        router.push("/dashboard/manager");
      } else {
        router.push("/dashboard/staff");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}