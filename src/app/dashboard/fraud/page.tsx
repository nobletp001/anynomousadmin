"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ScanSearch, AlertTriangle, Eye, CreditCard, Wifi, Smartphone, RefreshCw, Activity, ShieldCheck, ShieldOff } from "lucide-react";
import { apiFetch } from "./utils";
import { AlertsTab } from "./components/AlertsTab";
import { MonitoredTab } from "./components/MonitoredTab";
import { CollisionTab } from "./components/CollisionTab";
import { CollisionDetailsView } from "./components/CollisionDetailsView";

interface FraudSummary {
  unresolvedAlerts: number;
  criticalAlerts: number;
  monitoredUsers: number;
  bankCollisions: number;
}

export default function FraudPage() {
  const [activeTab, setActiveTab] = useState<"alerts" | "bank" | "ip" | "device" | "monitored">("alerts");
  const [summary, setSummary] = useState<FraudSummary | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [bankCollisions, setBankCollisions] = useState<any[]>([]);
  const [ipCollisions, setIpCollisions] = useState<any[]>([]);
  const [deviceCollisions, setDeviceCollisions] = useState<any[]>([]);
  const [monitored, setMonitored] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [analyzingUser, setAnalyzingUser] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [analyzeUsername, setAnalyzeUsername] = useState("");

  const [investigatingCollision, setInvestigatingCollision] = useState<{ type: "bank" | "ip" | "device"; value: string } | null>(null);
  const [collisionDetails, setCollisionDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      alert(`✅ @${username} is now under watch.`);
      loadMonitored();
      loadAlerts();
      loadSummary();
    }
  };

  const loadCollisionDetails = async (type: "bank" | "ip" | "device", value: string) => {
    setLoadingDetails(true);
    setCollisionDetails([]);
    try {
      const data = await apiFetch(`/api/admin/fraud/collision-details?type=${type}&value=${encodeURIComponent(value)}`);
      if (data.success) setCollisionDetails(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleWatch = async (username: string, currentMonitored: boolean) => {
    const data = await apiFetch(`/api/admin/fraud/users/${username}/monitor`, {
      method: "PATCH",
      body: JSON.stringify({ monitored: !currentMonitored }),
    });
    if (data.success) {
      setCollisionDetails((prev) =>
        prev.map((item) =>
          item.user.username === username
            ? { ...item, user: { ...item.user, monitored: !currentMonitored } }
            : item
        )
      );
      loadMonitored();
      loadSummary();
    }
  };

  const handleToggleDisable = async (userId: number, currentDisabled: boolean) => {
    const data = await apiFetch(`/api/admin/users/${userId}/flags`, {
      method: "PATCH",
      body: JSON.stringify({ disabled: !currentDisabled }),
    });
    if (data.success) {
      setCollisionDetails((prev) =>
        prev.map((item) =>
          item.user.id === userId
            ? {
                ...item,
                user: {
                  ...item.user,
                  disabled: !currentDisabled,
                  withdrawalDisabled: !currentDisabled ? true : item.user.withdrawalDisabled,
                  taskDisabled: !currentDisabled ? true : item.user.taskDisabled,
                },
              }
            : item
        )
      );
    }
  };

  const handleToggleTaskDisabled = async (userId: number, currentTaskDisabled: boolean) => {
    const data = await apiFetch(`/api/admin/users/${userId}/flags`, {
      method: "PATCH",
      body: JSON.stringify({ taskDisabled: !currentTaskDisabled }),
    });
    if (data.success) {
      setCollisionDetails((prev) =>
        prev.map((item) =>
          item.user.id === userId
            ? { ...item, user: { ...item.user, taskDisabled: !currentTaskDisabled } }
            : item
        )
      );
    }
  };

  const handleToggleWithdrawalDisabled = async (userId: number, currentWithdrawalDisabled: boolean) => {
    const data = await apiFetch(`/api/admin/users/${userId}/flags`, {
      method: "PATCH",
      body: JSON.stringify({ withdrawalDisabled: !currentWithdrawalDisabled }),
    });
    if (data.success) {
      setCollisionDetails((prev) =>
        prev.map((item) =>
          item.user.id === userId
            ? { ...item, user: { ...item.user, withdrawalDisabled: !currentWithdrawalDisabled } }
            : item
        )
      );
    }
  };

  const TABS = [
    { id: "alerts" as const, label: "Fraud Alerts", icon: AlertTriangle, count: summary?.unresolvedAlerts },
    { id: "bank" as const, label: "Bank Collisions", icon: CreditCard, count: bankCollisions.length },
    { id: "ip" as const, label: "IP Collisions", icon: Wifi, count: ipCollisions.length },
    { id: "device" as const, label: "Device Collisions", icon: Smartphone, count: deviceCollisions.length },
    { id: "monitored" as const, label: "Watch List", icon: Eye, count: monitored.length },
  ];

  if (investigatingCollision) {
    return (
      <CollisionDetailsView
        investigatingCollision={investigatingCollision}
        collisionDetails={collisionDetails}
        loadingDetails={loadingDetails}
        onClose={() => {
          setInvestigatingCollision(null);
          setCollisionDetails([]);
        }}
        onRefresh={() => loadCollisionDetails(investigatingCollision.type, investigatingCollision.value)}
        onToggleWatch={handleToggleWatch}
        onToggleDisable={handleToggleDisable}
        onToggleTaskDisabled={handleToggleTaskDisabled}
        onToggleWithdrawalDisabled={handleToggleWithdrawalDisabled}
      />
    );
  }

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
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
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
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">{card.label}</span>
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
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                  <p className="text-xs text-violet-350 mb-3">{analyzeResult.newAlerts.length} new alert(s) created</p>
                )}
                {analyzeResult.allFlags?.length > 0 ? (
                  <div className="space-y-2">
                    {analyzeResult.allFlags.map((f: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-800">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-zinc-800 border border-zinc-700 text-zinc-400 select-none">
                          {f.severity}
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed">{f.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-450 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> No fraud signals detected for this user
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-red-400">{analyzeResult.error}</p>
            )}
            <button onClick={() => setAnalyzeResult(null)} className="mt-3 text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer">
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
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 -mb-px cursor-pointer ${
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
        {activeTab === "alerts" && (
          <AlertsTab
            alerts={alerts}
            showResolved={showResolved}
            onToggleShowResolved={() => setShowResolved(!showResolved)}
            onWatchUser={handleWatchFromCollision}
            onResolveAlert={handleResolveAlert}
          />
        )}
        {activeTab === "bank" && (
          <CollisionTab
            type="bank"
            collisions={bankCollisions}
            onInvestigate={(val) => {
              setInvestigatingCollision({ type: "bank", value: val });
              loadCollisionDetails("bank", val);
            }}
            onWatchUser={handleWatchFromCollision}
          />
        )}
        {activeTab === "ip" && (
          <CollisionTab
            type="ip"
            collisions={ipCollisions}
            onInvestigate={(val) => {
              setInvestigatingCollision({ type: "ip", value: val });
              loadCollisionDetails("ip", val);
            }}
            onWatchUser={handleWatchFromCollision}
          />
        )}
        {activeTab === "device" && (
          <CollisionTab
            type="device"
            collisions={deviceCollisions}
            onInvestigate={(val) => {
              setInvestigatingCollision({ type: "device", value: val });
              loadCollisionDetails("device", val);
            }}
            onWatchUser={handleWatchFromCollision}
          />
        )}
        {activeTab === "monitored" && (
          <MonitoredTab
            monitored={monitored}
            onViewAlerts={(user) => {
              setAnalyzeUsername(user);
              setActiveTab("alerts");
            }}
            onRemoveFromWatch={handleRemoveFromWatch}
          />
        )}
      </div>
    </div>
  );
}
