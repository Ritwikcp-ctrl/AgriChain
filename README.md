<div align="center">

# 🌾 AgriChain

**Decentralized Infrastructure for Agricultural Commerce & Governance**

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Solidity](https://img.shields.io/badge/Solidity-Smart_Contracts-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Solana](https://img.shields.io/badge/Solana-Programs-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

*A single on-chain-anchored platform for crop trade, price transparency, tool sharing, and agricultural governance.*

[Overview](#-overview) • [Modules](#-core-modules) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Environment](#-environment-variables) • [Database](#-database-schema) • [Contracts](#-smart-contracts) • [Roadmap](#-roadmap) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**AgriChain** is a production blockchain-backed platform built to remove intermediaries from agricultural commerce and give farmers direct market access, verifiable transaction history, and a voice in agricultural policy through on-chain elections.

Every transaction — a crop sale, a tool rental, a vote — is written to chain and mirrored in a relational data layer for fast querying, giving the platform both the auditability of a blockchain and the performance of a conventional application.

> **Status:** Active development — pre-launch. Interfaces and contract addresses in this document are subject to change until v1.0.0.

---

## 🧩 Core Modules

| Module | Description |
|---|---|
| 🛒 **Direct Crop Marketplace** | Farmers list crops directly to buyers/merchants, cutting out middlemen. |
| 📊 **Real-Time Price Analytics** | Live market pricing to help farmers time sales and negotiate fairly. |
| 🔗 **On-Chain Transactions** | Crop and tool-rental payments recorded on Ethereum/Solana with `tx_hash` provenance. |
| 🔧 **Peer-to-Peer Tool Rentals** | Farmers list and rent equipment (Lessor/Lessee roles) without third-party platforms. |
| 🗳️ **On-Chain Agricultural Voting** | State-level, tamper-proof voting for Agriculture Minister elections. |

---

## 🏗️ Architecture

```
                         ┌───────────────────────────┐
                         │        Client (Web)        │
                         │  Next.js App Router + TS   │
                         │      Tailwind CSS UI       │
                         └──────────────┬─────────────┘
                                        │
                              REST / Server Actions
                                        │
                         ┌──────────────▼─────────────┐
                         │        Application Layer     │
                         │   Next.js Route Handlers     │
                         └──────┬─────────────────┬────┘
                                │                 │
                    ┌───────────▼───────┐   ┌─────▼──────────────┐
                    │     PostgreSQL      │   │   Blockchain Layer   │
                    │  Users · Crop ·     │   │  Solidity (EVM) /    │
                    │  Tools · Transaction│   │  Solana Programs     │
                    └────────────────────┘   └─────────────────────┘
```

- **Off-chain (PostgreSQL):** user profiles, role data (Lessor/Lessee/Merchant), crop and tool listings, cached analytics.
- **On-chain (Ethereum/Solana):** transaction settlement, `tx_hash` provenance, voting ballots.
- Every `TRANSACTION` record links an off-chain row to its on-chain proof, so the UI stays fast while remaining independently verifiable.

---

## 🗃️ Database Schema

Core entities, with role-based inheritance:

```
User
 ├── Lessor    (lists Tools for rent)
 ├── Lessee    (rents Tools)
 └── Merchant  (buys/sells Crop)

Crop
 ├── owner_id      → User
 ├── price
 └── listing_status

Tools
 ├── lessor_id     → User
 ├── availability
 └── rental_rate

Transaction
 ├── type           (crop_sale | tool_rental)
 ├── ref_id          → Crop.id | Tools.id
 ├── from_user_id    → User
 ├── to_user_id      → User
 ├── amount
 ├── tx_hash         (on-chain proof)
 ├── chain           (ethereum | solana)
 └── status          (pending | confirmed | failed)
```

> Full ERD available in [`/docs/erd.md`](./docs/erd.md).

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Smart Contracts | Solidity (EVM), Solana Programs (Rust) |
| Auth | *(fill in — e.g. NextAuth / custom JWT)* |
| Hosting | *(fill in — e.g. Vercel + Railway/Supabase)* |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- PostgreSQL ≥ 14
- pnpm / npm / yarn
- A funded wallet + RPC endpoint for testnet deployment (Ethereum Sepolia / Solana Devnet)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-org>/agrichain.git
cd agrichain

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔐 Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agrichain

# Blockchain — Ethereum
NEXT_PUBLIC_ETH_RPC_URL=
ETH_PRIVATE_KEY=
CONTRACT_ADDRESS_ETH=

# Blockchain — Solana
NEXT_PUBLIC_SOLANA_RPC_URL=
SOLANA_PROGRAM_ID=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

> **Never commit `.env.local`.** Rotate any keys that were ever pushed to a public branch.

---

## ⛓️ Smart Contracts

| Contract / Program | Chain | Purpose | Address |
|---|---|---|---|
| `AgriTransaction` | Ethereum | Crop & tool-rental settlement | `TBD` |
| `AgriVote` | Ethereum / Solana | State-level Agriculture Minister voting | `TBD` |

Contract source lives under [`/contracts`](./contracts). Deployment scripts under [`/scripts/deploy`](./scripts/deploy).

```bash
# Compile contracts
npm run contracts:compile

# Run contract tests
npm run contracts:test

# Deploy to testnet
npm run contracts:deploy -- --network sepolia
```

---

## 🧪 Testing

```bash
npm run test          # unit tests
npm run test:e2e       # end-to-end tests
npm run contracts:test # smart contract tests
```

---

## 🗺️ Roadmap

- [x] Core ERD: User, Lessor, Lessee, Merchant, Tools, Crop
- [x] `TRANSACTION` entity for on-chain payment logging
- [x] Dark, soil-themed UI system
- [ ] Wallet connect (MetaMask / Phantom)
- [ ] Real-time price analytics dashboard
- [ ] On-chain voting module (testnet)
- [ ] Security audit of smart contracts
- [ ] Mainnet deployment

---

## 🤝 Contributing

This is currently a closed-development startup repository. If you've been granted access:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit with clear messages: `git commit -m "feat: add crop listing pagination"`
3. Open a pull request against `main` with a description and testing notes.

---

## 📄 License

Proprietary — All rights reserved, © 2026 AgriChain. *(Replace with MIT/Apache-2.0 if open-sourcing.)*

---

<div align="center">

Built by **Sunny Rai** — shipping real infrastructure, not tutorials.

</div>