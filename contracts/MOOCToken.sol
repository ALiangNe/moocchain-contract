// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MOOCToken
 * @dev MOOCChain平台ERC20代币合约
 * 
 * 合约职责（只负责资产转移，不关心业务逻辑）：
 * - mint: 管理员铸造代币（用于奖励发放）
 * - transfer: 标准ERC20转账（用于购买资源等）
 * - balanceOf: 查询余额
 * 
 * 业务逻辑（课程、学习记录、权限控制）由后端+数据库处理
 */
contract MOOCToken is ERC20, Ownable {
    // 平台钱包地址（接收用户购买资源支付的代币）
    address public platformWallet;

    // 事件：代币铸造
    event TokensMinted(address indexed to, uint256 amount);

    // 事件：平台钱包地址更新
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);

    /**
     * @dev 构造函数
     * @param initialSupply 初始代币供应量（可设为0，后续通过mint发放）
     * @param _platformWallet 平台钱包地址（接收用户购买资源支付的代币）
     */
    constructor(
        uint256 initialSupply,
        address _platformWallet
    ) ERC20("MOOCChain Token", "MOOC") Ownable() {
        require(_platformWallet != address(0), "MOOCToken: platform wallet cannot be zero address");
        
        platformWallet = _platformWallet;
        
        // 如果设置了初始供应量，铸造给合约部署者（管理员）
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    /**
     * @dev 铸造代币（仅管理员可调用）
     * 用于奖励发放：学习完成、资源上传、评价参与等
     * @param to 接收代币的地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "MOOCToken: cannot mint to zero address");
        require(amount > 0, "MOOCToken: amount must be greater than zero");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev 批量铸造代币（仅管理员可调用）
     * @param recipients 接收代币的地址数组
     * @param amounts 每个地址对应的代币数量数组
     */
    function batchMint(
        address[] memory recipients,
        uint256[] memory amounts
    ) public onlyOwner {
        require(recipients.length == amounts.length, "MOOCToken: arrays length mismatch");
        require(recipients.length > 0, "MOOCToken: arrays cannot be empty");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "MOOCToken: cannot mint to zero address");
            require(amounts[i] > 0, "MOOCToken: amount must be greater than zero");
            
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev 更新平台钱包地址（仅管理员可调用）
     * @param _platformWallet 新的平台钱包地址
     */
    function setPlatformWallet(address _platformWallet) public onlyOwner {
        require(_platformWallet != address(0), "MOOCToken: platform wallet cannot be zero address");
        
        address oldWallet = platformWallet;
        platformWallet = _platformWallet;
        
        emit PlatformWalletUpdated(oldWallet, _platformWallet);
    }

    /**
     * @dev 获取平台钱包地址
     * @return 平台钱包地址
     */
    function getPlatformWallet() public view returns (address) {
        return platformWallet;
    }

    /**
     * @dev 销毁代币（仅管理员可调用）
     * @param amount 销毁数量
     */
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

    /**
     * @dev 从指定地址销毁代币（仅管理员可调用）
     * @param from 代币持有者地址
     * @param amount 销毁数量
     */
    function burnFrom(address from, uint256 amount) public onlyOwner {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
}
