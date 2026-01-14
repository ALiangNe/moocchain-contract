// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ResourceNFTModule = buildModule("ResourceNFTModule", (m) => {
  const resourceNFT = m.contract("ResourceNFT");

  return { resourceNFT };
});

export default ResourceNFTModule;
