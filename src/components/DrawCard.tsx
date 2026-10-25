"use client";

import { useAccount, useConnect, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { botchainTestnet } from "@/lib/chain";
import { prizePopAbi } from "@/lib/abi";
import { Sparkles, Users, CheckCircle2, Loader2, AlertCircle, ArrowRight, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { WalletModal } from "./WalletModal";

interface DrawCardProps {
  contractAddress: `0x${string}` | undefined;
  currentDrawId: number;
  drawStatus: number | undefined; // 0: Open, 1: Closed, 2: Completed
  participantCount: number;
  hasUserEntered: boolean;
  isOwner?: boolean;
  onRefresh: () => void;
}

export function DrawCard({
  contractAddress,
  currentDrawId,
  drawStatus,
  participantCount,
  hasUserEntered,
  isOwner,
  onRefresh,
}: DrawCardProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== botchainTestnet.id;
  const isDrawOpen = drawStatus === 0;
  const isDrawClosed = drawStatus === 1;
  const isDrawCompleted = drawStatus === 2;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Contract write hook for enterDraw()
  const {
    data: hash,
    isPending: isWritePending,
    error: writeError,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle errors
  useEffect(() => {
    if (writeError) {
      let msg = writeError.message;
      if (msg.includes("User rejected") || msg.includes("user rejected")) {
        msg = "Transaction rejected in wallet.";
      } else if (msg.includes("Already entered")) {
        msg = `You have already entered Draw #${currentDrawId}.`;
      } else if (
        msg.includes("0x2a5") ||
        msg.toLowerCase().includes("insufficient funds") ||
        msg.toLowerCase().includes("exceed")
      ) {
        msg =
          "Insufficient BOT balance in active wallet for gas fees. Please switch to an account with testnet BOT or get testnet BOT from the faucet.";
      } else if (msg.length > 160) {
        msg = msg.slice(0, 160) + "...";
      }
      setErrorMessage(msg);
    } else if (receiptError) {
      setErrorMessage(receiptError.message.slice(0, 140));
    } else {
      setErrorMessage(null);
    }
  }, [writeError, receiptError, currentDrawId]);

  // Refresh data on confirmed transaction
  useEffect(() => {
    if (isConfirmed) {
      onRefresh();
    }
  }, [isConfirmed, onRefresh]);

  const handleEnterDraw = () => {
    setErrorMessage(null);
    if (!contractAddress) {
      setErrorMessage("Smart contract address is not configured in .env.local.");
      return;
    }
    writeContract({
      address: contractAddress,
      abi: prizePopAbi,
      functionName: "enterDraw",
    });
  };

  const getStatusBadge = () => {
    if (drawStatus === undefined) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-border text-mutedText">
          Checking status...
        </span>
      );
    }
    if (isDrawOpen) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30">
          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
          Round #{currentDrawId} Open
        </span>
      );
    }
    if (isDrawClosed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-error/15 text-error border border-error/30">
          <span className="w-2 h-2 rounded-full bg-error"></span>
          Round #{currentDrawId} Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Round #{currentDrawId} Completed
      </span>
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl glow-card">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-mainText tracking-tight">
              PrizePop #{currentDrawId || 1}
            </h2>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-mutedText max-w-xl">
            Free entry on Botchain Testnet. Enter Draw #{currentDrawId} with a single on-chain transaction. Past participants are eligible to enter every new round!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5 bg-background/80 px-4 py-2.5 rounded-xl border border-border">
              <Users className="w-5 h-5 text-secondary" />
              <div>
                <div className="text-xs text-mutedText font-medium">Round #{currentDrawId} Entrants</div>
                <div className="text-xl font-bold text-mainText">{participantCount}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-background/80 px-4 py-2.5 rounded-xl border border-border">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-mutedText font-medium">Entry Cost</div>
                <div className="text-xl font-bold text-secondary">Free (0 BOT)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & States */}
        <div className="flex flex-col items-center md:items-end justify-center gap-3 min-w-[240px]">
          {!isMounted || !isConnected ? (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-bold bg-primary text-[#15171C] hover:bg-primary-hover shadow-lg glow-primary transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Connect Wallet to Enter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : isWrongNetwork ? (
            <button
              onClick={() => switchChain({ chainId: botchainTestnet.id })}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-bold bg-error/20 text-error border border-error/40 hover:bg-error/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Switch to Botchain Testnet</span>
            </button>
          ) : hasUserEntered ? (
            <div className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-success/20 text-success border border-success/40 font-bold flex items-center justify-center gap-2 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>You&apos;re In Draw #{currentDrawId}!</span>
            </div>
          ) : isDrawCompleted ? (
            <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
              <div className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary/15 text-primary border border-primary/30 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Draw #{currentDrawId} Completed</span>
              </div>
              {isOwner && (
                <span className="text-[11px] text-mutedText">
                  Owner can start Draw #{currentDrawId + 1} below
                </span>
              )}
            </div>
          ) : isDrawClosed ? (
            <button
              disabled
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-border/60 text-mutedText font-semibold flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
            >
              <span>Draw #{currentDrawId} Closed</span>
            </button>
          ) : (
            <button
              onClick={handleEnterDraw}
              disabled={isWritePending || isConfirming || !contractAddress}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-primary to-secondary text-[#15171C] hover:opacity-95 shadow-lg glow-secondary transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isWritePending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirm in Wallet...</span>
                </>
              ) : isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Entry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Enter Draw #{currentDrawId}</span>
                </>
              )}
            </button>
          )}

          {/* Pending / Confirmed Transaction Feedback */}
          {hash && (
            <div className="text-xs text-mutedText flex items-center gap-1.5 mt-1">
              <span>Tx:</span>
              <a
                href={`${botchainTestnet.blockExplorers.default.url}/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-mono"
              >
                {hash.slice(0, 8)}...{hash.slice(-6)}
                <ExternalLink className="w-3 h-3" />
              </a>
              {isConfirming && <span className="text-primary animate-pulse">(Pending)</span>}
              {isConfirmed && <span className="text-success font-semibold">(Confirmed!)</span>}
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 max-w-sm p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs mt-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Transaction Error</p>
                <p className="opacity-90">{errorMessage}</p>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    resetWrite();
                  }}
                  className="mt-1 text-[11px] underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}
