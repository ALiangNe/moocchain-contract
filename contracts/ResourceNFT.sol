// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ResourceNFT
 * @dev 标准 ERC721 实现的教育资源NFT合约，用于教育资源版权的区块链确权
 * 在标准 ERC721 基础上，扩展了内容指纹、防重复铸造和元数据存储
 */
contract ResourceNFT is ERC721, Ownable {
    // Token ID 计数器
    uint256 private _tokenIdCounter;

    // Token ID => Token 信息
    mapping(uint256 => ResourceToken) private _tokens;

    // Content Hash => Token ID（防止重复铸造）
    mapping(bytes32 => uint256) private _contentHashToTokenId;

    // 资源Token结构体
    struct ResourceToken {
        uint256 tokenId;           // Token ID
        address owner;             // 资源所有者（教师钱包地址）
        bytes32 contentHash;        // 内容指纹（由 ipfsHash + owner + createdAt 通过 Keccak256 生成）
        string ipfsHash;           // IPFS CID
        uint256 createdAt;          // 创建时间（区块时间戳）
        bool exists;                // 是否存在
    }

    // 自定义事件：资源铸造
    event ResourceMinted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 indexed contentHash,
        string ipfsHash,
        uint256 createdAt
    );

    /**
     * @dev 构造函数
     * 初始化 ERC721 名称和符号
     */
    constructor() ERC721("ResourceNFT", "RNFT") {
        // 为了保持与原实现一致，从 1 开始分配 tokenId
        _tokenIdCounter = 1;
    }

    /**
     * @dev 铸造教育资源NFT
     * @param owner 资源所有者地址（教师钱包地址）
     * @param contentHash 内容指纹（由 ipfsHash + owner + createdAt 通过 Keccak256 生成）
     * @param ipfsHash IPFS CID
     * @return tokenId 铸造的Token ID
     */
    function mint(
        address owner,
        bytes32 contentHash,
        string memory ipfsHash
    ) public returns (uint256) {
        require(owner != address(0), "ResourceNFT: owner cannot be zero address");
        require(contentHash != bytes32(0), "ResourceNFT: contentHash cannot be zero");
        require(bytes(ipfsHash).length > 0, "ResourceNFT: ipfsHash cannot be empty");
        require(_contentHashToTokenId[contentHash] == 0, "ResourceNFT: contentHash already exists");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // 铸造标准 ERC721 NFT（内部会触发 Transfer(address(0), owner, tokenId) 事件）
        _safeMint(owner, tokenId);

        // 记录资源元数据
        _tokens[tokenId] = ResourceToken({
            tokenId: tokenId,
            owner: owner,
            contentHash: contentHash,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            exists: true
        });

        _contentHashToTokenId[contentHash] = tokenId;

        emit ResourceMinted(tokenId, owner, contentHash, ipfsHash, block.timestamp);

        return tokenId;
    }

    /**
     * @dev 根据 contentHash 查询 Token ID
     * @param contentHash 内容指纹
     * @return tokenId Token ID，如果不存在返回 0
     */
    function getTokenIdByContentHash(bytes32 contentHash) public view returns (uint256) {
        return _contentHashToTokenId[contentHash];
    }

    /**
     * @dev 获取Token信息
     * @param tokenId Token ID
     * @return token Token信息结构体
     */
    function getToken(uint256 tokenId) public view returns (ResourceToken memory) {
        require(_tokens[tokenId].exists, "ResourceNFT: token does not exist");
        return _tokens[tokenId];
    }

    /**
     * @dev 获取Token的IPFS Hash
     * @param tokenId Token ID
     * @return ipfsHash IPFS CID
     */
    function getIpfsHash(uint256 tokenId) public view returns (string memory) {
        require(_tokens[tokenId].exists, "ResourceNFT: token does not exist");
        return _tokens[tokenId].ipfsHash;
    }

    /**
     * @dev 获取Token的Content Hash
     * @param tokenId Token ID
     * @return contentHash 内容指纹
     */
    function getContentHash(uint256 tokenId) public view returns (bytes32) {
        require(_tokens[tokenId].exists, "ResourceNFT: token does not exist");
        return _tokens[tokenId].contentHash;
    }

    /**
     * @dev 获取当前Token ID计数器
     * @return counter 当前计数器值
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev 覆盖 ERC721 的转移前钩子函数
     * 用于在标准 ERC721 完成 owner/balance 更新的同时，同步本合约自定义的 ResourceToken.owner 字段
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // 铸造和销毁时由 mint / 未来的 burn 逻辑维护，这里主要处理普通转移
        if (from != address(0) && to != address(0) && _tokens[tokenId].exists) {
            _tokens[tokenId].owner = to;
        }
    }
}
