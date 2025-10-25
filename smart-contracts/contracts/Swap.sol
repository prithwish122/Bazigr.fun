// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FixedRateSwap
 * @notice Swaps native CELO <-> BAZ at a fixed rate (1 CELO = 20 BAZ).
 * - Contract must be pre-funded with BAZ (for native->BAZ) and CELO (for BAZ->native) liquidity.
 * - Uses 18 decimals for both sides; fixed rate uses base units: 1e18 CELO => 20e18 BAZ.
 */
contract FixedRateSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable bazToken;

    // 1 CELO = 20 BAZ. Both tokens are 18 decimals, so we can use an integer rate.
    uint256 public constant RATE = 20; // 1 native => 20 BAZ

    event SwapNativeForBaz(address indexed user, uint256 celoIn, uint256 bazOut);
    event SwapBazForNative(address indexed user, uint256 bazIn, uint256 celoOut);
    event Rescue(address indexed to, address token, uint256 amount);

    constructor(address _bazToken, address initialOwner) Ownable(initialOwner) {
        require(_bazToken != address(0), "baz token is zero");
        bazToken = IERC20(_bazToken);
    }

    /**
     * @notice Swap native CELO for BAZ at fixed rate.
     * @dev Expects msg.value in wei. Outputs BAZ in base units.
     */
    function swapNativeForBaz() external payable nonReentrant {
        require(msg.value > 0, "no native sent");
        // Since both sides have 18 decimals, bazOut is simply 20 * msg.value
        uint256 bazOut = msg.value * RATE;
        require(bazToken.balanceOf(address(this)) >= bazOut, "insufficient BAZ liquidity");
        bazToken.safeTransfer(msg.sender, bazOut);
        emit SwapNativeForBaz(msg.sender, msg.value, bazOut);
    }

    /**
     * @notice Swap BAZ for native CELO at fixed rate.
     * @param bazIn Amount of BAZ (base units) to swap.
     */
    function swapBazForNative(uint256 bazIn) external nonReentrant {
        require(bazIn > 0, "zero amount");
        // native out = bazIn / 20 (same decimals on both sides)
        uint256 celoOut = bazIn / RATE;
        require(address(this).balance >= celoOut, "insufficient native liquidity");

        // pull BAZ from user
        bazToken.safeTransferFrom(msg.sender, address(this), bazIn);
        // send native
        (bool ok, ) = msg.sender.call{ value: celoOut }("");
        require(ok, "native transfer failed");
        emit SwapBazForNative(msg.sender, bazIn, celoOut);
    }

    // Owner can top-up native liquidity
    receive() external payable {}

    // Admin rescues tokens
    function rescue(address to, address token, uint256 amount) external onlyOwner {
        require(to != address(0), "to=0");
        if (token == address(0)) {
            (bool ok, ) = to.call{ value: amount }("");
            require(ok, "native rescue failed");
        } else {
            require(IERC20(token).transfer(to, amount), "token rescue failed");
        }
        emit Rescue(to, token, amount);
    }
}


