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
npm run deploy:ResourceNFT

# Deploy CertificateNFT contract
npm run deploy:CertificateNFT

# Deploy MOOCToken ERC20 contract
npm run deploy:MOOCToken
```

### Sync to Frontend

After deploying the contracts, sync the ABI and addresses to the frontend:

```bash
# Sync ResourceNFT contract
npm run sync:ResourceNFT

# Sync CertificateNFT contract
npm run sync:CertificateNFT

# Sync MOOCToken contract
npm run sync:MOOCToken
```

This will automatically:
- Copy the contract ABI files to `moocchain-web/src/contracts/`
- Generate contract addresses file at `moocchain-web/src/contracts/contractAddresses.ts`

## Contracts

### ResourceNFT
ERC721 NFT contract for course resources. Each resource is minted as a unique NFT.

### CertificateNFT
ERC721 NFT contract for course certificates. Certificates are minted as NFTs upon course completion.

### MOOCToken
ERC20 token contract for the MOOCChain platform. Used for rewarding users and purchasing course resources.

## Scripts

### Compilation & Testing
- `npm run compile` - Compile Solidity contracts
- `npm run test` - Run test suite

### Deployment
- `npm run deploy:ResourceNFT` - Deploy ResourceNFT contract to localhost
- `npm run deploy:CertificateNFT` - Deploy CertificateNFT contract to localhost
- `npm run deploy:MOOCToken` - Deploy MOOCToken ERC20 contract to localhost

### Synchronization
- `npm run sync:ResourceNFT` - Sync ResourceNFT ABI and address to frontend
- `npm run sync:CertificateNFT` - Sync CertificateNFT ABI and address to frontend
- `npm run sync:MOOCToken` - Sync MOOCToken ABI and address to frontend

## License

MIT
