const fs = require('fs');
const path = require('path');

// 路径配置
const CONTRACT_ROOT = path.join(__dirname, '..');
const FRONTEND_ROOT = path.join(__dirname, '../../moocchain-web');

// 合约文件路径（只处理 ResourceNFT）
const RESOURCE_ARTIFACTS_PATH = path.join(CONTRACT_ROOT, 'artifacts/contracts/ResourceNFT.sol/ResourceNFT.json');
const DEPLOYED_ADDRESSES_PATH = path.join(CONTRACT_ROOT, 'ignition/deployments/chain-1337/deployed_addresses.json');

// 前端输出路径
const FRONTEND_CONTRACTS_DIR = path.join(FRONTEND_ROOT, 'src/contracts');
const FRONTEND_RESOURCE_ABI_PATH = path.join(FRONTEND_CONTRACTS_DIR, 'ResourceNFT.json');
const FRONTEND_ADDRESS_PATH = path.join(FRONTEND_CONTRACTS_DIR, 'contractAddresses.ts');

/**
 * 同步 ResourceNFT 合约 ABI 和地址到前端项目
 */
function syncResourceContracts() {
  console.log('🚀 开始同步 ResourceNFT 合约文件到前端项目...\n');

  // 检查 ResourceNFT 合约文件是否存在
  if (!fs.existsSync(RESOURCE_ARTIFACTS_PATH)) {
    console.error('❌ 错误: 找不到 ResourceNFT 合约 ABI 文件');
    console.error(`   路径: ${RESOURCE_ARTIFACTS_PATH}`);
    console.error('   请先编译合约: npm run compile');
    process.exit(1);
  }

  if (!fs.existsSync(DEPLOYED_ADDRESSES_PATH)) {
    console.error('❌ 错误: 找不到部署地址文件');
    console.error(`   路径: ${DEPLOYED_ADDRESSES_PATH}`);
    console.error('   请先部署 ResourceNFT 合约: npm run deploy:ResourceNFT');
    process.exit(1);
  }

  // 读取 ResourceNFT 合约 ABI
  let resourceArtifact;
  try {
    const resourceArtifactContent = fs.readFileSync(RESOURCE_ARTIFACTS_PATH, 'utf-8');
    resourceArtifact = JSON.parse(resourceArtifactContent);
  } catch (error) {
    console.error('❌ 读取 ResourceNFT 合约 ABI 文件失败:', error.message);
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
  const resourceNftAddress = deployedAddresses['ResourceNFTModule#ResourceNFT'];
  if (!resourceNftAddress) {
    console.error('❌ 错误: 找不到 ResourceNFT 合约地址');
    console.error('   请确保已部署 ResourceNFT 合约');
    process.exit(1);
  }

  // 确保前端 contracts 目录存在
  if (!fs.existsSync(FRONTEND_CONTRACTS_DIR)) {
    fs.mkdirSync(FRONTEND_CONTRACTS_DIR, { recursive: true });
    console.log('✅ 创建前端 contracts 目录');
  }

  // 写入 ResourceNFT ABI 文件
  try {
    const abiData = {
      abi: resourceArtifact.abi,
      contractName: resourceArtifact.contractName,
    };
    fs.writeFileSync(FRONTEND_RESOURCE_ABI_PATH, JSON.stringify(abiData, null, 2), 'utf-8');
    console.log('✅ 已同步 ResourceNFT ABI 文件:', FRONTEND_RESOURCE_ABI_PATH);
  } catch (error) {
    console.error('❌ 写入 ResourceNFT ABI 文件失败:', error.message);
    process.exit(1);
  }

  // 尝试保留已有的 CertificateNFT 地址（如果存在）
  let existingCertificateAddress = null;
  if (fs.existsSync(FRONTEND_ADDRESS_PATH)) {
    try {
      const content = fs.readFileSync(FRONTEND_ADDRESS_PATH, 'utf-8');
      const match = content.match(/export const CERTIFICATE_NFT_ADDRESS\s*=\s*'([^']+)'/);
      if (match && match[1]) {
        existingCertificateAddress = match[1];
      }
    } catch (error) {
      console.warn('⚠️ 读取现有合约地址文件失败，将只写入 ResourceNFT 地址:', error.message);
    }
  }

  // 写入合约地址 TypeScript 文件
  try {
    let addressContent = `// 自动生成的文件，请勿手动修改
// 此文件由 scripts/sync-resource-contracts.js 和 scripts/sync-certificate-contracts.js 自动生成

/**
 * ResourceNFT 合约地址
 */
export const RESOURCE_NFT_ADDRESS = '${resourceNftAddress}' as const;
`;

    if (existingCertificateAddress) {
      addressContent += `
/**
 * CertificateNFT 合约地址
 */
export const CERTIFICATE_NFT_ADDRESS = '${existingCertificateAddress}' as const;
`;
    }

    addressContent += `
/**
 * 合约地址映射
 */
export const CONTRACT_ADDRESSES = {
  ResourceNFT: RESOURCE_NFT_ADDRESS,`;

    if (existingCertificateAddress) {
      addressContent += `
  CertificateNFT: CERTIFICATE_NFT_ADDRESS,`;
    }

    addressContent += `
} as const;

export type ContractAddresses = typeof CONTRACT_ADDRESSES;
`;

    fs.writeFileSync(FRONTEND_ADDRESS_PATH, addressContent, 'utf-8');
    console.log('✅ 已同步合约地址文件:', FRONTEND_ADDRESS_PATH);
  } catch (error) {
    console.error('❌ 写入合约地址文件失败:', error.message);
    process.exit(1);
  }

  console.log('\n✨ ResourceNFT 同步完成！');
  console.log(`   ResourceNFT 地址: ${resourceNftAddress}`);
  if (existingCertificateAddress) {
    console.log(`   已保留 CertificateNFT 地址: ${existingCertificateAddress}`);
  }
  console.log(`   ResourceNFT ABI 文件: ${FRONTEND_RESOURCE_ABI_PATH}`);
  console.log(`   地址文件: ${FRONTEND_ADDRESS_PATH}`);
}

// 执行同步
syncResourceContracts();
