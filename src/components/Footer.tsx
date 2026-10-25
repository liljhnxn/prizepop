import { botchainTestnet } from "@/lib/chain";
import { ExternalLink, ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#111317] mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-start gap-2.5 max-w-xl">
          <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-mutedText leading-relaxed">
            PrizePop is a testnet portfolio demo. Winner selection is not
            cryptographically secure and must not be used for real prizes or
            valuable assets.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-mutedText">
          <a
            href={botchainTestnet.blockExplorers.default.url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
          >
            <span>Botchain Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-border">•</span>
          <span>Chain ID: 968</span>
          <span className="text-border">•</span>
          <span>BOT Testnet</span>
        </div>
      </div>
    </footer>
  );
}
