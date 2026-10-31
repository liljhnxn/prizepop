# PrizePop — Pitch Deck

**Decentralized, Transparent Community Prize Draws on Botchain**

---

### Slide 1: Cover
* **Title:** PrizePop 🎁✨
* **Subtitle:** Trustless, Multi-Round Web3 Prize Draws & Community Raffles
* **Network:** Built on Botchain Testnet (Chain ID: `968`)
* **Tagline:** *"Eliminating black-box sweepstakes with transparent, on-chain raffle verification."*
* **Links:**
  * GitHub: [github.com/liljhnxn/prizepop](https://github.com/liljhnxn/prizepop)
  * Smart Contract: [`0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929`](https://scan.bohr.life/address/0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929)
  * Block Explorer: [scan.bohr.life](https://scan.bohr.life)

---

### Slide 2: The Real-World Problem
* **The "Black Box" Dilemma:** Online giveaways on Twitter/X, Discord, and Telegram are the #1 community growth tactic, but they are plagued by distrust.
* **Phantom Entries & Hidden Lists:** Centralized databases allow organizers to secretly inject entries or manipulate participant numbers.
* **Unverifiable Winner Picking:** Winners are chosen via opaque server scripts or screen-recorded randomizer wheels that can be re-run indefinitely until the organizer gets their desired result.
* **Intrusive Data Harvesting:** Web2 raffle services (Gleam, SweepWidget) force users to surrender email addresses, phone numbers, and social logins just to enter a trivial giveaway.

---

### Slide 3: The Insight
* **Community incentives don't need invasive personal data—they need cryptographic fairness.**
* When community members join a promotional drawing, they only care about three guarantees:
  1. *Is my entry registered and visible to everyone?*
  2. *Is each person restricted to a single fair entry?*
  3. *Was the winner chosen immutably on-chain where no one could rig the outcome?*
* **Blockchain provides the ultimate transparent registry and immutable state machine for public giveaways.**

---

### Slide 4: The Solution — PrizePop
* **Zero-Friction Web3 Raffles:** A lightweight, non-custodial decentralized application deployed on Botchain.
* **100% On-Chain Roster:** Every participant is registered transparently into the smart contract's state array.
* **Enforced Single-Entry Rule:** Smart contract logic prevents double entries at the protocol level.
* **Verifiable Lifecycle:** Clear, auditable status progression: `Open` ➔ `Closed` ➔ `Completed`.
* **Permanent Multi-Round History:** Records of past rounds, winner addresses, and participant counts are preserved on-chain forever.

---

### Slide 5: How It Works
* **For Participants (Seamless & Free):**
  1. Connect any EVM Web3 wallet (MetaMask, Rabby, Coinbase Wallet).
  2. Click **"Enter Draw"** (0 BOT fee, gas only).
  3. Instantly see their wallet appear on the live participant roster.
* **For Organizers / Community Managers:**
  1. **Launch:** Draw opens automatically on-chain with clear status indicators.
  2. **Close:** Click **"Close Draw"** when the entry window ends, freezing the pool.
  3. **Finalize:** Click **"Finalize Winner"** to select and log the winning address on-chain.
  4. **Next Round:** One-click **"Start New Draw"** to launch Round #2 without redeploying.

---

### Slide 6: Technical Architecture
* **High-Throughput EVM Layer:** Deployed on **Botchain Testnet** (`Chain ID: 968`), ensuring near-zero transaction fees and instant block confirmation times.
* **Robust Smart Contract:** Solidity `^0.8.20` featuring strict state machine guards, reentrancy safety, and structured multi-round historical storage.
* **Modern Frontend:** Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS with a tailored modern dark theme.
* **Reactive Blockchain Layer:** Wagmi v2 + Viem hooks paired with TanStack React Query for live event subscriptions and optimistic UI states.

---

### Slide 7: Security & Anti-Sybil Strategy
* **On-Chain Enforcement:** Duplicate entry prevention is baked directly into the smart contract mapping (`hasEnteredRound[roundId][address]`).
* **Economic Defense:** Even for free promotional draws, network gas friction makes mass automated Sybil botting cost-ineffective.
* **Modular Randomness Architecture:** Designed with isolated winner selection hooks—ready to seamlessly integrate **Chainlink VRF** or native Botchain randomness oracles for mainnet high-stakes prize pools.
* **Zero Personal Data Risk:** Zero user PII, emails, or credentials stored—fully compliant with global privacy standards by design.

---

### Slide 8: Market Opportunity & Use Cases
* **Web3 Project Launches:** Token projects, NFT collections, and gaming protocols need verifiable ways to distribute airdrops and whitelist spots without accusations of favoritism.
* **DAO Community Governance:** Distribute community bounties, conference tickets, and reward pools transparently.
* **Brand & Influencer Giveaways:** Brands can prove to sponsors and followers that promotional sweepstakes were legally fair and tamper-proof.
* **Monetization Potential:** Premium sponsored raffle pools, ticketed token entry fees (ERC-20/BOT), and branded white-label widgets.

---

### Slide 9: Development Roadmap
* **Milestone 1 — MVP & Testnet Launch (Completed ✅):**
  * Core multi-round Solidity contract deployed to Botchain Testnet (`0x48ef...f929`).
  * 16/16 Hardhat unit tests passed covering all state transitions and edge cases.
  * Live responsive Web3 dApp with wallet integration and admin controls.
* **Milestone 2 — Production Randomness & Tokenized Pools (Q1 2027):**
  * Chainlink VRF / Drand verifiable randomness integration.
  * Native BOT and ERC-20 token deposit pools for automated prize payout upon finalization.
* **Milestone 3 — Permissionless Ecosystem (Q2 2027):**
  * Factory contracts allowing any creator to launch a custom-branded giveaway in 60 seconds.
  * Embeddable React widgets and social proof attestations.

---

### Slide 10: Traction & Submission Summary
* **Smart Contract:** [`0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929`](https://scan.bohr.life/address/0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929)
* **Block Explorer:** [BohrScan Explorer](https://scan.bohr.life)
* **GitHub Repository:** [github.com/liljhnxn/prizepop](https://github.com/liljhnxn/prizepop)
* **Key Differentiator:** 100% on-chain transparency, zero-PII requirements, multi-round history preservation, and frictionless user onboarding.
