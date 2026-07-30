"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, ExternalLink, Search, ShieldCheck } from "lucide-react";

import { Badge, Button, Card, Input } from "@/components/ui";
import {
  directVerifyCelebrity,
  listCelebrityDisputes,
  listCelebrityApplications,
  listCelebrityServices,
  resolveCelebrityDispute,
  reviewCelebrityApplication,
  reviewCelebrityService,
  scheduleCelebrityApplication,
  type CelebrityApplication,
} from "@/services/celebrity-service";

type ScheduleDraft = {
  googleMeetLink: string;
  meetingScheduledAt: string;
  referralUsername: string;
};

export default function CelebrityAdminPage() {
  const queryClient = useQueryClient();
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<number, ScheduleDraft>>({});
  const [directVerify, setDirectVerify] = useState({ username: "", referralUsername: "", category: "", country: "" });
  const [message, setMessage] = useState<string | null>(null);
  const applicationsQuery = useQuery({
    queryKey: ["admin", "celebrity", "applications", "pending"],
    queryFn: () => listCelebrityApplications("pending").then((res) => res.data || []),
  });
  const approvedQuery = useQuery({
    queryKey: ["admin", "celebrity", "applications", "approved"],
    queryFn: () => listCelebrityApplications("approved").then((res) => res.data || []),
  });
  const servicesQuery = useQuery({
    queryKey: ["admin", "celebrity", "services"],
    queryFn: () => listCelebrityServices("pending").then((res) => res.data || []),
  });
  const disputesQuery = useQuery({
    queryKey: ["admin", "celebrity", "disputes"],
    queryFn: () => listCelebrityDisputes().then((res) => res.data?.items || []),
  });

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "applications"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "services"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "celebrity", "disputes"] }),
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
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Celebrity Review</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Schedule verification meetings, approve requests, direct-verify by username, and track admin verification
          ownership.
        </p>
        {message ? (
          <p className="mt-3 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
            {message}
          </p>
        ) : null}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-zinc-100">Direct username verification</h2>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <Input
            label="Username"
            onChange={(event) => setDirectVerify((current) => ({ ...current, username: event.target.value }))}
            placeholder="username"
            value={directVerify.username}
          />
          <Input
            label="Celebrity referrer"
            onChange={(event) => setDirectVerify((current) => ({ ...current, referralUsername: event.target.value }))}
            placeholder="optional username"
            value={directVerify.referralUsername}
          />
          <Input
            label="Category"
            onChange={(event) => setDirectVerify((current) => ({ ...current, category: event.target.value }))}
            placeholder="Celebrity"
            value={directVerify.category}
          />
          <Input
            label="Country"
            onChange={(event) => setDirectVerify((current) => ({ ...current, country: event.target.value }))}
            placeholder="Nigeria"
            value={directVerify.country}
          />
          <Button
            className="self-end"
            leftIcon={<Search className="h-4 w-4" />}
            onClick={() =>
              runAction("Celebrity verified by username.", () =>
                directVerifyCelebrity({
                  username: directVerify.username,
                  referralUsername: directVerify.referralUsername || undefined,
                  category: directVerify.category || undefined,
                  country: directVerify.country || undefined,
                })
              )
            }
          >
            Verify
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-bold text-zinc-100">Pending verification</h2>
        <div className="mt-4 space-y-3">
          {(applicationsQuery.data || []).map((app) => {
            const draft = scheduleDrafts[app.id] || {
              googleMeetLink: app.googleMeetLink || "",
              meetingScheduledAt: toDateTimeLocal(app.meetingScheduledAt),
              referralUsername: app.referralUsername || "",
            };
            return (
              <div key={app.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <ApplicationHeader app={app} />
                <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto_auto]">
                  <Input
                    label="Google Meet link"
                    onChange={(event) => updateDraft(app.id, { googleMeetLink: event.target.value })}
                    placeholder="https://meet.google.com/..."
                    value={draft.googleMeetLink}
                  />
                  <Input
                    label="Date and time"
                    onChange={(event) => updateDraft(app.id, { meetingScheduledAt: event.target.value })}
                    type="datetime-local"
                    value={draft.meetingScheduledAt}
                  />
                  <Input
                    label="Celebrity referrer"
                    onChange={(event) => updateDraft(app.id, { referralUsername: event.target.value })}
                    placeholder="optional username"
                    value={draft.referralUsername}
                  />
                  <Button
                    className="self-end"
                    variant="secondary"
                    onClick={() =>
                      runAction("Meeting scheduled.", () =>
                        scheduleCelebrityApplication(app.id, {
                          googleMeetLink: draft.googleMeetLink,
                          meetingScheduledAt: new Date(draft.meetingScheduledAt).toISOString(),
                          referralUsername: draft.referralUsername || undefined,
                        })
                      )
                    }
                  >
                    Schedule
                  </Button>
                  <Button
                    className="self-end"
                    onClick={() =>
                      runAction("Celebrity verification approved.", () =>
                        reviewCelebrityApplication(app.id, "approve", {
                          googleMeetLink: draft.googleMeetLink || undefined,
                          meetingScheduledAt: draft.meetingScheduledAt
                            ? new Date(draft.meetingScheduledAt).toISOString()
                            : undefined,
                          referralUsername: draft.referralUsername || undefined,
                        })
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    className="self-end"
                    variant="danger"
                    onClick={() =>
                      runAction("Celebrity verification rejected.", () =>
                        reviewCelebrityApplication(app.id, "reject", { rejectionReason: "Rejected by admin review." })
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
          {!applicationsQuery.data?.length ? <p className="text-sm text-zinc-500">No pending applications.</p> : null}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-bold text-zinc-100">Approved celebrities</h2>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {(approvedQuery.data || []).map((app) => (
            <div key={app.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <ApplicationHeader app={app} compact />
              <div className="mt-3 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
                <Meta label="Verified by" value={app.verifiedBy ? `@${app.verifiedBy}` : "Unknown"} />
                <Meta label="Method" value={app.verificationMethod || "Unknown"} />
                <Meta
                  label="Verified at"
                  value={app.verifiedAt ? new Date(app.verifiedAt).toLocaleString() : "Unknown"}
                />
                <Meta label="Celebrity referrer" value={app.referralUsername ? `@${app.referralUsername}` : "None"} />
              </div>
            </div>
          ))}
          {!approvedQuery.data?.length ? <p className="text-sm text-zinc-500">No approved celebrities.</p> : null}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-bold text-zinc-100">Pending services</h2>
        <div className="mt-4 space-y-3">
          {(servicesQuery.data || []).map((service) => (
            <div key={service.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-bold text-zinc-100">
                    {service.platform} {service.type}
                  </p>
                  <p className="text-sm text-zinc-500">
                    @{service.sellerUsername} · {service.visibility}
                  </p>
                  <a
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-400"
                    href={service.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View profile <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="mt-2 text-sm text-zinc-400">{service.terms}</p>
                </div>
                <Badge variant="warning">{service.status}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => runAction("Service approved.", () => reviewCelebrityService(service.id, "approve"))}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => runAction("Service rejected.", () => reviewCelebrityService(service.id, "reject"))}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
          {!servicesQuery.data?.length ? <p className="text-sm text-zinc-500">No pending services.</p> : null}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-bold text-zinc-100">Celebrity disputes</h2>
        <div className="mt-4 space-y-3">
          {(disputesQuery.data || []).map((order) => (
            <div key={order.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-bold text-zinc-100">Order #{order.id}</p>
                  <p className="text-sm text-zinc-500">
                    Buyer @{order.buyerUsername} · Celebrity @{order.sellerUsername}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Disputed by {order.disputedBy ? `@${order.disputedBy}` : "unknown"} · ₦
                    {order.amount.toLocaleString()}
                  </p>
                  <a
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-400"
                    href={order.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Badge variant="danger">disputed</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() =>
                    runAction("Dispute resolved for celebrity.", () => resolveCelebrityDispute(order.id, "complete"))
                  }
                >
                  Complete order
                </Button>
                <Button
                  variant="danger"
                  onClick={() => runAction("Dispute rejected.", () => resolveCelebrityDispute(order.id, "reject"))}
                >
                  Reject order
                </Button>
              </div>
            </div>
          ))}
          {!disputesQuery.data?.length ? <p className="text-sm text-zinc-500">No celebrity disputes.</p> : null}
        </div>
      </Card>
    </div>
  );
}

function ApplicationHeader({ app, compact = false }: { app: CelebrityApplication; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="font-bold text-zinc-100">{app.fullName || app.username}</p>
        <p className="text-sm text-zinc-500">
          @{app.username} · {app.category} · {app.country || "Country not set"}
        </p>
        {!compact ? <p className="mt-2 max-w-3xl text-sm text-zinc-400">{app.bio}</p> : null}
        {!compact && app.verificationDocuments?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {app.verificationDocuments.map((document) => (
              <a
                className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300"
                href={document.dataUrl}
                key={`${app.id}-${document.type}`}
                rel="noreferrer"
                target="_blank"
              >
                {document.type === "government_id" ? "Government ID" : "Selfie"}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant={app.status === "approved" ? "success" : app.status === "rejected" ? "danger" : "warning"}>
          {app.status}
        </Badge>
        <Badge variant="info">{app.meetingStatus || "pending"}</Badge>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-900/80 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}
