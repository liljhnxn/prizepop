import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "PrizePop — Simple Web3 Prize Draw dApp",
  description:
    "Enter the decentralized prize draw on Botchain Testnet for free. One draw. Many participants. One winner.",
  keywords: ["Web3", "Prize Draw", "dApp", "Botchain", "Ethereum", "Smart Contract"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const removeExtAttrs = () => {
                    const el = document.body;
                    if (el && el.hasAttribute('cz-shortcut-listen')) {
                      el.removeAttribute('cz-shortcut-listen');
                    }
                  };
                  removeExtAttrs();
                  if (typeof MutationObserver !== 'undefined' && document.documentElement) {
                    new MutationObserver(removeExtAttrs).observe(document.documentElement, {
                      attributes: true,
                      subtree: true,
                      attributeFilter: ['cz-shortcut-listen', 'data-gr-ext-installed', 'data-new-gr-c-s-check-loaded']
                    });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-background text-mainText antialiased min-h-screen flex flex-col selection:bg-primary/30 selection:text-white"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
