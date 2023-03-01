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

    struct Article {
        string title;
        string content;
        string imageUri;
        string note;
        uint256 timestamp;
    }

    struct Rules {
        bool freezableAddress;
        bool freezablePartial;
        bool freezablePartialTime;
        bool pausable;
        bool forcableTransfer;
        bool rulesModifiable;
        bool soulBoundSecurityToken;
        bool voteToWithdraw;
        uint256 dayToWithdraw;
        uint256 startFundraising;
        uint256 endFundraising;
        uint256 maxSupply;
    }
}
