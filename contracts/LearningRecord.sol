// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LearningRecord
 * @dev 学习完成时锚定合约（最小实现）
 *  - 以 learningRecordId 为键
 *  - 链上只存 contentHash，用于后续验真
 */
contract LearningRecord is Ownable {
    struct AnchorRecord {
        address owner; // 仅用于链上记录展示（验证不依赖）
        bytes32 contentHash; // 后端计算的学习完成摘要
        uint256 createdAt; // 上链时间（验证不依赖）
    }

    mapping(uint256 => AnchorRecord) private _anchors;

    event Anchored(
        uint256 indexed recordId,
        address indexed owner,
        bytes32 contentHash,
        uint256 createdAt
    );

    constructor() Ownable() {}

    /**
     * @dev 锚定学习完成证明（只允许写入一次）
     * @param recordId 学习记录主键
     * @param owner 钱包地址（可传 address(0)；验证不依赖）
     * @param contentHash 后端计算的学习完成摘要
     */
    function anchor(
        uint256 recordId,
        address owner,
        bytes32 contentHash
    ) external {
        require(recordId != 0, "LearningRecord: recordId is required");
        require(contentHash != bytes32(0), "LearningRecord: contentHash is required");
        require(_anchors[recordId].createdAt == 0, "LearningRecord: already anchored");
        require(owner == msg.sender, "LearningRecord: owner must be sender");

        _anchors[recordId] = AnchorRecord({
            owner: owner,
            contentHash: contentHash,
            createdAt: block.timestamp
        });

        emit Anchored(recordId, owner, contentHash, block.timestamp);
    }

    /**
     * @dev 获取锚定记录（用于验真）
     */
    function getAnchor(uint256 recordId) external view returns (AnchorRecord memory) {
        return _anchors[recordId];
    }

    /**
     * @dev 获取 contentHash（用于验真）
     */
    function getContentHash(uint256 recordId) external view returns (bytes32) {
        return _anchors[recordId].contentHash;
    }
}

