"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueryKey, authQueryFn } from "@/lib/auth";
import { Menu, X, Shield, Loader2 } from "lucide-react";
import { SidebarContent } from "./components/SidebarContent";
import { LogoutModal } from "./components/LogoutModal";
import { useIdleTimeout } from "./hooks/useIdleTimeout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Automatically log out user after 10 minutes of inactivity
  useIdleTimeout(user, isLoading);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  const confirmLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_user");
    queryClient.setQueryData(authQueryKey, null);
    queryClient.clear();
    router.replace("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm font-medium">Verifying credentials...</p>
      </div>
    );
  }

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <div className="h-screen bg-zinc-950 flex text-zinc-100 overflow-hidden">
      <aside className="hidden lg:flex lg:flex-col w-64 h-full border-r border-zinc-800/85 shrink-0">
        <SidebarContent
          user={user}
          pathname={pathname}
          onNavClick={handleNavClick}
          onLogoutClick={() => setShowLogoutModal(true)}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-zinc-905/60 border-b border-zinc-805/80 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-zinc-100 tracking-tight text-sm">PayFluence</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -mr-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
            >
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent
                user={user} pathname={pathname} onNavClick={handleNavClick}
                onLogoutClick={() => {
                  setMobileOpen(false);
                  setShowLogoutModal(true);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutModal && <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowLogoutModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
