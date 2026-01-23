const fs = require('fs');
const path = require('path');

// 路径配置
const CONTRACT_ROOT = path.join(__dirname, '..');
const FRONTEND_ROOT = path.join(__dirname, '../../moocchain-web');
const BACKEND_ROOT = path.join(__dirname, '../../moocchain-api');

// 合约文件路径（只处理 MOOCToken）
const MOOC_TOKEN_ARTIFACTS_PATH = path.join(CONTRACT_ROOT, 'artifacts/contracts/MOOCToken.sol/MOOCToken.json');
const DEPLOYED_ADDRESSES_PATH = path.join(CONTRACT_ROOT, 'ignition/deployments/chain-1337/deployed_addresses.json');

// 前端输出路径
const FRONTEND_CONTRACTS_DIR = path.join(FRONTEND_ROOT, 'src/contracts');
const FRONTEND_MOOC_TOKEN_ABI_PATH = path.join(FRONTEND_CONTRACTS_DIR, 'MOOCToken.json');
const FRONTEND_ADDRESS_PATH = path.join(FRONTEND_CONTRACTS_DIR, 'contractAddresses.ts');

// 后端输出路径
const BACKEND_CONTRACTS_DIR = path.join(BACKEND_ROOT, 'src/contracts');
const BACKEND_MOOC_TOKEN_ABI_PATH = path.join(BACKEND_CONTRACTS_DIR, 'MOOCToken.json');
const BACKEND_ADDRESS_PATH = path.join(BACKEND_CONTRACTS_DIR, 'contractAddresses.ts');

/**
 * 同步 MOOCToken 合约 ABI 和地址到前端和后端项目
 */
function syncMOOCTokenContracts() {
  console.log('🚀 开始同步 MOOCToken 合约文件到前端项目...\n');

  // 检查 MOOCToken 合约文件是否存在
  if (!fs.existsSync(MOOC_TOKEN_ARTIFACTS_PATH)) {
    console.error('❌ 错误: 找不到 MOOCToken 合约 ABI 文件');
    console.error(`   路径: ${MOOC_TOKEN_ARTIFACTS_PATH}`);
    console.error('   请先编译合约: npm run compile');
    process.exit(1);
  }

  if (!fs.existsSync(DEPLOYED_ADDRESSES_PATH)) {
    console.error('❌ 错误: 找不到部署地址文件');
    console.error(`   路径: ${DEPLOYED_ADDRESSES_PATH}`);
    console.error('   请先部署 MOOCToken 合约: npm run deploy:MOOCToken');
    process.exit(1);
  }

  // 读取 MOOCToken 合约 ABI
  let moocTokenArtifact;
  try {
    const moocTokenArtifactContent = fs.readFileSync(MOOC_TOKEN_ARTIFACTS_PATH, 'utf-8');
    moocTokenArtifact = JSON.parse(moocTokenArtifactContent);
  } catch (error) {
    console.error('❌ 读取 MOOCToken 合约 ABI 文件失败:', error.message);
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

  // 获取 MOOCToken 合约地址
  const moocTokenAddress = deployedAddresses['MOOCTokenModule#MOOCToken'];
  if (!moocTokenAddress) {
    console.error('❌ 错误: 找不到 MOOCToken 合约地址');
    console.error('   请确保已部署 MOOCToken 合约');
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

  // 写入前端 MOOCToken ABI 文件
  try {
    const abiData = {
      abi: moocTokenArtifact.abi,
      contractName: moocTokenArtifact.contractName,
    };
    fs.writeFileSync(FRONTEND_MOOC_TOKEN_ABI_PATH, JSON.stringify(abiData, null, 2), 'utf-8');
    console.log('✅ 已同步 MOOCToken ABI 文件:', FRONTEND_MOOC_TOKEN_ABI_PATH);
  } catch (error) {
    console.error('❌ 写入 MOOCToken ABI 文件失败:', error.message);
    process.exit(1);
  }

  // 写入后端 MOOCToken ABI 文件
  try {
    const abiData = {
      abi: moocTokenArtifact.abi,
      contractName: moocTokenArtifact.contractName,
    };
    fs.writeFileSync(BACKEND_MOOC_TOKEN_ABI_PATH, JSON.stringify(abiData, null, 2), 'utf-8');
    console.log('✅ 已同步后端 MOOCToken ABI 文件:', BACKEND_MOOC_TOKEN_ABI_PATH);
  } catch (error) {
    console.error('❌ 写入后端 MOOCToken ABI 文件失败:', error.message);
    process.exit(1);
  }

  // 尝试保留已有的其他合约地址（如果存在）
  let existingAddresses = {};
  if (fs.existsSync(FRONTEND_ADDRESS_PATH)) {
    try {
      const content = fs.readFileSync(FRONTEND_ADDRESS_PATH, 'utf-8');
      
      // 提取 ResourceNFT 地址
      const resourceMatch = content.match(/export const RESOURCE_NFT_ADDRESS\s*=\s*'([^']+)'/);
      if (resourceMatch && resourceMatch[1]) {
        existingAddresses.ResourceNFT = resourceMatch[1];
      }
      
      // 提取 CertificateNFT 地址
      const certificateMatch = content.match(/export const CERTIFICATE_NFT_ADDRESS\s*=\s*'([^']+)'/);
      if (certificateMatch && certificateMatch[1]) {
        existingAddresses.CertificateNFT = certificateMatch[1];
      }
    } catch (error) {
      console.warn('⚠️ 读取现有合约地址文件失败，将只写入 MOOCToken 地址:', error.message);
    }
  }

  // 写入前端合约地址 TypeScript 文件
  try {
    let addressContent = `// 自动生成的文件，请勿手动修改
// 此文件由 scripts/sync-resource-contracts.js 和 scripts/sync-certificate-contracts.js 自动生成
`;

    // 写入 ResourceNFT 地址（如果存在）
    if (existingAddresses.ResourceNFT) {
      addressContent += `
/**
 * ResourceNFT 合约地址
 */
export const RESOURCE_NFT_ADDRESS = '${existingAddresses.ResourceNFT}' as const;
`;
    }

    // 写入 CertificateNFT 地址（如果存在）
    if (existingAddresses.CertificateNFT) {
      addressContent += `
/**
 * CertificateNFT 合约地址
 */
export const CERTIFICATE_NFT_ADDRESS = '${existingAddresses.CertificateNFT}' as const;
`;
    }

    // 写入 MOOCToken 地址
    addressContent += `
/**
 * MOOCToken ERC20 代币合约地址
 */
export const MOOC_TOKEN_ADDRESS = '${moocTokenAddress}' as const;
`;

    addressContent += `
/**
 * 合约地址映射
 */
export const CONTRACT_ADDRESSES = {`;

    if (existingAddresses.ResourceNFT) {
      addressContent += `
  ResourceNFT: RESOURCE_NFT_ADDRESS,`;
    }

    if (existingAddresses.CertificateNFT) {
      addressContent += `
  CertificateNFT: CERTIFICATE_NFT_ADDRESS,`;
    }

    addressContent += `
  MOOCToken: MOOC_TOKEN_ADDRESS,
} as const;

export type ContractAddresses = typeof CONTRACT_ADDRESSES;
`;

    fs.writeFileSync(FRONTEND_ADDRESS_PATH, addressContent, 'utf-8');
    console.log('✅ 已同步合约地址文件:', FRONTEND_ADDRESS_PATH);
  } catch (error) {
    console.error('❌ 写入合约地址文件失败:', error.message);
    process.exit(1);
  }

  // 写入后端合约地址 TypeScript 文件（与前端相同）
  try {
    let addressContent = `// 自动生成的文件，请勿手动修改
// 此文件由 scripts/sync-resource-contracts.js 和 scripts/sync-certificate-contracts.js 自动生成
`;

    // 写入 ResourceNFT 地址（如果存在）
    if (existingAddresses.ResourceNFT) {
      addressContent += `
/**
 * ResourceNFT 合约地址
 */
export const RESOURCE_NFT_ADDRESS = '${existingAddresses.ResourceNFT}' as const;
`;
    }

    // 写入 CertificateNFT 地址（如果存在）
    if (existingAddresses.CertificateNFT) {
      addressContent += `
/**
 * CertificateNFT 合约地址
 */
export const CERTIFICATE_NFT_ADDRESS = '${existingAddresses.CertificateNFT}' as const;
`;
    }

    // 写入 MOOCToken 地址
    addressContent += `
/**
 * MOOCToken ERC20 代币合约地址
 */
export const MOOC_TOKEN_ADDRESS = '${moocTokenAddress}' as const;
`;

    addressContent += `
/**
 * 合约地址映射
 */
export const CONTRACT_ADDRESSES = {`;

    if (existingAddresses.ResourceNFT) {
      addressContent += `
  ResourceNFT: RESOURCE_NFT_ADDRESS,`;
    }

    if (existingAddresses.CertificateNFT) {
      addressContent += `
  CertificateNFT: CERTIFICATE_NFT_ADDRESS,`;
    }

    addressContent += `
  MOOCToken: MOOC_TOKEN_ADDRESS,
} as const;

export type ContractAddresses = typeof CONTRACT_ADDRESSES;
`;

    fs.writeFileSync(BACKEND_ADDRESS_PATH, addressContent, 'utf-8');
    console.log('✅ 已同步后端合约地址文件:', BACKEND_ADDRESS_PATH);
  } catch (error) {
    console.error('❌ 写入后端合约地址文件失败:', error.message);
    process.exit(1);
  }

  console.log('\n✨ MOOCToken 同步完成！');
  console.log(`   MOOCToken 地址: ${moocTokenAddress}`);
  if (Object.keys(existingAddresses).length > 0) {
    if (existingAddresses.ResourceNFT) {
      console.log(`   已保留 ResourceNFT 地址: ${existingAddresses.ResourceNFT}`);
    }
    if (existingAddresses.CertificateNFT) {
      console.log(`   已保留 CertificateNFT 地址: ${existingAddresses.CertificateNFT}`);
    }
  }
  console.log(`   MOOCToken ABI 文件: ${FRONTEND_MOOC_TOKEN_ABI_PATH}`);
  console.log(`   地址文件: ${FRONTEND_ADDRESS_PATH}`);
  console.log(`   后端 MOOCToken ABI 文件: ${BACKEND_MOOC_TOKEN_ABI_PATH}`);
  console.log(`   后端地址文件: ${BACKEND_ADDRESS_PATH}`);
}

// 执行同步
syncMOOCTokenContracts();
