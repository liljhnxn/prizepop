"use client";

import { useConnect, Connector } from "wagmi";
import { X, Wallet, AlertCircle, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { useEffect } from "react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending, error, reset } = useConnect();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectConnector = (connector: Connector) => {
    reset();
    connect(
      { connector },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  // Filter unique connectors by name/id
  const uniqueConnectors = connectors.filter(
    (c, index, self) => index === self.findIndex((t) => t.id === c.id || t.name === c.name)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative glow-card animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-mainText">Connect Wallet</h3>
              <p className="text-xs text-mutedText">Select your Web3 provider</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mutedText hover:text-mainText hover:bg-background border border-transparent hover:border-border transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Connection Failed</p>
              <p className="opacity-90 leading-relaxed">
                {error.message.includes("User rejected")
                  ? "Connection request was cancelled in your wallet."
                  : error.message.includes("Provider not found")
                  ? "Wallet extension not detected or still loading. Please unlock MetaMask, make sure it has access to localhost, and refresh the page."
                  : error.message.slice(0, 160)}
              </p>
            </div>
          </div>
        )}

        {/* Connectors List */}
        <div className="space-y-2.5">
          {uniqueConnectors.length > 0 ? (
            uniqueConnectors.map((connector) => (
              <button
                key={connector.uid || connector.id}
                onClick={() => handleSelectConnector(connector)}
                disabled={isPending}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/60 hover:bg-cardHover hover:border-primary/50 text-mainText transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-mainText group-hover:text-primary transition-colors">
                      {connector.name === "Injected" ? "Browser Wallet (MetaMask / Injected)" : connector.name}
                    </div>
                    <div className="text-[11px] text-mutedText">
                      Connect via browser extension
                    </div>
                  </div>
                </div>

                <div className="text-mutedText group-hover:text-primary transition-colors">
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-6 px-4">
              <div className="w-12 h-12 rounded-full bg-border/40 flex items-center justify-center text-mutedText mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-sm font-bold text-mainText mb-1">
                No Web3 Wallet Detected
              </h4>
              <p className="text-xs text-mutedText mb-4 max-w-xs mx-auto leading-relaxed">
                You need a browser wallet like MetaMask or Rabby to interact with Botchain Testnet.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-[#15171C] hover:bg-primary-hover shadow-md transition-all cursor-pointer"
              >
                <span>Install MetaMask</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-border text-center">
          <p className="text-[11px] text-mutedText">
            Connecting to Botchain Testnet (Chain ID 968)
          </p>
        </div>
      </div>
    </div>
  );
}
