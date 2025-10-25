// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SepoliaBridge is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Events
    event TokensLocked(address indexed user, uint256 amount, uint256 nonce, string targetChain);
    event TokensUnlocked(address indexed user, uint256 amount, uint256 nonce, string sourceChain);
    event BridgePaused(bool paused);
    event BridgeUnpaused(bool unpaused);

    // State variables
    IERC20 public immutable bazigrToken;
    uint256 public nonce;
    mapping(uint256 => bool) public processedNonces;
    mapping(address => uint256) public userNonces;

    // Bridge configuration
    string public constant SOURCE_CHAIN = "SEPOLIA";
    string public constant TARGET_CHAIN = "U2U";
    
    constructor(address _bazigrToken) Ownable(msg.sender) {
        bazigrToken = IERC20(_bazigrToken);
    }

    /**
     * @dev Lock tokens on source chain (Sepolia) to bridge to target chain (U2U)
     * @param amount Amount of tokens to lock
     */
    function lockTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(bazigrToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(bazigrToken.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        // Transfer tokens from user to this contract
        bazigrToken.safeTransferFrom(msg.sender, address(this), amount);

        // Increment nonce for this user
        userNonces[msg.sender]++;
        uint256 currentNonce = userNonces[msg.sender];

        // Emit event for cross-chain communication
        emit TokensLocked(msg.sender, amount, currentNonce, TARGET_CHAIN);
    }

    /**
     * @dev Unlock tokens on target chain (Sepolia) after bridging from source chain (U2U)
     * @param user Address to receive tokens
     * @param amount Amount of tokens to unlock
     * @param nonceToProcess Nonce to prevent replay attacks
     */
    function unlockTokens(address user, uint256 amount, uint256 nonceToProcess) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        require(!processedNonces[nonceToProcess], "Nonce already processed");
        require(bazigrToken.balanceOf(address(this)) >= amount, "Insufficient bridge balance");

        // Mark nonce as processed
        processedNonces[nonceToProcess] = true;

        // Transfer tokens to user
        bazigrToken.safeTransfer(user, amount);

        // Emit event
        emit TokensUnlocked(user, amount, nonceToProcess, SOURCE_CHAIN);
    }

    /**
     * @dev Self-unlock function for users to unlock their own tokens
     * @param amount Amount of tokens to unlock
     * @param nonceToProcess Nonce to prevent replay attacks
     */
    function selfUnlockTokens(uint256 amount, uint256 nonceToProcess) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(!processedNonces[nonceToProcess], "Nonce already processed");
        require(bazigrToken.balanceOf(address(this)) >= amount, "Insufficient bridge balance");

        // Mark nonce as processed
        processedNonces[nonceToProcess] = true;

        // Transfer tokens to user
        bazigrToken.safeTransfer(msg.sender, amount);

        // Emit event
        emit TokensUnlocked(msg.sender, amount, nonceToProcess, SOURCE_CHAIN);
    }

    /**
     * @dev Emergency function to pause the bridge
     */
    function pauseBridge() external onlyOwner {
        _pause();
        emit BridgePaused(true);
    }

    /**
     * @dev Emergency function to unpause the bridge
     */
    function unpauseBridge() external onlyOwner {
        _unpause();
        emit BridgeUnpaused(false);
    }

    /**
     * @dev Get the current nonce for a user
     * @param user User address
     * @return Current nonce for the user
     */
    function getUserNonce(address user) external view returns (uint256) {
        return userNonces[user];
    }

    /**
     * @dev Check if a nonce has been processed
     * @param nonceToCheck Nonce to check
     * @return True if nonce has been processed
     */
    function isNonceProcessed(uint256 nonceToCheck) external view returns (bool) {
        return processedNonces[nonceToCheck];
    }

    /**
     * @dev Get bridge balance (tokens locked in the bridge)
     * @return Balance of tokens in the bridge
     */
    function getBridgeBalance() external view returns (uint256) {
        return bazigrToken.balanceOf(address(this));
    }

    /**
     * @dev Emergency function to withdraw tokens (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= bazigrToken.balanceOf(address(this)), "Insufficient balance");
        bazigrToken.safeTransfer(owner(), amount);
    }
}
