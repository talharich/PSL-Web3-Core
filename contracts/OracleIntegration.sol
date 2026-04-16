// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

// 1. Interface to talk to the main NFT contract
interface IPSLMomentNFT {
    enum Tier { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }
    function upgradeTier(uint256 tokenId, Tier newTier, string calldata newUri) external;
}

contract OracleIntegration is Ownable {
    IPSLMomentNFT public nftContract;

    // 2. This constructor expects EXACTLY ONE argument, matching your deployAll.js script
    constructor(address _nftAddress) Ownable(msg.sender) {
        nftContract = IPSLMomentNFT(_nftAddress);
    }

    // 3. The function your game server calls to trigger an upgrade
    function processGameEvent(
        uint256 tokenId, 
        uint8 newTier, 
        string calldata newUri
    ) external onlyOwner {
        nftContract.upgradeTier(tokenId, IPSLMomentNFT.Tier(newTier), newUri);
    }

    // Helper to update the NFT address if needed
    function setNFTContract(address _nftAddress) external onlyOwner {
        nftContract = IPSLMomentNFT(_nftAddress);
    }
}