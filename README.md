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
npm run deploy
```

## Scripts

- `npm run compile` - Compile Solidity contracts
- `npm run test` - Run test suite
- `npm run deploy` - Deploy contracts to localhost network

## License

MIT
