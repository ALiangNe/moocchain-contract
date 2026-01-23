// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MOOCTokenModule = buildModule("MOOCTokenModule", (m) => {
  // 初始代币供应量（设为0，后续通过mint发放）
  const initialSupply = m.getParameter("initialSupply", 0);
  
  // 平台钱包地址（接收用户购买资源支付的代币）
  // 默认使用配置的平台钱包地址，部署时可以通过参数覆盖
  const platformWallet = m.getParameter("platformWallet", "0xb0349190f80cd06D46FB65279aD4cC091eF34906");

  const moocToken = m.contract("MOOCToken", [initialSupply, platformWallet]);

  return { moocToken };
});

export default MOOCTokenModule;
