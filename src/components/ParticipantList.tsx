"use client";

import { useState, useEffect } from "react";
import { Users, Copy, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { botchainTestnet } from "@/lib/chain";

interface ParticipantListProps {
  participants: readonly `0x${string}`[] | string[];
  currentUserAddress?: `0x${string}` | string;
  isLoading: boolean;
}

export function ParticipantList({
  participants,
  currentUserAddress,
  isLoading,
}: ParticipantListProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => {
      setCopiedAddress(null);
    }, 2000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-mainText">Participants</h3>
            <p className="text-xs text-mutedText">
              Real-time on-chain entrants
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
          {participants.length} {participants.length === 1 ? "Entrant" : "Entrants"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-mutedText">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Fetching participant list...</p>
        </div>
      ) : participants.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-border/40 flex items-center justify-center text-mutedText mb-3">
            <Users className="w-6 h-6 opacity-60" />
          </div>
          <h4 className="text-sm font-semibold text-mainText mb-1">
            No participants yet
          </h4>
          <p className="text-xs text-mutedText max-w-xs">
            Connect your wallet and click &quot;Enter Draw&quot; above to become the first participant!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-2">
          {participants.map((addr, index) => {
            const isCurrentUser =
              Boolean(isMounted &&
              currentUserAddress &&
              addr.toLowerCase() === currentUserAddress.toLowerCase());

            return (
              <div
                key={`${addr}-${index}`}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isCurrentUser
                    ? "bg-primary/10 border-primary/40 shadow-sm"
                    : "bg-background/60 border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-mutedText w-6 text-right">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-medium text-mainText">
                        {shortenAddress(addr)}
                      </span>
                      {isCurrentUser && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                          <ShieldCheck className="w-3 h-3" />
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(addr)}
                    className="p-1.5 rounded-lg text-mutedText hover:text-mainText hover:bg-card border border-transparent hover:border-border transition-colors cursor-pointer"
                    title="Copy full address"
                  >
                    {copiedAddress === addr ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <a
                    href={`${botchainTestnet.blockExplorers.default.url}/address/${addr}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-mutedText hover:text-primary hover:bg-card border border-transparent hover:border-border transition-colors"
                    title="View on Botchain Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
