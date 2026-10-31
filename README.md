# PrizePop — Simple Web3 Prize Draw dApp

PrizePop is a lightweight, decentralized prize draw application deployed on **Botchain Mainnet**. It enables users to connect their Web3 wallet, enter an on-chain prize draw for free, view all registered participants in real time, and observe the finalized winner selected on-chain across multiple consecutive rounds.

> [!NOTE]
> **Portfolio Showcase:**
> PrizePop is designed as a clean, production-grade Web3 portfolio project. No entry fees or token prizes are charged (0 BOT entry fee, minimal gas only). The demo winner-selection mechanism is pseudo-random for demonstration purposes.

---

## Features

- **Free On-Chain Entry:** Users can enter the open draw directly with their Web3 wallet (0 BOT entry fee, minimal gas only).
- **Duplicate Prevention:** The smart contract strictly enforces single entry per address in each round.
- **Multi-Round Support:** Consecutive rounds with preserved historical records and participant tracking.
- **Real-Time Participant Roster:** Transparently lists all registered wallet addresses directly from the smart contract, with address truncation and copy-to-clipboard functionality.
- **Owner Administrative Controls:** Only the contract deployer (owner) can close the draw and trigger the on-chain winner finalization or start the next round.
- **Dynamic Draw State:** Tracks draw progression across three distinct states: `Open`, `Closed`, and `Completed`.
- **Botchain Mainnet Integration:** Native support for Botchain Mainnet (Chain ID 677) with automatic network detection and switching prompts.
- **Responsive Dark Theme:** Built with a custom palette (`#15171C`, `#20232B`, `#A78BFA`, `#45C4B0`) and subtle animations.

---

## Tech Stack

- **Smart Contract:** Solidity `0.8.20`
- **Development & Testing:** Hardhat, Ethers.js, Chai
- **Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Lucide React icons
- **Blockchain Connectivity:** Wagmi v2, Viem, TanStack React Query

---

## Botchain Network Details

### Mainnet (Production)

| Parameter | Value |
|---|---|
| **Network Name** | Botchain Mainnet |
| **Chain ID** | `677` |
| **RPC URL** | `https://rpc.botchain.ai` |
| **Native Token** | `BOT` |
| **Total Supply** | `150,000,000 BOT` |
| **Block Explorer** | `https://scan.botchain.ai` |
| **Deployed Contract** | `0x38AaD618b663e5E14431965a26d50FC76fb90273` |

---

## Prerequisites

Before getting started, make sure you have:
1. **Node.js** (v18+ or v20+)
2. **npm** or **yarn**
3. A Web3 wallet (e.g. MetaMask, Rabby, or Coinbase Wallet) configured with Botchain Mainnet (Chain ID 677) and `BOT` tokens for gas.

---

## Installation & Setup

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd Prizepop
npm install
```

### 2. Configure Environment Variables

Create `.env.local` by copying `.env.example`:

```bash
cp .env.example .env.local
```

Inside `.env.local`, specify:

```env
# Botchain Mainnet Configuration (Chain ID: 677)
BOTCHAIN_RPC_URL=https://rpc.botchain.ai
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.botchain.ai

# Deployed PrizePop Smart Contract Address on Botchain Mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0x38AaD618b663e5E14431965a26d50FC76fb90273

# Deployer Private Key (For Hardhat deployment only — NEVER commit this!)
PRIVATE_KEY=your_private_key_here
```

---

## Smart Contract Development

### Compile Contract

Compile the Solidity smart contracts:

```bash
npm run compile
```

### Run Tests

Execute the 23 comprehensive tests covering deployment, ownership, duplicate entries, closure, winner selection, multi-round draws, and events:

```bash
npm test
```

### Deploy to Botchain Mainnet

Ensure `PRIVATE_KEY` has `BOT` tokens on Botchain Mainnet, then run:

```bash
npm run deploy:mainnet
```

After deployment, copy the contract address printed to your terminal and set it in `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddressHere
```

---

## Running Frontend Locally

Start the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Inspecting on Block Explorer

You can inspect the contract, verified source code, transactions, and events directly on the Botchain Explorer:

`https://scan.botchain.ai/address/0x38AaD618b663e5E14431965a26d50FC76fb90273#code`

---

## Deploying Frontend to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. In **Environment Variables**, configure:
   - `NEXT_PUBLIC_BOTCHAIN_RPC_URL`: `https://rpc.botchain.ai`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: `0x38AaD618b663e5E14431965a26d50FC76fb90273`
4. Click **Deploy**.

---

## Security & Randomness Disclaimer

> [!CAUTION]
> **Winner Selection Is Demo-Only:**
> The `_selectDemoWinnerIndex()` internal function uses block data (`block.prevrandao`, `block.timestamp`, and participant array length) for deterministic demonstration.
>
> In production environments with real financial value or significant prizes, block variables can be influenced or predicted by validators and participants. A production-ready prize draw must utilize an asynchronous Verifiable Random Function (VRF), such as **Chainlink VRF** or **Gelato VRF**, which provides cryptographic proofs of tamper-proof randomness.

---

## License

MIT License. Free to use, adapt, and build upon.
