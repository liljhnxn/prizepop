"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { prizePopAbi } from "@/lib/abi";
import { botchainTestnet } from "@/lib/chain";
import { Shield, Lock, Trophy, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface OwnerControlsProps {
  contractAddress: `0x${string}` | undefined;
  contractOwner: `0x${string}` | string | undefined;
  drawStatus: number | undefined; // 0: Open, 1: Closed, 2: Completed
  participantCount: number;
  onRefresh: () => void;
}

export function OwnerControls({
  contractAddress,
  contractOwner,
  drawStatus,
  participantCount,
  onRefresh,
}: OwnerControlsProps) {
  const { address } = useAccount();

  // Verify whether the currently connected wallet is the owner
  const isOwner =
    Boolean(address &&
    contractOwner &&
    address.toLowerCase() === contractOwner.toLowerCase());

  const [activeAction, setActiveAction] = useState<"close" | "finalize" | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Wagmi contract write
  const {
    data: hash,
    isPending: isWritePending,
    error: writeError,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (writeError) {
      const msg = writeError.message.includes("User rejected")
        ? "Transaction rejected by user."
        : writeError.message.slice(0, 140);
      setFeedbackError(msg);
      setActiveAction(null);
    } else if (receiptError) {
      setFeedbackError(receiptError.message.slice(0, 140));
      setActiveAction(null);
    }
  }, [writeError, receiptError]);

  useEffect(() => {
    if (isConfirmed) {
      if (activeAction === "close") {
        setFeedbackSuccess("Draw closed successfully! No new entries can be submitted.");
      } else if (activeAction === "finalize") {
        setFeedbackSuccess("Winner selected and finalized on-chain!");
      }
      onRefresh();
      setActiveAction(null);
    }
  }, [isConfirmed, activeAction, onRefresh]);

  // If not mounted or not owner, hide completely
  if (!isMounted || !isOwner) {
    return null;
  }

  const isDrawOpen = drawStatus === 0;
  const isDrawClosed = drawStatus === 1;
  const isDrawCompleted = drawStatus === 2;

  const handleCloseDraw = () => {
    if (!contractAddress) return;
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setActiveAction("close");
    writeContract({
      address: contractAddress,
      abi: prizePopAbi,
      functionName: "closeDraw",
    });
  };

  const handleFinalizeWinner = () => {
    if (!contractAddress) return;
    if (participantCount === 0) {
      setFeedbackError("Cannot finalize draw with 0 participants.");
      return;
    }
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setActiveAction("finalize");
    writeContract({
      address: contractAddress,
      abi: prizePopAbi,
      functionName: "finalizeWinner",
    });
  };

  const isBusy = isWritePending || isConfirming;

  return (
    <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 sm:p-7 shadow-xl glow-primary/10 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-mainText">Owner Administration</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-mutedText">
              You are connected with the deployer / contract owner wallet
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-mutedText bg-background px-3 py-1.5 rounded-lg border border-border">
          Status: {isDrawOpen ? "Open" : isDrawClosed ? "Closed (Pending Finalization)" : "Completed"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Step 1: Close Draw */}
        <div className="bg-background/80 border border-border rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Lock className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold text-mainText">1. Close Draw</h4>
            </div>
            <p className="text-xs text-mutedText mb-4">
              Stop accepting new entrants. Required before selecting a winner.
            </p>
          </div>

          <button
            onClick={handleCloseDraw}
            disabled={!isDrawOpen || isBusy || !contractAddress}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isDrawOpen && !isBusy
                ? "bg-primary text-[#15171C] hover:bg-primary-hover shadow-md"
                : "bg-border/60 text-mutedText cursor-not-allowed opacity-60"
            }`}
          >
            {isBusy && activeAction === "close" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Closing Draw...</span>
              </>
            ) : isDrawOpen ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Close Draw</span>
              </>
            ) : (
              <span>Draw Already Closed</span>
            )}
          </button>
        </div>

        {/* Step 2: Finalize Winner */}
        <div className="bg-background/80 border border-border rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Trophy className="w-4 h-4 text-secondary" />
              <h4 className="text-sm font-bold text-mainText">2. Finalize Winner</h4>
            </div>
            <p className="text-xs text-mutedText mb-4">
              Select one winning entrant on-chain and mark draw as completed.
            </p>
          </div>

          <button
            onClick={handleFinalizeWinner}
            disabled={!isDrawClosed || participantCount === 0 || isBusy || !contractAddress}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isDrawClosed && participantCount > 0 && !isBusy
                ? "bg-secondary text-[#15171C] hover:bg-secondary-hover shadow-md"
                : "bg-border/60 text-mutedText cursor-not-allowed opacity-60"
            }`}
          >
            {isBusy && activeAction === "finalize" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Finalizing Winner...</span>
              </>
            ) : isDrawCompleted ? (
              <span>Winner Already Finalized</span>
            ) : isDrawOpen ? (
              <span>Close Draw First</span>
            ) : participantCount === 0 ? (
              <span>Needs Entrants to Finalize</span>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                <span>Finalize Winner</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transaction status info */}
      {hash && (
        <div className="mt-4 flex items-center gap-2 text-xs text-mutedText bg-background/90 p-2.5 rounded-lg border border-border">
          <span>Transaction:</span>
          <a
            href={`${botchainTestnet.blockExplorers.default.url}/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline flex items-center gap-1 font-mono"
          >
            {hash.slice(0, 10)}...{hash.slice(-8)}
            <ExternalLink className="w-3 h-3" />
          </a>
          {isConfirming && <span className="text-primary animate-pulse">(Awaiting confirmation...)</span>}
          {isConfirmed && <span className="text-success font-semibold">(Confirmed)</span>}
        </div>
      )}

      {feedbackError && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Action Failed: </span>
            <span>{feedbackError}</span>
          </div>
          <button
            onClick={() => {
              setFeedbackError(null);
              resetWrite();
            }}
            className="text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {feedbackSuccess && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Success: </span>
            <span>{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => {
              setFeedbackSuccess(null);
              resetWrite();
            }}
            className="text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
