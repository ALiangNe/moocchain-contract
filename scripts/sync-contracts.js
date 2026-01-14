const fs = require('fs');
const path = require('path');

// 路径配置
const CONTRACT_ROOT = path.join(__dirname, '..');
const FRONTEND_ROOT = path.join(__dirname, '../../moocchain-web');

// 合约文件路径
const ARTIFACTS_PATH = path.join(CONTRACT_ROOT, 'artifacts/contracts/ResourceNFT.sol/ResourceNFT.json');
const DEPLOYED_ADDRESSES_PATH = path.join(CONTRACT_ROOT, 'ignition/deployments/chain-1337/deployed_addresses.json');

// 前端输出路径
const FRONTEND_CONTRACTS_DIR = path.join(FRONTEND_ROOT, 'src/contracts');
const FRONTEND_ABI_PATH = path.join(FRONTEND_CONTRACTS_DIR, 'ResourceNFT.json');
const FRONTEND_ADDRESS_PATH = path.join(FRONTEND_CONTRACTS_DIR, 'contractAddresses.ts');

/**
 * 同步合约 ABI 和地址到前端项目
 */
function syncContracts() {
  console.log('🚀 开始同步合约文件到前端项目...\n');

  // 检查合约文件是否存在
  if (!fs.existsSync(ARTIFACTS_PATH)) {
    console.error('❌ 错误: 找不到合约 ABI 文件');
    console.error(`   路径: ${ARTIFACTS_PATH}`);
    console.error('   请先编译合约: npm run compile');
    process.exit(1);
  }

  if (!fs.existsSync(DEPLOYED_ADDRESSES_PATH)) {
    console.error('❌ 错误: 找不到部署地址文件');
    console.error(`   路径: ${DEPLOYED_ADDRESSES_PATH}`);
    console.error('   请先部署合约: npx hardhat ignition deploy ignition/modules/ResourceNFT.ts --network localhost');
    process.exit(1);
  }

  // 读取合约 ABI
  let artifact;
  try {
    const artifactContent = fs.readFileSync(ARTIFACTS_PATH, 'utf-8');
    artifact = JSON.parse(artifactContent);
  } catch (error) {
    console.error('❌ 读取合约 ABI 文件失败:', error.message);
    process.exit(1);
  }

  // 读取部署地址
  let deployedAddresses;
  try {
    const addressesContent = fs.readFileSync(DEPLOYED_ADDRESSES_PATH, 'utf-8');
    deployedAddresses = JSON.parse(addressesContent);
  } catch (error) {
    console.error('❌ 读取部署地址文件失败:', error.message);
    process.exit(1);
  }

  // 获取 ResourceNFT 合约地址
  const contractAddress = deployedAddresses['ResourceNFTModule#ResourceNFT'];
  if (!contractAddress) {
    console.error('❌ 错误: 找不到 ResourceNFT 合约地址');
    console.error('   请确保已部署 ResourceNFT 合约');
    process.exit(1);
  }

  // 确保前端 contracts 目录存在
  if (!fs.existsSync(FRONTEND_CONTRACTS_DIR)) {
    fs.mkdirSync(FRONTEND_CONTRACTS_DIR, { recursive: true });
    console.log('✅ 创建前端 contracts 目录');
  }

  // 写入 ABI 文件
  try {
    const abiData = {
      abi: artifact.abi,
      contractName: artifact.contractName,
    };
    fs.writeFileSync(FRONTEND_ABI_PATH, JSON.stringify(abiData, null, 2), 'utf-8');
    console.log('✅ 已同步 ABI 文件:', FRONTEND_ABI_PATH);
  } catch (error) {
    console.error('❌ 写入 ABI 文件失败:', error.message);
    process.exit(1);
  }

  // 写入合约地址 TypeScript 文件
  try {
    const addressContent = `// 自动生成的文件，请勿手动修改
// 此文件由 scripts/sync-contracts.js 自动生成

/**
 * ResourceNFT 合约地址
 */
export const RESOURCE_NFT_ADDRESS = '${contractAddress}' as const;

/**
 * 合约地址映射
 */
export const CONTRACT_ADDRESSES = {
  ResourceNFT: RESOURCE_NFT_ADDRESS,
} as const;

export type ContractAddresses = typeof CONTRACT_ADDRESSES;
`;
    fs.writeFileSync(FRONTEND_ADDRESS_PATH, addressContent, 'utf-8');
    console.log('✅ 已同步合约地址文件:', FRONTEND_ADDRESS_PATH);
  } catch (error) {
    console.error('❌ 写入合约地址文件失败:', error.message);
    process.exit(1);
  }

  console.log('\n✨ 同步完成！');
  console.log(`   合约地址: ${contractAddress}`);
  console.log(`   ABI 文件: ${FRONTEND_ABI_PATH}`);
  console.log(`   地址文件: ${FRONTEND_ADDRESS_PATH}`);
}

// 执行同步
syncContracts();
