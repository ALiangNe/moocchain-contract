# MOOCChain Contracts

Smart contracts for MOOCChain blockchain MOOC platform, built with Hardhat and Solidity.

## Tech Stack

- **Framework**: Hardhat 2.x
- **Language**: Solidity 0.8.20
- **Testing**: TypeScript, Chai, Hardhat Toolbox
- **Deployment**: Hardhat Ignition
- **Compiler**: Optimized with IR-based compilation (runs: 200)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Local blockchain node (geth) running on `http://127.0.0.1:8888`

### Installation

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm run test
```

### Deploy

Start your local blockchain node first, then:

```bash
# Deploy ResourceNFT contract
npm run deploy
```

### Sync to Frontend

After deploying the contract, sync the ABI and address to the frontend:

```bash
npm run sync
```

This will automatically:
- Copy the contract ABI to `moocchain-web/src/contracts/Contracts.json`
- Generate contract addresses file at `moocchain-web/src/contracts/contractAddresses.ts`

## Scripts

- `npm run compile` - Compile Solidity contracts
- `npm run test` - Run test suite
- `npm run deploy` - Deploy contracts to localhost network
- `npm run sync` - Sync contract ABI and addresses to frontend project

## License

MIT
