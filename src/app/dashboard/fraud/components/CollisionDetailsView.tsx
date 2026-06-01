import React, { useState } from "react";
import { ScanSearch, RefreshCw, X, ShieldCheck } from "lucide-react";
import { AccountColumn } from "./AccountColumn";
import { ZoomLightbox } from "./ZoomLightbox";

interface CollisionDetailsViewProps {
  investigatingCollision: { type: "bank" | "ip" | "device"; value: string };
  collisionDetails: any[];
  loadingDetails: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onToggleWatch: (username: string, monitored: boolean) => void;
  onToggleDisable: (id: number, disabled: boolean) => void;
  onToggleTaskDisabled: (id: number, disabled: boolean) => void;
  onToggleWithdrawalDisabled: (id: number, disabled: boolean) => void;
}

export function CollisionDetailsView({
  investigatingCollision,
  collisionDetails,
  loadingDetails,
  onClose,
  onRefresh,
  onToggleWatch,
  onToggleDisable,
  onToggleTaskDisabled,
  onToggleWithdrawalDisabled,
}: CollisionDetailsViewProps) {
  const [selectedProofImage, setSelectedProofImage] = useState<{ imageUrl: string; index: number; allImages: string[] } | null>(null);

  const handleZoom = (imageUrl: string, index: number, allImages: string[]) => {
    setSelectedProofImage({ imageUrl, index, allImages });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <ScanSearch className="w-5 h-5 text-violet-400" />
              Collision Investigation
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Comparing accounts that share {investigatingCollision.type === "bank" ? "bank account" : investigatingCollision.type === "ip" ? "IP address" : "Device ID"}:{" "}
              <span className="font-mono text-zinc-300 font-bold bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{investigatingCollision.value}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loadingDetails}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingDetails ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {loadingDetails ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-violet-500/55 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Loading colliding accounts and history...</p>
        </div>
      ) : collisionDetails.length === 0 ? (
        <div className="py-24 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
          <p className="text-zinc-550 text-sm">No colliding accounts found for this value.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {collisionDetails.map((item) => (
            <AccountColumn
              key={item.user.id}
              user={item.user}
              bankDetails={item.bankDetails}
              submissions={item.submissions}
              onToggleWatch={onToggleWatch}
              onToggleDisable={onToggleDisable}
              onToggleTaskDisabled={onToggleTaskDisabled}
              onToggleWithdrawalDisabled={onToggleWithdrawalDisabled}
              onZoom={handleZoom}
            />
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedProofImage && (
        <ZoomLightbox
          selectedImage={selectedProofImage}
          onClose={() => setSelectedProofImage(null)}
          onChangeImage={(idx) =>
            setSelectedProofImage({
              ...selectedProofImage,
              index: idx,
              imageUrl: selectedProofImage.allImages[idx],
            })
          }
        />
      )}
    </div>
  );
}
