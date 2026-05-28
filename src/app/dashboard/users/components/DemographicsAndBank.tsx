import React from "react";

interface DemographicsAndBankProps {
  profile: any;
  bankDetails: any;
}

export function DemographicsAndBank({ profile, bankDetails }: DemographicsAndBankProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Demographic details */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">Demographics</h4>
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Age / Gender:</span>
            <span className="text-zinc-200 capitalize font-medium">
              {profile?.age ? `${profile.age} yrs` : "—"} /{" "}
              {profile?.gender
                ? profile.gender === "male"
                  ? "Male"
                  : profile.gender === "female"
                    ? "Female"
                    : "Other"
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">State:</span>
            <span className="text-zinc-200 font-medium">{profile?.state || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">LGA / Town:</span>
            <span className="text-zinc-200 font-medium">
              {profile?.lga || "—"} / {profile?.town || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Education:</span>
            <span className="text-zinc-200 capitalize font-medium">{profile?.educationLevel || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Employment:</span>
            <span className="text-zinc-200 capitalize font-medium">{profile?.employmentStatus || "—"}</span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-550">Bank details</h4>
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Bank Name:</span>
            <span className="text-zinc-200 font-medium">{bankDetails?.bankName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-550">Account Name:</span>
            <span className="text-zinc-200 font-medium">{bankDetails?.accountName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-555">Account Number:</span>
            <span className="text-zinc-200 font-mono font-medium tracking-wider">
              {bankDetails?.accountNumber || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-555">WhatsApp:</span>
            <span className="text-zinc-200 font-medium">{bankDetails?.whatsappNumber || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
