// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LearningRecordModule = buildModule("LearningRecordModule", (m) => {
  const learningRecord = m.contract("LearningRecord");

  return { learningRecord };
});

export default LearningRecordModule;

