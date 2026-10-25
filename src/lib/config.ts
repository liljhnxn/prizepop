import { http, createConfig } from "wagmi";
import { injected } from "@wagmi/core";
import { botchainTestnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [botchainTestnet],
  connectors: [
    injected({
      target() {
        return {
          id: "injected",
          name: "MetaMask / Browser Wallet",
          provider(window?: any) {
            if (typeof window === "undefined") return undefined;
            const eth = window?.ethereum || (typeof globalThis !== "undefined" ? (globalThis as any).ethereum : undefined);
            if (!eth) return undefined;
            if (Array.isArray(eth.providers)) {
              return eth.providers.find((p: any) => p?.isMetaMask) || eth.providers[0];
            }
            return eth;
          },
        };
      },
    }),
  ],
  transports: {
    [botchainTestnet.id]: http(
      process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.bohr.life"
    ),
  },
  ssr: false,
});
