// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "../immutable/SecurityToken.sol";

contract factory {

    mapping(uint256 => address) securityToken;
    uint256 internal countSecurityToken;
    address immutable OWNER;

    constructor() {
        OWNER = msg.sender;
    }

    function addSecurityToken(address _securityToken) external {
        require(OWNER == msg.sender,"Not The Owner");
        securityToken[countSecurityToken] = _securityToken;
        countSecurityToken++;
    }

    function listSecurityTokensByBalances(uint256 limit) external view returns(address[] memory){
        uint256 count = limit > countSecurityToken ? countSecurityToken : limit;
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = securityToken[i];
        }
        return result;
    }

    function getCountSecurityToken() external view returns(uint256){
        return countSecurityToken;
    }
}