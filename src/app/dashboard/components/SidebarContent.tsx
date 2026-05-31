import React from "react";
import {
  LayoutDashboard,
  BarChart2,
  MessageSquare,
  Users,
  CreditCard,
  ClipboardList,
  UserCheck,
  Settings,
  Shield,
  LogOut,
  Trophy,
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
    name: "Leadership",
    href: "/dashboard/leadership",
    icon: Trophy,
    roles: ["super-admin", "admin"],
  },
  {
    name: "My Users",
    href: "/dashboard/my-users",
    icon: UserCheck,
    roles: ["account-manager", "super-admin", "admin"],
  },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarContentProps {
  user: { name: string; email: string; role: string };
  pathname: string;
  onNavClick: (href: string) => void;
  onLogoutClick: () => void;
}

export function SidebarContent({
  user,
  pathname,
  onNavClick,
  onLogoutClick,
}: SidebarContentProps) {
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
            <span className="text-xs text-zinc-550 block truncate">{user.email}</span>
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
