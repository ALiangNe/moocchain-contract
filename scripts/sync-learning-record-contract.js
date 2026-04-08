const fs = require('fs');
const path = require('path');

// 路径配置
const CONTRACT_ROOT = path.join(__dirname, '..');
const FRONTEND_ROOT = path.join(__dirname, '../../moocchain-web');
const BACKEND_ROOT = path.join(__dirname, '../../moocchain-api');

// 合约文件路径（只处理 LearningRecord）
const LEARNING_RECORD_ARTIFACTS_PATH = path.join(CONTRACT_ROOT, 'artifacts/contracts/LearningRecord.sol/LearningRecord.json');
const DEPLOYED_ADDRESSES_PATH = path.join(CONTRACT_ROOT, 'ignition/deployments/chain-1337/deployed_addresses.json');

// 后端输出路径（所有合约地址都写入同一个 contractAddresses.ts）
const BACKEND_CONTRACTS_DIR = path.join(BACKEND_ROOT, 'src/contracts');
const BACKEND_LEARNING_RECORD_ABI_PATH = path.join(BACKEND_CONTRACTS_DIR, 'LearningRecord.json');
const BACKEND_ADDRESS_PATH = path.join(BACKEND_ROOT, 'src/contracts/contractAddresses.ts');

// 前端输出路径（同步 ABI 和地址文件）
const FRONTEND_CONTRACTS_DIR = path.join(FRONTEND_ROOT, 'src/contracts');
const FRONTEND_LEARNING_RECORD_ABI_PATH = path.join(FRONTEND_CONTRACTS_DIR, 'LearningRecord.json');
const FRONTEND_ADDRESS_PATH = path.join(FRONTEND_ROOT, 'src/contracts/contractAddresses.ts');

/**
 * 同步 LearningRecord 合约 ABI 和地址到后端项目
 */
function syncLearningRecordContracts() {
  console.log('🚀 开始同步 LearningRecord 合约文件到前后端...\n');

  // 检查 LearningRecord 合约文件是否存在
  if (!fs.existsSync(LEARNING_RECORD_ARTIFACTS_PATH)) {
    console.error('❌ 错误: 找不到 LearningRecord 合约 ABI 文件');
    console.error(`   路径: ${LEARNING_RECORD_ARTIFACTS_PATH}`);
    console.error('   请先编译合约: npm run compile');
    process.exit(1);
  }

  if (!fs.existsSync(DEPLOYED_ADDRESSES_PATH)) {
    console.error('❌ 错误: 找不到部署地址文件');
    console.error(`   路径: ${DEPLOYED_ADDRESSES_PATH}`);
    console.error('   请先部署 LearningRecord 合约: npm run deploy:LearningRecord');
    process.exit(1);
  }

  // 读取 LearningRecord 合约 ABI
  let learningRecordArtifact;
  try {
    const content = fs.readFileSync(LEARNING_RECORD_ARTIFACTS_PATH, 'utf-8');
    learningRecordArtifact = JSON.parse(content);
  } catch (error) {
    console.error('❌ 读取 LearningRecord 合约 ABI 文件失败:', error.message);
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

  // ignition 模块名：LearningRecordModule#LearningRecord
  const learningRecordAddress = deployedAddresses['LearningRecordModule#LearningRecord'];
  if (!learningRecordAddress) {
    console.error('❌ 错误: 找不到 LearningRecord 合约地址');
    console.error('   请确保已部署 LearningRecord 合约');
    process.exit(1);
  }

  // 确保前端 contracts 目录存在
  if (!fs.existsSync(FRONTEND_CONTRACTS_DIR)) {
    fs.mkdirSync(FRONTEND_CONTRACTS_DIR, { recursive: true });
    console.log('✅ 创建前端 contracts 目录');
  }

  // 确保后端 contracts 目录存在
  if (!fs.existsSync(BACKEND_CONTRACTS_DIR)) {
    fs.mkdirSync(BACKEND_CONTRACTS_DIR, { recursive: true });
    console.log('✅ 创建后端 contracts 目录');
  }

  // 写入前端 LearningRecord ABI 文件
  try {
    const abiData = {
      abi: learningRecordArtifact.abi,
      contractName: learningRecordArtifact.contractName,
    };
    fs.writeFileSync(FRONTEND_LEARNING_RECORD_ABI_PATH, JSON.stringify(abiData, null, 2), 'utf-8');
    console.log('✅ 已同步前端 LearningRecord ABI 文件:', FRONTEND_LEARNING_RECORD_ABI_PATH);
  } catch (error) {
    console.error('❌ 写入前端 LearningRecord ABI 文件失败:', error.message);
    process.exit(1);
  }

  // 写入后端 LearningRecord ABI 文件
  try {
    const abiData = {
      abi: learningRecordArtifact.abi,
      contractName: learningRecordArtifact.contractName,
    };
    fs.writeFileSync(BACKEND_LEARNING_RECORD_ABI_PATH, JSON.stringify(abiData, null, 2), 'utf-8');
    console.log('✅ 已同步后端 LearningRecord ABI 文件:', BACKEND_LEARNING_RECORD_ABI_PATH);
  } catch (error) {
    console.error('❌ 写入后端 LearningRecord ABI 文件失败:', error.message);
    process.exit(1);
  }

  // 尝试保留已有的前端其他合约地址（如果存在）
  let existingFrontendAddresses = {};
  if (fs.existsSync(FRONTEND_ADDRESS_PATH)) {
    try {
      const content = fs.readFileSync(FRONTEND_ADDRESS_PATH, 'utf-8');

      const resourceMatch = content.match(/export const RESOURCE_NFT_ADDRESS\s*=\s*'([^']+)'/);
      if (resourceMatch && resourceMatch[1]) existingFrontendAddresses.ResourceNFT = resourceMatch[1];

      const certificateMatch = content.match(/export const CERTIFICATE_NFT_ADDRESS\s*=\s*'([^']+)'/);
      if (certificateMatch && certificateMatch[1]) existingFrontendAddresses.CertificateNFT = certificateMatch[1];

      const tokenMatch = content.match(/export const MOOC_TOKEN_ADDRESS\s*=\s*'([^']+)'/);
      if (tokenMatch && tokenMatch[1]) existingFrontendAddresses.MOOCToken = tokenMatch[1];
    } catch (error) {
      console.warn('⚠️ 读取现有前端合约地址文件失败，将以占位地址写入:', error.message);
    }
  }

  const frontendResourceNftAddress = existingFrontendAddresses.ResourceNFT || '0xe4819c057D39960a330E979399f870FB72C0a1CF';
  const frontendCertificateNftAddress = existingFrontendAddresses.CertificateNFT || '0x2A7ED58470dAa4BD5804DDcD2c6ca7622274f174';
  const frontendMoocTokenAddress = existingFrontendAddresses.MOOCToken || '0xE4051c7EA9B35A600724676acBdE51508458F996';

  // 写入前端合约地址 TypeScript 文件
  try {
    const frontendAddressContent = `// 自动生成的文件，请勿手动修改
// 此文件由 scripts/sync-resource-contracts.js、scripts/sync-certificate-contracts.js、scripts/sync-mooc-token-contracts.js 和 scripts/sync-learning-record-contract.js 自动生成

/**
 * ResourceNFT 合约地址
 */
export const RESOURCE_NFT_ADDRESS = '${frontendResourceNftAddress}' as const;

/**
 * CertificateNFT 合约地址
 */
export const CERTIFICATE_NFT_ADDRESS = '${frontendCertificateNftAddress}' as const;

/**
 * MOOCToken ERC20 代币合约地址
 */
export const MOOC_TOKEN_ADDRESS = '${frontendMoocTokenAddress}' as const;

/**
 * LearningRecord 合约地址
 */
export const LEARNING_RECORD_ADDRESS = '${learningRecordAddress}' as const;

/**
 * 合约地址映射
 */
export const CONTRACT_ADDRESSES = {
  ResourceNFT: RESOURCE_NFT_ADDRESS,
  CertificateNFT: CERTIFICATE_NFT_ADDRESS,
  MOOCToken: MOOC_TOKEN_ADDRESS,
  LearningRecord: LEARNING_RECORD_ADDRESS,
} as const;

export type ContractAddresses = typeof CONTRACT_ADDRESSES;
`;
    fs.writeFileSync(FRONTEND_ADDRESS_PATH, frontendAddressContent, 'utf-8');
    console.log('✅ 已同步前端合约地址文件:', FRONTEND_ADDRESS_PATH);
  } catch (error) {
    console.error('❌ 写入前端合约地址文件失败:', error.message);
    process.exit(1);
  }

  // 尝试保留已有的其他合约地址（如果存在）
  let existingAddresses = {};
  if (fs.existsSync(BACKEND_ADDRESS_PATH)) {
    try {
      const content = fs.readFileSync(BACKEND_ADDRESS_PATH, 'utf-8');

      const resourceMatch = content.match(/export const RESOURCE_NFT_ADDRESS\s*=\s*'([^']+)'/);
      if (resourceMatch && resourceMatch[1]) existingAddresses.ResourceNFT = resourceMatch[1];

      const certificateMatch = content.match(/export const CERTIFICATE_NFT_ADDRESS\s*=\s*'([^']+)'/);
      if (certificateMatch && certificateMatch[1]) existingAddresses.CertificateNFT = certificateMatch[1];

      const tokenMatch = content.match(/export const MOOC_TOKEN_ADDRESS\s*=\s*'([^']+)'/);
      if (tokenMatch && tokenMatch[1]) existingAddresses.MOOCToken = tokenMatch[1];
    } catch (error) {
      console.warn('⚠️ 读取现有后端合约地址文件失败，将以占位地址写入:', error.message);
    }
  }

  const resourceNftAddress = existingAddresses.ResourceNFT || '0xe4819c057D39960a330E979399f870FB72C0a1CF';
  const certificateNftAddress = existingAddresses.CertificateNFT || '0x2A7ED58470dAa4BD5804DDcD2c6ca7622274f174';
  const moocTokenAddress = existingAddresses.MOOCToken || '0xE4051c7EA9B35A600724676acBdE51508458F996';

  // 写入后端合约地址 TypeScript 文件
  try {
    let addressContent = `// 自动生成的文件，请勿手动修改
// 此文件由 scripts/sync-resource-contracts.js、scripts/sync-certificate-contracts.js、scripts/sync-mooc-token-contracts.js 和 scripts/sync-learning-record-contract.js 自动生成
`;

    addressContent += `
/**
 * ResourceNFT 合约地址
 */
export const RESOURCE_NFT_ADDRESS = '${resourceNftAddress}' as const;
`;

    addressContent += `
/**
 * CertificateNFT 合约地址
 */
export const CERTIFICATE_NFT_ADDRESS = '${certificateNftAddress}' as const;
`;

    addressContent += `
/**
 * MOOCToken ERC20 代币合约地址
 */
export const MOOC_TOKEN_ADDRESS = '${moocTokenAddress}' as const;
`;

    addressContent += `
/**
 * LearningRecord 合约地址
 */
export const LEARNING_RECORD_ADDRESS = '${learningRecordAddress}' as const;
`;

    addressContent += `
/**
 * 合约地址映射
 */
export const CONTRACT_ADDRESSES = {
  ResourceNFT: RESOURCE_NFT_ADDRESS,
  CertificateNFT: CERTIFICATE_NFT_ADDRESS,
  MOOCToken: MOOC_TOKEN_ADDRESS,
  LearningRecord: LEARNING_RECORD_ADDRESS,
} as const;

export type ContractAddresses = typeof CONTRACT_ADDRESSES;
`;

    fs.writeFileSync(BACKEND_ADDRESS_PATH, addressContent, 'utf-8');
    console.log('✅ 已同步后端合约地址文件:', BACKEND_ADDRESS_PATH);
  } catch (error) {
    console.error('❌ 写入后端合约地址文件失败:', error.message);
    process.exit(1);
  }

  console.log('\n✨ LearningRecord 同步完成！');
  console.log(`   LearningRecord 地址: ${learningRecordAddress}`);
  console.log(`   后端 LearningRecord ABI 文件: ${BACKEND_LEARNING_RECORD_ABI_PATH}`);
  console.log(`   地址文件: ${BACKEND_ADDRESS_PATH}`);
}

syncLearningRecordContracts();

