"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Percent } from "lucide-react";

import { Badge, Button, Card, Input } from "@/components/ui";
import {
  getCelebrityPaymentDashboard,
  updateCelebrityPaymentSettings,
  upsertCelebrityReferralCommissionSplit,
} from "@/services/celebrity-service";

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  currency: "NGN",
  maximumFractionDigits: 0,
  style: "currency",
});

export default function CelebrityPaymentsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [dayFilter, setDayFilter] = useState("7");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "biggest">("newest");
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [clearanceDays, setClearanceDays] = useState(5);
  const [splitDraft, setSplitDraft] = useState({
    celebrityUsername: "",
    referrerUsername: "",
    systemSharePercent: 50,
    referralSharePercent: 50,
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin", "celebrity", "payments", page, dayFilter, fromDate, toDate, sort],
    queryFn: () =>
      getCelebrityPaymentDashboard({
        page,
        limit: 50,
        days: dayFilter === "custom" ? undefined : Number(dayFilter),
        from: dayFilter === "custom" && fromDate ? fromDate : undefined,
        to: dayFilter === "custom" && toDate ? toDate : undefined,
        sort,
      }).then((res) => res.data),
  });

  useEffect(() => {
    const settings = paymentsQuery.data?.settings;
    if (!settings) return;
    setCommissionPercent(settings.commissionPercent);
    setClearanceDays(settings.clearanceDays);
  }, [paymentsQuery.data?.settings]);

  async function runAction(label: string, action: () => Promise<unknown>) {
    setMessage(null);
    try {
      await action();
      setMessage(label);
      await queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "payments"] });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    }
  }

  const data = paymentsQuery.data;
  const totals = data?.totals;
  const splitTotal = splitDraft.systemSharePercent + splitDraft.referralSharePercent;
  const taskPagination = data?.taskPagination;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-emerald-300/20 bg-zinc-950/80 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-200">
              <Banknote className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-50">Celebrity Payment</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Backend-calculated celebrity service money, buyer returns, referral share, system share, and clearance
                timing.
              </p>
            </div>
          </div>
          <Badge variant="success">{paymentsQuery.isLoading ? "loading" : `${taskPagination?.total || 0} tasks`}</Badge>
        </div>
        {message ? (
          <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100">
            {message}
          </p>
        ) : null}
      </Card>

      <Card className="p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-200">Task money filters</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5", "6", "7"].map((days) => (
                <Button
                  className="h-9 px-3"
                  key={days}
                  onClick={() => {
                    setDayFilter(days);
                    setPage(1);
                  }}
                  variant={dayFilter === days ? "primary" : "secondary"}
                >
                  {days} day{days === "1" ? "" : "s"}
                </Button>
              ))}
              <Button
                className="h-9 px-3"
                onClick={() => {
                  setDayFilter("custom");
                  setPage(1);
                }}
                variant={dayFilter === "custom" ? "primary" : "secondary"}
              >
                Dates
              </Button>
            </div>
          </div>
          {dayFilter === "custom" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="From"
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
                type="date"
                value={fromDate}
              />
              <Input
                label="To"
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
                type="date"
                value={toDate}
              />
            </div>
          ) : null}
          <label className="block text-sm font-bold text-zinc-400">
            Sort
            <select
              className="mt-1 h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm font-bold text-zinc-100 outline-none focus:border-emerald-300/60"
              onChange={(event) => {
                setSort(event.target.value as "newest" | "oldest" | "biggest");
                setPage(1);
              }}
              value={sort}
            >
              <option value="newest">Newest</option>
              <option value="biggest">Biggest paid</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MoneyTile label="Task paid by users" value={totals?.taskPaidInAmount || 0} />
        <MoneyTile label="Tasker payout" value={totals?.taskerPayoutAmount || 0} />
        <MoneyTile label="Returned unused" value={totals?.taskReturnedAmount || 0} />
        <MoneyTile label="System left" value={totals?.taskSystemAmount || 0} />
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-zinc-50">Task money</h2>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {totals?.taskCount || 0} business tasks · 50 per page
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-9 px-3"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              variant="secondary"
            >
              Previous
            </Button>
            <span className="text-sm font-bold text-zinc-400">
              {taskPagination?.page || page}/{Math.max(taskPagination?.totalPages || 1, 1)}
            </span>
            <Button
              className="h-9 px-3"
              disabled={!taskPagination?.hasNextPage}
              onClick={() => setPage((value) => value + 1)}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3 pr-4">Task</th>
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Paid in</th>
                <th className="py-3 pr-4">Taskers</th>
                <th className="py-3 pr-4">Returned</th>
                <th className="py-3 pr-4">System left</th>
                <th className="py-3 pr-4">Approved</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {(data?.taskItems || []).map((task) => (
                <tr key={task.taskId}>
                  <td className="max-w-[260px] py-3 pr-4">
                    <p className="truncate font-bold text-zinc-200">{task.title || `Task #${task.taskId}`}</p>
                    <p className="text-xs text-zinc-600">#{task.taskId}</p>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-zinc-400">@{task.createdBy}</td>
                  <td className="py-3 pr-4 font-bold text-zinc-300">{currencyFormatter.format(task.paidInAmount)}</td>
                  <td className="py-3 pr-4 text-zinc-400">{currencyFormatter.format(task.taskerPayoutAmount)}</td>
                  <td className="py-3 pr-4 text-zinc-400">{currencyFormatter.format(task.returnedAmount)}</td>
                  <td className="py-3 pr-4 font-bold text-emerald-200">
                    {currencyFormatter.format(task.systemAmount)}
                  </td>
                  <td className="py-3 pr-4 text-zinc-400">
                    {task.approvedCount}/{task.capacity}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={task.status === "completed" ? "success" : "default"}>{task.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.taskItems?.length ? (
            <p className="py-8 text-center text-sm font-semibold text-zinc-500">No business task money found.</p>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MoneyTile label="Gross paid" value={totals?.grossAmount || 0} />
        <MoneyTile label="Celebrity net" value={totals?.celebrityAmount || 0} />
        <MoneyTile label="System" value={totals?.systemAmount || 0} />
        <MoneyTile label="Referral" value={totals?.referralAmount || 0} />
        <MoneyTile label="Buyer returned" value={totals?.refundedToWallet || 0} />
        <MoneyTile label="Held amount" value={totals?.heldAmount || 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-emerald-300" />
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-200">Payment settings</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              label="Commission %"
              max={100}
              min={0}
              onChange={(event) => setCommissionPercent(Number(event.target.value))}
              type="number"
              value={String(commissionPercent)}
            />
            <Input
              label="Clearance days"
              max={90}
              min={0}
              onChange={(event) => setClearanceDays(Number(event.target.value))}
              type="number"
              value={String(clearanceDays)}
            />
          </div>
          <Button
            className="mt-4"
            disabled={commissionPercent < 0 || commissionPercent > 100 || clearanceDays < 0 || clearanceDays > 90}
            onClick={() =>
              runAction("Celebrity payment settings updated.", () =>
                updateCelebrityPaymentSettings({ commissionPercent, clearanceDays })
              )
            }
          >
            Save settings
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-200">Special referral split</h2>
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
              onClick={() =>
                runAction("Celebrity referral split saved.", async () => {
                  await upsertCelebrityReferralCommissionSplit(splitDraft);
                  setSplitDraft({
                    celebrityUsername: "",
                    referrerUsername: "",
                    systemSharePercent: 50,
                    referralSharePercent: 50,
                  });
                })
              }
            >
              Save
            </Button>
          </div>
          <p className={`mt-2 text-xs font-semibold ${splitTotal > 100 ? "text-red-300" : "text-zinc-500"}`}>
            System and referral share total: {splitTotal}%
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black text-zinc-50">Payment ledger</h2>
        <div className="mt-4 divide-y divide-zinc-800">
          {(data?.items || []).map((item) => (
            <div className="grid gap-3 py-3 text-sm xl:grid-cols-[120px_1fr_1fr_1fr_1fr]" key={item.id}>
              <span className="font-bold text-zinc-400">Order #{item.orderId}</span>
              <span className="text-zinc-300">
                @{item.buyerUsername} to @{item.celebrityUsername}
              </span>
              <span className="text-zinc-400">Gross {currencyFormatter.format(item.grossAmount)}</span>
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
          {!data?.items?.length ? (
            <p className="py-8 text-center text-sm font-semibold text-zinc-500">No celebrity payment ledger yet.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function MoneyTile({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-black text-zinc-100">{currencyFormatter.format(value)}</p>
    </Card>
  );
}
