// Hardhat Ignition 模块，用于部署 CertificateNFT 合约
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CertificateNFTModule = buildModule("CertificateNFTModule", (m) => {
  const certificateNFT = m.contract("CertificateNFT");

  return { certificateNFT };
});

export default CertificateNFTModule;
