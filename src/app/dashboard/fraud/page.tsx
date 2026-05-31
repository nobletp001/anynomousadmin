"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ScanSearch,
  AlertTriangle,
  Eye,
  ShieldOff,
  ShieldCheck,
  Users,
  CreditCard,
  Wifi,
  Smartphone,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Activity,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken() {
  if (typeof window !== "undefined") return localStorage.getItem("admin_token");
  return null;
}

async function apiFetch(path: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface FraudSummary {
  unresolvedAlerts: number;
  criticalAlerts: number;
  monitoredUsers: number;
  bankCollisions: number;
}

interface FraudAlert {
  id: number;
  username: string;
  alertType: string;
  severity: string;
  description: string;
  metadata: string;
  resolved: boolean;
  resolvedBy: string | null;
  createdAt: string;
}

interface CollisionRow {
  account_number?: string;
  bank_name?: string;
  ip_address?: string;
  device_id?: string;
  usernames: string[];
  user_count: number;
  submission_count?: number;
}

interface MonitoredUser {
  id: number;
  name: string;
  username: string;
  email: string;
  disabled: boolean;
  rating: number;
  monitored: boolean;
}

// ─── Severity Badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-zinc-700/40 text-zinc-400 border-zinc-600/40",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[severity] ?? map.medium}`}>
      {severity}
    </span>
  );
}

// ─── Alert Type Label ─────────────────────────────────────────────────────────
function alertTypeLabel(type: string) {
  const map: Record<string, string> = {
    bank_collision: "💳 Bank Collision",
    ip_collision: "🌐 IP Collision",
    device_collision: "📱 Device Collision",
    rapid_submission: "⚡ Rapid Submission",
    high_rejection_rate: "❌ High Rejection Rate",
  };
  return map[type] ?? type;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FraudPage() {
  const [activeTab, setActiveTab] = useState<"alerts" | "bank" | "ip" | "device" | "monitored">("alerts");
  const [summary, setSummary] = useState<FraudSummary | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [bankCollisions, setBankCollisions] = useState<CollisionRow[]>([]);
  const [ipCollisions, setIpCollisions] = useState<CollisionRow[]>([]);
  const [deviceCollisions, setDeviceCollisions] = useState<CollisionRow[]>([]);
  const [monitored, setMonitored] = useState<MonitoredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [analyzingUser, setAnalyzingUser] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [analyzeUsername, setAnalyzeUsername] = useState("");
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  const loadSummary = useCallback(async () => {
    const data = await apiFetch("/api/admin/fraud/summary");
    if (data.success) setSummary(data.data);
  }, []);

  const loadAlerts = useCallback(async () => {
    const data = await apiFetch(`/api/admin/fraud/alerts?resolved=${showResolved}`);
    if (data.success) setAlerts(data.data);
  }, [showResolved]);

  const loadBankCollisions = useCallback(async () => {
    const data = await apiFetch("/api/admin/fraud/account-collisions");
    if (data.success) setBankCollisions(data.data);
  }, []);

  const loadIPCollisions = useCallback(async () => {
    const data = await apiFetch("/api/admin/fraud/ip-collisions");
    if (data.success) setIpCollisions(data.data);
  }, []);

  const loadDeviceCollisions = useCallback(async () => {
    const data = await apiFetch("/api/admin/fraud/device-collisions");
    if (data.success) setDeviceCollisions(data.data);
  }, []);

  const loadMonitored = useCallback(async () => {
    const data = await apiFetch("/api/admin/fraud/monitored");
    if (data.success) setMonitored(data.data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadSummary(),
      loadAlerts(),
      loadBankCollisions(),
      loadIPCollisions(),
      loadDeviceCollisions(),
      loadMonitored(),
    ]);
    setLoading(false);
  }, [loadSummary, loadAlerts, loadBankCollisions, loadIPCollisions, loadDeviceCollisions, loadMonitored]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    loadAlerts();
  }, [showResolved, loadAlerts]);

  const handleResolveAlert = async (id: number) => {
    const data = await apiFetch(`/api/admin/fraud/alerts/${id}/resolve`, { method: "PATCH" });
    if (data.success) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      loadSummary();
    }
  };

  const handleRemoveFromWatch = async (username: string) => {
    const data = await apiFetch(`/api/admin/fraud/users/${username}/monitor`, {
      method: "PATCH",
      body: JSON.stringify({ monitored: false }),
    });
    if (data.success) {
      setMonitored((prev) => prev.filter((u) => u.username !== username));
      loadSummary();
    }
  };

  const handleAnalyze = async () => {
    if (!analyzeUsername.trim()) return;
    setAnalyzingUser(analyzeUsername.trim());
    setAnalyzeResult(null);
    const data = await apiFetch(`/api/admin/fraud/analyze/${analyzeUsername.trim()}`, { method: "POST" });
    setAnalyzeResult(data);
    setAnalyzingUser(null);
    loadSummary();
    loadAlerts();
  };

  const handleWatchFromCollision = async (username: string) => {
    const data = await apiFetch(`/api/admin/fraud/users/${username}/monitor`, {
      method: "PATCH",
      body: JSON.stringify({ monitored: true, runAnalysis: true }),
    });
    if (data.success) {
      alert(`✅ @${username} is now under watch.\n${data.newAlerts?.length > 0 ? `${data.newAlerts.length} fraud signal(s) detected.` : "No immediate flags — monitoring active."}`);
      loadMonitored();
      loadAlerts();
      loadSummary();
    }
  };

  const TABS = [
    { id: "alerts" as const, label: "Fraud Alerts", icon: AlertTriangle, count: summary?.unresolvedAlerts },
    { id: "bank" as const, label: "Bank Collisions", icon: CreditCard, count: bankCollisions.length },
    { id: "ip" as const, label: "IP Collisions", icon: Wifi, count: ipCollisions.length },
    { id: "device" as const, label: "Device Collisions", icon: Smartphone, count: deviceCollisions.length },
    { id: "monitored" as const, label: "Watch List", icon: Eye, count: monitored.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5">
            <ScanSearch className="w-5 h-5 text-violet-400" />
            Fraud & Security
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Monitor suspicious activity, track account collisions, and manage watchlist</p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Unresolved Alerts", value: summary.unresolvedAlerts, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
            { label: "Critical Alerts", value: summary.criticalAlerts, icon: ShieldOff, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
            { label: "Monitored Users", value: summary.monitoredUsers, icon: Eye, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
            { label: "Bank Collisions", value: summary.bankCollisions, icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border p-5 ${card.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{card.label}</span>
              </div>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* On-demand Analysis Tool */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-violet-400" />
          Run Fraud Analysis
        </h3>
        <div className="flex items-center gap-3">
          <input
            value={analyzeUsername}
            onChange={(e) => setAnalyzeUsername(e.target.value)}
            placeholder="Enter username to analyze..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-550 focus:outline-none focus:border-violet-500/50 max-w-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={!analyzeUsername.trim() || !!analyzingUser}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {analyzingUser ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {analyzeResult && (
          <div className={`mt-4 rounded-xl border p-4 ${analyzeResult.success ? "border-violet-500/20 bg-violet-500/5" : "border-red-500/20 bg-red-500/5"}`}>
            {analyzeResult.success ? (
              <div>
                <p className="text-sm font-bold text-zinc-200 mb-2">
                  @{analyzeResult.user?.username} — {analyzeResult.flagsFound} fraud signal(s) found
                </p>
                {analyzeResult.newAlerts?.length > 0 && (
                  <p className="text-xs text-violet-300 mb-3">{analyzeResult.newAlerts.length} new alert(s) created</p>
                )}
                {analyzeResult.allFlags?.length > 0 ? (
                  <div className="space-y-2">
                    {analyzeResult.allFlags.map((f: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-800">
                        <SeverityBadge severity={f.severity} />
                        <p className="text-xs text-zinc-300 leading-relaxed">{f.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> No fraud signals detected for this user
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-red-400">{analyzeResult.error}</p>
            )}
            <button onClick={() => setAnalyzeResult(null)} className="mt-3 text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800/80 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-violet-400 border-violet-500 bg-violet-500/5"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {(tab.count ?? 0) > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? "bg-violet-500/20 text-violet-300" : "bg-zinc-800 text-zinc-500"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden">

        {/* Fraud Alerts Tab */}
        {activeTab === "alerts" && (
          <div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
              <p className="text-xs text-zinc-500 font-semibold">{alerts.length} {showResolved ? "total" : "unresolved"} alert(s)</p>
              <button
                onClick={() => setShowResolved(!showResolved)}
                className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
              >
                {showResolved ? <ShieldOff className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                {showResolved ? "Hide Resolved" : "Show Resolved"}
              </button>
            </div>
            {alerts.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No {showResolved ? "" : "unresolved "}fraud alerts</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`px-5 py-4 ${alert.resolved ? "opacity-50" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <SeverityBadge severity={alert.severity} />
                          <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                            {alertTypeLabel(alert.alertType)}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-medium">@{alert.username}</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{alert.description}</p>
                        {alert.metadata && expandedAlert === alert.id && (
                          <pre className="mt-2 text-[10px] text-zinc-500 bg-zinc-950 rounded-lg p-3 border border-zinc-800/60 overflow-x-auto">
                            {JSON.stringify(JSON.parse(alert.metadata), null, 2)}
                          </pre>
                        )}
                        <p className="text-[10px] text-zinc-600 mt-1.5">{new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {alert.metadata && (
                          <button
                            onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                          >
                            {expandedAlert === alert.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {!alert.resolved && (
                          <button
                            onClick={() => handleWatchFromCollision(alert.username)}
                            className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors"
                            title="Watch this user"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Mark as resolved"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bank Collisions Tab */}
        {activeTab === "bank" && (
          <div>
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <p className="text-xs text-zinc-500">{bankCollisions.length} shared bank account number(s) detected</p>
            </div>
            {bankCollisions.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No shared bank accounts detected</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {bankCollisions.map((row, i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-sm font-bold text-zinc-200">{row.account_number}</span>
                          <span className="text-xs text-zinc-500">{row.bank_name}</span>
                        </div>
                        <p className="text-xs text-red-400 font-semibold mb-2">Shared by {row.user_count} accounts</p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(row.usernames) ? row.usernames : []).map((u) => (
                            <div key={u} className="flex items-center gap-1">
                              <span className="bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">@{u}</span>
                              <button
                                onClick={() => handleWatchFromCollision(u)}
                                title={`Watch @${u}`}
                                className="text-violet-400 hover:text-violet-300 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 uppercase">
                        CRITICAL
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* IP Collisions Tab */}
        {activeTab === "ip" && (
          <div>
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <p className="text-xs text-zinc-500">{ipCollisions.length} shared IP address(es) detected</p>
            </div>
            {ipCollisions.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No shared IP addresses detected</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {ipCollisions.map((row, i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Wifi className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-sm font-bold text-zinc-200 font-mono">{row.ip_address}</span>
                        </div>
                        <p className="text-xs text-orange-400 font-semibold mb-2">
                          {row.user_count} accounts · {row.submission_count ?? "?"} submissions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(row.usernames) ? row.usernames : []).map((u) => (
                            <div key={u} className="flex items-center gap-1">
                              <span className="bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">@{u}</span>
                              <button
                                onClick={() => handleWatchFromCollision(u)}
                                title={`Watch @${u}`}
                                className="text-violet-400 hover:text-violet-300 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <SeverityBadge severity={Number(row.user_count) >= 3 ? "critical" : "high"} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Device Collisions Tab */}
        {activeTab === "device" && (
          <div>
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <p className="text-xs text-zinc-500">{deviceCollisions.length} shared device ID(s) detected</p>
            </div>
            {deviceCollisions.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No shared device IDs detected</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {deviceCollisions.map((row, i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-xs font-bold text-zinc-200 font-mono truncate max-w-[240px]">
                            {(row.device_id ?? "").substring(0, 24)}...
                          </span>
                        </div>
                        <p className="text-xs text-yellow-400 font-semibold mb-2">
                          {row.user_count} accounts · {row.submission_count ?? "?"} submissions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(row.usernames) ? row.usernames : []).map((u) => (
                            <div key={u} className="flex items-center gap-1">
                              <span className="bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">@{u}</span>
                              <button
                                onClick={() => handleWatchFromCollision(u)}
                                title={`Watch @${u}`}
                                className="text-violet-400 hover:text-violet-300 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <SeverityBadge severity={Number(row.user_count) >= 3 ? "critical" : "high"} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Watch List Tab */}
        {activeTab === "monitored" && (
          <div>
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <p className="text-xs text-zinc-500">{monitored.length} user(s) under active monitoring</p>
            </div>
            {monitored.length === 0 ? (
              <div className="py-16 text-center">
                <Eye className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No users currently being monitored</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {monitored.map((user) => (
                  <div key={user.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{user.name}</p>
                        <p className="text-xs text-zinc-500">@{user.username} · {user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setAnalyzeUsername(user.username);
                          setActiveTab("alerts");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                      >
                        <Activity className="w-3 h-3" />
                        View Alerts
                      </button>
                      <button
                        onClick={() => handleRemoveFromWatch(user.username)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
