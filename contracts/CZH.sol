// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 < 0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CZH is ERC20 {
    constructor(uint256 initialSupply) ERC20("CZH Token", "CZH") {
        _mint(msg.sender, initialSupply);
    }
}