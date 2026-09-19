"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function ApprovalActions({ onApprove, onReject }) {
  const [showReject, setShowReject] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [busy, setBusy] = useState(false);

  if (showReject) {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Alasan penolakan"
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          className="h-9"
        />
        <Button
          variant="danger"
          disabled={busy || !alasan}
          onClick={async () => {
            setBusy(true);
            await onReject(alasan);
            setBusy(false);
            setShowReject(false);
            setAlasan("");
          }}
        >
          Kirim
        </Button>
        <Button variant="ghost" onClick={() => setShowReject(false)}>
          Batal
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onApprove();
          setBusy(false);
        }}
      >
        Setujui
      </Button>
      <Button variant="danger" onClick={() => setShowReject(true)}>
        Tolak
      </Button>
    </div>
  );
}
