"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueryKey, authQueryFn } from "@/lib/auth";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  CreditCard,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Loader2,
  AlertTriangle,
  BarChart2,
  UserCheck,
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles?: string[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2, roles: ["super-admin", "admin"] },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare, roles: ["super-admin"] },
  { name: "Users", href: "/dashboard/users", icon: Users, roles: ["super-admin", "admin"] },
  {
    name: "Payout Claims",
    href: "/dashboard/payouts",
    icon: CreditCard,
    roles: ["super-admin", "admin", "accountant"],
  },
  { name: "Tasks", href: "/dashboard/tasks", icon: ClipboardList, roles: ["super-admin", "admin", "task-officer"] },
  {
    name: "My Users",
    href: "/dashboard/my-users",
    icon: UserCheck,
    roles: ["account-manager", "super-admin", "admin"],
  },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({
  user,
  pathname,
  onNavClick,
  onLogoutClick,
}: {
  user: { name: string; email: string; role: string };
  pathname: string;
  onNavClick: (href: string) => void;
  onLogoutClick: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800/80 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/5">
          <Shield className="w-4.5 h-4.5" />
        </div>
        <div>
          <span className="font-bold text-zinc-100 tracking-tight block">PayFluence</span>
          <span className="text-[10px] text-zinc-550 font-semibold uppercase tracking-wider block">Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {SIDEBAR_ITEMS.filter((item) => {
          if (!item.roles) return true;
          const userRoles = user.role.split(",").map((r) => r.trim());
          return userRoles.some((r) => item.roles!.includes(r));
        }).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <button
              key={item.name}
              onClick={() => onNavClick(item.href)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-zinc-50 shadow-lg shadow-purple-500/10"
                  : "hover:bg-zinc-800/60 hover:text-zinc-100 text-zinc-400"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-zinc-50" : "text-zinc-500"}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800/80 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-bold text-sm text-purple-400 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-zinc-200 block truncate">{user.name}</span>
            <span className="text-xs text-zinc-500 block truncate">{user.email}</span>
          </div>
        </div>
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Sign out?</h3>
            <p className="text-sm text-zinc-400 mt-1">You will be redirected to the login page.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 hover:text-red-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

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

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!isLoading && user) {
      const activeItem = SIDEBAR_ITEMS.find(
        (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
      );
      if (activeItem?.roles) {
        const userRoles = user.role.split(",").map((r) => r.trim());
        const hasAccess = userRoles.some((r) => activeItem.roles!.includes(r));
        if (!hasAccess) {
          router.replace("/dashboard");
        }
      }
    }
  }, [pathname, user, isLoading, router]);

  const confirmLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
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
      {/* Desktop sidebar — fixed, never scrolls */}
      <aside className="hidden lg:flex lg:flex-col w-64 h-full border-r border-zinc-800/85 shrink-0">
        <SidebarContent
          user={user}
          pathname={pathname}
          onNavClick={handleNavClick}
          onLogoutClick={() => setShowLogoutModal(true)}
        />
      </aside>

      {/* Right side — content area scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-zinc-900/60 border-b border-zinc-800/80 backdrop-blur-md z-30 shrink-0">
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

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
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
                user={user}
                pathname={pathname}
                onNavClick={handleNavClick}
                onLogoutClick={() => {
                  setMobileOpen(false);
                  setShowLogoutModal(true);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutModal && <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowLogoutModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
