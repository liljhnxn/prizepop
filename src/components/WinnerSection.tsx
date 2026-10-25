"use client";

import { useState, useEffect } from "react";
import { Trophy, Copy, Check, ExternalLink, AlertTriangle, Sparkles, Award } from "lucide-react";
import { botchainTestnet } from "@/lib/chain";

interface WinnerSectionProps {
  currentDrawId: number;
  winner: `0x${string}` | string | undefined;
  isFinalized: boolean;
  drawStatus: number | undefined;
  participantCount: number;
  mostRecentWinner?: `0x${string}` | string;
  mostRecentDrawId?: number;
  currentUserAddress?: `0x${string}` | string;
}

export function WinnerSection({
  currentDrawId,
  winner,
  isFinalized,
  drawStatus,
  participantCount,
  mostRecentWinner,
  mostRecentDrawId,
  currentUserAddress,
}: WinnerSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasCurrentWinner =
    isFinalized &&
    winner &&
    winner !== "0x0000000000000000000000000000000000000000";

  const hasPreviousWinner =
    Boolean(!hasCurrentWinner &&
    mostRecentWinner &&
    mostRecentWinner !== "0x0000000000000000000000000000000000000000");

  const displayedWinner = hasCurrentWinner
    ? winner
    : hasPreviousWinner
    ? mostRecentWinner
    : undefined;

  const displayedDrawId = hasCurrentWinner
    ? currentDrawId
    : hasPreviousWinner
    ? mostRecentDrawId
    : undefined;

  const isUserWinner = Boolean(
    isMounted &&
    displayedWinner &&
    currentUserAddress &&
    displayedWinner.toLowerCase() === currentUserAddress.toLowerCase()
  );

  const handleCopy = () => {
    if (!displayedWinner) return;
    navigator.clipboard.writeText(displayedWinner);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-mainText">
                {hasCurrentWinner
                  ? `Draw #${currentDrawId} Winner`
                  : hasPreviousWinner
                  ? `Most Recent Winner (Draw #${displayedDrawId})`
                  : `Draw #${currentDrawId} Winner`}
              </h3>
              <p className="text-xs text-mutedText">
                {hasCurrentWinner
                  ? "Finalized on-chain result"
                  : hasPreviousWinner
                  ? `Latest crowned winner from Draw #${displayedDrawId}`
                  : `Awaiting draw finalization`}
              </p>
            </div>
          </div>

          {hasCurrentWinner ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Draw #{currentDrawId} Winner
            </span>
          ) : hasPreviousWinner ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Recent (Draw #{displayedDrawId})
            </span>
          ) : null}
        </div>

        {!displayedWinner ? (
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-border/40 flex items-center justify-center text-mutedText mb-3">
              <Trophy className="w-6 h-6 opacity-60" />
            </div>
            <h4 className="text-base font-semibold text-mainText mb-1">
              No winner selected yet for Draw #{currentDrawId}
            </h4>
            <p className="text-xs text-mutedText max-w-sm">
              The winner will be randomly selected on-chain once Draw #{currentDrawId} is closed by the owner.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-5 rounded-xl border text-center transition-all ${
                isUserWinner
                  ? "bg-gradient-to-br from-primary/20 via-secondary/10 to-card border-primary/50 shadow-lg glow-primary"
                  : "bg-background/80 border-border"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-3">
                <Trophy className="w-3.5 h-3.5" />
                <span>
                  {hasCurrentWinner
                    ? `Draw #${currentDrawId} Winner Announced!`
                    : `Draw #${displayedDrawId} Champion`}
                </span>
              </div>

              {isUserWinner && (
                <div className="mb-2 text-sm font-bold text-secondary flex items-center justify-center gap-1.5 animate-bounce">
                  <Sparkles className="w-4 h-4" />
                  <span>Congratulations! Your wallet won this draw!</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className="font-mono text-sm sm:text-base font-bold text-mainText break-all my-2">
                {displayedWinner}
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border hover:border-primary text-mainText transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Address</span>
                    </>
                  )}
                </button>

                <a
                  href={`${botchainTestnet.blockExplorers.default.url}/address/${displayedWinner}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View on Explorer</span>
                </a>
              </div>
            </div>

            {/* Current draw status banner when displaying previous winner */}
            {hasPreviousWinner && !hasCurrentWinner && (
              <div className="p-3 rounded-xl bg-background border border-border/80 text-xs text-mutedText flex items-center justify-between">
                <span>
                  Draw #{currentDrawId} is currently{" "}
                  <strong className="text-mainText">
                    {drawStatus === 0 ? "Open for entries" : "Closed"}
                  </strong>
                  .
                </span>
                <span className="text-secondary font-medium">
                  {participantCount} {participantCount === 1 ? "Entrant" : "Entrants"}
                </span>
              </div>
            )}

            {/* Randomness disclaimer */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#282C36]/70 border border-border/80 text-[11px] text-mutedText leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-mainText">Demo Randomness Notice: </span>
                This winner was selected using a demo-only on-chain pseudo-random mechanism for Botchain testnet illustration. It is not cryptographically verifiable or tamper-resistant.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
