// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

/**
 * @title Test sqrt implementation
 */
contract TestMath {
    /**
     * @notice Babylonian method for square root calculation
     */
    function sqrt(uint256 y) public pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function testLiquidity() public view {
        uint256 amount0 = 5 * 10**18;  // 5 WCELO
        uint256 amount1 = 1000 * 10**18;  // 1000 BAZ
        uint256 MINIMUM_LIQUIDITY = 10**3;

        uint256 product = amount0 * amount1;
        console.log("Product:", product);
        
        uint256 sqrtResult = sqrt(product);
        console.log("Sqrt result:", sqrtResult);
        
        uint256 liquidity = sqrtResult - MINIMUM_LIQUIDITY;
        console.log("Liquidity:", liquidity);
        console.log("Liquidity > 0:", liquidity > 0);
    }
}
