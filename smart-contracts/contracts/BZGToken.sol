// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BZGToken
 * @notice Reward token for the Bazigr DeFi ecosystem
 */
contract BZGToken is ERC20, Ownable {
    constructor() ERC20("Bazigr Reward Token", "BZG") Ownable(msg.sender) {
        // Mint initial supply to deployer (100M tokens)
        _mint(msg.sender, 100_000_000 * 10**18);
    }

    /**
     * @notice Mint new tokens (only owner - will be MasterChef)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
