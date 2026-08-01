"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import {
  Ban,
  Banknote,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  ExternalLink,
  FileBadge,
  Link2,
  Percent,
  Power,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

import { Badge, Button, Card, Input } from "@/components/ui";
import {
  attachCelebrityReferral,
  directVerifyCelebrity,
  getCelebrityApplicantDetail,
  getCelebrityPaymentDashboard,
  listCelebrityApplications,
  listCelebrityServices,
  reviewCelebrityApplication,
  reviewCelebrityService,
  scheduleCelebrityApplication,
  updateCelebrityPaymentSettings,
  upsertCelebrityReferralCommissionSplit,
  type AdminUserDetail,
  type CelebrityApplication,
  type CelebrityPaymentDashboard,
  type CelebrityService,
} from "@/services/celebrity-service";

type ReviewTab = "pending" | "approved";
type ReviewDecision = "approve" | "reject";
type DateFilter = "all" | "1" | "2" | "3" | "custom";
type ScheduleDraft = { googleMeetLink: string; meetingScheduledAt: string; referralUsername: string };
type ConfirmState = { app: CelebrityApplication; action: ReviewDecision } | null;
const ITEMS_PER_PAGE = 6;
const CATEGORY_OPTIONS = [
  "Music",
  "Comedy",
  "Fashion",
  "Beauty",
  "Fitness",
  "Lifestyle",
  "Gaming",
  "Sports",
  "Technology",
  "Food",
  "Travel",
  "Business",
];
const COUNTRY_OPTIONS = ["Nigeria"];
const currencyFormatter = new Intl.NumberFormat("en-NG", {
  currency: "NGN",
  maximumFractionDigits: 0,
  style: "currency",
});

export default function CelebrityAdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ReviewTab>("pending");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<CelebrityService | null>(null);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDate, setCustomDate] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [rejectReason, setRejectReason] = useState("Rejected by admin review.");
  const [message, setMessage] = useState<string | null>(null);
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<number, ScheduleDraft>>({});
  const [directVerify, setDirectVerify] = useState({ username: "", category: "", country: "Nigeria" });
  const [referralAttach, setReferralAttach] = useState({ celebrityUsername: "", referralUsername: "" });
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [clearanceDays, setClearanceDays] = useState(5);
  const [splitDraft, setSplitDraft] = useState({
    celebrityUsername: "",
    referrerUsername: "",
    systemSharePercent: 50,
    referralSharePercent: 50,
  });
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 15_000);
    return () => window.clearInterval(interval);
  }, []);

  const pendingQuery = useQuery({
    queryKey: ["admin", "celebrity", "applications", "pending"],
    queryFn: () => listCelebrityApplications("pending").then((res) => res.data || []),
  });
  const approvedQuery = useQuery({
    queryKey: ["admin", "celebrity", "applications", "approved"],
    queryFn: () => listCelebrityApplications("approved").then((res) => res.data || []),
  });
  const servicesQuery = useQuery({
    queryKey: ["admin", "celebrity", "services", "all"],
    queryFn: () => listCelebrityServices().then((res) => res.data || []),
  });
  const paymentsQuery = useQuery({
    queryKey: ["admin", "celebrity", "payments", 1],
    queryFn: () => getCelebrityPaymentDashboard({ page: 1, limit: 8 }).then((res) => res.data),
  });

  useEffect(() => {
    if (paymentsQuery.data?.settings?.commissionPercent !== undefined) {
      setCommissionPercent(paymentsQuery.data.settings.commissionPercent);
    }
    if (paymentsQuery.data?.settings?.clearanceDays !== undefined) {
      setClearanceDays(paymentsQuery.data.settings.clearanceDays);
    }
  }, [paymentsQuery.data?.settings?.commissionPercent, paymentsQuery.data?.settings?.clearanceDays]);

  const applications = useMemo(
    () => (activeTab === "pending" ? pendingQuery.data || [] : approvedQuery.data || []),
    [activeTab, approvedQuery.data, pendingQuery.data]
  );
  const filteredApplications = useMemo(
    () => filterApplicationsByDate(applications, dateFilter, customDate),
    [applications, customDate, dateFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / ITEMS_PER_PAGE));
  const paginatedApplications = filteredApplications.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const selectedApp = applications.find((app) => app.id === selectedId) || null;
  const applicantQuery = useQuery({
    enabled: !!selectedApp?.username,
    queryKey: ["admin", "celebrity", "applicant", selectedApp?.username],
    queryFn: () => getCelebrityApplicantDetail(selectedApp!.username).then((res) => res.data || {}),
  });

  const draft = selectedApp
    ? scheduleDrafts[selectedApp.id] || {
        googleMeetLink: selectedApp.googleMeetLink || "",
        meetingScheduledAt: toDateTimeLocal(selectedApp.meetingScheduledAt),
        referralUsername: selectedApp.referralUsername || "",
      }
    : null;
  const canReview = !!selectedApp && isReviewTimeReached(selectedApp, nowMs);
  const confirmDraft = confirmState
    ? scheduleDrafts[confirmState.app.id] || {
        googleMeetLink: confirmState.app.googleMeetLink || "",
        meetingScheduledAt: toDateTimeLocal(confirmState.app.meetingScheduledAt),
        referralUsername: confirmState.app.referralUsername || "",
      }
    : undefined;

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "applications"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "services"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "payments"] }),
      selectedApp
        ? queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "applicant", selectedApp.username] })
        : Promise.resolve(),
    ]);
  }

  function updateDraft(id: number, patch: Partial<ScheduleDraft>) {
    setScheduleDrafts((current) => ({
      ...current,
      [id]: {
        googleMeetLink: current[id]?.googleMeetLink || "",
        meetingScheduledAt: current[id]?.meetingScheduledAt || "",
        referralUsername: current[id]?.referralUsername || "",
        ...patch,
      },
    }));
  }

  async function runAction(label: string, action: () => Promise<unknown>) {
    setMessage(null);
    try {
      await action();
      setMessage(label);
      await refresh();
      setConfirmState(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    }
  }

  return (
    <div className="space-y-6">
      <ReviewHeader
        directVerify={directVerify}
        message={message}
        pendingCount={pendingQuery.data?.length || 0}
        setDirectVerify={setDirectVerify}
        onDirectVerify={() =>
          runAction("Celebrity verified by username.", () =>
            directVerifyCelebrity({
              username: directVerify.username,
              category: directVerify.category || undefined,
              country: directVerify.country || undefined,
            })
          )
        }
      />

      <AttachReferralSection
        referralAttach={referralAttach}
        setReferralAttach={setReferralAttach}
        onAttachReferral={() =>
          runAction("Referral attached to celebrity.", async () => {
            await attachCelebrityReferral({
              celebrityUsername: referralAttach.celebrityUsername,
              referralUsername: referralAttach.referralUsername,
            });
            setReferralAttach({ celebrityUsername: "", referralUsername: "" });
          })
        }
      />

      <CelebrityPaymentsSection
        commissionPercent={commissionPercent}
        data={paymentsQuery.data}
        loading={paymentsQuery.isLoading}
        setCommissionPercent={setCommissionPercent}
        setSplitDraft={setSplitDraft}
        splitDraft={splitDraft}
        onSaveCommission={() =>
          runAction("Celebrity commission updated.", () =>
            updateCelebrityPaymentSettings({ commissionPercent, clearanceDays })
          )
        }
        onSaveSplit={() =>
          runAction("Celebrity referral commission split saved.", async () => {
            await upsertCelebrityReferralCommissionSplit(splitDraft);
            setSplitDraft({
              celebrityUsername: "",
              referrerUsername: "",
              systemSharePercent: 50,
              referralSharePercent: 50,
            });
          })
        }
      />

      <TabBar
        activeTab={activeTab}
        approvedCount={approvedQuery.data?.length || 0}
        pendingCount={pendingQuery.data?.length || 0}
        onChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
          setSelectedId(null);
        }}
      />

      <ReviewFilters
        customDate={customDate}
        dateFilter={dateFilter}
        resultCount={filteredApplications.length}
        setCustomDate={(value) => {
          setCustomDate(value);
          setPage(1);
        }}
        setDateFilter={(value) => {
          setDateFilter(value);
          setPage(1);
        }}
      />

      <ApplicationGrid
        activeTab={activeTab}
        applications={paginatedApplications}
        loading={pendingQuery.isLoading || approvedQuery.isLoading}
        onSelect={setSelectedId}
      />

      <ReviewPagination
        page={page}
        pageSize={ITEMS_PER_PAGE}
        setPage={setPage}
        totalItems={filteredApplications.length}
        totalPages={totalPages}
      />

      <CelebrityServicesSection
        loading={servicesQuery.isLoading}
        onDisable={(service) =>
          runAction("Celebrity service disabled.", () => reviewCelebrityService(service.id, "disable"))
        }
        onEnable={(service) =>
          runAction("Celebrity service enabled.", () => reviewCelebrityService(service.id, "enable"))
        }
        onSelect={setSelectedService}
        services={servicesQuery.data || []}
      />

      {selectedApp && draft ? (
        <DetailModal onClose={() => setSelectedId(null)}>
          <ApplicationDetail
            applicant={applicantQuery.data}
            app={selectedApp}
            canReview={canReview}
            draft={draft}
            onConfirm={(action) => {
              setRejectReason("Rejected by admin review.");
              setConfirmState({ app: selectedApp, action });
            }}
            onSchedule={() => {
              if (!isScheduleAtLeastTenMinutesAway(draft.meetingScheduledAt)) {
                setMessage("Pick a date and time at least 10 minutes from now.");
                return;
              }
              void runAction("Meeting scheduled.", () =>
                scheduleCelebrityApplication(selectedApp.id, {
                  googleMeetLink: draft.googleMeetLink,
                  meetingScheduledAt: new Date(draft.meetingScheduledAt).toISOString(),
                })
              );
            }}
            onAttachReferral={() =>
              runAction("Celebrity referral attached.", () =>
                scheduleCelebrityApplication(selectedApp.id, {
                  googleMeetLink: draft.googleMeetLink || selectedApp.googleMeetLink || "",
                  meetingScheduledAt: draft.meetingScheduledAt
                    ? new Date(draft.meetingScheduledAt).toISOString()
                    : selectedApp.meetingScheduledAt || "",
                  referralUsername: draft.referralUsername || undefined,
                })
              )
            }
            onUpdateDraft={(patch) => updateDraft(selectedApp.id, patch)}
          />
        </DetailModal>
      ) : null}

      {selectedService ? (
        <DetailModal onClose={() => setSelectedService(null)}>
          <ServiceDetail
            onDisable={() =>
              runAction("Celebrity service disabled.", async () => {
                await reviewCelebrityService(selectedService.id, "disable");
                setSelectedService(null);
              })
            }
            onEnable={() =>
              runAction("Celebrity service enabled.", async () => {
                await reviewCelebrityService(selectedService.id, "enable");
                setSelectedService(null);
              })
            }
            service={selectedService}
          />
        </DetailModal>
      ) : null}

      {confirmState && (
        <ConfirmReviewModal
          canReview={isReviewTimeReached(confirmState.app, nowMs)}
          draft={confirmDraft}
          reason={rejectReason}
          state={confirmState}
          onChangeReason={setRejectReason}
          onClose={() => setConfirmState(null)}
          onSubmit={() =>
            runAction(
              confirmState.action === "approve"
                ? "Celebrity verification approved."
                : "Celebrity verification rejected.",
              () =>
                reviewCelebrityApplication(confirmState.app.id, confirmState.action, {
                  googleMeetLink: confirmDraft?.googleMeetLink || undefined,
                  meetingScheduledAt: confirmDraft?.meetingScheduledAt
                    ? new Date(confirmDraft.meetingScheduledAt).toISOString()
                    : undefined,
                  rejectionReason: confirmState.action === "reject" ? rejectReason : undefined,
                })
            )
          }
        />
      )}
    </div>
  );
}

function ReviewHeader({
  directVerify,
  message,
  pendingCount,
  setDirectVerify,
  onDirectVerify,
}: {
  directVerify: { username: string; category: string; country: string };
  message: string | null;
  pendingCount: number;
  setDirectVerify: (value: { username: string; category: string; country: string }) => void;
  onDirectVerify: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 p-3 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(45,212,191,.22),transparent_28%),radial-gradient(circle_at_70%_0%,rgba(251,191,36,.18),transparent_26%),radial-gradient(circle_at_92%_72%,rgba(244,63,94,.18),transparent_30%)]" />
      <div className="relative grid gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-[26px] border border-white/10 bg-white/[0.045] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-teal-200">
                <Sparkles className="h-3.5 w-3.5" />
                Creator ops
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] text-zinc-50 md:text-5xl">
                Celebrity verification, but make it clean.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                Pick an applicant, inspect their full profile, schedule the Meet, attach referral separately, then
                confirm the final decision.
              </p>
            </div>
            <div className="grid min-w-32 place-items-center rounded-[26px] border border-amber-300/20 bg-amber-300/10 px-5 py-4">
              <p className="text-4xl font-black text-amber-100">{pendingCount}</p>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300/70">pending</p>
            </div>
          </div>
          {message ? (
            <p className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-sm font-bold text-teal-100">
              {message}
            </p>
          ) : null}
        </section>

        <section className="rounded-[26px] border border-white/10 bg-zinc-900/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-100">Direct verification</h2>
              <p className="text-xs font-semibold text-zinc-500">No referral is attached from here.</p>
            </div>
          </div>
          <div className="grid gap-3">
            <Input
              label="Username"
              onChange={(event) => setDirectVerify({ ...directVerify, username: event.target.value })}
              placeholder="username"
              value={directVerify.username}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <DirectVerifySelect
                label="Category"
                onChange={(event) => setDirectVerify({ ...directVerify, category: event.target.value })}
                options={CATEGORY_OPTIONS}
                placeholder="Select category"
                value={directVerify.category}
              />
              <DirectVerifySelect
                label="Country"
                onChange={(event) => setDirectVerify({ ...directVerify, country: event.target.value })}
                options={COUNTRY_OPTIONS}
                value={directVerify.country}
              />
            </div>
          </div>
          <Button
            className="mt-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/10"
            disabled={!directVerify.username.trim() || !directVerify.category || !directVerify.country}
            fullWidth
            leftIcon={<Search className="h-4 w-4" />}
            onClick={onDirectVerify}
          >
            Verify username only
          </Button>
        </section>
      </div>
    </div>
  );
}

function DirectVerifySelect({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
      <select
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-200 outline-none transition-all duration-200 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/20"
        onChange={onChange}
        value={value}
      >
        {placeholder ? (
          <option disabled value="">
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AttachReferralSection({
  referralAttach,
  setReferralAttach,
  onAttachReferral,
}: {
  referralAttach: { celebrityUsername: string; referralUsername: string };
  setReferralAttach: (value: { celebrityUsername: string; referralUsername: string }) => void;
  onAttachReferral: () => void;
}) {
  return (
    <Card className="overflow-hidden border-fuchsia-300/20 bg-zinc-950/80 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-fuchsia-300/10 text-fuchsia-200">
              <Link2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-zinc-50">Attach referral to celebrity</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                Use this only to connect an existing celebrity to the user who referred them.
              </p>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <Input
            label="Celebrity username"
            onChange={(event) => setReferralAttach({ ...referralAttach, celebrityUsername: event.target.value })}
            placeholder="celebrity username"
            value={referralAttach.celebrityUsername}
          />
          <Input
            label="Referral username"
            onChange={(event) => setReferralAttach({ ...referralAttach, referralUsername: event.target.value })}
            placeholder="username to attach"
            value={referralAttach.referralUsername}
          />
          <Button
            className="self-end bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-lg shadow-purple-500/10"
            disabled={!referralAttach.celebrityUsername.trim() || !referralAttach.referralUsername.trim()}
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={onAttachReferral}
          >
            Attach
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CelebrityPaymentsSection({
  commissionPercent,
  data,
  loading,
  setCommissionPercent,
  setSplitDraft,
  splitDraft,
  onSaveCommission,
  onSaveSplit,
}: {
  commissionPercent: number;
  data?: CelebrityPaymentDashboard;
  loading: boolean;
  setCommissionPercent: (value: number) => void;
  setSplitDraft: (value: {
    celebrityUsername: string;
    referrerUsername: string;
    systemSharePercent: number;
    referralSharePercent: number;
  }) => void;
  splitDraft: {
    celebrityUsername: string;
    referrerUsername: string;
    systemSharePercent: number;
    referralSharePercent: number;
  };
  onSaveCommission: () => void;
  onSaveSplit: () => void;
}) {
  const totals = data?.totals;
  const splitTotal = splitDraft.systemSharePercent + splitDraft.referralSharePercent;
  return (
    <Card className="overflow-hidden border-emerald-300/20 bg-zinc-950/80 p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-200">
            <Banknote className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-zinc-50">Celebrity payment dashboard</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Backend-calculated gross, seller net, system commission, referral commission, and buyer returns.
            </p>
          </div>
        </div>
        <Badge variant="success">{loading ? "loading" : `${data?.pagination.total || 0} ledger rows`}</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MoneyTile label="Gross paid" value={totals?.grossAmount || 0} />
        <MoneyTile label="Celebrity net" value={totals?.celebrityAmount || 0} />
        <MoneyTile label="System" value={totals?.systemAmount || 0} />
        <MoneyTile label="Referral" value={totals?.referralAmount || 0} />
        <MoneyTile label="Buyer returned" value={totals?.refundedToWallet || 0} />
        <MoneyTile label="Held amount" value={totals?.heldAmount || 0} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-emerald-300" />
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">Platform commission</h3>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <Input
              label="Percent"
              max={100}
              min={0}
              onChange={(event) => setCommissionPercent(Number(event.target.value))}
              type="number"
              value={String(commissionPercent)}
            />
            <Button disabled={commissionPercent < 0 || commissionPercent > 100} onClick={onSaveCommission}>
              Save
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">Special referral split</h3>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_120px_120px_auto]">
            <Input
              label="Celebrity"
              onChange={(event) => setSplitDraft({ ...splitDraft, celebrityUsername: event.target.value })}
              placeholder="celebrity username"
              value={splitDraft.celebrityUsername}
            />
            <Input
              label="Referrer"
              onChange={(event) => setSplitDraft({ ...splitDraft, referrerUsername: event.target.value })}
              placeholder="referrer username"
              value={splitDraft.referrerUsername}
            />
            <Input
              label="System %"
              max={100}
              min={0}
              onChange={(event) => setSplitDraft({ ...splitDraft, systemSharePercent: Number(event.target.value) })}
              type="number"
              value={String(splitDraft.systemSharePercent)}
            />
            <Input
              label="Referral %"
              max={100}
              min={0}
              onChange={(event) => setSplitDraft({ ...splitDraft, referralSharePercent: Number(event.target.value) })}
              type="number"
              value={String(splitDraft.referralSharePercent)}
            />
            <Button
              className="self-end"
              disabled={
                !splitDraft.celebrityUsername.trim() ||
                !splitDraft.referrerUsername.trim() ||
                splitTotal > 100 ||
                splitDraft.systemSharePercent < 0 ||
                splitDraft.referralSharePercent < 0
              }
              onClick={onSaveSplit}
            >
              Save
            </Button>
          </div>
          <p className={`mt-2 text-xs font-semibold ${splitTotal > 100 ? "text-red-300" : "text-zinc-500"}`}>
            System and referral share total: {splitTotal}%
          </p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-zinc-800">
        {(data?.items || []).slice(0, 6).map((item) => (
          <div className="grid gap-3 py-3 text-sm md:grid-cols-[120px_1fr_1fr_1fr]" key={item.id}>
            <span className="font-bold text-zinc-400">Order #{item.orderId}</span>
            <span className="text-zinc-300">
              @{item.buyerUsername} → @{item.celebrityUsername}
            </span>
            <span className="text-zinc-400">
              Seller {currencyFormatter.format(item.celebrityAmount)} · Buyer{" "}
              {currencyFormatter.format(item.refundAmount)}
            </span>
            <span className="text-zinc-500">
              System {currencyFormatter.format(item.systemAmount)} · Referral{" "}
              {currencyFormatter.format(item.referralAmount)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MoneyTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black text-zinc-100">{currencyFormatter.format(value)}</p>
    </div>
  );
}

function TabBar({
  activeTab,
  approvedCount,
  pendingCount,
  onChange,
}: {
  activeTab: ReviewTab;
  approvedCount: number;
  pendingCount: number;
  onChange: (tab: ReviewTab) => void;
}) {
  const tabs = [
    { id: "pending" as const, label: "Pending verification", count: pendingCount, icon: CalendarClock },
    { id: "approved" as const, label: "Approved celebrities", count: approvedCount, icon: UserRoundCheck },
  ];

  return (
    <div className="grid gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-2 sm:grid-cols-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = tab.id === activeTab;
        return (
          <button
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
              selected
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/10"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <Icon className="h-4 w-4" />
              {tab.label}
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-black">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReviewFilters({
  customDate,
  dateFilter,
  resultCount,
  setCustomDate,
  setDateFilter,
}: {
  customDate: string;
  dateFilter: DateFilter;
  resultCount: number;
  setCustomDate: (value: string) => void;
  setDateFilter: (value: DateFilter) => void;
}) {
  const filters: Array<{ id: DateFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "1", label: "1 day" },
    { id: "2", label: "2 days" },
    { id: "3", label: "3 days" },
    { id: "custom", label: "Date" },
  ];

  return (
    <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Queue filters</p>
        <p className="mt-1 text-sm font-semibold text-zinc-300">{resultCount} celebrities match this view</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                dateFilter === filter.id
                  ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
              }`}
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <input
          className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-bold text-zinc-200 outline-none transition focus:border-cyan-300/50 disabled:opacity-40"
          disabled={dateFilter !== "custom"}
          onChange={(event) => setCustomDate(event.target.value)}
          type="date"
          value={customDate}
        />
      </div>
    </Card>
  );
}

function ApplicationGrid({
  activeTab,
  applications,
  loading,
  onSelect,
}: {
  activeTab: ReviewTab;
  applications: CelebrityApplication[];
  loading: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Review cards</p>
          <h2 className="mt-1 text-xl font-black text-zinc-100">
            {activeTab === "pending" ? "Pending verification" : "Approved celebrities"}
          </h2>
        </div>
        <p className="text-sm font-semibold text-zinc-500">Click a card to view full details</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {applications.map((app) => (
          <button
            className="group min-h-64 rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-5 text-left transition hover:-translate-y-0.5 hover:border-purple-400/40 hover:bg-zinc-900/70 hover:shadow-2xl hover:shadow-purple-500/10"
            key={app.id}
            onClick={() => onSelect(app.id)}
            type="button"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                  {app.category || "Creator"}
                </p>
                <h3 className="mt-2 truncate text-2xl font-black tracking-tight text-zinc-50">
                  {app.fullName || app.username}
                </h3>
                <p className="mt-1 truncate text-sm font-semibold text-zinc-500">@{app.username}</p>
              </div>
              <StatusPills app={app} />
            </div>
            <p className="mt-5 line-clamp-3 min-h-16 text-sm leading-6 text-zinc-400">
              {app.bio || "No biography submitted."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-zinc-400">
              <div className="rounded-2xl bg-zinc-900/80 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">Country</p>
                <p className="mt-1 text-zinc-200">{app.country || "—"}</p>
              </div>
              <div className="rounded-2xl bg-zinc-900/80 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">Submitted</p>
                <p className="mt-1 text-zinc-200">{formatShortDate(app.createdAt)}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-600">Open file</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-purple-500/10 text-purple-200 transition group-hover:bg-purple-500 group-hover:text-white">
                <Eye className="h-4 w-4" />
              </span>
            </div>
          </button>
        ))}
        {!applications.length ? (
          <div className="col-span-full rounded-3xl border border-dashed border-zinc-800 p-10 text-center">
            <p className="font-bold text-zinc-300">{loading ? "Loading queue..." : "Nothing in this tab."}</p>
            <p className="mt-1 text-sm text-zinc-500">
              Switch tabs, change filters, or wait for new celebrity applications.
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function ReviewPagination({
  page,
  pageSize,
  setPage,
  totalItems,
  totalPages,
}: {
  page: number;
  pageSize: number;
  setPage: (page: number | ((current: number) => number)) => void;
  totalItems: number;
  totalPages: number;
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-zinc-500">
        Showing <span className="text-zinc-200">{start}</span> to <span className="text-zinc-200">{end}</span> of{" "}
        <span className="text-zinc-200">{totalItems}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-800 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((item) => (
          <button
            className={`grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-black transition ${
              item === page
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/10"
                : "border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
            }`}
            key={item}
            onClick={() => setPage(item)}
            type="button"
          >
            {item}
          </button>
        ))}
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-800 text-zinc-300 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function CelebrityServicesSection({
  loading,
  services,
  onDisable,
  onEnable,
  onSelect,
}: {
  loading: boolean;
  services: CelebrityService[];
  onDisable: (service: CelebrityService) => void;
  onEnable: (service: CelebrityService) => void;
  onSelect: (service: CelebrityService) => void;
}) {
  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Celebrity service</p>
          <h2 className="mt-1 text-xl font-black text-zinc-100">All marketplace services</h2>
        </div>
        <p className="text-sm font-semibold text-zinc-500">
          New services are approved automatically. Disable a service to hide it from marketplace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article
            className="rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-5 transition hover:border-cyan-300/35 hover:bg-zinc-900/70"
            key={service.id}
          >
            <button className="block w-full text-left" onClick={() => onSelect(service)} type="button">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                    {service.platform || "Platform"}
                  </p>
                  <h3 className="mt-2 truncate text-2xl font-black tracking-tight text-zinc-50">
                    {service.type || "Service"}
                  </h3>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-500">@{service.sellerUsername}</p>
                </div>
                <ServiceStatusBadge status={service.status} />
              </div>
              <p className="mt-5 line-clamp-2 break-all text-sm font-semibold text-zinc-400">{service.url}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-zinc-400">
                <div className="rounded-2xl bg-zinc-900/80 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">Visibility</p>
                  <p className="mt-1 capitalize text-zinc-200">{service.visibility}</p>
                </div>
                <div className="rounded-2xl bg-zinc-900/80 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">Created</p>
                  <p className="mt-1 text-zinc-200">{formatShortDate(service.createdAt)}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {service.prices.slice(0, 2).map((price) => (
                  <div
                    className="flex items-center justify-between rounded-xl bg-zinc-900/80 px-3 py-2"
                    key={`${service.id}-${price.duration}-${price.amount}`}
                  >
                    <span className="text-sm font-semibold text-zinc-400">{price.duration}</span>
                    <span className="text-sm font-black text-zinc-100">{formatNaira(price.amount)}</span>
                  </div>
                ))}
              </div>
            </button>
            <div className="mt-5 flex gap-2 border-t border-zinc-800 pt-4">
              <Button
                fullWidth
                leftIcon={<Eye className="h-4 w-4" />}
                onClick={() => onSelect(service)}
                variant="secondary"
              >
                Details
              </Button>
              {service.status === "disabled" ? (
                <Button fullWidth leftIcon={<Power className="h-4 w-4" />} onClick={() => onEnable(service)}>
                  Enable
                </Button>
              ) : (
                <Button
                  fullWidth
                  leftIcon={<Ban className="h-4 w-4" />}
                  onClick={() => onDisable(service)}
                  variant="danger"
                >
                  Disable
                </Button>
              )}
            </div>
          </article>
        ))}
        {!services.length ? (
          <div className="col-span-full rounded-3xl border border-dashed border-zinc-800 p-10 text-center">
            <p className="font-bold text-zinc-300">{loading ? "Loading services..." : "No celebrity services yet."}</p>
            <p className="mt-1 text-sm text-zinc-500">Created celebrity services will appear here automatically.</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function ServiceDetail({
  service,
  onDisable,
  onEnable,
}: {
  service: CelebrityService;
  onDisable: () => void;
  onEnable: () => void;
}) {
  const active = service.status !== "disabled";

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-zinc-800 bg-zinc-950/70 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Celebrity service details</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-zinc-50">
              {service.platform} {service.type}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              @{service.sellerUsername} · {service.visibility} · {formatDateTime(service.createdAt)}
            </p>
          </div>
          <ServiceStatusBadge status={service.status} />
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <InfoSection
            rows={[
              ["Seller", `@${service.sellerUsername}`],
              ["Platform", service.platform || "—"],
              ["Service type", service.type || "—"],
              ["Visibility", service.visibility || "—"],
              ["Status", service.status || "—"],
              ["Created", formatDateTime(service.createdAt)],
            ]}
            title="Service information"
          />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Profile URL</p>
            <a
              className="mt-2 inline-flex break-all text-sm font-bold text-cyan-300 hover:text-cyan-200"
              href={service.url}
              rel="noreferrer"
              target="_blank"
            >
              {service.url}
            </a>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Terms</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
              {service.terms || "No terms submitted."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-purple-300/20 bg-purple-300/5 p-4">
            <h3 className="font-bold text-zinc-100">Packages</h3>
            <div className="mt-4 space-y-2">
              {service.prices.map((price) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-3"
                  key={`${price.duration}-${price.amount}`}
                >
                  <span className="text-sm font-semibold text-zinc-400">{price.duration}</span>
                  <span className="text-sm font-black text-zinc-100">{formatNaira(price.amount)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-cyan-300/20 bg-cyan-300/5 p-4">
            <h3 className="font-bold text-zinc-100">{active ? "Marketplace active" : "Marketplace disabled"}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {active
                ? "This service can appear in marketplace when its visibility is public."
                : "This service is hidden from marketplace and cannot be purchased."}
            </p>
            <Button
              className="mt-4"
              fullWidth
              leftIcon={active ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              onClick={active ? onDisable : onEnable}
              variant={active ? "danger" : "primary"}
            >
              {active ? "Disable service" : "Enable service"}
            </Button>
          </Card>
        </div>
      </div>
    </Card>
  );
}

function DetailModal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex justify-end">
          <button
            className="rounded-full border border-zinc-700 bg-zinc-950 px-5 py-2 text-sm font-black text-zinc-200 transition hover:border-zinc-500"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ApplicationDetail({
  applicant,
  app,
  canReview,
  draft,
  onConfirm,
  onAttachReferral,
  onSchedule,
  onUpdateDraft,
}: {
  applicant?: AdminUserDetail;
  app: CelebrityApplication;
  canReview: boolean;
  draft: ScheduleDraft;
  onConfirm: (action: ReviewDecision) => void;
  onAttachReferral: () => void;
  onSchedule: () => void;
  onUpdateDraft: (patch: Partial<ScheduleDraft>) => void;
}) {
  const profileRows = useProfileRows(applicant?.profile);
  const minimumScheduleDate = getMinimumScheduleDate();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-zinc-800 bg-zinc-950/70 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">Selected celebrity</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-zinc-50">{app.fullName || app.username}</h2>
            <p className="mt-2 text-sm text-zinc-500">
              @{app.username} · {app.category || "No category"} · {app.country || "No country"}
            </p>
          </div>
          <StatusPills app={app} />
        </div>
      </div>

      <div className="grid gap-5 p-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <InfoSection
            title="Application personal information"
            rows={[
              ["Full name", app.fullName || String(applicant?.user?.name || "—")],
              ["Display name", app.displayName || app.fullName || String(applicant?.user?.name || app.username || "—")],
              ["Email", app.email || String(applicant?.user?.email || "—")],
              [
                "Phone",
                app.phone ||
                  String(
                    applicant?.user?.phone ||
                      applicant?.user?.whatsappNumber ||
                      applicant?.bankDetails?.whatsappNumber ||
                      getProfileValue(applicant?.profile, "phone") ||
                      getProfileValue(applicant?.profile, "businessPhone") ||
                      "—"
                  ),
              ],
              ["Username", `@${app.username}`],
              ["Category", app.category || "—"],
              ["Country", app.country || "—"],
              ["State", app.state || String(getProfileValue(applicant?.profile, "state") || "—")],
              ["Language", app.languages || "—"],
            ]}
          />
          <InfoSection title="Position information" rows={profileRows} />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Biography</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{app.bio || "No biography submitted."}</p>
          </div>
          <Documents documents={app.verificationDocuments || []} />
        </div>

        <div className="space-y-4">
          <Card className="border-cyan-300/20 bg-cyan-300/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-cyan-200" />
              <h3 className="font-bold text-zinc-100">1. Schedule review</h3>
            </div>
            <div className="space-y-3">
              <Input
                label="Google Meet link"
                onChange={(event) => onUpdateDraft({ googleMeetLink: event.target.value })}
                placeholder="https://meet.google.com/..."
                value={draft.googleMeetLink}
              />
              <div className="flex w-full flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Date and time</label>
                <DatePicker
                  calendarClassName="pf-datepicker-calendar"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                  dateFormat="MMM d, yyyy h:mm aa"
                  filterDate={(date) => date >= startOfDay(minimumScheduleDate)}
                  filterTime={(date) => date >= minimumScheduleDate}
                  minDate={minimumScheduleDate}
                  onChange={(date: Date | null) => onUpdateDraft({ meetingScheduledAt: toDateTimeInputValue(date) })}
                  placeholderText="Pick date and time"
                  popperClassName="pf-datepicker-popper"
                  portalId="admin-datepicker-portal"
                  selected={toPickerDate(draft.meetingScheduledAt)}
                  showTimeSelect
                  timeCaption="Time"
                  timeFormat="h:mm aa"
                  timeIntervals={15}
                  wrapperClassName="w-full"
                />
              </div>
              <Button
                disabled={!draft.googleMeetLink || !isScheduleAtLeastTenMinutesAway(draft.meetingScheduledAt)}
                fullWidth
                onClick={onSchedule}
                variant="secondary"
              >
                Save schedule
              </Button>
            </div>
          </Card>

          <Card className="border-fuchsia-300/20 bg-fuchsia-300/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-fuchsia-200" />
              <h3 className="font-bold text-zinc-100">2. Attach referral</h3>
            </div>
            <p className="mb-3 text-sm leading-6 text-zinc-400">
              This is separate from direct verification. Add the user who referred this celebrity.
            </p>
            <Input
              label="Referral username"
              onChange={(event) => onUpdateDraft({ referralUsername: event.target.value })}
              placeholder="optional username"
              value={draft.referralUsername}
            />
            <Button
              className="mt-3"
              disabled={!hasScheduledReview(app, draft) || !draft.referralUsername.trim()}
              fullWidth
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={onAttachReferral}
              variant="secondary"
            >
              Save referral
            </Button>
          </Card>

          <Card className="border-emerald-300/20 bg-emerald-300/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-200" />
              <h3 className="font-bold text-zinc-100">3. Final decision</h3>
            </div>
            <p className="mb-4 text-sm leading-6 text-zinc-400">
              Approve or reject only when the scheduled verification time has arrived.
            </p>
            {canReview && app.status === "pending" ? (
              <div className="grid gap-2">
                <Button onClick={() => onConfirm("approve")}>Approve celebrity</Button>
                <Button onClick={() => onConfirm("reject")} variant="danger">
                  Reject application
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/5 px-4 py-3 text-sm font-semibold text-emerald-100">
                {getReviewLockMessage(app)}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Card>
  );
}

function ConfirmReviewModal({
  canReview,
  draft,
  reason,
  state,
  onChangeReason,
  onClose,
  onSubmit,
}: {
  canReview: boolean;
  draft?: ScheduleDraft;
  reason: string;
  state: { app: CelebrityApplication; action: ReviewDecision };
  onChangeReason: (reason: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const approving = state.action === "approve";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-zinc-700 bg-zinc-950 p-5">
        <div className="flex items-start gap-3">
          {approving ? (
            <CheckCircle2 className="mt-1 h-6 w-6 text-emerald-300" />
          ) : (
            <XCircle className="mt-1 h-6 w-6 text-red-300" />
          )}
          <div>
            <h2 className="text-xl font-black text-zinc-50">
              {approving ? "Approve celebrity?" : "Reject application?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This decision is for @{state.app.username}. The schedule must be saved before a final decision.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300">
          <p>Meet: {draft?.googleMeetLink || "Not scheduled"}</p>
          <p className="mt-1">
            Time: {draft?.meetingScheduledAt ? new Date(draft.meetingScheduledAt).toLocaleString() : "Not scheduled"}
          </p>
        </div>

        {!approving ? (
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Rejection reason</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-red-500/70"
              onChange={(event) => onChangeReason(event.target.value)}
              value={reason}
            />
          </label>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={!canReview || (!approving && !reason.trim())}
            onClick={onSubmit}
            variant={approving ? "primary" : "danger"}
          >
            {approving ? "Confirm approval" : "Confirm rejection"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function InfoSection({ rows, title }: { rows: Array<[string, string]>; title: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, value]) => (
          <div className="rounded-xl bg-zinc-900/80 px-3 py-2" key={label}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-zinc-200">{value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Documents({ documents }: { documents: NonNullable<CelebrityApplication["verificationDocuments"]> }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Verification documents</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {documents.map((document) => (
          <a
            className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-300"
            href={document.dataUrl}
            key={`${document.type}-${document.fileName}`}
            rel="noreferrer"
            target="_blank"
          >
            <FileBadge className="h-4 w-4" />
            {document.type === "government_id" ? "Government ID" : "Selfie"}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
        {!documents.length ? <p className="text-sm text-zinc-500">No documents uploaded.</p> : null}
      </div>
    </div>
  );
}

function StatusPills({ app }: { app: CelebrityApplication }) {
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <Badge variant={app.status === "approved" ? "success" : app.status === "rejected" ? "danger" : "warning"}>
        {app.status}
      </Badge>
      <Badge variant="info">{app.meetingStatus || "pending"}</Badge>
    </div>
  );
}

function ServiceStatusBadge({ status }: { status: CelebrityService["status"] }) {
  const variant =
    status === "approved" ? "success" : status === "disabled" || status === "rejected" ? "danger" : "warning";
  const label = status === "approved" ? "active" : status;
  return (
    <Badge dot variant={variant}>
      {label}
    </Badge>
  );
}

function useProfileRows(profile?: Record<string, unknown> | null) {
  return useMemo(() => {
    const keys = [
      "age",
      "gender",
      "state",
      "lga",
      "town",
      "educationLevel",
      "employmentStatus",
      "workFromHome",
      "businessName",
      "businessCategory",
      "businessPhone",
      "businessWebsite",
    ];
    return keys.map((key) => [labelize(key), String(getProfileValue(profile, key) || "—")] as [string, string]);
  }, [profile]);
}

function getProfileValue(profile: Record<string, unknown> | null | undefined, key: string) {
  if (!profile) return "";
  return profile[key] ?? profile[toSnakeCase(key)] ?? "";
}

function hasScheduledReview(app: CelebrityApplication, draft?: ScheduleDraft | null) {
  return !!(app.googleMeetLink || draft?.googleMeetLink) && !!(app.meetingScheduledAt || draft?.meetingScheduledAt);
}

function isReviewTimeReached(app: CelebrityApplication, nowMs = Date.now()) {
  if (!app.googleMeetLink || !app.meetingScheduledAt) return false;
  const scheduledAt = new Date(app.meetingScheduledAt).getTime();
  return !Number.isNaN(scheduledAt) && scheduledAt <= nowMs;
}

function getReviewLockMessage(app: CelebrityApplication) {
  if (app.status !== "pending") return "Final decision is already completed for this application.";
  if (!app.googleMeetLink || !app.meetingScheduledAt) return "Save the Google Meet schedule before final decision.";
  const scheduledAt = new Date(app.meetingScheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return "Save a valid meeting time before final decision.";
  return `Approve and reject unlock at ${scheduledAt.toLocaleString()}.`;
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function toSnakeCase(value: string) {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function filterApplicationsByDate(applications: CelebrityApplication[], filter: DateFilter, customDate: string) {
  if (filter === "all") return applications;
  if (filter === "custom") {
    if (!customDate) return applications;
    return applications.filter((app) => toDateKey(app.createdAt) === customDate);
  }
  const days = Number(filter);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return applications.filter((app) => {
    const time = new Date(app.createdAt).getTime();
    return !Number.isNaN(time) && time >= cutoff;
  });
}

function formatShortDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatNaira(value: string | number | null | undefined) {
  const amount = typeof value === "number" ? value : Number(String(value || "").replace(/,/g, ""));
  if (!Number.isFinite(amount)) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function toDateKey(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toDateTimeInputValue(date);
}

function toPickerDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function getMinimumScheduleDate() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isScheduleAtLeastTenMinutesAway(value?: string | null) {
  const date = toPickerDate(value);
  return !!date && date >= getMinimumScheduleDate();
}

function toDateTimeInputValue(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
