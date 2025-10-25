// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bazigr is ERC20, Ownable {
    constructor() ERC20("BAZIGR", "BAZ") Ownable(msg.sender) {}

    // Mint in base units (use amount * 10**decimals() if you pass whole tokens)
    function mint(address to, uint256 amount) external  {
        _mint(to, amount * 10 ** 18);
    }

    // Bridge helper: amount in base units
    function bridge(address to, uint256 amount) external returns (bool) {
        _transfer(_msgSender(), to, amount* 10 ** 18);
        return true;
    }

    function send(address to, uint256 amount) external returns (bool) {
        _transfer(_msgSender(), to, amount* 10 ** 18);
        return true;
    }

    // Donate from caller to recipient; amount in base units
    function donate(address to, uint256 amount) external returns (bool) {
        _transfer(_msgSender(), to, amount* 10**decimals());
        return true;
    }
}