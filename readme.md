# 📜 Blockchain-Based Certificate Verification System

This project implements a decentralized certificate verification system on both **Ethereum** and **Sui** blockchains, allowing secure, tamper-proof issuance and verification of digital certificates.

---

## ⚙️ Ethereum Smart Contract Deployment (Remix IDE)

> Language: Solidity  
> Platform: [Remix IDE](https://remix.ethereum.org)

### 📌 Steps:
1. Open [Remix IDE](https://remix.ethereum.org) in your browser.
2. Create a new file named `CertificateVerification.sol` and paste the Solidity contract code.
3. Navigate to the **Solidity Compiler** tab:
   - Select version `0.8.x` (matching pragma).
   - Click **Compile CertificateVerification.sol**.
4. Go to the **Deploy & Run Transactions** tab:
   - Set environment to **Injected Provider - MetaMask** (ensure you're connected to Sepolia or Goerli testnet).
   - Deploy the contract by clicking **Deploy**.
5. After deployment, copy the **contract address** displayed under **Deployed Contracts**.

---

## ⚙️ Sui Smart Contract Deployment (CLI)

> Language: Move  
> Tool: Sui CLI  
> Prerequisite: [Install Sui CLI](https://docs.sui.io/devnet/build/install)

### 📌 Steps:

```bash
# 1. Clone the project or navigate to your Move package folder
cd path/to/your/sui_project

# 2. Build the Move contract
sui move build

# 3. Publish the contract to the Sui network
sui client publish --gas-budget 100000000

# 4. Copy the Package ID from the publish output
# This is your deployed contract's unique identifier
```
🔗 Deployed Contract Addresses

| Platform | Network | Contract Address / Package ID |
|----------|---------|-------------------------------|
| **Ethereum** | Sepolia Testnet | [`0x8Eea8E6acd7c018D60C22162E6cDCE05f0ee249E`](https://sepolia.etherscan.io/address/0x8Eea8E6acd7c018D60C22162E6cDCE05f0ee249E) |
| **Sui** | Sui Testnet | [`0xa07b80f6e13a408cf659ce5994243cffeb43e3febb537e27c06cc58545346608`](https://suiscan.xyz/testnet/object/0xa07b80f6e13a408cf659ce5994243cffeb43e3febb537e27c06cc58545346608/tx-blocks) |
