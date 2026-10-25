"use client";

import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { botchainTestnet } from "@/lib/chain";
import { Ticket, Wallet, AlertTriangle, LogOut, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { WalletModal } from "./WalletModal";

export function Header() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [copied, setCopied] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isWrongNetwork = isConnected && chainId !== botchainTestnet.id;

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md glow-primary flex items-center justify-center">
              <div className="w-full h-full bg-[#15171C] rounded-[10px] flex items-center justify-center">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-mainText">
                  Prize<span className="text-primary">Pop</span>
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Botchain Testnet
                </span>
              </div>
              <p className="text-xs text-mutedText">
                One draw. Many participants. One winner.
              </p>
            </div>
          </div>

          {/* Wallet & Network Info */}
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
            {isMounted && isConnected && isWrongNetwork && (
              <button
                onClick={() => switchChain({ chainId: botchainTestnet.id })}
                disabled={isSwitching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-error/15 text-error border border-error/30 hover:bg-error/25 transition-all cursor-pointer animate-pulse"
                title="Click to switch to Botchain Testnet"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isSwitching ? "Switching..." : "Switch to Botchain"}</span>
              </button>
            )}

            {!isMounted || !isConnected ? (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-[#15171C] hover:bg-primary-hover shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1.5 shadow-sm">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-mainText hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-background"
                  title="Click to copy address"
                >
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  <span>{shortenAddress(address!)}</span>
                  {copied && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success ml-1" />
                  )}
                </button>

                <button
                  onClick={() => disconnect()}
                  className="p-1.5 text-mutedText hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                  title="Disconnect wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
}
