"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ExternalLink, Gavel, XCircle } from "lucide-react";

import { Badge, Button, Card, Input } from "@/components/ui";
import { listCelebrityDisputes, resolveCelebrityDispute, type CelebrityOrder } from "@/services/celebrity-service";

type DisputeAction = "complete" | "reject" | "split";
type ConfirmState = {
  order: CelebrityOrder;
  action: DisputeAction;
  sellerPercent: number;
  buyerPercent: number;
} | null;

export default function CelebrityDisputesPage() {
  const queryClient = useQueryClient();
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [message, setMessage] = useState<string | null>(null);
  const disputesQuery = useQuery({
    queryKey: ["admin", "celebrity", "disputes"],
    queryFn: () => listCelebrityDisputes().then((res) => res.data?.items || []),
  });
  const disputes = disputesQuery.data || [];

  async function resolveDispute(state: NonNullable<ConfirmState>) {
    setMessage(null);
    try {
      await resolveCelebrityDispute(
        state.order.id,
        state.action,
        state.action === "split" ? { sellerPercent: state.sellerPercent, buyerPercent: state.buyerPercent } : undefined
      );
      setMessage(
        state.action === "complete"
          ? "Dispute completed for celebrity."
          : state.action === "split"
            ? "Dispute split between buyer and celebrity."
            : "Dispute returned to buyer."
      );
      setConfirmState(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "disputes"] });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resolve dispute.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-red-500/20 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,.18),transparent_34%),rgba(24,24,27,.72)] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Gavel className="h-7 w-7 text-red-300" />
              <h1 className="text-2xl font-black tracking-tight text-zinc-50">Celebrity disputes</h1>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Manage disputed celebrity service orders from one focused workspace. Review buyer, celebrity, amount,
              source proof, then confirm the resolution.
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-right">
            <p className="text-2xl font-black text-red-200">{disputes.length}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-red-300/70">open disputes</p>
          </div>
        </div>
        {message ? (
          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-100">
            {message}
          </p>
        ) : null}
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {disputes.map((order) => (
          <DisputeCard
            key={order.id}
            order={order}
            onResolve={(action) =>
              setConfirmState({
                order,
                action,
                sellerPercent: action === "complete" ? 100 : action === "reject" ? 0 : 50,
                buyerPercent: action === "complete" ? 0 : action === "reject" ? 100 : 50,
              })
            }
          />
        ))}
      </div>

      {!disputes.length ? (
        <Card className="grid min-h-[320px] place-items-center p-8 text-center">
          <div>
            <AlertTriangle className="mx-auto h-10 w-10 text-zinc-700" />
            <h2 className="mt-4 text-xl font-black text-zinc-200">
              {disputesQuery.isLoading ? "Loading disputes..." : "No celebrity disputes"}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">New disputed celebrity orders will appear here.</p>
          </div>
        </Card>
      ) : null}

      {confirmState ? (
        <ConfirmDisputeModal
          state={confirmState}
          onChange={(patch) => setConfirmState((current) => (current ? { ...current, ...patch } : current))}
          onClose={() => setConfirmState(null)}
          onSubmit={() => resolveDispute(confirmState)}
        />
      ) : null}
    </div>
  );
}

function DisputeCard({ order, onResolve }: { order: CelebrityOrder; onResolve: (action: DisputeAction) => void }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Order #{order.id}</p>
          <h2 className="mt-1 text-xl font-black text-zinc-100">
            @{order.buyerUsername} vs @{order.sellerUsername}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Disputed by {order.disputedBy ? `@${order.disputedBy}` : "unknown"} for ₦{order.amount.toLocaleString()}.
          </p>
        </div>
        <Badge variant="danger">disputed</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Meta label="Service ID" value={String(order.serviceId)} />
        <Meta label="Selected price" value={`${order.selectedPrice.duration} · ₦${order.selectedPrice.amount}`} />
        <Meta label="Created" value={new Date(order.createdAt).toLocaleString()} />
        <Meta label="Disputed" value={order.disputedAt ? new Date(order.disputedAt).toLocaleString() : "—"} />
      </div>

      {order.note ? (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Order note</p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{order.note}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <a
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-300 hover:text-blue-200"
          href={order.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          View source proof <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <div className="flex gap-2">
          <Button onClick={() => onResolve("complete")} size="sm">
            Seller gets net
          </Button>
          <Button onClick={() => onResolve("split")} size="sm" variant="secondary">
            Split net
          </Button>
          <Button onClick={() => onResolve("reject")} size="sm" variant="danger">
            Buyer gets net
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ConfirmDisputeModal({
  state,
  onChange,
  onClose,
  onSubmit,
}: {
  state: { order: CelebrityOrder; action: DisputeAction; sellerPercent: number; buyerPercent: number };
  onChange: (patch: Partial<NonNullable<ConfirmState>>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const completing = state.action === "complete";
  const splitting = state.action === "split";
  const splitValid = !splitting || state.sellerPercent + state.buyerPercent === 100;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-zinc-700 bg-zinc-950 p-5">
        <div className="flex items-start gap-3">
          {completing ? (
            <CheckCircle2 className="mt-1 h-6 w-6 text-emerald-300" />
          ) : (
            <XCircle className="mt-1 h-6 w-6 text-red-300" />
          )}
          <div>
            <h2 className="text-xl font-black text-zinc-50">
              {completing
                ? "Give seller the net amount?"
                : splitting
                  ? "Split the net amount?"
                  : "Give buyer the net amount?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This resolves dispute order #{state.order.id} between @{state.order.buyerUsername} and @
              {state.order.sellerUsername}. Platform commission is removed first; this decision distributes the
              remaining net amount.
            </p>
          </div>
        </div>
        {splitting ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Input
              label="Seller %"
              min={0}
              max={100}
              onChange={(event) => {
                const sellerPercent = Number(event.target.value);
                onChange({ sellerPercent, buyerPercent: Math.max(0, 100 - sellerPercent) });
              }}
              type="number"
              value={String(state.sellerPercent)}
            />
            <Input
              label="Buyer %"
              min={0}
              max={100}
              onChange={(event) => {
                const buyerPercent = Number(event.target.value);
                onChange({ buyerPercent, sellerPercent: Math.max(0, 100 - buyerPercent) });
              }}
              type="number"
              value={String(state.buyerPercent)}
            />
            {!splitValid ? (
              <p className="text-sm font-semibold text-red-300 sm:col-span-2">
                Seller and buyer percentages must total 100.
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={!splitValid} onClick={onSubmit} variant={completing || splitting ? "primary" : "danger"}>
            {completing ? "Confirm seller payout" : splitting ? "Confirm split" : "Confirm buyer return"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-950/70 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-200">{value || "—"}</p>
    </div>
  );
}
