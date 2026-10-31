# PrizePop Whitepaper

**A Transparent, Multi-Round Decentralized Prize Draw & Community Raffle Protocol on Botchain**

*Version 1.0 — October 2026*  
*Project Repository: [liljhnxn/prizepop](https://github.com/liljhnxn/prizepop)*  
*Smart Contract Address: [`0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929`](https://scan.bohr.life/address/0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929)*  
*Network: Botchain Testnet (Chain ID: `968`)*  

---

## 1. Executive Summary

Digital sweepstakes, community giveaways, and lucky draws are ubiquitous marketing and engagement tools across Web2 and Web3 ecosystems. However, the vast majority of online prize draws suffer from a critical lack of operational transparency: entry lists are obscured in private relational databases, entry numbers are easily manipulated, winner selection occurs behind closed doors, and participants have no cryptographically verifiable proof that a draw was conducted honestly.

**PrizePop** solves these vulnerabilities by introducing a lightweight, fully transparent, smart-contract-enforced prize draw protocol deployed on **Botchain**. PrizePop facilitates verifiable, multi-round prize drawings where:
- Participants register their wallet addresses directly on-chain with zero hidden fees.
- Single-entry-per-wallet rules are enforced trustlessly at the EVM bytecode level.
- Complete participant rosters and draw lifecycle transitions are broadcast openly via blockchain events.
- Winner finalization is executed immutably on-chain, preserving an auditable history across every draw round.

By establishing a clear separation of draw lifecycle states (`Open` ➔ `Closed` ➔ `Completed`), PrizePop guarantees deterministic fairness and auditable transparency for community giveaways, promotional rewards, and digital event raffles.

---

## 2. Problem Statement

### 2.1 The Crisis of Trust in Traditional Giveaways
Centralized prize promotions and sweepstakes on platforms like Twitter/X, Discord, Telegram, and Gleam face chronic integrity challenges:
* **Hidden Roster Manipulation:** Contest hosts can silently inject phantom entries, suppress legitimate participants, or misrepresent entry totals.
* **Black-Box Winner Selection:** When winners are selected via server-side random number generation or closed scripts, participants must blindly trust that the host did not hand-pick a friend or controlled secondary account.
* **Retroactive Alteration:** If a host does not like the chosen winner, there is nothing preventing them from re-rolling the selection off-screen and claiming it was the first attempt.
* **Data Harvesting & Privacy Infringements:** Web2 raffle tools frequently mandate extensive personal information harvesting (emails, social identities, tracking cookies) to participate in trivial promotional contests.

### 2.2 The Web3 Opportunity on Botchain
While high transaction fees on Layer 1 blockchains historically made on-chain entry registration cost-prohibitive for free promotions, high-throughput, low-latency networks like **Botchain** enable frictionless, zero-cost (gas-only) user transactions. This enables every promotional contest, product launch, or community raffle to take place completely on-chain without compromising user experience.

---

## 3. PrizePop Protocol Architecture

PrizePop is designed with an emphasis on simplicity, gas efficiency, and verifiable auditability.

```
       +-------------------------------------------------------------+
       |                  PrizePop Smart Contract                     |
       |         (Deployed on Botchain Testnet: 0x48ef...f929)        |
       +-------------------------------------------------------------+
                     |                          |
       +-------------v-------------+            |
       | 1. Registration Phase     |            |
       | - `enterDraw()`           |            |
       | - State: OPEN             |            |
       | - Checks: !hasEntered     |            |
       +-------------+-------------+            |
                     |                          |
                     | owner `closeDraw()`      |  Multi-Round History:
                     v                          |  - Round IDs (1, 2, 3...)
       +---------------------------+            |  - Historical Winners
       | 2. Finalization Phase     |            |  - Historical Counts
       | - State: CLOSED           |            |
       | - No more entries allowed |            |
       +-------------+-------------+            |
                     |                          |
                     | owner `finalizeWinner()` |
                     v                          |
       +---------------------------+            |
       | 3. Resolution Phase       |            |
       | - State: COMPLETED        |            |
       | - Winner picked & logged  |            |
       | - `startNewDraw()` ready  |------------+
       +---------------------------+
```

### 3.1 Finite State Machine (Draw Lifecycle)
Each prize round in PrizePop transitions through an irreversible linear lifecycle managed by an explicit enumeration:

```solidity
enum DrawStatus {
    Open,       // Accepting entries from connected wallets
    Closed,     // Registration closed; awaiting finalization
    Completed   // Winner finalized on-chain; round concluded
}
```

* **`Open`:** Any unique wallet address can invoke `enterDraw()` to join the active round. Duplicate submissions from the same address revert with `"Already entered"`.
* **`Closed`:** The contract owner closes the draw via `closeDraw()`. No further participants may enter, freezing the candidate pool to ensure deterministic selection parameters.
* **`Completed`:** The owner triggers `finalizeWinner()`. The winning participant address is permanently recorded in the round’s state struct, emitting the `WinnerSelected` event.

### 3.2 Multi-Round Archival Storage
Unlike basic raffle contracts that erase historical records upon round reset, PrizePop maintains structured historical storage:
* **Round Structs:** `mapping(uint256 => DrawRound) public draws` stores round metadata, completion flag, and winner address.
* **Participant Arrays:** `mapping(uint256 => address[]) internal drawParticipants` stores the sequential entry order of all participants per round.
* **Historical View:** `getDrawHistory()` aggregates all past round outcomes into a single array payload, enabling front-end dashboards to display comprehensive historical records without requiring a centralized indexing server.

---

## 4. Technical Specifications & Smart Contract Interface

### 4.1 Core Contract Methods

#### State Modifying Functions
* `enterDraw() external`: Registers `msg.sender` in `drawParticipants[currentDrawId]`. Requires current status to be `DrawStatus.Open` and `!hasEnteredRound[currentDrawId][msg.sender]`.
* `closeDraw() external onlyOwner`: Halts entry registrations, advancing state from `Open` to `Closed`.
* `finalizeWinner() external onlyOwner`: Evaluates candidate pool, designates the winning address, transitions status to `Completed`, and locks the round against re-execution.
* `startNewDraw() external onlyOwner`: Increments `currentDrawId`, initializes a fresh `DrawRound` struct in `Open` status, and enables participation for the new round while preserving previous round data.

#### View & Inspection Functions
* `drawStatus() / getDrawStatus()`: Returns active round status.
* `getParticipantCount()`: Returns active participant count.
* `getAllParticipants()`: Returns array of addresses registered in the active round.
* `hasEntered(address user)`: Verifies if a given address has entered the current round.
* `getWinner()`: Returns the winning address once finalized (or zero address if pending).
* `getDrawDetails(uint256 drawId)`: Returns full metadata for any arbitrary past round.
* `getDrawHistory()`: Returns complete history items across all completed and active rounds.

### 4.2 Events & Client Indexing
PrizePop emits deterministic EVM events to facilitate real-time WebSocket subscriptions and subgraph ingestion:
```solidity
event DrawStarted(uint256 indexed drawId);
event ParticipantEntered(uint256 indexed drawId, address indexed participant);
event DrawClosed(uint256 indexed drawId);
event WinnerSelected(uint256 indexed drawId, address indexed winner);
```

---

## 5. Randomness Architecture & Production Roadmap

### 5.1 Testnet Demonstration Randomness
For initial testnet deployment on Botchain Testnet, PrizePop implements a low-overhead pseudo-random selection function:
```solidity
function _selectDemoWinnerIndex(uint256 drawId) internal view returns (uint256) {
    uint256 count = drawParticipants[drawId].length;
    return uint256(keccak256(abi.encodePacked(
        block.prevrandao, 
        block.timestamp, 
        drawId, 
        count
    ))) % count;
}
```
> **Security Notice:** As documented in the contract header, pseudo-randomness derived from block metadata is vulnerable to miner/validator lookahead in high-stakes environments. It is intentionally isolated in an internal function to serve as an illustrative demonstration for testnet portfolio use.

### 5.2 Mainnet Transition to Verifiable Random Function (VRF)
In production and mainnet deployments featuring real-value rewards or token disbursements, `_selectDemoWinnerIndex()` will be replaced with an asynchronous, cryptographically provable randomness provider:
1. **Chainlink VRF / Supra dVRF Integration:** Requesting verifiable random seeds via an off-chain oracle callback, ensuring that neither the contract owner nor participating nodes can predict or bias the winning index.
2. **Commit-Reveal Schemes:** Alternative trust-minimized fallback using user-supplied cryptographic commitments.

---

## 6. Sybil Resistance & Anti-Bot Strategy

In a zero-entry-fee raffle environment, Sybil attacks (creating multiple burner wallets) represent the primary vector of exploitation. PrizePop implements a layered defensive strategy:

1. **Layer 1: Deterministic On-Chain Registry (Live)**
   - Smart-contract-enforced duplicate prevention strictly limits one entry per cryptographic address per draw.
2. **Layer 2: Network Gas Friction (Live)**
   - While entry is free (0 BOT fee), each entry consumes standard EVM execution gas (~48,000 gas), imposing an escalating computational and economic cost on automated mass-wallet generation.
3. **Layer 3: Web3 Identity & Reputation Filters (Phase 2)**
   - Future protocol versions will offer pluggable entry gatekeepers:
     * Minimum wallet age or historical transaction threshold.
     * Gitcoin Passport / EAS (Ethereum Attestation Service) human-verification score checks.
     * Token-gated or NFT-holding qualification requirements.

---

## 7. Technology Stack

* **Smart Contract:** Solidity `^0.8.20` (strict compiler settings, custom errors, modular modifiers).
* **Development & Tooling:** Hardhat, Ethers.js v6, Chai test suite (16 comprehensive unit tests passing).
* **Frontend:** Next.js 15 (App Router), React 19, TypeScript.
* **State & Web3 Connectivity:** Wagmi v2, Viem, TanStack React Query.
* **Design & UX:** Custom responsive dark theme (`#15171C`, `#20232B`, `#A78BFA`, `#45C4B0`), Lucide React icons, real-time toast feedback.
* **Target Network:** Botchain Testnet (Chain ID: `968`, RPC: `https://rpc.bohr.life`).

---

## 8. Strategic Roadmap

```
[Phase 1: Testnet MVP] (COMPLETED)
 - Core PrizePop smart contract deployment on Botchain Testnet (0x48ef...f929)
 - Multi-round architecture and historical roster querying
 - Modern Next.js 15 frontend with live Wagmi integration and owner administrative portal

[Phase 2: Verifiable Randomness & Tokenized Pools] (Q1 2027)
 - Integration of Chainlink VRF or native Botchain randomness oracle
 - Support for ERC-20 prize pools and native BOT bounty draws
 - Automated timer-based round closure and finalization via Chainlink Automation / Gelato

[Phase 3: Community & Sponsored Raffles] (Q2 2027)
 - Permissionless draw creation: Any project can host custom promotional draws
 - Sybil-resistant entry gates (Proof of Humanity / Social attestations)
 - SDK & widget embedding for third-party dApps and communities
```

---

## 9. Verification & Reference Links

* **Deployed Contract Address:** [`0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929`](https://scan.bohr.life/address/0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929)
* **Block Explorer:** [BohrScan Explorer](https://scan.bohr.life)
* **Source Code Repository:** [github.com/liljhnxn/prizepop](https://github.com/liljhnxn/prizepop)
* **Chain ID:** `968` | **Symbol:** `BOT` | **RPC Endpoint:** `https://rpc.bohr.life`
