# PrizePop — Simple Web3 Prize Draw dApp

PrizePop is a lightweight, decentralized prize draw application built for **Botchain Testnet**. It enables users to connect their Web3 wallet, enter an on-chain prize draw for free, view all registered participants in real time, and observe the finalized winner selected on-chain.

> [!NOTE]
> **Testnet Portfolio Demonstration:**
> PrizePop is designed as a clean, production-grade testnet portfolio project. No real funds, entry fees, or token prizes are involved. The demo winner-selection mechanism is pseudo-random and explicitly designed for testnet demonstration only.

---

## Features

- **Free On-Chain Entry:** Users can enter the open draw directly with their Web3 wallet (0 BOT entry fee, gas only).
- **Duplicate Prevention:** The smart contract strictly enforces single entry per address.
- **Real-Time Participant Roster:** Transparently lists all registered wallet addresses directly from the smart contract, with address truncation and copy-to-clipboard functionality.
- **Owner Administrative Controls:** Only the contract deployer (owner) can close the draw and trigger the on-chain winner finalization.
- **Dynamic Draw State:** Tracks draw progression across three distinct states: `Open`, `Closed`, and `Completed`.
- **Botchain Testnet Integration:** Native support for Botchain Testnet (Chain ID 968) with automatic network detection and switching prompts.
- **Responsive Dark Theme:** Built with a custom palette (`#15171C`, `#20232B`, `#A78BFA`, `#45C4B0`) and subtle animations.

---

## Tech Stack

- **Smart Contract:** Solidity `0.8.20`
- **Development & Testing:** Hardhat, Ethers.js, Chai
- **Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Lucide React icons
- **Blockchain Connectivity:** Wagmi v2, Viem, TanStack React Query

---

## Botchain Testnet Details

| Parameter | Value |
|---|---|
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Currency Symbol** | `BOT` |
| **Block Explorer** | `https://scan.bohr.life` |

---

## Prerequisites

Before getting started, make sure you have:
1. **Node.js** (v18+ or v20+)
2. **npm** or **yarn**
3. A Web3 wallet (e.g. MetaMask, Rabby, or Coinbase Wallet) configured with Botchain Testnet and testnet `BOT` tokens for gas.

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
# Botchain Testnet RPC
BOTCHAIN_RPC_URL=https://rpc.bohr.life
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.bohr.life

# Deployed Smart Contract (fill in after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=

# Deployer Private Key (For Hardhat deployment only — NEVER commit this!)
PRIVATE_KEY=your_private_key_here
```

---

## Smart Contract Development

### Compile Contract

Compile the Solidity smart contracts:

```bash
npx hardhat compile
```

### Run Tests

Execute the 16 comprehensive tests covering deployment, ownership, duplicate entries, closure, winner selection, and events:

```bash
npx hardhat test
```

### Deploy to Botchain Testnet

Ensure `PRIVATE_KEY` has testnet `BOT` tokens on Botchain Testnet, then run:

```bash
npx hardhat run scripts/deploy.js --network botchainTestnet
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

`https://scan.bohr.life/address/<YOUR_CONTRACT_ADDRESS>`

---

## Deploying Frontend to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. In **Environment Variables**, configure:
   - `NEXT_PUBLIC_BOTCHAIN_RPC_URL`: `https://rpc.bohr.life`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: `<YOUR_DEPLOYED_CONTRACT_ADDRESS>`
4. Click **Deploy**.

---

## Security & Winner Selection Disclaimer

> [!CAUTION]
> **Winner Selection Is Demo-Only:**
> The `_selectDemoWinnerIndex()` internal function uses block data (`block.prevrandao`, `block.timestamp`, and participant array length) for deterministic demonstration on testnet.
>
> In production environments with real financial value or significant prizes, block variables can be influenced or predicted by miners/validators and participants. A production-ready prize draw must utilize an asynchronous Verifiable Random Function (VRF), such as **Chainlink VRF** or **Gelato VRF**, which provides cryptographic proofs of tamper-proof randomness.

---

## License

MIT License. Free to use, adapt, and build upon.
