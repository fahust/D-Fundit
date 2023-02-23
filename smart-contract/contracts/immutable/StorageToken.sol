// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../library/TokenLibrary.sol";

contract StorageToken {

    uint256 internal constant oneDay = 86400;
    uint256 internal immutable pricePerToken;
    uint256 internal paused;
    uint256 internal lastWithdraw;
    uint256 internal amountRequestWithdraw;
    uint256 internal acceptedRequestWithdraw;
    uint256 internal refusedRequestWithdraw;

    address internal OWNER;

    TokenLibrary.Rules internal rules;

    mapping(uint256 => TokenLibrary.Transfer) internal _transfers;
    mapping(address => TokenLibrary.FreezePeriod) internal freezedPeriod;

    mapping(address => uint256) internal frozenTokens;

    mapping(address => string) internal hasVoted;

    mapping(address => bool) internal frozen;

    uint32 internal _transfersCount;

    string internal constant TOKEN_VERSION = "0.0.1";
    string internal messageRequestWithdraw;
    
    error NotTheOwner(address sender, bytes32 role);
    error TransferFromZeroAddress(address from);
    error TransferToZeroAddress(address to);
    error TransferAmountExceedsBalance( uint256 fromBalance, address from, uint256 amount);
    error MintFromZeroAddress(address account);
    error MintDoesNotWork(address account, uint256 previousBalance, uint256 currentBalance, uint256 amount);
    error BurnFromZeroAddress(address account);
    error BurnAmountExceedsBalance(address account, uint256 accountBalance, uint256 amount);

    event TransferOwnership(address indexed oldAccount, address indexed newAccount);
    event Transfer(string eventType, address indexed from, address indexed to, uint256 value);
    event Paused(address indexed sender, uint256 indexed paused);
    event AddressFrozen(address indexed userAddress, bool indexed freeze, address indexed sender);
    event TokensFrozen(address indexed userAddress, uint256 indexed amount);
    event TokensFrozenPeriod(
        address indexed userAddress,
        uint256 indexed startTime,
        uint256 indexed endTime,
        uint256 amount,
        address signer
    );
    event TokensUnfrozen(address indexed userAddress, uint256 indexed amount);
    event TokensUnfrozenPeriod(address indexed userAddress, uint256 indexed amount);
    
    function _now() public view returns (uint256) {
        return block.timestamp;
    }

    function compare(string memory str1, string memory str2) public pure returns (bool) {
        if (bytes(str1).length != bytes(str2).length) {
            return false;
        }
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }

    constructor(
        uint256 _pricePerToken
    ) {
        pricePerToken = _pricePerToken;
    }
}