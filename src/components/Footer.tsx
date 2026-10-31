import { botchain } from "@/lib/chain";
import { ExternalLink, Globe, Search, ShieldAlert, Cpu } from "lucide-react";

export function Footer() {
  const contractAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x38AaD618b663e5E14431965a26d50FC76fb90273";

  return (
    <footer className="border-t border-border bg-[#0E1014] mt-auto">
      {/* BOT Chain Ecosystem Showcase Section */}
      <div className="border-b border-border/60 bg-[#12151B]/80 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* BOT Chain Branding */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#15171C] border border-border p-1 shadow-md flex items-center justify-center">
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-mainText tracking-tight">
                    BOT Chain Ecosystem
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider">
                    Mainnet (Chain ID: 677)
                  </span>
                </div>
                <p className="text-xs text-mutedText">
                  AI-native blockchain • Native Token: BOT • Total Supply: 150 Million
                </p>
              </div>
            </div>

            {/* Required Ecosystem Links: Website & Explorer */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1C1F27] hover:bg-cardHover text-mainText hover:text-primary border border-border hover:border-primary/40 shadow-sm transition-all group"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Website"
                  className="w-4 h-4 rounded object-contain shrink-0 group-hover:scale-110 transition-transform"
                />
                <span>BOT Chain Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-mutedText group-hover:text-primary transition-colors" />
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1C1F27] hover:bg-cardHover text-mainText hover:text-secondary border border-border hover:border-secondary/40 shadow-sm transition-all group"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Explorer"
                  className="w-4 h-4 rounded object-contain shrink-0 group-hover:scale-110 transition-transform"
                />
                <span>BOT Chain Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-mutedText group-hover:text-secondary transition-colors" />
              </a>

              <a
                href={`https://scan.botchain.ai/address/${contractAddress}#code`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-sm transition-all group"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Contract"
                  className="w-4 h-4 rounded object-contain shrink-0 group-hover:scale-110 transition-transform"
                />
                <span>Verified Contract</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-start gap-2.5 max-w-xl">
            <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-mutedText leading-relaxed">
              PrizePop is an on-chain demonstration on BOT Chain Mainnet. Winner selection is
              pseudo-random for demonstration purposes and does not handle real money prizes.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-mutedText">
            <span className="font-medium text-mainText">PrizePop © {new Date().getFullYear()}</span>
            <span className="text-border">•</span>
            <span>Chain ID: {botchain.id}</span>
            <span className="text-border">•</span>
            <span className="text-primary font-medium">BOT Chain Mainnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
