// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library TokenLibrary {

    struct Transfer {
        string transferType;
        address from;
        address to;
        uint256 amount;
        uint256 date;
    }

    struct FreezePeriod {
        uint256 startTime;
        uint256 endTime;
        uint256 amountFreezed;
    }
}
