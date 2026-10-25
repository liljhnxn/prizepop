"use client";

import { useState } from "react";
import { History, Trophy, ExternalLink, Copy, Check, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { botchainTestnet } from "@/lib/chain";

export interface HistoryItem {
  drawId: number;
  status: number; // 0: Open, 1: Closed, 2: Completed
  winner: string;
  isFinalized: boolean;
  participantCount: number;
}

interface DrawHistoryProps {
  history: HistoryItem[];
  currentDrawId: number;
  currentUserAddress?: string;
}

export function DrawHistory({
  history,
  currentDrawId,
  currentUserAddress,
}: DrawHistoryProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const shortenAddress = (addr: string) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "None";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Filter completed draws or previous draws, reverse to show newest first
  const pastDraws = [...history]
    .filter((item) => item.status === 2 || item.drawId < currentDrawId)
    .sort((a, b) => b.drawId - a.drawId);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-mainText">Draw History</h3>
            <p className="text-xs text-mutedText">
              Immutable on-chain archive of consecutive draws & winners
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-background text-mutedText border border-border">
            Current: Draw #{currentDrawId}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
            {pastDraws.length} {pastDraws.length === 1 ? "Past Draw" : "Past Draws"}
          </span>
        </div>
      </div>

      {pastDraws.length === 0 ? (
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-border/40 flex items-center justify-center text-mutedText mb-3">
            <Trophy className="w-6 h-6 opacity-50" />
          </div>
          <h4 className="text-sm font-semibold text-mainText mb-1">
            No completed draws yet
          </h4>
          <p className="text-xs text-mutedText max-w-sm">
            Draw #{currentDrawId} is currently in progress. Once the owner finalizes a winner and launches the next round, completed draws will be recorded here permanently.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[600px] space-y-2.5">
            {pastDraws.map((item) => {
              const hasWinner =
                item.isFinalized &&
                item.winner &&
                item.winner !== "0x0000000000000000000000000000000000000000";

              const isUserWinner = Boolean(
                hasWinner &&
                currentUserAddress &&
                item.winner.toLowerCase() === currentUserAddress.toLowerCase()
              );

              return (
                <div
                  key={item.drawId}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isUserWinner
                      ? "bg-gradient-to-r from-primary/15 via-secondary/10 to-card border-primary/50 shadow-md glow-primary/20"
                      : "bg-background/70 border-border hover:border-border/80"
                  }`}
                >
                  {/* Left: Draw ID & Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border font-extrabold text-sm text-mainText">
                      #{item.drawId}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-mainText">
                          Draw #{item.drawId}
                        </span>
                        {item.status === 2 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        ) : item.status === 1 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/15 text-error border border-error/30">
                            Closed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                            Open
                          </span>
                        )}
                        {isUserWinner && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/40 animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            You Won!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-mutedText mt-0.5">
                        <Users className="w-3.5 h-3.5 text-secondary" />
                        <span>{item.participantCount} Participants entered</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Winner Details */}
                  <div className="flex items-center gap-3">
                    {hasWinner ? (
                      <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border">
                        <Trophy className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-mono font-medium text-mainText">
                          {shortenAddress(item.winner)}
                        </span>
                        <button
                          onClick={() => handleCopy(item.winner)}
                          className="text-mutedText hover:text-mainText transition-colors ml-1 p-0.5 cursor-pointer"
                          title="Copy full winner address"
                        >
                          {copiedAddress === item.winner ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`${botchainTestnet.blockExplorers.default.url}/address/${item.winner}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-mutedText hover:text-primary transition-colors p-0.5"
                          title="View on Botchain Explorer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-mutedText italic px-3 py-1.5">
                        No winner recorded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
